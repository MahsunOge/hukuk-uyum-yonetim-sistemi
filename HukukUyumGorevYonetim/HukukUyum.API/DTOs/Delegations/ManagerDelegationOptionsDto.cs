namespace HukukUyum.API.DTOs.Delegations;

public class ManagerDelegationOptionsDto
{
    public List<ManagerDelegationGroupOptionDto> Groups { get; set; } =
        new();
}

public class ManagerDelegationGroupOptionDto
{
    public int GroupId { get; set; }

    public string GroupName { get; set; } =
        string.Empty;

    public string ManagerUserId { get; set; } =
        string.Empty;

    public string ManagerFullName { get; set; } =
        string.Empty;

    public List<ManagerDelegationEmployeeOptionDto> Employees { get; set; } =
        new();
}

public class ManagerDelegationEmployeeOptionDto
{
    public string UserId { get; set; } =
        string.Empty;

    public string FullName { get; set; } =
        string.Empty;

    public string? Email { get; set; }
}
