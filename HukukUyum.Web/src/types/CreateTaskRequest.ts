export interface CreateTaskRequest {
    title: string;
    description: string | null;
    priority: number;
    dueDate: string | null;
    assignedUserId: string | null;
    assignedGroupId: number | null;
}
