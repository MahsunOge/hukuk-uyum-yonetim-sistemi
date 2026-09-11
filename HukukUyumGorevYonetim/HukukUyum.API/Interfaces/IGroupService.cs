using HukukUyum.API.DTOs.Groups;

namespace HukukUyum.API.Interfaces;

public interface IGroupService
{
    Task<List<ManagedMemberResponseDto>> GetManagedMembersAsync(string currentUserId);

    Task<List<GroupResponseDto>>
    GetAllAsync(
        string currentUserId,
        bool canViewAllGroups);

    Task<GroupResponseDto?>
        GetByIdAsync(int id);

    Task<GroupResponseDto>
        CreateAsync(
            CreateGroupDto dto);

    Task<bool>
        AddUserToGroupAsync(
            int groupId,
            string userId);

    Task<bool>
        RemoveUserFromGroupAsync(
            int groupId,
            string userId);

    Task<List<GroupUserResponseDto>>
        GetGroupUsersAsync(
            int groupId);

    Task<GroupResponseDto?>
    UpdateGroupManagerAsync(
        int groupId,
        string managerUserId);
}
