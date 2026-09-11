namespace HukukUyum.API.DTOs.Delegations;

public class CreateManagerDelegationDto
{
    public int GroupId { get; set; }

    public string DelegateUserId { get; set; } =
        string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }
}
