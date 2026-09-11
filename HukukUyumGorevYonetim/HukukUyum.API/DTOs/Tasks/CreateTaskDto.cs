using HukukUyum.API.Enums;
using System.ComponentModel.DataAnnotations;

public class CreateTaskDto
{
    [Required(
        ErrorMessage = "Görev başlığı zorunludur.")]
    [MaxLength(200)]
    public string Title { get; set; } =
        string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } =
        TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    // Kişiye atama
    public string? AssignedUserId { get; set; }

    // Gruba atama
    public int? AssignedGroupId { get; set; }
}