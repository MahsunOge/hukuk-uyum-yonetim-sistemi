import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Link as RouterLink, useLocation } from "react-router-dom";

interface NavigationItem { text: string; path: string }

export default function PageBreadcrumbs({ menuItems }: { menuItems: NavigationItem[] }) {
    const { pathname } = useLocation();
    const normalizedPath = pathname.replace(/\/+$/, "") || "/dashboard";
    const taskLabel = menuItems.find(item => item.path === "/tasks")?.text ?? "Görevler";
    const requestLabel = menuItems.find(item => item.path === "/my-requests")?.text ?? "Taleplerim";
    const items = [{ text: "Genel Bakış", path: "/dashboard" }];

    if (normalizedPath.startsWith("/tasks/")) {
        items.push({ text: taskLabel, path: "/tasks" });
        items.push({ text: normalizedPath === "/tasks/create" ? "Yeni Görev" : "Görev Detayı", path: normalizedPath });
    } else if (normalizedPath.startsWith("/requests/")) {
        items.push({ text: requestLabel, path: "/my-requests" });
        items.push({ text: normalizedPath === "/requests/create" ? "Yeni Talep" : "Talep Detayı", path: normalizedPath });
    } else if (normalizedPath !== "/dashboard") {
        const labels: Record<string, string> = {
            "/profile": "Profilim", "/account/change-password": "Şifre Değiştir",
            "/change-password": "Şifre Değiştir", "/unauthorized": "Erişim Yetkisi",
        };
        items.push({
            text: menuItems.find(item => item.path === normalizedPath)?.text ?? labels[normalizedPath] ?? "Sayfa Bulunamadı",
            path: normalizedPath,
        });
    }

    return (
        <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
            <Typography aria-current="page" variant="body2" noWrap sx={{ display: { xs: "block", md: "none" }, fontWeight: 650 }}>
                {items.at(-1)?.text}
            </Typography>
            <Breadcrumbs aria-label="Sayfa yolu" separator={<NavigateNextRoundedIcon fontSize="small" />}
                sx={{ display: { xs: "none", md: "block" }, "& .MuiBreadcrumbs-ol": { flexWrap: "wrap", rowGap: 0.5 } }}>
                {items.map((item, index) => index === items.length - 1 ? (
                    <Typography key={item.path} aria-current="page" variant="body2" sx={{ fontWeight: 650 }}>
                        {item.text}
                    </Typography>
                ) : (
                    <Link key={item.path} component={RouterLink} to={item.path} underline="hover" color="text.secondary"
                        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13 }}>
                        {index === 0 && <HomeRoundedIcon sx={{ fontSize: 17 }} />}
                        {item.text}
                    </Link>
                ))}
            </Breadcrumbs>
        </Box>
    );
}
