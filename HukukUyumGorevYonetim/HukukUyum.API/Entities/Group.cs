using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class Group
{
    public int Id { get; set; }

    public string Name { get; set; } =
        string.Empty;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    // Geçiş aşamasında nullable.
    public string? ManagerUserId { get; set; }

    public ApplicationUser? ManagerUser
    {
        get;
        set;
    }

    public ICollection<UserGroup> UserGroups
    {
        get;
        set;
    } = new List<UserGroup>();

    public ICollection<TaskItem> Tasks
    {
        get;
        set;
    } = new List<TaskItem>();

    public ICollection<TaskCategory> TaskCategories
    {
        get;
        set;
    } = new List<TaskCategory>();
}