import {
    useEffect,
    useState,
} from "react";

import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
    ButtonBase,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";

import {
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import PageBreadcrumbs from "../components/common/PageBreadcrumbs";
import {
    getCurrentUserName,
} from "../utils/auth";
import type { AppRole } from "../utils/auth";

import api from "../api/axios";
import type { Task } from "../types/Task";
import { isAwaitingAssignment } from "../utils/taskAssignment";

export interface RoleMenuItem {
    text: string;
    path: string;
}

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    taskItemId: number | null;
}

interface UserApplicationBadgeItem {
    id: number;
    status: number;
}

interface RoleLayoutProps {
    onLogout: () => void;

    role: AppRole;
    roleLabel: string;

    dashboardTitle: string;

    menuItems: RoleMenuItem[];

    roleColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";

    layoutVariant?:
    | "default"
    | "requestUser";
}

const drawerWidth = 250;

function RoleLayout({
    onLogout,
    role,
    roleLabel,
    menuItems,
}: RoleLayoutProps) {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const theme =
        useTheme();

    const [unassignedTaskCount, setUnassignedTaskCount] = useState(0);
    const hasTeamMenu = menuItems.some(item => item.path === "/members");

    useEffect(() => {
        if (!hasTeamMenu) {
            setUnassignedTaskCount(0);
            return;
        }
        let disposed = false;
        let loading = false;
        const refreshCount = async () => {
            if (loading) return;
            loading = true;
            try {
                const response = await api.get<Task[]>("/Tasks");
                if (!disposed) setUnassignedTaskCount(response.data.filter(isAwaitingAssignment).length);
            } catch {
                if (!disposed) setUnassignedTaskCount(0);
            } finally {
                loading = false;
            }
        };
        void refreshCount();
        const timer = window.setInterval(() => void refreshCount(), 30000);
        const refresh = () => { void refreshCount(); };
        window.addEventListener("focus", refresh);
        return () => {
            disposed = true;
            window.clearInterval(timer);
            window.removeEventListener("focus", refresh);
        };
    }, [hasTeamMenu, location.pathname]);

    const isRequestRole =
        role === "User";

    const [
        currentUserName,
        setCurrentUserName,
    ] = useState(
        getCurrentUserName() ??
        "Kullanıcı"
    );

    const userInitial =
        currentUserName
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "K";

    const isMobile =
        useMediaQuery(
            theme.breakpoints.down(
                "md"
            )
        );

    const [
        mobileDrawerOpen,
        setMobileDrawerOpen,
    ] = useState(false);


    const [
        notifications,
        setNotifications,
    ] = useState<
        NotificationItem[]
    >([]);

    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);

    const [
        pendingApplicationCount,
        setPendingApplicationCount,
    ] = useState(0);

    const [
        notificationAnchorEl,
        setNotificationAnchorEl,
    ] =
        useState<HTMLElement | null>(
            null
        );

    const [
        profileAnchorEl,
        setProfileAnchorEl,
    ] =
        useState<HTMLElement | null>(
            null
        );

    const profileMenuOpen =
        Boolean(
            profileAnchorEl
        );

    useEffect(() => {
        const loadCurrentProfile =
            async () => {
                try {
                    const response =
                        await api.get<{
                            fullName: string;
                        }>(
                            "/Auth/profile"
                        );

                    if (
                        response.data
                            .fullName
                    ) {
                        setCurrentUserName(
                            response.data
                                .fullName
                        );
                    }
                } catch (
                error
                ) {
                    console.error(
                        "Profil bilgisi yüklenemedi:",
                        error
                    );
                }
            };

        const handleProfileUpdated =
            (
                event: Event
            ) => {
                const customEvent =
                    event as CustomEvent<{
                        fullName?: string;
                    }>;

                const updatedFullName =
                    customEvent.detail
                        ?.fullName;

                if (
                    updatedFullName &&
                    updatedFullName.trim()
                ) {
                    setCurrentUserName(
                        updatedFullName.trim()
                    );
                } else {
                    void loadCurrentProfile();
                }
            };

        void loadCurrentProfile();

        window.addEventListener(
            "profile-updated",
            handleProfileUpdated
        );

        return () => {
            window.removeEventListener(
                "profile-updated",
                handleProfileUpdated
            );
        };
    }, []);

    const loadNotifications =
        async () => {
            try {
                const [
                    notificationsResponse,
                    countResponse,
                ] =
                    await Promise.all(
                        [
                            api.get<
                                NotificationItem[]
                            >(
                                "/Notifications"
                            ),

                            api.get<{
                                count: number;
                            }>(
                                "/Notifications/unread-count"
                            ),
                        ]
                    );

                setNotifications(
                    notificationsResponse
                        .data
                );

                setUnreadCount(
                    countResponse.data
                        .count
                );
            } catch (
            error
            ) {
                console.error(
                    "Bildirimler yüklenemedi:",
                    error
                );
            }
        };

    const loadPendingApplications =
        async () => {
            if (
                role !==
                "Admin"
            ) {
                setPendingApplicationCount(
                    0
                );

                return;
            }

            try {
                const response =
                    await api.get<
                        UserApplicationBadgeItem[]
                    >(
                        "/UserApplications"
                    );

                const pendingCount =
                    response.data.filter(
                        (
                            application
                        ) =>
                            application.status ===
                            1
                    ).length;

                setPendingApplicationCount(
                    pendingCount
                );
            } catch (
            error
            ) {
                console.error(
                    "Bekleyen kullanıcı başvuruları alınamadı:",
                    error
                );
            }
        };

    useEffect(() => {
        void loadNotifications();
        void loadPendingApplications();
        const onChatRead = () => { void loadNotifications(); };
        window.addEventListener("chat-read", onChatRead);

        const intervalId =
            window.setInterval(
                () => {
                    void loadNotifications();
                    void loadPendingApplications();
                },
                30000
            );

        return () => {
            window.removeEventListener("chat-read", onChatRead);
            window.clearInterval(
                intervalId
            );
        };
    }, [role]);

    const handleNotificationClick =
        async (
            notification:
                NotificationItem
        ) => {
            try {
                if (
                    !notification.isRead
                ) {
                    await api.patch(
                        `/Notifications/${notification.id}/read`
                    );
                }

                setNotificationAnchorEl(
                    null
                );

                await loadNotifications();

                if (
                    notification.taskItemId
                ) {
                    navigate(
                        isRequestRole
                            ? `/requests/${notification.taskItemId}`
                            : `/tasks/${notification.taskItemId}`
                    );
                } else if (notification.title.toLocaleLowerCase("tr-TR").includes("izin")) {
                    navigate("/leaves");
                }
            } catch (
            error
            ) {
                console.error(
                    "Bildirim güncellenemedi:",
                    error
                );
            }
        };

    const handleMarkAllAsRead =
        async () => {
            try {
                await api.patch(
                    "/Notifications/read-all"
                );

                await loadNotifications();
            } catch (
            error
            ) {
                console.error(
                    "Bildirimler güncellenemedi:",
                    error
                );
            }
        };

    const handleProfileMenuOpen =
        (
            event:
                React.MouseEvent<HTMLElement>
        ) => {
            setProfileAnchorEl(
                event.currentTarget
            );
        };

    const handleProfileMenuClose =
        () => {
            setProfileAnchorEl(
                null
            );
        };

    const handleSettingsClick =
        () => {
            setProfileAnchorEl(
                null
            );

            navigate(
                "/settings"
            );
        };

    const handleLogoutClick =
        () => {
            setProfileAnchorEl(
                null
            );

            onLogout();
        };

    const handleMenuClick = (
        path: string
    ) => {
        navigate(
            path
        );

        if (
            isMobile
        ) {
            setMobileDrawerOpen(
                false
            );
        }
    };

    const isMenuSelected = (
        path: string
    ) => {
        if (
            path ===
            "/tasks"
        ) {
            return (
                location.pathname ===
                "/tasks" ||
                (
                    location.pathname.startsWith(
                        "/tasks/"
                    ) &&
                    location.pathname !==
                    "/tasks/create"
                )
            );
        }

        if (
            path ===
            "/my-requests"
        ) {
            return (
                location.pathname ===
                "/my-requests" ||
                location.pathname.startsWith(
                    "/requests/"
                ) &&
                location.pathname !==
                "/requests/create"
            );
        }

        return (
            location.pathname ===
            path
        );
    };

    const getMenuIcon = (
        path: string
    ) => {
        switch (
        path
        ) {
            case "/dashboard":
                return (
                    <DashboardRoundedIcon />
                );

            case "/tasks":
                return (
                    <AssignmentRoundedIcon />
                );

            case "/tasks/create":
                return (
                    <AddTaskRoundedIcon />
                );

            case "/users":
                return (
                    <PeopleAltRoundedIcon />
                );

            case "/user-applications":
                return (
                    <HowToRegRoundedIcon />
                );

            case "/members":
            case "/groups":
                return (
                    <GroupsRoundedIcon />
                );

            case "/files":
                return (
                    <FolderRoundedIcon />
                );

            case "/reports":
                return (
                    <AssessmentRoundedIcon />
                );

            case "/audit-logs":
                return (
                    <HistoryRoundedIcon />
                );

            case "/leaves":
                return (
                    <EventAvailableRoundedIcon />
                );

            case "/settings":
                return (
                    <SettingsRoundedIcon />
                );

            case "/requests/create":
                return (
                    <RateReviewRoundedIcon />
                );

            case "/my-requests":
                return (
                    <ListAltRoundedIcon />
                );

            default:
                return (
                    <AssignmentRoundedIcon />
                );
        }
    };

    const preferencePaths =
        [
            "/reports",
            "/audit-logs",
            "/settings",
        ];

    const mainMenuItems =
        menuItems.filter(
            (item) =>
                !preferencePaths.includes(
                    item.path
                )
        );

    const preferenceItems =
        menuItems.filter(
            (item) =>
                preferencePaths.includes(
                    item.path
                )
        );

    const selectedColor = theme.palette.mode === "dark" ? "#93C5FD" : "#163A63";
    const shellBorderColor = theme.palette.mode === "dark"
        ? "rgba(148,163,184,0.10)"
        : "rgba(22,58,99,0.08)";

    const renderMenuItems =
        (
            items:
                RoleMenuItem[]
        ) => {
            return (
                <List
                    disablePadding
                >
                    {items.map(
                        (
                            item
                        ) => {
                            const selected =
                                isMenuSelected(
                                    item.path
                                );

                            return (
                                <ListItemButton
                                    key={
                                        item.path
                                    }
                                    selected={
                                        selected
                                    }
                                    onClick={() =>
                                        handleMenuClick(
                                            item.path
                                        )
                                    }
                                    sx={{
                                        position:
                                            "relative",

                                        mx: 1.5,

                                        mb: 0.5,

                                        px: 1.5,

                                        minHeight:
                                            46,

                                        borderRadius:
                                            2,

                                        color:
                                            selected
                                                ? selectedColor
                                                : "text.secondary",

                                        transition:
                                            "background-color 0.18s ease, color 0.18s ease",

                                        "& .MuiListItemIcon-root":
                                        {
                                            color:
                                                selected
                                                    ? selectedColor
                                                    : "text.disabled",
                                        },

                                        "&.Mui-selected": {
                                            backgroundColor: theme.palette.mode === "dark"
                                                ? "rgba(96,165,250,0.12)"
                                                : "rgba(59,130,246,0.08)",
                                        },
                                        "&.Mui-selected:hover": {
                                            backgroundColor: theme.palette.mode === "dark"
                                                ? "rgba(96,165,250,0.18)"
                                                : "rgba(59,130,246,0.13)",
                                        },

                                        "&:hover":
                                        {
                                            backgroundColor:
                                                "action.hover",

                                            color:
                                                selected
                                                    ? selectedColor
                                                    : "text.primary",
                                        },


                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth:
                                                38,

                                            "& svg":
                                            {
                                                fontSize:
                                                    20,
                                            },
                                        }}
                                    >
                                        {getMenuIcon(
                                            item.path
                                        )}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            item.text
                                        }
                                        slotProps={{
                                            primary:
                                            {
                                                sx: {
                                                    fontSize:
                                                        14,

                                                    fontWeight:
                                                        selected
                                                            ? 700
                                                            : 500,
                                                },
                                            },
                                        }}
                                    />

                                    {item.path === "/tasks" && hasTeamMenu && unassignedTaskCount > 0 && (
                                        <Badge color="warning" badgeContent={unassignedTaskCount} max={99}
                                            title="Çalışana atama bekleyen görevler"
                                            aria-label={`${unassignedTaskCount} görev atama bekliyor`}
                                            sx={{ ml: 1, mr: 1, "& .MuiBadge-badge": {
                                                position: "static", transform: "none", minWidth: 22,
                                                height: 22, borderRadius: 11, fontWeight: 700,
                                            } }} />
                                    )}
                                    {item.path ===
                                        "/user-applications" &&
                                        pendingApplicationCount >
                                        0 && (
                                            <Badge
                                                color="error"
                                                badgeContent={
                                                    pendingApplicationCount
                                                }
                                                max={
                                                    99
                                                }
                                                sx={{
                                                    mr: 1,

                                                    "& .MuiBadge-badge":
                                                    {
                                                        position:
                                                            "static",

                                                        transform:
                                                            "none",

                                                        minWidth:
                                                            22,

                                                        height:
                                                            22,

                                                        borderRadius:
                                                            11,

                                                        fontWeight:
                                                            700,
                                                    },
                                                }}
                                            />
                                        )}
                                </ListItemButton>
                            );
                        }
                    )}
                </List>
            );
        };

    const drawerContent =
        (
            <Box
                sx={{
                    display:
                        "flex",

                    flexDirection:
                        "column",

                    height:
                        "100%",

                    backgroundColor:
                        (
                            currentTheme
                        ) =>
                            currentTheme.palette.mode === "dark"
                                ? "#0F172A"
                                : "#FFFFFF",

                    color:
                        "text.primary",

                    borderRight:
                        "1px solid",

                    borderColor:
                        shellBorderColor,
                }}
            >
                <Box
                    sx={{
                        height: 78,

                        px: 2.5,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        borderBottom:
                            "1px solid",

                        borderColor:
                            shellBorderColor,
                    }}
                >
                    <Box
                        sx={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap: 1.25,
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,

                                height: 38,

                                borderRadius:
                                    2,

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                backgroundColor:
                                    "#163A63",

                                color:
                                    "#FFFFFF",

                                boxShadow:
                                    "0 4px 12px rgba(22, 58, 99, 0.18)",
                            }}
                        >
                            <GavelRoundedIcon
                                sx={{
                                    fontSize:
                                        21,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight:
                                        800,

                                    letterSpacing:
                                        "-0.02em",

                                    lineHeight:
                                        1.2,
                                }}
                            >
                                Hukuk Uyum
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Yönetim
                                Sistemi
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,

                        overflowY:
                            "auto",

                        py: 2.25,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            display:
                                "block",

                            px: 3,

                            mb: 1,

                            color:
                                "text.disabled",

                            fontWeight:
                                700,

                            fontSize:
                                10.5,

                            letterSpacing:
                                "0.1em",
                        }}
                    >
                        ANA MENÜ
                    </Typography>

                    {renderMenuItems(
                        mainMenuItems
                    )}

                    {preferenceItems.length >
                        0 && (
                            <>
                                <Box aria-hidden="true" sx={{ height: 24 }} />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        display:
                                            "block",

                                        px: 3,

                                        mb: 1,

                                        color:
                                            "text.disabled",

                                        fontWeight:
                                            700,

                                        fontSize:
                                            10.5,

                                        letterSpacing:
                                            "0.1em",
                                    }}
                                >
                                    TERCİHLER
                                </Typography>

                                {renderMenuItems(
                                    preferenceItems
                                )}
                            </>
                        )}
                </Box>

                <Box
                    sx={{
                        p: 2,

                        borderTop:
                            "1px solid",

                        borderColor:
                            shellBorderColor,
                    }}
                >
                    <Button
                        fullWidth
                        startIcon={
                            <LogoutRoundedIcon />
                        }
                        onClick={
                            onLogout
                        }
                        sx={{
                            justifyContent:
                                "flex-start",

                            color:
                                "text.secondary",

                            px: 1.5,

                            py: 1.15,

                            borderRadius:
                                2,

                            textTransform:
                                "none",

                            fontWeight:
                                600,

                            "&:hover":
                            {
                                backgroundColor:
                                    "action.hover",

                                color:
                                    "error.main",
                            },
                        }}
                    >
                        Çıkış Yap
                    </Button>
                </Box>
            </Box>
        );

    return (
        <Box
            sx={{
                display:
                    "flex",

                width:
                    "100%",

                minHeight:
                    "100vh",

                boxSizing:
                    "border-box",

                backgroundColor:
                    (
                        currentTheme
                    ) =>
                        currentTheme.palette.mode === "dark"
                            ? "#0B1120"
                            : "#F6F8FB",
            }}
        >
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: {
                        xs: "100%",

                        md: `calc(100% - ${drawerWidth}px)`,
                    },

                    ml: {
                        xs: 0,

                        md: `${drawerWidth}px`,
                    },

                    backgroundColor:
                        (
                            currentTheme
                        ) =>
                            currentTheme.palette.mode === "dark"
                                ? "rgba(15, 23, 42, 0.96)"
                                : "rgba(255, 255, 255, 0.96)",

                    color:
                        "text.primary",

                    borderBottom:
                        "1px solid",

                    borderColor:
                        shellBorderColor,

                    backdropFilter:
                        "blur(12px)",

                    zIndex: (
                        currentTheme
                    ) =>
                        currentTheme
                            .zIndex
                            .drawer -
                        1,
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 64,

                            md: 78,
                        },

                        px: {
                            xs: 2,

                            md: 3,
                        },
                    }}
                >
                    {isMobile && (
                        <IconButton
                            edge="start"
                            aria-label="Menüyü aç"
                            onClick={() =>
                                setMobileDrawerOpen(
                                    true
                                )
                            }
                            sx={{
                                mr: 1.5,
                            }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                    )}

                    <PageBreadcrumbs menuItems={menuItems} />

                    <Box
                        sx={{
                            ml: "auto",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap: {
                                xs: 0.5,

                                sm: 1.5,
                            },
                        }}
                    >
                        <Tooltip
                            title="Bildirimler"
                        >
                            <IconButton
                                onClick={(
                                    event
                                ) =>
                                    setNotificationAnchorEl(
                                        event.currentTarget
                                    )
                                }
                                sx={{
                                    width: 42,

                                    height: 42,

                                    border:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                    backgroundColor:
                                        "background.paper",

                                    "&:hover":
                                    {
                                        backgroundColor:
                                            "action.hover",
                                    },
                                }}
                            >
                                <Badge
                                    color="error"
                                    badgeContent={
                                        unreadCount
                                    }
                                    max={
                                        99
                                    }
                                    invisible={
                                        unreadCount ===
                                        0
                                    }
                                >
                                    <NotificationsNoneRoundedIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={
                                notificationAnchorEl
                            }
                            open={Boolean(
                                notificationAnchorEl
                            )}
                            onClose={() =>
                                setNotificationAnchorEl(
                                    null
                                )
                            }
                            slotProps={{
                                paper: {
                                    sx: {
                                        mt: 1,

                                        width: {
                                            xs: 300,

                                            sm: 380,
                                        },

                                        maxHeight:
                                            460,

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        borderRadius:
                                            2.5,

                                        boxShadow:
                                            "0 16px 40px rgba(15, 23, 42, 0.12)",
                                    },
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    px: 2,

                                    py: 1.25,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    gap: 2,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Bildirimler
                                </Typography>

                                {unreadCount >
                                    0 && (
                                        <Button
                                            size="small"
                                            onClick={
                                                handleMarkAllAsRead
                                            }
                                            sx={{
                                                textTransform:
                                                    "none",
                                            }}
                                        >
                                            Tümünü
                                            okundu
                                            yap
                                        </Button>
                                    )}
                            </Box>

                            <Divider />

                            {notifications.length ===
                                0 ? (
                                <Box
                                    sx={{
                                        px: 2,

                                        py: 4,

                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <NotificationsNoneRoundedIcon
                                        sx={{
                                            fontSize:
                                                32,

                                            color:
                                                "text.disabled",

                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Henüz
                                        bildiriminiz
                                        yok.
                                    </Typography>
                                </Box>
                            ) : (
                                notifications.map(
                                    (
                                        notification
                                    ) => (
                                        <MenuItem
                                            key={
                                                notification.id
                                            }
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                            }
                                            sx={{
                                                alignItems:
                                                    "flex-start",

                                                whiteSpace:
                                                    "normal",

                                                py: 1.5,

                                                px: 2,

                                                backgroundColor:
                                                    notification.isRead
                                                        ? "transparent"
                                                        : "action.selected",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    minWidth:
                                                        0,

                                                    width:
                                                        "100%",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "center",

                                                        gap: 1,
                                                    }}
                                                >
                                                    {!notification.isRead && (
                                                        <Box
                                                            sx={{
                                                                width:
                                                                    7,

                                                                height:
                                                                    7,

                                                                borderRadius:
                                                                    "50%",

                                                                backgroundColor:
                                                                    "#163A63",

                                                                flexShrink:
                                                                    0,
                                                            }}
                                                        />
                                                    )}

                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight:
                                                                notification.isRead
                                                                    ? 600
                                                                    : 800,
                                                        }}
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </Typography>
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display:
                                                            "block",

                                                        mt: 0.5,

                                                        lineHeight:
                                                            1.5,
                                                    }}
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{
                                                        display:
                                                            "block",

                                                        mt: 0.75,
                                                    }}
                                                >
                                                    {new Date(
                                                        notification.createdAt
                                                    ).toLocaleString(
                                                        "tr-TR"
                                                    )}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    )
                                )
                            )}
                        </Menu>

                        <Box>
                            <ButtonBase
                                type="button"
                                onClick={
                                    handleProfileMenuOpen
                                }
                                aria-label="Kullanıcı menüsünü aç"
                                aria-haspopup="menu"
                                aria-expanded={
                                    profileMenuOpen
                                        ? "true"
                                        : undefined
                                }
                                sx={{
                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    gap: 1.25,

                                    pl: {
                                        xs: 0,

                                        sm: 0.5,
                                    },

                                    pr: {
                                        xs: 0,

                                        sm: 1,
                                    },

                                    py: 0.75,

                                    borderRadius:
                                        2.5,

                                    textAlign: "left",

                                    "&.Mui-focusVisible": {
                                        outline: "2px solid",
                                        outlineColor: "primary.main",
                                        outlineOffset: 2,
                                    },

                                    cursor:
                                        "pointer",

                                    transition:
                                        "background-color 0.18s ease",

                                    "&:hover":
                                    {
                                        backgroundColor:
                                            "action.hover",
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 40,

                                        height: 40,

                                        bgcolor:
                                            "#163A63",

                                        fontSize:
                                            14,

                                        fontWeight:
                                            700,

                                        boxShadow:
                                            "0 2px 8px rgba(22,58,99,0.18)",
                                    }}
                                >
                                    {
                                        userInitial
                                    }
                                </Avatar>

                                <Box
                                    sx={{
                                        display:
                                        {
                                            xs: "none",

                                            sm: "block",
                                        },

                                        minWidth:
                                            110,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight:
                                                700,

                                            lineHeight:
                                                1.2,

                                            whiteSpace:
                                                "nowrap",
                                        }}
                                    >
                                        {
                                            currentUserName
                                        }
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {
                                            roleLabel
                                        }
                                    </Typography>
                                </Box>

                                <KeyboardArrowDownRoundedIcon
                                    sx={{
                                        display:
                                        {
                                            xs: "none",

                                            md: "block",
                                        },

                                        color:
                                            "text.secondary",

                                        transition:
                                            "transform 0.2s ease",

                                        transform:
                                            profileMenuOpen
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                    }}
                                />
                            </ButtonBase>

                            <Menu
                                anchorEl={
                                    profileAnchorEl
                                }
                                open={
                                    profileMenuOpen
                                }
                                onClose={
                                    handleProfileMenuClose
                                }
                                anchorOrigin={{
                                    vertical:
                                        "bottom",

                                    horizontal:
                                        "right",
                                }}
                                transformOrigin={{
                                    vertical:
                                        "top",

                                    horizontal:
                                        "right",
                                }}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            mt: 1,

                                            minWidth:
                                                240,

                                            borderRadius:
                                                2.5,

                                            border:
                                                "1px solid",

                                            borderColor:
                                                "divider",

                                            boxShadow:
                                                "0 16px 40px rgba(15,23,42,0.12)",
                                        },
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        px: 2,

                                        py: 1.5,

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        gap: 1.25,
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 42,

                                            height: 42,

                                            bgcolor:
                                                "#163A63",

                                            fontSize:
                                                14,

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {
                                            userInitial
                                        }
                                    </Avatar>

                                    <Box
                                        sx={{
                                            minWidth:
                                                0,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            {
                                                currentUserName
                                            }
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {
                                                roleLabel
                                            }
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                <MenuItem
                                    onClick={() => {
                                        handleProfileMenuClose();

                                        navigate(
                                            "/profile"
                                        );
                                    }}
                                    sx={{
                                        py: 1.25,

                                        gap: 1.5,
                                    }}
                                >
                                    <PersonRoundedIcon
                                        fontSize="small"
                                        color="action"
                                    />

                                    <Typography
                                        variant="body2"
                                    >
                                        Profilim
                                    </Typography>
                                </MenuItem>

                                <MenuItem
                                    onClick={
                                        handleSettingsClick
                                    }
                                    sx={{
                                        py: 1.25,

                                        gap: 1.5,
                                    }}
                                >
                                    <SettingsRoundedIcon
                                        fontSize="small"
                                        color="action"
                                    />

                                    <Typography
                                        variant="body2"
                                    >
                                        Ayarlar
                                    </Typography>
                                </MenuItem>

                                <Divider />

                                <MenuItem
                                    onClick={
                                        handleLogoutClick
                                    }
                                    sx={{
                                        py: 1.25,

                                        gap: 1.5,

                                        color:
                                            "error.main",
                                    }}
                                >
                                    <LogoutRoundedIcon
                                        fontSize="small"
                                    />

                                    <Typography
                                        variant="body2"
                                    >
                                        Çıkış Yap
                                    </Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width:
                            drawerWidth,

                        flexShrink:
                            0,

                        "& .MuiDrawer-paper":
                        {
                            width:
                                drawerWidth,

                            boxSizing:
                                "border-box",

                            borderRight:
                                0,
                        },
                    }}
                >
                    {
                        drawerContent
                    }
                </Drawer>
            )}

            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={
                        mobileDrawerOpen
                    }
                    onClose={() =>
                        setMobileDrawerOpen(
                            false
                        )
                    }
                    ModalProps={{
                        keepMounted:
                            true,
                    }}
                    sx={{
                        "& .MuiDrawer-paper":
                        {
                            width:
                                drawerWidth,

                            boxSizing:
                                "border-box",

                            borderRight:
                                0,
                        },
                    }}
                >
                    {
                        drawerContent
                    }
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

                    minHeight:
                        "100vh",

                    backgroundColor:
                        (
                            currentTheme
                        ) =>
                            currentTheme.palette.mode === "dark"
                                ? "#0B1120"
                                : "#F6F8FB",
                }}
            >
                <Toolbar
                    sx={{
                        minHeight: {
                            xs: 64,

                            md: 78,
                        },
                    }}
                />

                <Box
                    sx={{
                        width:
                            "100%",

                        boxSizing:
                            "border-box",

                        pt: {
                            xs: 2,
                            sm: 2.5,
                            md: 3,
                        },

                        pb: {
                            xs: 2,
                            sm: 2.5,
                            md: 3,
                        },

                        px: 0,
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default RoleLayout;
