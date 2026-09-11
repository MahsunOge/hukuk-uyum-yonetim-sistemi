using HukukUyum.API.DTOs.Leaves;

namespace HukukUyum.API.Interfaces;

public interface ILeaveService
{
    Task<LeaveRequestResponseDto> CreateAsync(
        string currentUserId,
        CreateLeaveRequestDto dto);

    Task<List<LeaveRequestResponseDto>> GetMyLeavesAsync(
        string currentUserId);

    Task<List<LeaveRequestResponseDto>> GetAllAsync();

    Task<List<LeaveRequestResponseDto>> GetManagedGroupLeavesAsync(
        string managerUserId);

    Task<LeaveRequestResponseDto?> GetByIdAsync(
        int id,
        string currentUserId,
        bool isAdmin,
        bool isManager);

    Task<bool> ReviewAsync(
        int id,
        string reviewerUserId,
        bool isAdmin,
        bool isManager,
        ReviewLeaveRequestDto dto);

    Task<bool> CancelAsync(
        int id,
        string currentUserId,
        bool isAdmin,
        CancelLeaveRequestDto dto);
}
