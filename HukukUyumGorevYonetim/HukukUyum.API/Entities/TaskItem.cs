using HukukUyum.API.Enums;
using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } =
        string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } =
        TaskPriority.Medium;

    public Enums.TaskStatus Status { get; set; } =
        Enums.TaskStatus.New;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public DateTime? StartDate { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public bool IsDeleted { get; set; } =
        false;

    // Görevin atandığı kullanıcı
    public string? AssignedUserId { get; set; }

    public ApplicationUser? AssignedUser
    {
        get;
        set;
    }

    // Görevin atandığı grup
    public int? AssignedGroupId { get; set; }

    public Group? AssignedGroup { get; set; }

    // Talebi oluşturan kullanıcı
    public string? CreatedByUserId { get; set; }

    public ApplicationUser? CreatedByUser
    {
        get;
        set;
    }

    // Normal kullanıcı tarafından oluşturulan
    // bir talep olup olmadığı
    public bool IsUserRequest { get; set; } =
        false;

    // Kullanıcı talebinin kategorisi
    public int? TaskCategoryId { get; set; }

    public TaskCategory? TaskCategory
    {
        get;
        set;
    }

    // Ana görev bilgisi
    public int? ParentTaskId { get; set; }

    public TaskItem? ParentTask { get; set; }

    // Göreve bağlı alt görevler
    public ICollection<TaskItem> SubTasks
    {
        get;
        set;
    } = new List<TaskItem>();

    // Göreve yüklenen dosyalar
    public ICollection<TaskFile> Files
    {
        get;
        set;
    } = new List<TaskFile>();

    public ICollection<TaskMessage> Messages
    {
        get;
        set;
    } = new List<TaskMessage>();
}