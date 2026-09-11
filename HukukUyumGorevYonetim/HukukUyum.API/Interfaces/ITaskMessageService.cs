using HukukUyum.API.DTOs.TaskMessages;

namespace HukukUyum.API.Interfaces;

public interface ITaskMessageService
{
    Task<int> GetUnreadCountAsync(int taskId, string userId, bool isAdmin);
    Task MarkReadAsync(int taskId, int throughMessageId, string userId, bool isAdmin);
    Task<List<TaskMessageResponseDto>> GetMessagesAsync(
        int taskId,
        string currentUserId,
        bool isAdmin);

    Task<TaskMessageResponseDto> CreateMessageAsync(
        int taskId,
        CreateTaskMessageDto dto,
        string currentUserId,
        bool isAdmin);
}
