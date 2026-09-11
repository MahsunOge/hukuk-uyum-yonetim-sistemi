namespace HukukUyum.API.DTOs.Auth;

public class LoginResponseDto
{
    public string Token { get; set; } =
        string.Empty;

    public bool MustChangePassword
    {
        get;
        set;
    }
}