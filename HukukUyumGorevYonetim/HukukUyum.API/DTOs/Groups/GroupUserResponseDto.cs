namespace HukukUyum.API.DTOs.Groups;

public class GroupUserResponseDto
{
    public string UserId { get; set; } =
        string.Empty;

    public string FullName { get; set; } =
        string.Empty;

    public string Email { get; set; } =
        string.Empty;

    public bool IsManager { get; set; }
}