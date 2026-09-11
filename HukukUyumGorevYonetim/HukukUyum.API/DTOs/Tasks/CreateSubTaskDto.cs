using HukukUyum.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.Tasks;

public class CreateSubTaskDto
{
    [Required(
        ErrorMessage =
            "Alt görev başlığı zorunludur.")]
    [MaxLength(200)]
    public string Title { get; set; } =
        string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } =
        TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    public string? AssignedUserId { get; set; }

    public int? AssignedGroupId { get; set; }
}