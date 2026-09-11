import RoleLayout from "./RoleLayout";

interface EmployeeLayoutProps {
    onLogout: () => void;
}

function EmployeeLayout({
    onLogout,
}: EmployeeLayoutProps) {
    const menuItems = [
        {
            text: "Görev Özetim",
            path: "/dashboard",
        },
        {
            text: "Görevlerim",
            path: "/tasks",
        },
        {
            text: "İzinlerim",
            path: "/leaves",
        },
        {
            text: "Ayarlar",
            path: "/settings",
        },
    ];

    return (
        <RoleLayout
            onLogout={onLogout}
            role="Employee"
            roleLabel="Çalışan"
            roleColor="primary"
            dashboardTitle="Kişisel Görev Takibi"
            menuItems={menuItems}
            layoutVariant="requestUser"
        />
    );
}

export default EmployeeLayout;
