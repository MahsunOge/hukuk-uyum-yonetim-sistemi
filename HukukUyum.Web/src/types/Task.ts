export interface Task {
    id: number;
    title: string;
    description: string | null;
    priority: number;
    status: number;
    createdAt: string;
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    isOverdue: boolean;
    assignedUserId: string | null;
    assignedGroupId: number | null;
}


