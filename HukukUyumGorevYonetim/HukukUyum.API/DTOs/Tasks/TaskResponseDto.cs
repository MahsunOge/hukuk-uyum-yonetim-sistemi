using HukukUyum.API.Enums;
using TaskStatus =
    HukukUyum.API.Enums.TaskStatus;

namespace HukukUyum.API.DTOs.Tasks;

public class TaskResponseDto
{
    public int Id { get; set; }

    public string Title { get; set; } =
        string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public TaskStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime? CompletedAt { get; set; }

    public bool IsOverdue { get; set; }

    public int? ParentTaskId { get; set; }

    public string? AssignedUserId { get; set; }

    public int? AssignedGroupId { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }
}