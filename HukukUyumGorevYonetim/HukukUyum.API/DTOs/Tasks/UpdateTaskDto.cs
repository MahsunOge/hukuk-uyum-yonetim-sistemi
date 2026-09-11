using System.ComponentModel.DataAnnotations;
using HukukUyum.API.Enums;
using TaskStatus = HukukUyum.API.Enums.TaskStatus;

namespace HukukUyum.API.DTOs.Tasks;

public class UpdateTaskDto
{
    [Required(
        ErrorMessage = "Görev başlığı zorunludur.")]
    [MaxLength(
        200,
        ErrorMessage = "Görev başlığı en fazla 200 karakter olabilir.")]
    public string Title { get; set; } = string.Empty;

    [MaxLength(
        2000,
        ErrorMessage = "Görev açıklaması en fazla 2000 karakter olabilir.")]
    public string? Description { get; set; }

    public TaskPriority Priority { get; set; }

    public TaskStatus Status { get; set; }

    public DateTime? DueDate { get; set; }

    public string? AssignedUserId { get; set; }

    public int? AssignedGroupId { get; set; }
}