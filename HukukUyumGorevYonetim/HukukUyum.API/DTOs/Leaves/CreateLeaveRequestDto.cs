using HukukUyum.API.Enums;

namespace HukukUyum.API.DTOs.Leaves;

public class CreateLeaveRequestDto
{
    public LeaveType LeaveType { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string? Description { get; set; }
}
