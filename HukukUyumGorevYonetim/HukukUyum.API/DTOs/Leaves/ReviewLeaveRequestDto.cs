using HukukUyum.API.Enums;

namespace HukukUyum.API.DTOs.Leaves;

public class ReviewLeaveRequestDto
{
    public LeaveStatus Status { get; set; }

    public string? RejectionReason { get; set; }
}
