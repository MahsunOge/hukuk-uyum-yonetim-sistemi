namespace HukukUyum.API.Enums;

public enum AssignGroupTaskResult
{
    Success = 1,
    TaskNotFound = 2,
    NotAssignedToGroup = 3,
    NotGroupManager = 4,
    UserNotFound = 5,
    UserNotInGroup = 6,
    AlreadyAssigned = 7,
    TaskClosed = 8
}