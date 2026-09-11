using HukukUyum.API.DTOs.Tasks;
using HukukUyum.API.Enums;
using TaskStatus =
    HukukUyum.API.Enums.TaskStatus;

namespace HukukUyum.API.Interfaces;

public interface ITaskService
{
    Task<List<TaskResponseDto>> GetAllAsync(
        string currentUserId,
        bool canViewAllTasks);

    Task<TaskResponseDto?> GetByIdAsync(
        int id,
        string currentUserId,
        bool canViewAllTasks);

    Task<TaskResponseDto> CreateAsync(
        CreateTaskDto createTaskDto,
        string currentUserId,
        bool isAdmin);

    Task<bool> UpdateAsync(
        int id,
        UpdateTaskDto updateTaskDto,
        string currentUserId);

    Task<bool> UpdateUserRequestAsync(
        int id,
        UpdateUserRequestDto updateUserRequestDto,
        string currentUserId);

    Task<bool> DeleteAsync(int id);

    Task<TakeTaskResult> TakeTaskAsync(
        int taskId,
        string currentUserId);

    Task<AssignGroupTaskResult>
        AssignGroupTaskAsync(
            int taskId,
            string managerUserId,
            string assignedUserId,
            bool isAdmin = false);

    Task<UpdateTaskStatusResult>
        UpdateStatusAsync(
            int taskId,
            string currentUserId,
            TaskStatus status);

    Task<TaskResponseDto?> CreateSubTaskAsync(
        int parentTaskId,
        CreateSubTaskDto createSubTaskDto);

    Task<List<TaskResponseDto>> GetSubTasksAsync(
        int parentTaskId,
        string currentUserId,
        bool canViewAllTasks);

    Task<TaskResponseDto> CreateUserRequestAsync(
        CreateUserRequestDto requestDto,
        string currentUserId);

    Task<List<TaskResponseDto>> GetMyRequestsAsync(
        string currentUserId);

    Task<TaskResponseDto?> GetUserRequestByIdAsync(
        int id,
        string currentUserId);

    Task<List<TaskAssignmentHistoryDto>>
        GetAssignmentHistoryAsync(
            int taskId,
            string currentUserId,
            bool canViewAllTasks);
}
