import RoleLayout from "./RoleLayout";

interface UserLayoutProps {
    onLogout: () => void;
}

function UserLayout({
    onLogout,
}: UserLayoutProps) {
    const menuItems = [
        {
            text: "Genel Bakış",
            path: "/dashboard",
        },
        {
            text: "Yeni Talep",
            path: "/requests/create",
        },
        {
            text: "Taleplerim",
            path: "/my-requests",
        },
        {
            text: "Ayarlar",
            path: "/settings",
        },
    ];

    return (
        <RoleLayout
            onLogout={onLogout}
            role="User"
            roleLabel="Talep Kullanıcısı"
            roleColor="primary"
            dashboardTitle="Talep Yönetimi"
            menuItems={menuItems}
            layoutVariant="requestUser"
        />
    );
}

export default UserLayout;
