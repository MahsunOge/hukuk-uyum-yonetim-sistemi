import { useMemo, useState } from "react";

import {
    AppBar,
    Avatar,
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    getCurrentUserName,
    getCurrentUserRoles,
    type AppRole,
} from "../utils/auth";

interface MainLayoutProps {
    onLogout: () => void;
}

interface MenuItem {
    text: string;
    path: string;
    roles: AppRole[];
}

const drawerWidth = 230;

function MainLayout({
    onLogout,
}: MainLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const isMobile = useMediaQuery(
        theme.breakpoints.down("md")
    );

    const [
        mobileDrawerOpen,
        setMobileDrawerOpen,
    ] = useState(false);

    const currentRoles =
        getCurrentUserRoles();

    const currentUserName =
        getCurrentUserName();

    const userInitial =
        currentUserName
            .trim()
            .charAt(0)
            .toUpperCase() || "K";

    const primaryRole =
        currentRoles.includes("Admin")
            ? "Admin"
            : currentRoles.includes("Manager")
                ? "Manager"
                : "Employee";

    const roleDisplayName =
        primaryRole === "Employee"
            ? "Çalışan"
            : primaryRole;

    const allMenuItems: MenuItem[] = [
        {
            text:
                primaryRole === "Employee"
                    ? "Görev Özetim"
                    : "Dashboard",
            path: "/dashboard",
            roles: [
                "Admin",
                "Manager",
                "Employee",
            ],
        },
        {
            text:
                primaryRole === "Employee"
                    ? "Görevlerim"
                    : "Görevler",
            path: "/tasks",
            roles: [
                "Admin",
                "Manager",
                "Employee",
            ],
        },
        {
            text: "Yeni Görev",
            path: "/tasks/create",
            roles: [
                "Admin",
                "Manager",
            ],
        },
        {
            text: "Kullanıcılar",
            path: "/users",
            roles: ["Admin"],
        },
        {
            text: "Gruplar",
            path: "/groups",
            roles: [
                "Admin",
                "Manager",
            ],
        },
        {
            text: "Dosyalar",
            path: "/files",
            roles: [
                "Admin",
                "Manager",
            ],
        },
        {
            text: "Raporlar",
            path: "/reports",
            roles: [
                "Admin",
                "Manager",
            ],
        },
        {
            text: "Ayarlar",
            path: "/settings",
            roles: ["Admin"],
        },
    ];

    const menuItems = useMemo(
        () =>
            allMenuItems.filter((item) =>
                item.roles.some((role) =>
                    currentRoles.includes(role)
                )
            ),
        [currentRoles.join(",")]
    );

    const handleMenuClick = (
        path: string
    ) => {
        navigate(path);

        if (isMobile) {
            setMobileDrawerOpen(false);
        }
    };

    const isMenuItemSelected = (
        path: string
    ) => {
        if (path === "/tasks") {
            return (
                location.pathname === "/tasks" ||
                (
                    location.pathname.startsWith(
                        "/tasks/"
                    ) &&
                    location.pathname !==
                    "/tasks/create"
                )
            );
        }

        return location.pathname === path;
    };

    const drawerContent = (
        <>
            <Toolbar />

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                        borderBottom: 1,
                        borderColor: "divider",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 1.5,
                            alignItems: "center",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: "primary.main",
                                fontWeight: 700,
                            }}
                        >
                            {userInitial}
                        </Avatar>

                        <Box
                            sx={{
                                minWidth: 0,
                                flexGrow: 1,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 700,
                                    overflow: "hidden",
                                    textOverflow:
                                        "ellipsis",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {currentUserName}
                            </Typography>

                            <Chip
                                label={
                                    roleDisplayName
                                }
                                size="small"
                                color={
                                    primaryRole ===
                                        "Admin"
                                        ? "error"
                                        : primaryRole ===
                                            "Manager"
                                            ? "warning"
                                            : "primary"
                                }
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        overflowY: "auto",
                        flexGrow: 1,
                    }}
                >
                    <List sx={{ py: 1 }}>
                        {menuItems.map((item) => {
                            const selected =
                                isMenuItemSelected(
                                    item.path
                                );

                            return (
                                <ListItemButton
                                    key={item.path}
                                    selected={selected}
                                    onClick={() =>
                                        handleMenuClick(
                                            item.path
                                        )
                                    }
                                    sx={{
                                        mx: 1,
                                        my: 0.5,
                                        borderRadius: 1,

                                        "&.Mui-selected":
                                        {
                                            borderLeft:
                                                "4px solid",
                                            borderLeftColor:
                                                "primary.main",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            item.text
                                        }
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>
            </Box>
        </>
    );

    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                minHeight: "100vh",
            }}
        >
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (currentTheme) =>
                        currentTheme.zIndex.drawer +
                        1,
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            aria-label="Menüyü aç"
                            onClick={() =>
                                setMobileDrawerOpen(
                                    true
                                )
                            }
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            textAlign: {
                                xs: "left",
                                md: "center",
                            },
                        }}
                    >
                        Hukuk Uyum
                    </Typography>

                    <Box
                        sx={{
                            mr: 2,
                            display: {
                                xs: "none",
                                sm: "flex",
                            },
                            flexDirection: "row",
                            gap: 1,
                            alignItems: "center",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor:
                                    "background.paper",
                                color: "primary.main",
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            {userInitial}
                        </Avatar>

                        <Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                }}
                            >
                                {currentUserName}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    opacity: 0.85,
                                }}
                            >
                                {roleDisplayName}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        color="inherit"
                        onClick={onLogout}
                        sx={{
                            whiteSpace: "nowrap",
                        }}
                    >
                        Çıkış Yap
                    </Button>
                </Toolbar>
            </AppBar>

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,

                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileDrawerOpen}
                    onClose={() =>
                        setMobileDrawerOpen(false)
                    }
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },
                    minWidth: 0,
                    minHeight: "100vh",
                    backgroundColor: "#f5f5f5",
                }}
            >
                <Toolbar />

                <Box
                    sx={{
                        width: "100%",
                        boxSizing: "border-box",
                        p: {
                            xs: 2,
                            sm: 3,
                            lg: 4,
                        },
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default MainLayout;