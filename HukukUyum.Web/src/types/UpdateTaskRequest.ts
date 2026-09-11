export interface UpdateTaskRequest {
    title: string;
    description: string | null;
    priority: number;
    status: number;
    startDate: string | null;
    dueDate: string | null;
    assignedUserId: string | null;
    assignedGroupId: number | null;
}


