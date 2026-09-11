namespace HukukUyum.API.Enums;

public enum TakeTaskResult
{
    Success = 1,
    TaskNotFound = 2,
    NotAssignedToGroup = 3,
    UserNotInGroup = 4,
    AlreadyAssignedToUser = 5,
    TaskClosed = 6
}