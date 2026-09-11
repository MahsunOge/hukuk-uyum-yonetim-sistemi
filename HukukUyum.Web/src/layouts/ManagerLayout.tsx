import RoleLayout from "./RoleLayout";

interface ManagerLayoutProps {
    onLogout: () => void;
    isDelegated?: boolean;
}

function ManagerLayout({
    onLogout,
    isDelegated = false,
}: ManagerLayoutProps) {
    const menuItems =
        isDelegated
            ? [
                {
                    text: "Genel Bakış",
                    path: "/dashboard",
                },
                {
                    text: "Ekibimin Görevleri",
                    path: "/tasks",
                },
                {
                    text: "Üyeler",
                    path: "/members",
                },
                {
                    text: "Yeni Görev",
                    path: "/tasks/create",
                },
                {
                    text: "İzin Yönetimi",
                    path: "/leaves",
                },
                {
                    text: "Ayarlar",
                    path: "/settings",
                },
            ]
            : [
                {
                    text: "Genel Bakış",
                    path: "/dashboard",
                },
                {
                    text: "Ekibimin Görevleri",
                    path: "/tasks",
                },
                {
                    text: "Üyeler",
                    path: "/members",
                },
                {
                    text: "Yeni Görev",
                    path: "/tasks/create",
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
                    text: "Ayarlar",
                    path: "/settings",
                },
            ];

    return (
        <RoleLayout
            onLogout={onLogout}
            role={isDelegated ? "Employee" : "Manager"}
            roleLabel={
                isDelegated
                    ? "Vekil Yönetici"
                    : "Yönetici"
            }
            roleColor="warning"
            dashboardTitle={
                isDelegated
                    ? "Geçici Ekip Yönetimi"
                    : "Görev ve Ekip Yönetimi"
            }
            menuItems={menuItems}
        />
    );
}

export default ManagerLayout;
