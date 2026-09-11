using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class GroupManagerDelegation
{
    public int Id { get; set; }

    public int GroupId { get; set; }

    public Group Group { get; set; } =
        null!;

    public string OriginalManagerUserId { get; set; } =
        string.Empty;

    public ApplicationUser OriginalManagerUser { get; set; } =
        null!;

    public string DelegateUserId { get; set; } =
        string.Empty;

    public ApplicationUser DelegateUser { get; set; } =
        null!;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; } =
        true;

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;

    public string CreatedByUserId { get; set; } =
        string.Empty;

    public ApplicationUser CreatedByUser { get; set; } =
        null!;
}
