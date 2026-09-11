using HukukUyum.API.DTOs.Users;

namespace HukukUyum.API.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();

    Task<UserResponseDto?> GetByIdAsync(string id);

    Task<UserResponseDto?> UpdateAsync(
        string id,
        UpdateUserDto updateUserDto);

    Task<bool> DeleteAsync(string id);
}
