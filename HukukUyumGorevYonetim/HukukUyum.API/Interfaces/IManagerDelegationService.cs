using HukukUyum.API.DTOs.Delegations;

namespace HukukUyum.API.Interfaces;

public interface IManagerDelegationService
{
    Task<ManagerDelegationResponseDto> CreateAsync(
        string currentUserId,
        bool isAdmin,
        CreateManagerDelegationDto dto);

    Task<List<ManagerDelegationResponseDto>> GetAllAsync();

    Task<List<ManagerDelegationResponseDto>> GetMyDelegationsAsync(
        string currentUserId);

    Task<ManagerDelegationOptionsDto> GetOptionsAsync(
        string currentUserId,
        bool isAdmin);

    Task<bool> EndAsync(
        int id,
        string currentUserId,
        bool isAdmin);

    Task<bool> HasActiveManagerAccessAsync(
        string userId,
        int groupId);

    Task<List<int>> GetAccessibleGroupIdsAsync(
        string userId);
}
