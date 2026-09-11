export interface Group {
    id: number;
    name: string;
    createdAt: string;
    userCount: number;

    managerUserId: string;
    managerFullName: string;
    managerEmail: string;
}
