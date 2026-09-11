import type { Task } from "../types/Task";

export function isAwaitingAssignment(task: Task): boolean {
    return task.assignedGroupId != null &&
        !task.assignedUserId?.trim() &&
        [1, 2, 3].includes(task.status);
}
