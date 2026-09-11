using HukukUyum.API.Enums;
using HukukUyum.API.Identity;

namespace HukukUyum.API.Entities;

public class LeaveRequest
{
    public int Id { get; set; }

    public string UserId { get; set; } =
        string.Empty;

    public ApplicationUser User { get; set; } =
        null!;

    public LeaveType LeaveType { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? Description { get; set; }

    public LeaveStatus Status { get; set; } =
        LeaveStatus.Pending;

    public string? ReviewedByUserId { get; set; }

    public ApplicationUser? ReviewedByUser { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime CreatedAt { get; set; } =
        DateTime.UtcNow;
}
