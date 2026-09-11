namespace HukukUyum.API.DTOs.Tasks;

public class TaskAssignmentHistoryDto
{
    public int Id { get; set; }

    public string? ActionByUserId { get; set; }

    public string ActionByUserFullName { get; set; } =
        string.Empty;

    public string Description { get; set; } =
        string.Empty;

    public DateTime CreatedAt { get; set; }
}
