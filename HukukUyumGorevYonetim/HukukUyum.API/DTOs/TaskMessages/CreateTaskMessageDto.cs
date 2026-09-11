using System.ComponentModel.DataAnnotations;

namespace HukukUyum.API.DTOs.TaskMessages;

public class CreateTaskMessageDto
{
    [Required(ErrorMessage = "Mesaj boş olamaz.")]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}