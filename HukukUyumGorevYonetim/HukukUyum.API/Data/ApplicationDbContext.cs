using HukukUyum.API.Entities;
using HukukUyum.API.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Data;

public class ApplicationDbContext
    : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskCategory> TaskCategories =>
        Set<TaskCategory>();

    public DbSet<TaskItem> Tasks =>
        Set<TaskItem>();

    public DbSet<Group> Groups =>
        Set<Group>();

    public DbSet<UserGroup> UserGroups =>
        Set<UserGroup>();

    public DbSet<TaskFile> TaskFiles =>
        Set<TaskFile>();

    public DbSet<EmailOutbox> EmailOutbox =>
        Set<EmailOutbox>();

    public DbSet<UserApplication> UserApplications =>
        Set<UserApplication>();

    public DbSet<SystemSetting> SystemSettings =>
        Set<SystemSetting>();

    public DbSet<Notification> Notifications =>
        Set<Notification>();

    public DbSet<TaskMessage> TaskMessages =>
        Set<TaskMessage>();

    public DbSet<AuditLog> AuditLogs =>
        Set<AuditLog>();

    public DbSet<LeaveRequest> LeaveRequests =>
        Set<LeaveRequest>();

    public DbSet<GroupManagerDelegation> GroupManagerDelegations =>
        Set<GroupManagerDelegation>();

    protected override void OnModelCreating(
        ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // TASK - ASSIGNED USER
        builder.Entity<TaskItem>()
            .HasOne(task =>
                task.AssignedUser)
            .WithMany(user =>
                user.Tasks)
            .HasForeignKey(task =>
                task.AssignedUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // GROUP - MANAGER
        builder.Entity<Group>()
            .HasOne(group =>
                group.ManagerUser)
            .WithMany()
            .HasForeignKey(group =>
                group.ManagerUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // TASK - ASSIGNED GROUP
        builder.Entity<TaskItem>()
            .HasOne(task =>
                task.AssignedGroup)
            .WithMany(group =>
                group.Tasks)
            .HasForeignKey(task =>
                task.AssignedGroupId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // TASK - CREATED BY USER
        builder.Entity<TaskItem>()
            .HasOne(task =>
                task.CreatedByUser)
            .WithMany()
            .HasForeignKey(task =>
                task.CreatedByUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // TASK - CATEGORY
        builder.Entity<TaskItem>()
            .HasOne(task =>
                task.TaskCategory)
            .WithMany()
            .HasForeignKey(task =>
                task.TaskCategoryId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // TASK - PARENT / SUBTASK
        builder.Entity<TaskItem>()
            .HasOne(task =>
                task.ParentTask)
            .WithMany(task =>
                task.SubTasks)
            .HasForeignKey(task =>
                task.ParentTaskId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // TASK FILE
        builder.Entity<TaskFile>()
            .HasOne(file =>
                file.TaskItem)
            .WithMany(task =>
                task.Files)
            .HasForeignKey(file =>
                file.TaskItemId)
            .OnDelete(
                DeleteBehavior.Cascade);

        // USER GROUP
        builder.Entity<UserGroup>()
            .HasKey(userGroup =>
                new
                {
                    userGroup.UserId,
                    userGroup.GroupId
                });

        builder.Entity<UserGroup>()
            .HasOne(userGroup =>
                userGroup.User)
            .WithMany()
            .HasForeignKey(userGroup =>
                userGroup.UserId)
            .OnDelete(
                DeleteBehavior.Cascade);

        builder.Entity<UserGroup>()
            .HasOne(userGroup =>
                userGroup.Group)
            .WithMany(group =>
                group.UserGroups)
            .HasForeignKey(userGroup =>
                userGroup.GroupId)
            .OnDelete(
                DeleteBehavior.Cascade);

        // NOTIFICATION - USER
        builder.Entity<Notification>()
            .HasOne(notification =>
                notification.User)
            .WithMany(user =>
                user.Notifications)
            .HasForeignKey(notification =>
                notification.UserId)
            .OnDelete(
                DeleteBehavior.Cascade);

        // NOTIFICATION - TASK
        builder.Entity<Notification>()
            .HasOne(notification =>
                notification.TaskItem)
            .WithMany()
            .HasForeignKey(notification =>
                notification.TaskItemId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.Entity<Notification>()
            .HasIndex(notification =>
                new
                {
                    notification.UserId,
                    notification.IsRead
                });

        // TASK MESSAGE - TASK
        builder.Entity<TaskMessage>()
            .HasOne(message =>
                message.TaskItem)
            .WithMany(task =>
                task.Messages)
            .HasForeignKey(message =>
                message.TaskItemId)
            .OnDelete(
                DeleteBehavior.Cascade);

        // TASK MESSAGE - USER
        builder.Entity<TaskMessage>()
            .HasOne(message =>
                message.User)
            .WithMany()
            .HasForeignKey(message =>
                message.UserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.Entity<TaskMessage>()
            .Property(message =>
                message.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Entity<TaskMessage>()
            .HasIndex(message =>
                new
                {
                    message.TaskItemId,
                    message.CreatedAt
                });

        // AUDIT LOG
        builder.Entity<AuditLog>()
            .Property(log =>
                log.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Entity<AuditLog>()
            .Property(log =>
                log.EntityType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Entity<AuditLog>()
            .Property(log =>
                log.EntityId)
            .HasMaxLength(100);

        builder.Entity<AuditLog>()
            .Property(log =>
                log.Description)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Entity<AuditLog>()
            .Property(log =>
                log.UserId)
            .HasMaxLength(450);

        builder.Entity<AuditLog>()
            .HasIndex(log =>
                log.CreatedAt);

        builder.Entity<AuditLog>()
            .HasIndex(log =>
                new
                {
                    log.EntityType,
                    log.EntityId
                });

        builder.Entity<AuditLog>()
            .HasIndex(log =>
                log.UserId);

        // LEAVE REQUEST - USER
        builder.Entity<LeaveRequest>()
            .HasOne(leave =>
                leave.User)
            .WithMany()
            .HasForeignKey(leave =>
                leave.UserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // LEAVE REQUEST - REVIEWED BY USER
        builder.Entity<LeaveRequest>()
            .HasOne(leave =>
                leave.ReviewedByUser)
            .WithMany()
            .HasForeignKey(leave =>
                leave.ReviewedByUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.Entity<LeaveRequest>()
            .Property(leave =>
                leave.Description)
            .HasMaxLength(1000);

        builder.Entity<LeaveRequest>()
            .Property(leave =>
                leave.RejectionReason)
            .HasMaxLength(1000);

        builder.Entity<LeaveRequest>()
            .HasIndex(leave =>
                new
                {
                    leave.UserId,
                    leave.Status
                });

        builder.Entity<LeaveRequest>()
            .HasIndex(leave =>
                new
                {
                    leave.StartDate,
                    leave.EndDate
                });

        // GROUP MANAGER DELEGATION - GROUP
        builder.Entity<GroupManagerDelegation>()
            .HasOne(delegation =>
                delegation.Group)
            .WithMany()
            .HasForeignKey(delegation =>
                delegation.GroupId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // GROUP MANAGER DELEGATION - ORIGINAL MANAGER
        builder.Entity<GroupManagerDelegation>()
            .HasOne(delegation =>
                delegation.OriginalManagerUser)
            .WithMany()
            .HasForeignKey(delegation =>
                delegation.OriginalManagerUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // GROUP MANAGER DELEGATION - DELEGATE USER
        builder.Entity<GroupManagerDelegation>()
            .HasOne(delegation =>
                delegation.DelegateUser)
            .WithMany()
            .HasForeignKey(delegation =>
                delegation.DelegateUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        // GROUP MANAGER DELEGATION - CREATED BY USER
        builder.Entity<GroupManagerDelegation>()
            .HasOne(delegation =>
                delegation.CreatedByUser)
            .WithMany()
            .HasForeignKey(delegation =>
                delegation.CreatedByUserId)
            .OnDelete(
                DeleteBehavior.Restrict);

        builder.Entity<GroupManagerDelegation>()
            .HasIndex(delegation =>
                new
                {
                    delegation.GroupId,
                    delegation.IsActive
                });

        builder.Entity<GroupManagerDelegation>()
            .HasIndex(delegation =>
                new
                {
                    delegation.DelegateUserId,
                    delegation.StartDate,
                    delegation.EndDate
                });

        builder.Entity<GroupManagerDelegation>()
            .HasIndex(delegation =>
                new
                {
                    delegation.OriginalManagerUserId,
                    delegation.StartDate,
                    delegation.EndDate
                });
    }
}
