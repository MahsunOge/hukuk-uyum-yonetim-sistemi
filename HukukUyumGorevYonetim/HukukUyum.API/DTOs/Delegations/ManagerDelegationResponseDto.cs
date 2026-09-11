namespace HukukUyum.API.DTOs.Delegations;

public class ManagerDelegationResponseDto
{
    public int Id { get; set; }

    public int GroupId { get; set; }

    public string GroupName { get; set; } =
        string.Empty;

    public string OriginalManagerUserId { get; set; } =
        string.Empty;

    public string OriginalManagerFullName { get; set; } =
        string.Empty;

    public string DelegateUserId { get; set; } =
        string.Empty;

    public string DelegateUserFullName { get; set; } =
        string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public bool IsCurrentlyEffective { get; set; }

    public DateTime CreatedAt { get; set; }

    public string CreatedByUserId { get; set; } =
        string.Empty;

    public string CreatedByUserFullName { get; set; } =
        string.Empty;
}
