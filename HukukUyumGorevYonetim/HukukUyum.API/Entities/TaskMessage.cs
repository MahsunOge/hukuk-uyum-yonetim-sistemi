using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class TaskMessage
{
    public int Id { get; set; }

    public int TaskItemId { get; set; }

    public TaskItem TaskItem { get; set; } =
        null!;

    public string UserId { get; set; } =
        string.Empty;

    public ApplicationUser User { get; set; } =
        null!;

    public string Message { get; set; } =
        string.Empty;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}