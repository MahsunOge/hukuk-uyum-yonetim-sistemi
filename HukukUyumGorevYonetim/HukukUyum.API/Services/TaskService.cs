using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Tasks;
using HukukUyum.API.Entities;
using HukukUyum.API.Enums;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Net;
using TaskStatus = HukukUyum.API.Enums.TaskStatus;

namespace HukukUyum.API.Services;

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly IAuditLogService _auditLogService;
    private readonly IManagerDelegationService _managerDelegationService;

    public TaskService(
        ApplicationDbContext context,
        IAuditLogService auditLogService,
        IManagerDelegationService managerDelegationService)
    {
        _context = context;
        _auditLogService = auditLogService;
        _managerDelegationService = managerDelegationService;
    }

    public async Task<List<TaskResponseDto>> GetAllAsync(
    string currentUserId,
    bool canViewAllTasks)
    {
        var query =
            _context.Tasks
                .AsNoTracking()
                .Where(task =>
                    !task.IsDeleted);

        if (!canViewAllTasks)
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        currentUserId);

            query =
                query.Where(task =>

                    // Kullanıcıya doğrudan atanmış görev
                    task.AssignedUserId ==
                        currentUserId ||

                    // Kullanıcının yönettiği gruba ait görev
                    (
                        task.AssignedGroupId
                            .HasValue &&

                        accessibleGroupIds.Contains(
                            task.AssignedGroupId
                                .Value)
                    )
                );
        }

        var tasks =
            await query
                .OrderByDescending(task =>
                    task.CreatedAt)
                .ToListAsync();

        return tasks
            .Select(MapToResponseDto)
            .ToList();
    }

    public async Task<TaskResponseDto?> GetByIdAsync(
    int id,
    string currentUserId,
    bool canViewAllTasks)
    {
        var query =
            _context.Tasks
                .AsNoTracking()
                .Where(task =>
                    task.Id == id &&
                    !task.IsDeleted);

        if (!canViewAllTasks)
        {
            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        currentUserId);

            query =
                query.Where(task =>

                    // Görev doğrudan kullanıcıya atanmışsa
                    task.AssignedUserId ==
                        currentUserId ||

                    // Talep kullanıcısı kendi oluşturduğu
                    // talebi görüntüleyebilir.
                    (
                        task.IsUserRequest &&
                        task.CreatedByUserId ==
                            currentUserId
                    ) ||

                    // Kullanıcı bu görevin bağlı olduğu
                    // grubun yöneticisiyse görevi görebilir.
                    (
                        task.AssignedGroupId
                            .HasValue &&

                        accessibleGroupIds.Contains(
                            task.AssignedGroupId
                                .Value)
                    )
                );
        }

        var task =
            await query
                .FirstOrDefaultAsync();

        if (task is null)
        {
            return null;
        }

        return MapToResponseDto(
            task);
    }

    public async Task<TaskResponseDto> CreateAsync(
    CreateTaskDto createTaskDto,
    string currentUserId,
    bool isAdmin)
    {
        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            throw new UnauthorizedAccessException(
                "Oturum açmış kullanıcı bilgisi bulunamadı.");
        }

        ValidateDates(
            DateTime.UtcNow,
            createTaskDto.DueDate);

        int assignedGroupId;
        string? assignedUserId = null;

        // ADMIN
        if (isAdmin)
        {
            if (!createTaskDto.AssignedGroupId.HasValue)
            {
                throw new ArgumentException(
                    "Görev bir gruba atanmalıdır.");
            }

            if (!string.IsNullOrWhiteSpace(
                    createTaskDto.AssignedUserId))
            {
                throw new ArgumentException(
                    "Admin görevi doğrudan kullanıcıya atayamaz. Görev önce gruba atanmalıdır.");
            }

            assignedGroupId =
                createTaskDto.AssignedGroupId.Value;

            await ValidateAssignedTargetAsync(
                null,
                assignedGroupId);
        }

        // MANAGER
        else
        {
            if (string.IsNullOrWhiteSpace(
                    createTaskDto.AssignedUserId))
            {
                throw new ArgumentException(
                    "Görevin atanacağı kişi seçilmelidir.");
            }

            var accessibleGroupIds =
                await _managerDelegationService
                    .GetAccessibleGroupIdsAsync(
                        currentUserId);

            if (accessibleGroupIds.Count == 0)
            {
                throw new UnauthorizedAccessException(
                    "Yönetici veya aktif vekil olarak erişebildiğiniz bir grup bulunamadı.");
            }

            // Manager/vekil yalnızca erişebildiği gruptaki bir kullanıcıya görev atayabilir.
            var targetGroupId =
                await _context.UserGroups
                    .AsNoTracking()
                    .Where(userGroup =>
                        accessibleGroupIds.Contains(
                            userGroup.GroupId) &&
                        userGroup.UserId ==
                            createTaskDto.AssignedUserId)
                    .Select(userGroup =>
                        userGroup.GroupId)
                    .FirstOrDefaultAsync();

            if (targetGroupId == 0)
            {
                throw new UnauthorizedAccessException(
                    "Yalnızca yönetici veya aktif vekil olarak erişebildiğiniz gruptaki kullanıcılara görev atayabilirsiniz.");
            }

            assignedGroupId =
                targetGroupId;

            assignedUserId =
                createTaskDto.AssignedUserId;
        }

        // Atanacak kullanıcı/grup son kez merkezi olarak doğrulanır.
        // Bu kontrol aktif onaylı izin durumunu da kapsar.
        await ValidateAssignedTargetAsync(
            assignedUserId,
            assignedGroupId);

        var task =
            new TaskItem
            {
                Title =
                    createTaskDto.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        createTaskDto.Description)
                        ? null
                        : createTaskDto
                            .Description.Trim(),

                Priority =
                    createTaskDto.Priority,

                Status =
                    TaskStatus.New,

                CreatedAt =
                    DateTime.UtcNow,

                StartDate =
                    DateTime.UtcNow,

                DueDate =
                    createTaskDto.DueDate,

                IsDeleted =
                    false,

                AssignedUserId =
                    assignedUserId,

                AssignedGroupId =
                    assignedGroupId
            };

        _context.Tasks.Add(task);

        await _context.SaveChangesAsync();

        var emailRecords =
            await CreateAssignmentEmailsAsync(
                task);

        if (emailRecords.Count > 0)
        {
            _context.EmailOutbox.AddRange(
                emailRecords);
        }

        var notificationRecords =
            await CreateAssignmentNotificationsAsync(
                task,
                "Yeni görev atandı",
                $"\"{task.Title}\" görevi size atandı.");

        if (notificationRecords.Count > 0)
        {
            _context.Notifications.AddRange(
                notificationRecords);
        }

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            currentUserId,
            "TASK_CREATED",
            "Task",
            task.Id.ToString(),
            $"\"{task.Title}\" başlıklı görev oluşturuldu.");

        return MapToResponseDto(task);
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateTaskDto updateTaskDto,
        string currentUserId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == id &&
                !task.IsDeleted);

        if (task is null)
        {
            return false;
        }

        ValidateDates(
    task.StartDate,
    updateTaskDto.DueDate);

        ValidateAssignment(
            updateTaskDto.AssignedUserId,
            updateTaskDto.AssignedGroupId);

        await ValidateAssignedTargetAsync(
            updateTaskDto.AssignedUserId,
            updateTaskDto.AssignedGroupId);

        var previous = $"Durum: {GetStatusText(task.Status)}, bitiş: {task.DueDate:dd.MM.yyyy}, sorumlu: {task.AssignedUserId ?? "atanmamış"}, grup: {task.AssignedGroupId}";
        task.Title =
            updateTaskDto.Title.Trim();

        task.Description =
            string.IsNullOrWhiteSpace(
                updateTaskDto.Description)
                ? null
                : updateTaskDto.Description.Trim();

        task.Priority =
            updateTaskDto.Priority;

        task.Status =
            updateTaskDto.Status;

        task.DueDate =
            updateTaskDto.DueDate;

        task.AssignedUserId =
            updateTaskDto.AssignedUserId;

        task.AssignedGroupId =
            updateTaskDto.AssignedGroupId;

        if (updateTaskDto.Status ==
            TaskStatus.Completed)
        {
            task.CompletedAt ??=
                DateTime.UtcNow;
        }
        else
        {
            task.CompletedAt = null;
        }

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(currentUserId, "TASK_UPDATED",
            task.IsUserRequest ? "Request" : "Task", task.Id.ToString(),
            $"Görev güncellendi. Önce: {previous}. Sonra: Durum: {GetStatusText(task.Status)}, bitiş: {task.DueDate:dd.MM.yyyy}, sorumlu: {task.AssignedUserId ?? "atanmamış"}, grup: {task.AssignedGroupId}.");
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == id &&
                !task.IsDeleted);

        if (task is null)
        {
            return false;
        }

        task.IsDeleted = true;

        await _context.SaveChangesAsync();

        return true;
    }
    public async Task<TakeTaskResult> TakeTaskAsync(
    int taskId,
    string currentUserId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == taskId &&
                !task.IsDeleted);

        if (task is null)
        {
            return TakeTaskResult.TaskNotFound;
        }

        if (!string.IsNullOrWhiteSpace(
                task.AssignedUserId))
        {
            return TakeTaskResult
                .AlreadyAssignedToUser;
        }

        if (!task.AssignedGroupId.HasValue)
        {
            return TakeTaskResult
                .NotAssignedToGroup;
        }

        if (task.Status == TaskStatus.Completed ||
            task.Status == TaskStatus.Cancelled)
        {
            return TakeTaskResult.TaskClosed;
        }

        var isUserInGroup =
            await _context.UserGroups
                .AsNoTracking()
                .AnyAsync(userGroup =>
                    userGroup.UserId ==
                        currentUserId &&
                    userGroup.GroupId ==
                        task.AssignedGroupId.Value);

        if (!isUserInGroup)
        {
            return TakeTaskResult
                .UserNotInGroup;
        }

        if (await IsUserOnApprovedLeaveAsync(
                currentUserId))
        {
            throw new ArgumentException(
                "Onaylı izinde olduğunuz için bu görevi üzerinize alamazsınız.");
        }

        task.AssignedUserId =
            currentUserId;

        // Görev grup bağını korur.
        // AssignedGroupId null yapılmaz.

        if (task.Status == TaskStatus.New)
        {
            task.Status =
                TaskStatus.InProgress;

            task.StartDate ??=
                DateTime.UtcNow;
        }

        var assignedUser =
            await _context.Users
                .AsNoTracking()
                .Where(user =>
                    user.Id ==
                        currentUserId)
                .Select(user => new
                {
                    user.Email,
                    user.FullName
                })
                .FirstOrDefaultAsync();

        if (assignedUser is not null &&
            !string.IsNullOrWhiteSpace(
                assignedUser.Email))
        {
            var emailRecord =
                CreateEmailOutbox(
                    assignedUser.Email,
                    assignedUser.FullName,
                    task);

            emailRecord.Subject =
                $"Görevi üzerinize aldınız: {task.Title}";

            _context.EmailOutbox.Add(
                emailRecord);
        }

        _context.Notifications.Add(
            new Notification
            {
                UserId = currentUserId,
                Title = "Görevi üzerinize aldınız",
                Message =
                    $"\"{task.Title}\" görevi artık size atanmıştır.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                TaskItemId = task.Id
            });

        await _context.SaveChangesAsync();

        return TakeTaskResult.Success;
    }
    public async Task<AssignGroupTaskResult>
        AssignGroupTaskAsync(
            int taskId,
            string managerUserId,
            string assignedUserId,
            bool isAdmin = false)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == taskId &&
                !task.IsDeleted);

        if (task is null)
        {
            return AssignGroupTaskResult.TaskNotFound;
        }

        if (!task.AssignedGroupId.HasValue)
        {
            return AssignGroupTaskResult.NotAssignedToGroup;
        }

        if (task.Status == TaskStatus.Completed ||
            task.Status == TaskStatus.Cancelled)
        {
            return AssignGroupTaskResult.TaskClosed;
        }

        var previousAssignedUserId =
            task.AssignedUserId;

        var group = await _context.Groups
            .AsNoTracking()
            .Where(group =>
                group.Id ==
                    task.AssignedGroupId.Value)
            .Select(group => new
            {
                group.ManagerUserId
            })
            .FirstOrDefaultAsync();

        if (group is null)
        {
            return AssignGroupTaskResult.NotAssignedToGroup;
        }

        if (!isAdmin)
        {
            var hasManagerAccess =
                await _managerDelegationService
                    .HasActiveManagerAccessAsync(
                        managerUserId,
                        task.AssignedGroupId.Value);

            if (!hasManagerAccess)
            {
                return AssignGroupTaskResult.NotGroupManager;
            }
        }

        string? previousAssignedUserFullName =
            null;

        if (!string.IsNullOrWhiteSpace(
                previousAssignedUserId))
        {
            previousAssignedUserFullName =
                await _context.Users
                    .AsNoTracking()
                    .Where(previousUser =>
                        previousUser.Id ==
                            previousAssignedUserId)
                    .Select(previousUser =>
                        previousUser.FullName)
                    .FirstOrDefaultAsync();
        }

        var user = await _context.Users
            .AsNoTracking()
            .Where(user =>
                user.Id == assignedUserId)
            .Select(user => new
            {
                user.Id,
                user.Email,
                user.FullName
            })
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return AssignGroupTaskResult.UserNotFound;
        }

        var isUserInGroup =
            await _context.UserGroups
                .AsNoTracking()
                .AnyAsync(userGroup =>
                    userGroup.GroupId ==
                        task.AssignedGroupId.Value &&
                    userGroup.UserId ==
                        assignedUserId);

        if (!isUserInGroup)
        {
            return AssignGroupTaskResult.UserNotInGroup;
        }

        if (await IsUserOnApprovedLeaveAsync(
                assignedUserId))
        {
            throw new ArgumentException(
                "Seçilen çalışan şu anda onaylı izinde olduğu için görev atanamaz.");
        }

        // Aynı kullanıcı zaten atanmışsa işlem başarılı kabul edilir.
        if (previousAssignedUserId ==
            assignedUserId)
        {
            return AssignGroupTaskResult.Success;
        }

        task.AssignedUserId =
            assignedUserId;

        // Talebin çalışana atanma zamanı; ortak sohbet geçmişini sınırlamaz.
        if (task.IsUserRequest)
        {
            task.StartDate =
                DateTime.UtcNow;
        }

        // AssignedGroupId özellikle korunur.
        // Böylece görev grubun görevi olarak kalır.

        if (!string.IsNullOrWhiteSpace(
                user.Email))
        {
            var emailRecord =
                CreateEmailOutbox(
                    user.Email,
                    user.FullName,
                    task);

            emailRecord.Subject =
                $"Grup yöneticiniz size görev atadı: {task.Title}";

            _context.EmailOutbox.Add(
                emailRecord);
        }

        _context.Notifications.Add(
            new Notification
            {
                UserId =
                    assignedUserId,

                Title =
                    string.IsNullOrWhiteSpace(
                        previousAssignedUserId)
                        ? "Yeni görev atandı"
                        : "Görev size devredildi",

                Message =
                    string.IsNullOrWhiteSpace(
                        previousAssignedUserId)
                        ? $"Grup yöneticiniz \"{task.Title}\" görevini size atadı."
                        : $"Grup yöneticiniz \"{task.Title}\" görevini size devretti.",

                IsRead =
                    false,

                CreatedAt =
                    DateTime.UtcNow,

                TaskItemId =
                    task.Id
            });

        if (!string.IsNullOrWhiteSpace(
                previousAssignedUserId) &&
            previousAssignedUserId !=
                assignedUserId)
        {
            _context.Notifications.Add(
                new Notification
                {
                    UserId =
                        previousAssignedUserId,

                    Title =
                        "Görev başka çalışana devredildi",

                    Message =
                        $"\"{task.Title}\" görevi başka bir grup çalışanına devredildi.",

                    IsRead =
                        false,

                    CreatedAt =
                        DateTime.UtcNow,

                    TaskItemId =
                        task.Id
                });
        }

        await _context.SaveChangesAsync();

        await _auditLogService.LogAsync(
            managerUserId,
            "TASK_ASSIGNED",
            task.IsUserRequest
                ? "Request"
                : "Task",
            task.Id.ToString(),
            task.IsUserRequest
                ? $"\"{task.Title}\" talebi {user.FullName} kullanıcısına devredildi."
                : string.IsNullOrWhiteSpace(
                    previousAssignedUserId)
                    ? $"\"{task.Title}\" görevi {user.FullName} kullanıcısına atandı."
                    : !string.IsNullOrWhiteSpace(
                        previousAssignedUserFullName)
                        ? $"\"{task.Title}\" görevi {previousAssignedUserFullName} kullanıcısından {user.FullName} kullanıcısına devredildi."
                        : $"\"{task.Title}\" görevi {user.FullName} kullanıcısına yeniden atandı.");

        return AssignGroupTaskResult.Success;
    }

    public async Task<UpdateTaskStatusResult>
    UpdateStatusAsync(
        int taskId,
        string currentUserId,
        TaskStatus status)
    {
        if (status == TaskStatus.Cancelled)
        {
            return UpdateTaskStatusResult
                .InvalidStatus;
        }

        if (!Enum.IsDefined(status))
        {
            return UpdateTaskStatusResult
                .InvalidStatus;
        }

        var task = await _context.Tasks
            .FirstOrDefaultAsync(task =>
                task.Id == taskId &&
                !task.IsDeleted);

        if (task is null)
        {
            return UpdateTaskStatusResult
                .TaskNotFound;
        }

        if (task.AssignedUserId !=
            currentUserId)
        {
            return UpdateTaskStatusResult
                .NotAssignedToUser;
        }

        var previousStatus =
            task.Status;

        task.Status = status;

        if (status == TaskStatus.Completed)
        {
            task.CompletedAt =
                DateTime.UtcNow;
        }
        else
        {
            task.CompletedAt = null;
        }

        if (status == TaskStatus.InProgress)
        {
            task.StartDate ??=
                DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        if (previousStatus != status)
        {
            await _auditLogService.LogAsync(
                currentUserId,
                "TASK_STATUS_CHANGED",
                task.IsUserRequest
                    ? "Request"
                    : "Task",
                task.Id.ToString(),
                $"\"{task.Title}\" kaydının durumu {GetStatusText(previousStatus)} durumundan {GetStatusText(status)} durumuna değiştirildi.");
        }

        return UpdateTaskStatusResult
            .Success;
    }
    public async Task<TaskResponseDto?>
        CreateSubTaskAsync(
            int parentTaskId,
            CreateSubTaskDto createSubTaskDto)
    {
        var parentTask = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(task =>
                task.Id == parentTaskId &&
                !task.IsDeleted);

        if (parentTask is null)
        {
            return null;
        }

        if (parentTask.ParentTaskId.HasValue)
        {
            throw new ArgumentException(
                "Bir alt göreve yeniden alt görev eklenemez.");
        }

        ValidateDates(
    DateTime.UtcNow,
    createSubTaskDto.DueDate);

        ValidateAssignment(
            createSubTaskDto.AssignedUserId,
            createSubTaskDto.AssignedGroupId);

        await ValidateAssignedTargetAsync(
            createSubTaskDto.AssignedUserId,
            createSubTaskDto.AssignedGroupId);

        var subTask = new TaskItem
        {
            Title =
                createSubTaskDto.Title.Trim(),

            Description =
                string.IsNullOrWhiteSpace(
                    createSubTaskDto.Description)
                    ? null
                    : createSubTaskDto
                        .Description.Trim(),

            Priority =
                createSubTaskDto.Priority,

            Status = TaskStatus.New,
            CreatedAt = DateTime.UtcNow,

            StartDate = DateTime.UtcNow,

            DueDate =
                createSubTaskDto.DueDate,

            AssignedUserId =
                createSubTaskDto.AssignedUserId,

            AssignedGroupId =
                createSubTaskDto.AssignedGroupId,

            ParentTaskId = parentTaskId,
            IsDeleted = false
        };

        _context.Tasks.Add(subTask);

        await _context.SaveChangesAsync();

        var emailRecords =
            await CreateAssignmentEmailsAsync(
                subTask);

        if (emailRecords.Count > 0)
        {
            _context.EmailOutbox.AddRange(
                emailRecords);
        }

        var notificationRecords =
            await CreateAssignmentNotificationsAsync(
                subTask,
                "Yeni alt görev atandı",
                $"\"{subTask.Title}\" alt görevi size atandı.");

        if (notificationRecords.Count > 0)
        {
            _context.Notifications.AddRange(
                notificationRecords);
        }

        await _context.SaveChangesAsync();

        return MapToResponseDto(subTask);
    }

    public async Task<List<TaskResponseDto>>
        GetSubTasksAsync(
            int parentTaskId,
            string currentUserId,
            bool canViewAllTasks)
    {
        var query = _context.Tasks
            .AsNoTracking()
            .Where(task =>
                task.ParentTaskId ==
                    parentTaskId &&
                !task.IsDeleted);

        if (!canViewAllTasks)
        {
            var currentUserGroupIds =
                _context.UserGroups
                    .AsNoTracking()
                    .Where(userGroup =>
                        userGroup.UserId ==
                            currentUserId)
                    .Select(userGroup =>
                        userGroup.GroupId);

            query = query.Where(task =>
                task.AssignedUserId ==
                    currentUserId ||
                (
                    task.AssignedGroupId
                        .HasValue &&
                    currentUserGroupIds.Contains(
                        task.AssignedGroupId
                            .Value)
                ));
        }

        var subTasks = await query
            .OrderByDescending(task =>
                task.CreatedAt)
            .ToListAsync();

        return subTasks
            .Select(MapToResponseDto)
            .ToList();
    }

    private async Task<List<Notification>>
        CreateAssignmentNotificationsAsync(
            TaskItem task,
            string title,
            string message)
    {
        var notifications =
            new List<Notification>();

        if (!string.IsNullOrWhiteSpace(
                task.AssignedUserId))
        {
            notifications.Add(
                new Notification
                {
                    UserId = task.AssignedUserId,
                    Title = title,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                    TaskItemId = task.Id
                });

            return notifications;
        }

        if (task.AssignedGroupId.HasValue)
        {
            var managerUserId =
                await GetEffectiveManagerUserIdAsync(
                    task.AssignedGroupId.Value);

            if (!string.IsNullOrWhiteSpace(
                    managerUserId))
            {
                notifications.Add(
                    new Notification
                    {
                        UserId =
                            managerUserId,

                        Title =
                            title,

                        Message =
                            message,

                        IsRead =
                            false,

                        CreatedAt =
                            DateTime.UtcNow,

                        TaskItemId =
                            task.Id
                    });
            }
        }

        return notifications;
    }

    private async Task<List<EmailOutbox>>
        CreateAssignmentEmailsAsync(
            TaskItem task)
    {
        var emailRecords =
            new List<EmailOutbox>();

        if (!string.IsNullOrWhiteSpace(
                task.AssignedUserId))
        {
            var assignedUser =
                await _context.Users
                    .AsNoTracking()
                    .Where(user =>
                        user.Id ==
                        task.AssignedUserId)
                    .Select(user => new
                    {
                        user.Email,
                        user.FullName
                    })
                    .FirstOrDefaultAsync();

            if (assignedUser is null ||
                string.IsNullOrWhiteSpace(
                    assignedUser.Email))
            {
                return emailRecords;
            }

            emailRecords.Add(
                CreateEmailOutbox(
                    assignedUser.Email,
                    assignedUser.FullName,
                    task));

            return emailRecords;
        }

        if (task.AssignedGroupId.HasValue)
        {
            var effectiveManagerUserId =
                await GetEffectiveManagerUserIdAsync(
                    task.AssignedGroupId.Value);

            var manager =
                string.IsNullOrWhiteSpace(
                    effectiveManagerUserId)
                    ? null
                    : await _context.Users
                        .AsNoTracking()
                        .Where(user =>
                            user.Id ==
                                effectiveManagerUserId)
                        .Select(user => new
                        {
                            user.Email,
                            user.FullName
                        })
                        .FirstOrDefaultAsync();

            if (manager is not null &&
                !string.IsNullOrWhiteSpace(
                    manager.Email))
            {
                emailRecords.Add(
                    CreateEmailOutbox(
                        manager.Email,
                        manager.FullName,
                        task));
            }
        }

        return emailRecords;
    }

    private async Task<string?> GetEffectiveManagerUserIdAsync(
        int groupId)
    {
        var today =
            DateTime.UtcNow.Date;

        var delegateUserId =
            await _context.GroupManagerDelegations
                .AsNoTracking()
                .Where(delegation =>
                    delegation.GroupId ==
                        groupId &&
                    delegation.IsActive &&
                    delegation.StartDate <=
                        today &&
                    delegation.EndDate >=
                        today)
                .OrderByDescending(delegation =>
                    delegation.CreatedAt)
                .Select(delegation =>
                    delegation.DelegateUserId)
                .FirstOrDefaultAsync();

        if (!string.IsNullOrWhiteSpace(
                delegateUserId))
        {
            return delegateUserId;
        }

        return await _context.Groups
            .AsNoTracking()
            .Where(group =>
                group.Id == groupId)
            .Select(group =>
                group.ManagerUserId)
            .FirstOrDefaultAsync();
    }

    private static EmailOutbox CreateEmailOutbox(
        string emailAddress,
        string? fullName,
        TaskItem task)
    {
        var safeFullName =
            WebUtility.HtmlEncode(
                string.IsNullOrWhiteSpace(
                    fullName)
                    ? "Kullanıcı"
                    : fullName);

        var safeTitle =
            WebUtility.HtmlEncode(
                task.Title);

        var safeDescription =
            WebUtility.HtmlEncode(
                task.Description ??
                "Açıklama bulunmamaktadır.");

        var dueDateText =
            task.DueDate.HasValue
                ? task.DueDate.Value
                    .ToString("dd.MM.yyyy")
                : "Belirtilmedi";

        var priorityText =
            GetPriorityText(task.Priority);

        var subject =
            $"Yeni görev atandı: {task.Title}";

        var body = $"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Yeni Görev Ataması</h2>

                <p>Merhaba {safeFullName},</p>

                <p>
                    Hukuk Uyum sistemi üzerinden
                    size yeni bir görev atanmıştır.
                </p>

                <table style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Görev:
                        </td>
                        <td style="padding: 6px;">
                            {safeTitle}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Açıklama:
                        </td>
                        <td style="padding: 6px;">
                            {safeDescription}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Öncelik:
                        </td>
                        <td style="padding: 6px;">
                            {priorityText}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 6px; font-weight: bold;">
                            Bitiş tarihi:
                        </td>
                        <td style="padding: 6px;">
                            {dueDateText}
                        </td>
                    </tr>
                </table>

                <p>
                    Görev ayrıntılarını Hukuk Uyum
                    uygulamasından inceleyebilirsiniz.
                </p>

                <p>
                    Hukuk Uyum Sistemi
                </p>
            </body>
            </html>
            """;

        return new EmailOutbox
        {
            ToEmail = emailAddress.Trim(),
            Subject = subject,
            Body = body,

            Status =
                HukukUyum.API.Enums.EmailStatus.Pending,

            RetryCount = 0,
            CreatedAt = DateTime.UtcNow
        };
    }
    public async Task<TaskResponseDto> CreateUserRequestAsync(
     CreateUserRequestDto requestDto,
     string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            throw new ArgumentException(
                "Talebi oluşturan kullanıcı bilgisi bulunamadı.");
        }

        var userExists =
            await _context.Users
                .AsNoTracking()
                .AnyAsync(user =>
                    user.Id == currentUserId);

        if (!userExists)
        {
            throw new ArgumentException(
                "Talebi oluşturan kullanıcı bulunamadı.");
        }
        var isMemberOfAnyGroup =
    await _context.UserGroups
        .AsNoTracking()
        .AnyAsync(userGroup =>
            userGroup.UserId ==
                currentUserId);

        if (isMemberOfAnyGroup)
        {
            throw new UnauthorizedAccessException(
                "Grup üyesi kullanıcılar talep oluşturamaz.");
        }
        ValidateDates(
            null,
            requestDto.DueDate);

        // Kullanıcının seçtiği aktif kategori bulunur.
        var category =
            await _context.TaskCategories
                .AsNoTracking()
                .Include(category =>
                    category.Group)
                .FirstOrDefaultAsync(
                    category =>
                        category.Id ==
                            requestDto.CategoryId &&
                        category.IsActive);

        if (category is null)
        {
            throw new ArgumentException(
                "Seçilen kategori bulunamadı veya aktif değildir.");
        }

        // Kategorinin bağlı olduğu grup kontrol edilir.
        var group =
            category.Group;

        if (group is null)
        {
            throw new ArgumentException(
                "Seçilen kategori herhangi bir gruba bağlı değildir.");
        }

        // Grubun yöneticisi olmak zorunda.
        if (string.IsNullOrWhiteSpace(
                group.ManagerUserId))
        {
            throw new ArgumentException(
                "Seçilen kategorinin bağlı olduğu gruba henüz yönetici atanmamıştır.");
        }

        var requestTask =
            new TaskItem
            {
                Title =
                    requestDto.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        requestDto.Description)
                        ? null
                        : requestDto.Description.Trim(),

                Priority =
                    requestDto.Priority,

                Status =
                    TaskStatus.New,

                CreatedAt =
                    DateTime.UtcNow,

                StartDate =
                    null,

                DueDate =
                    requestDto.DueDate,

                CompletedAt =
                    null,

                IsDeleted =
                    false,

                // Kullanıcı kişi seçemez.
                AssignedUserId =
                    null,

                // Grup seçilen kategoriden otomatik gelir.
                AssignedGroupId =
                    category.GroupId,

                CreatedByUserId =
                    currentUserId,

                IsUserRequest =
                    true,

                ParentTaskId =
                    null
            };

        _context.Tasks.Add(
            requestTask);

        // Önce görev kaydedilir ve Id oluşur.
        await _context.SaveChangesAsync();

        // İlgili grup yöneticisine e-posta hazırlanır.
        var emailRecords =
            await CreateAssignmentEmailsAsync(
                requestTask);

        if (emailRecords.Count > 0)
        {
            _context.EmailOutbox.AddRange(
                emailRecords);
        }

        // İlgili grup yöneticisine bildirim oluşturulur.
        var notificationRecords =
            await CreateAssignmentNotificationsAsync(
                requestTask,
                "Yeni kullanıcı talebi",
                $"\"{requestTask.Title}\" başlıklı yeni bir talep grubunuza gönderildi.");

        if (notificationRecords.Count > 0)
        {
            _context.Notifications.AddRange(
                notificationRecords);
        }

        await _context.SaveChangesAsync();

        return MapToResponseDto(
            requestTask);
    }


    public async Task<bool> UpdateUserRequestAsync(
        int id,
        UpdateUserRequestDto updateUserRequestDto,
        string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            throw new UnauthorizedAccessException(
                "Oturum açmış kullanıcı bilgisi bulunamadı.");
        }

        var requestTask =
            await _context.Tasks
                .FirstOrDefaultAsync(task =>
                    task.Id == id &&
                    !task.IsDeleted &&
                    task.IsUserRequest &&
                    task.CreatedByUserId ==
                        currentUserId);

        if (requestTask is null)
        {
            return false;
        }

        ValidateDates(
            requestTask.CreatedAt,
            updateUserRequestDto.DueDate);

        requestTask.Title =
            updateUserRequestDto.Title.Trim();

        requestTask.Description =
            string.IsNullOrWhiteSpace(
                updateUserRequestDto.Description)
                ? null
                : updateUserRequestDto
                    .Description.Trim();

        requestTask.Priority =
            updateUserRequestDto.Priority;

        requestTask.DueDate =
            updateUserRequestDto.DueDate;

        // Status, AssignedUserId ve AssignedGroupId
        // talep kullanıcısı tarafından değiştirilmez.

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<List<TaskResponseDto>>
        GetMyRequestsAsync(
            string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return new List<TaskResponseDto>();
        }

        var requests =
            await _context.Tasks
                .AsNoTracking()
                .Where(task =>
                    !task.IsDeleted &&
                    task.IsUserRequest &&
                    task.CreatedByUserId ==
                        currentUserId)
                .OrderByDescending(task =>
                    task.CreatedAt)
                .ToListAsync();

        return requests
            .Select(MapToResponseDto)
            .ToList();
    }

    public async Task<TaskResponseDto?>
        GetUserRequestByIdAsync(
            int id,
            string currentUserId)
    {
        if (string.IsNullOrWhiteSpace(
                currentUserId))
        {
            return null;
        }

        var request =
            await _context.Tasks
                .AsNoTracking()
                .FirstOrDefaultAsync(task =>
                    task.Id == id &&
                    !task.IsDeleted &&
                    task.IsUserRequest &&
                    task.CreatedByUserId ==
                        currentUserId);

        if (request is null)
        {
            return null;
        }

        return MapToResponseDto(
            request);
    }


    public async Task<List<TaskAssignmentHistoryDto>>
        GetAssignmentHistoryAsync(
            int taskId,
            string currentUserId,
            bool canViewAllTasks)
    {
        var visibleTask =
            await GetByIdAsync(
                taskId,
                currentUserId,
                canViewAllTasks);

        if (visibleTask is null)
        {
            return new List<TaskAssignmentHistoryDto>();
        }

        var entityId =
            taskId.ToString();

        var logs =
            await _context.AuditLogs
                .AsNoTracking()
                .Where(log =>
                    log.EntityId == entityId &&
                    (log.Action == "TASK_ASSIGNED" || log.Action == "TASK_CREATED" ||
                     log.Action == "REQUEST_CREATED" || log.Action == "TASK_STATUS_CHANGED" ||
                     log.Action == "TASK_UPDATED" || log.Action == "REQUEST_UPDATED") &&
                    (
                        log.EntityType == "Task" ||
                        log.EntityType == "Request"
                    ))
                .OrderByDescending(log =>
                    log.CreatedAt)
                .ToListAsync();

        var actorIds =
            logs
                .Where(log =>
                    !string.IsNullOrWhiteSpace(
                        log.UserId))
                .Select(log =>
                    log.UserId!)
                .Distinct()
                .ToList();

        var actorNames =
            await _context.Users
                .AsNoTracking()
                .Where(user =>
                    actorIds.Contains(
                        user.Id))
                .Select(user =>
                    new
                    {
                        user.Id,
                        user.FullName
                    })
                .ToDictionaryAsync(
                    user => user.Id,
                    user => user.FullName);

        return logs
            .Select(log =>
                new TaskAssignmentHistoryDto
                {
                    Id =
                        log.Id,
                    ActionByUserId =
                        log.UserId,
                    ActionByUserFullName =
                        !string.IsNullOrWhiteSpace(
                            log.UserId) &&
                        actorNames.TryGetValue(
                            log.UserId!,
                            out var actorName)
                            ? actorName
                            : "Sistem",
                    Description =
                        log.Description,
                    CreatedAt =
                        log.CreatedAt
                })
            .ToList();
    }

    private async Task<bool> IsUserOnApprovedLeaveAsync(
        string userId)
    {
        var today =
            DateTime.UtcNow.Date;

        return await _context.LeaveRequests
            .AsNoTracking()
            .AnyAsync(leave =>
                leave.UserId ==
                    userId &&
                leave.Status ==
                    LeaveStatus.Approved &&
                leave.StartDate <=
                    today &&
                leave.EndDate >=
                    today);
    }

    private async Task ValidateAssignedTargetAsync(
        string? assignedUserId,
        int? assignedGroupId)
    {
        if (!string.IsNullOrWhiteSpace(
                assignedUserId))
        {
            var userExists =
                await _context.Users
                    .AsNoTracking()
                    .AnyAsync(user =>
                        user.Id ==
                        assignedUserId);

            if (!userExists)
            {
                throw new ArgumentException(
                    "Atanmak istenen kullanıcı bulunamadı.");
            }

            if (await IsUserOnApprovedLeaveAsync(
                    assignedUserId))
            {
                throw new ArgumentException(
                    "Seçilen çalışan şu anda onaylı izinde olduğu için görev atanamaz.");
            }
        }

        if (assignedGroupId.HasValue)
        {
            var groupExists =
                await _context.Groups
                    .AsNoTracking()
                    .AnyAsync(group =>
                        group.Id ==
                        assignedGroupId.Value);

            if (!groupExists)
            {
                throw new ArgumentException(
                    "Atanmak istenen grup bulunamadı.");
            }
        }

        if (!string.IsNullOrWhiteSpace(
                assignedUserId) &&
            assignedGroupId.HasValue)
        {
            var isUserInGroup =
                await _context.UserGroups
                    .AsNoTracking()
                    .AnyAsync(userGroup =>
                        userGroup.UserId ==
                            assignedUserId &&
                        userGroup.GroupId ==
                            assignedGroupId.Value);

            if (!isUserInGroup)
            {
                throw new ArgumentException(
                    "Atanmak istenen kullanıcı seçilen grubun üyesi değildir.");
            }
        }
    }

    private static void ValidateAssignment(
        string? assignedUserId,
        int? assignedGroupId)
    {
        // Yeni iş akışında görev hem gruba hem de
        // o grubun bir üyesine bağlı olabilir.
        // Asıl üyelik doğrulaması
        // ValidateAssignedTargetAsync içinde yapılır.
    }

    private static string GetStatusText(
        TaskStatus status)
    {
        return status switch
        {
            TaskStatus.New =>
                "Yeni",

            TaskStatus.InProgress =>
                "Devam Ediyor",

            TaskStatus.OnHold =>
                "Beklemede",

            TaskStatus.Completed =>
                "Tamamlandı",

            TaskStatus.Cancelled =>
                "İptal",

            _ =>
                status.ToString()
        };
    }

    private static string GetPriorityText(
        HukukUyum.API.Enums.TaskPriority priority)
    {
        return priority switch
        {
            HukukUyum.API.Enums.TaskPriority.Low =>
                "Düşük",

            HukukUyum.API.Enums.TaskPriority.Medium =>
                "Orta",

            HukukUyum.API.Enums.TaskPriority.High =>
                "Yüksek",

            _ => priority.ToString()
        };
    }

    private static TaskResponseDto MapToResponseDto(
        TaskItem task)
    {
        var isOverdue =
            task.Status != TaskStatus.Completed &&
            task.Status != TaskStatus.Cancelled &&
            task.DueDate.HasValue &&
            task.DueDate.Value <
            DateTime.UtcNow;

        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            StartDate = task.StartDate,
            DueDate = task.DueDate,
            CompletedAt = task.CompletedAt,
            IsOverdue = isOverdue,

            ParentTaskId =
         task.ParentTaskId,

            AssignedUserId =
         task.AssignedUserId,

            AssignedGroupId =
         task.AssignedGroupId
        };
    }

    private static void ValidateDates(
        DateTime? startDate,
        DateTime? dueDate)
    {
        if (startDate.HasValue &&
            dueDate.HasValue &&
            dueDate.Value <
            startDate.Value)
        {
            throw new ArgumentException(
                "Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }
    }
}
