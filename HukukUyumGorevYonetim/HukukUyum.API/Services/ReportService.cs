using HukukUyum.API.Data;
using HukukUyum.API.DTOs.Reports;
using HukukUyum.API.Enums;
using HukukUyum.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context) => _context = context;

    private sealed class ReportTask
    {
        public Enums.TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public string? AssignedUserId { get; set; }
        public int? AssignedGroupId { get; set; }
    }

    private IQueryable<ReportTask> TaskQuery() => _context.Tasks.AsNoTracking()
        .Where(t => !t.IsDeleted)
        .Select(t => new ReportTask
        {
            Status = t.Status, Priority = t.Priority, DueDate = t.DueDate,
            AssignedUserId = t.AssignedUserId, AssignedGroupId = t.AssignedGroupId
        });

    private static bool IsActive(ReportTask task) =>
        task.Status is Enums.TaskStatus.New or Enums.TaskStatus.InProgress or Enums.TaskStatus.OnHold;

    private static ReportSummaryDto Summarize(List<ReportTask> tasks, DateTime now) => new()
    {
        TotalTasks = tasks.Count,
        NewTasks = tasks.Count(t => t.Status == Enums.TaskStatus.New),
        InProgressTasks = tasks.Count(t => t.Status == Enums.TaskStatus.InProgress),
        OnHoldTasks = tasks.Count(t => t.Status == Enums.TaskStatus.OnHold),
        CompletedTasks = tasks.Count(t => t.Status == Enums.TaskStatus.Completed),
        CancelledTasks = tasks.Count(t => t.Status == Enums.TaskStatus.Cancelled),
        OverdueTasks = tasks.Count(t => IsActive(t) && t.DueDate.HasValue && t.DueDate.Value < now),
        LowPriorityTasks = tasks.Count(t => t.Priority == TaskPriority.Low),
        MediumPriorityTasks = tasks.Count(t => t.Priority == TaskPriority.Medium),
        HighPriorityTasks = tasks.Count(t => t.Priority == TaskPriority.High),
        CriticalPriorityTasks = tasks.Count(t => t.Priority == TaskPriority.Critical),
        UserAssignedTasks = tasks.Count(t => !string.IsNullOrWhiteSpace(t.AssignedUserId)),
        GroupAssignedTasks = tasks.Count(t => t.AssignedGroupId.HasValue),
        AwaitingAssignmentTasks = tasks.Count(t => IsActive(t) && t.AssignedGroupId.HasValue &&
            string.IsNullOrWhiteSpace(t.AssignedUserId))
    };

    public async Task<ReportSummaryDto> GetSummaryAsync(string currentUserId, bool canViewAllReports)
    {
        var query = TaskQuery();
        if (!canViewAllReports)
        {
            var groupIds = _context.Groups.AsNoTracking()
                .Where(g => g.ManagerUserId == currentUserId).Select(g => g.Id);
            query = query.Where(t => t.AssignedGroupId.HasValue && groupIds.Contains(t.AssignedGroupId.Value));
        }
        return Summarize(await query.ToListAsync(), DateTime.UtcNow);
    }

    public async Task<List<GroupReportDto>> GetGroupReportsAsync()
    {
        var groups = await _context.Groups.AsNoTracking().OrderBy(g => g.Name)
            .Select(g => new GroupReportDto
            {
                GroupId = g.Id, GroupName = g.Name,
                ManagerName = g.ManagerUser != null ? g.ManagerUser.FullName : null,
                MemberCount = g.UserGroups.Count
            }).ToListAsync();
        var memberships = await _context.UserGroups.AsNoTracking()
            .Select(m => new { m.GroupId, m.UserId, m.User.FullName }).ToListAsync();
        var tasks = await TaskQuery().Where(t => t.AssignedGroupId.HasValue).ToListAsync();
        var assignedIds = tasks.Where(t => !string.IsNullOrWhiteSpace(t.AssignedUserId))
            .Select(t => t.AssignedUserId!).Distinct().ToList();
        var names = await _context.Users.AsNoTracking().Where(u => assignedIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.FullName);
        var tasksByGroup = tasks.ToLookup(t => t.AssignedGroupId!.Value);
        var membersByGroup = memberships.ToLookup(m => m.GroupId);
        var now = DateTime.UtcNow;
        foreach (var group in groups)
        {
            var groupTasks = tasksByGroup[group.GroupId].ToList();
            group.Summary = Summarize(groupTasks, now);
            var currentMembers = membersByGroup[group.GroupId].ToDictionary(m => m.UserId, m => m.FullName);
            var byUser = groupTasks.Where(t => !string.IsNullOrWhiteSpace(t.AssignedUserId))
                .ToLookup(t => t.AssignedUserId!);
            // Grup üyeliği değişmiş olsa da gruptaki görevlerin sorumluları rapordan kaybolmaz.
            var userIds = currentMembers.Keys.Concat(byUser.Select(g => g.Key)).Distinct();
            group.Members = userIds.Select(id =>
            {
                var summary = Summarize(byUser[id].ToList(), now);
                return new GroupReportMemberDto
                {
                    UserId = id,
                    FullName = currentMembers.GetValueOrDefault(id) ?? names.GetValueOrDefault(id) ?? "Kullanıcı",
                    IsCurrentMember = currentMembers.ContainsKey(id),
                    ActiveTasks = summary.ActiveTasks,
                    CompletedTasks = summary.CompletedTasks,
                    OverdueTasks = summary.OverdueTasks
                };
            }).OrderBy(m => m.FullName).ToList();
        }
        return groups;
    }
}
