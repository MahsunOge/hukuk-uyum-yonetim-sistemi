using HukukUyum.API.DTOs.UserApplications;

namespace HukukUyum.API.Interfaces;

public interface IUserApplicationService
{
    Task<UserApplicationResponseDto>
        CreateAsync(
            CreateUserApplicationDto dto);

    Task<List<UserApplicationResponseDto>>
        GetAllAsync();

    Task<UserApplicationResponseDto?>
        GetByIdAsync(int id);

    Task<UserApplicationResponseDto?>
        ApproveAsync(
            int id,
            ApproveUserApplicationDto dto,
            string reviewedByUserId);

    Task<UserApplicationResponseDto?>
        RejectAsync(
            int id,
            RejectUserApplicationDto dto,
            string reviewedByUserId);
}