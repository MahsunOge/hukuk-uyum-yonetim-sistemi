import RoleLayout from "./RoleLayout";

interface AdminLayoutProps {
    onLogout: () => void;
}

function AdminLayout({
    onLogout,
}: AdminLayoutProps) {
    const menuItems = [
        {
            text: "Genel Bakış",
            path: "/dashboard",
        },
        {
            text: "Tüm Görevler",
            path: "/tasks",
        },
        {
            text: "Yeni Görev",
            path: "/tasks/create",
        },
        {
            text: "Kullanıcılar",
            path: "/users",
        },
        {
            text: "Kullanıcı Başvuruları",
            path: "/user-applications",
        },
        {
            text: "Gruplar",
            path: "/groups",
        },
        {
            text: "Dosyalar",
            path: "/files",
        },
        {
            text: "Raporlar",
            path: "/reports",
        },
        {
            text: "İzin Yönetimi",
            path: "/leaves",
        },
        {
            text: "Yönetici Vekaletleri",
            path: "/manager-delegations",
        },
        {
            text: "Sistem Hareketleri",
            path: "/audit-logs",
        },
        {
            text: "Ayarlar",
            path: "/settings",
        },
    ];

    return (
        <RoleLayout
            onLogout={onLogout}
            role="Admin"
            roleLabel="Sistem Yöneticisi"
            roleColor="error"
            dashboardTitle="Sistem Yönetimi"
            menuItems={menuItems}
        />
    );
}

export default AdminLayout;
