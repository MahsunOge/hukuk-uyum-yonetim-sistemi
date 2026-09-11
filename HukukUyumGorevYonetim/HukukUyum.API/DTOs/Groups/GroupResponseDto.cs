namespace HukukUyum.API.DTOs.Groups;

public class GroupResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } =
        string.Empty;

    public DateTime CreatedAt
    {
        get;
        set;
    }

    public int UserCount { get; set; }

    public string ManagerUserId
    {
        get;
        set;
    } = string.Empty;

    public string ManagerFullName
    {
        get;
        set;
    } = string.Empty;

    public string ManagerEmail
    {
        get;
        set;
    } = string.Empty;
}