namespace HukukUyum.API.DTOs.Auth;

public class ProfileResponseDto
{
    public string UserId { get; set; } =
        string.Empty;

    public string FullName { get; set; } =
        string.Empty;

    public string Email { get; set; } =
        string.Empty;

    public List<string> Roles { get; set; } =
        new();
}