using System.ComponentModel.DataAnnotations;
using TaskStatus =
    HukukUyum.API.Enums.TaskStatus;

namespace HukukUyum.API.DTOs.Tasks;

public class UpdateTaskStatusDto
{
    [Required]
    public TaskStatus Status { get; set; }
}