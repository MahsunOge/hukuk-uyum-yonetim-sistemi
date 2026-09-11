namespace HukukUyum.API.DTOs.Groups;

public class ManagedMemberResponseDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public bool IsManager { get; set; }
    public bool IsOnLeave { get; set; }
    public int NewTaskCount { get; set; }
    public int InProgressTaskCount { get; set; }
    public int OnHoldTaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public int OverdueTaskCount { get; set; }
    public int ActiveTaskCount => NewTaskCount + InProgressTaskCount + OnHoldTaskCount;
}
