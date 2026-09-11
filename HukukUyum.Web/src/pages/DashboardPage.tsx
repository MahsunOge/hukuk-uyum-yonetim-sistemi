import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    LinearProgress,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import UserDashboard from "../components/UserDashboard";
import api from "../api/axios";

import DashboardCharts from "../components/DashboardCharts";

import {
    getCurrentUserName,
    hasAnyRole,
} from "../utils/auth";

interface TaskItem {
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

interface GroupItem {
    id: number;
    name: string;
}

interface UserApplicationItem {
    id: number;
    status: number;
}

interface ManagedLeaveItem {
    userId: string;
    status: number;
    startDate: string;
    endDate: string;
}

interface DashboardDelegationItem {
    id: number;
    groupName: string;
    delegateUserFullName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isCurrentlyEffective: boolean;
}

interface DashboardCardProps {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    iconColor: string;
    iconBackground: string;
    onClick: () => void;
}

function DashboardCard({
    title,
    value,
    description,
    icon,
    iconColor,
    iconBackground,
    onClick,
}: DashboardCardProps) {
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                p: {
                    xs: 2,
                    md: 2.15,
                },
                minHeight: {
                    xs: 132,
                    lg: 142,
                },
                cursor: "pointer",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor:
                    "background.paper",
                transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",

                "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    backgroundColor:
                        iconColor,
                    opacity: 0.72,
                },

                "&:hover": {
                    transform:
                        "translateY(-2px)",
                    boxShadow:
                        "0 10px 24px rgba(15, 23, 42, 0.07)",
                    borderColor:
                        "rgba(22, 58, 99, 0.18)",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems:
                        "flex-start",
                    justifyContent:
                        "space-between",
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight:
                                750,
                            color:
                                "text.primary",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.7,
                            fontSize: {
                                xs: 30,
                                md: 32,
                            },
                            fontWeight:
                                850,
                            lineHeight:
                                1,
                            letterSpacing:
                                "-0.04em",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius:
                            2.25,
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        color:
                            iconColor,
                        backgroundColor:
                            (theme) =>
                                theme.palette.mode === "dark"
                                    ? theme.palette.action.hover
                                    : iconBackground,
                        boxShadow:
                            "0 8px 18px rgba(15,23,42,0.05)",
                        "& svg": {
                            fontSize:
                                21,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 2.2,
                    lineHeight:
                        1.45,
                    fontSize:
                        12.5,
                }}
            >
                {description}
            </Typography>
        </Paper>
    );
}

interface ManagementSummaryCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: ReactNode;
    backgroundColor: string;
    color: string;
    onClick?: () => void;
}

function ManagementSummaryCard({
    title,
    value,
    description,
    icon,
    backgroundColor,
    color,
    onClick,
}: ManagementSummaryCardProps) {
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                p: 2.25,
                minHeight: 170,

                cursor:
                    onClick
                        ? "pointer"
                        : "default",

                borderRadius: 3,

                border:
                    "1px solid",

                borderColor:
                    "divider",

                backgroundColor,

                color,

                position:
                    "relative",

                overflow:
                    "hidden",

                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",

                "&:hover":
                    onClick
                        ? {
                            transform:
                                "translateY(-3px)",

                            boxShadow:
                                "0 14px 32px rgba(15,23,42,0.10)",
                        }
                        : {},
            }}
        >
            <Box
                sx={{
                    position:
                        "absolute",

                    width: 150,
                    height: 150,

                    right: -50,
                    top: -55,

                    borderRadius:
                        "50%",

                    backgroundColor:
                        "rgba(255,255,255,0.10)",
                }}
            />

            <Stack
                sx={{
                    position:
                        "relative",

                    zIndex: 1,

                    height:
                        "100%",

                    minHeight: 120,
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,

                        borderRadius:
                            2,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        backgroundColor:
                            "rgba(255,255,255,0.16)",

                        mb: 1.25,
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        fontSize: 36,

                        lineHeight:
                            1,
                    }}
                >
                    {value}
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        mt: 1,
                        fontWeight:
                            700,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.75,
                        opacity: 0.8,
                    }}
                >
                    {description}
                </Typography>
            </Stack>
        </Paper>
    );
}

const quickActionButtonSx = {
    justifyContent:
        "flex-start",

    py: 1.25,
    px: 1.5,

    borderColor:
        "divider",

    borderRadius: 2,

    color:
        "text.primary",

    backgroundColor:
        "background.paper",

    fontWeight: 600,

    textTransform:
        "none",

    "& .MuiButton-startIcon":
    {
        color:
            "text.secondary",
    },

    "&:hover": {
        borderColor:
            "#7898B3",

        backgroundColor:
            "action.hover",

        color:
            "#315F8C",

        "& .MuiButton-startIcon":
        {
            color:
                "#315F8C",
        },
    },
};

function DashboardPage() {
    const navigate =
        useNavigate();

    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const currentUserName =
        getCurrentUserName() ??
        "Kullanıcı";

    const isAdmin =
        hasAnyRole([
            "Admin",
        ]);

    const isPermanentManager =
        hasAnyRole([
            "Manager",
        ]);

    const hasDelegatedManagerAccess =
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true";

    const isManager =
        isPermanentManager ||
        (
            hasAnyRole([
                "Employee",
            ]) &&
            hasDelegatedManagerAccess
        );

    const isEmployee =
        hasAnyRole([
            "Employee",
        ]) &&
        !hasDelegatedManagerAccess;

    const isUser =
        hasAnyRole([
            "User",
        ]);

    const canManageTasks =
        isAdmin ||
        isManager;

    const [
        tasks,
        setTasks,
    ] =
        useState<TaskItem[]>(
            []
        );

    const [
        groups,
        setGroups,
    ] =
        useState<GroupItem[]>(
            []
        );

    const [
        userApplications,
        setUserApplications,
    ] =
        useState<
            UserApplicationItem[]
        >([]);

    const [
        managedLeaves,
        setManagedLeaves,
    ] =
        useState<
            ManagedLeaveItem[]
        >([]);

    const [
        delegations,
        setDelegations,
    ] =
        useState<
            DashboardDelegationItem[]
        >([]);

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState("");

    useEffect(() => {
        const loadDashboardData =
            async () => {
                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    const tasksRequest =
                        isUser
                            ? Promise.resolve({
                                data:
                                    [] as TaskItem[],
                            })
                            : api.get<
                                TaskItem[]
                            >(
                                "/tasks"
                            );

                    const groupsRequest =
                        canManageTasks
                            ? api.get<
                                GroupItem[]
                            >(
                                "/groups"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as GroupItem[],
                                }
                            );

                    const applicationsRequest =
                        isAdmin
                            ? api.get<
                                UserApplicationItem[]
                            >(
                                "/UserApplications"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as UserApplicationItem[],
                                }
                            );

                    const leavesRequest =
                        canManageTasks
                            ? api.get<
                                ManagedLeaveItem[]
                            >(
                                isAdmin
                                    ? "/LeaveRequests"
                                    : "/LeaveRequests/managed-group"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as ManagedLeaveItem[],
                                }
                            );

                    const delegationsRequest =
                        canManageTasks
                            ? api.get<
                                DashboardDelegationItem[]
                            >(
                                isAdmin
                                    ? "/ManagerDelegations"
                                    : "/ManagerDelegations/my"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as DashboardDelegationItem[],
                                }
                            );

                    const [
                        tasksResponse,
                        groupsResponse,
                        applicationsResponse,
                        leavesResponse,
                        delegationsResponse,
                    ] =
                        await Promise.all(
                            [
                                tasksRequest,
                                groupsRequest,
                                applicationsRequest,
                                leavesRequest,
                                delegationsRequest,
                            ]
                        );

                    setTasks(
                        tasksResponse
                            .data
                    );

                    setGroups(
                        groupsResponse
                            .data
                    );

                    setUserApplications(
                        applicationsResponse
                            .data
                    );

                    setManagedLeaves(
                        leavesResponse
                            .data
                    );

                    setDelegations(
                        delegationsResponse
                            .data
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "Dashboard bilgileri alınamadı:",
                        error
                    );

                    const status =
                        error.response
                            ?.status;

                    if (
                        status ===
                        401
                    ) {
                        setErrorMessage(
                            "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                        );
                    } else if (
                        status ===
                        403
                    ) {
                        setErrorMessage(
                            "Genel bakış bilgilerine erişim yetkiniz bulunmuyor."
                        );
                    } else {
                        setErrorMessage(
                            "Genel bakış bilgileri yüklenemedi."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadDashboardData();
    }, [
        canManageTasks,
        isAdmin,
        isUser,
    ]);

    const dashboardData =
        useMemo(() => {
            const now =
                new Date();

            const upcomingLimit =
                new Date();

            upcomingLimit.setDate(
                upcomingLimit.getDate() +
                7
            );

            const newCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.status ===
                        1
                ).length;

            const inProgressCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.status ===
                        2
                ).length;

            const waitingCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.status ===
                        3
                ).length;

            const completedCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.status ===
                        4
                ).length;

            const cancelledCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.status ===
                        5
                ).length;

            const overdueCount =
                tasks.filter(
                    (
                        task
                    ) =>
                        task.isOverdue
                ).length;

            const upcomingCount =
                tasks.filter(
                    (
                        task
                    ) => {
                        if (
                            !task.dueDate
                        ) {
                            return false;
                        }

                        if (
                            task.status ===
                            4 ||
                            task.status ===
                            5
                        ) {
                            return false;
                        }

                        const dueDate =
                            new Date(
                                task.dueDate
                            );

                        return (
                            dueDate >=
                            now &&
                            dueDate <=
                            upcomingLimit
                        );
                    }
                ).length;

            const pendingApplicationCount =
                userApplications
                    .filter(
                        (
                            application
                        ) =>
                            application.status ===
                            1
                    )
                    .length;

            const completionRate =
                tasks.length >
                    0
                    ? Math.round(
                        (
                            completedCount /
                            tasks.length
                        ) *
                        100
                    )
                    : 0;

            return {
                total:
                    tasks.length,

                new:
                    newCount,

                inProgress:
                    inProgressCount,

                waiting:
                    waitingCount,

                completed:
                    completedCount,

                cancelled:
                    cancelledCount,

                overdue:
                    overdueCount,

                upcoming:
                    upcomingCount,

                groups:
                    groups.length,

                pendingApplications:
                    pendingApplicationCount,

                completionRate,
            };
        }, [
            tasks,
            groups,
            userApplications,
        ]);

    const leaveInterventionSummary =
        useMemo(() => {
            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            const currentLeaveUserIds =
                new Set(
                    managedLeaves
                        .filter(
                            (leave) => {
                                if (
                                    leave.status !==
                                    2
                                ) {
                                    return false;
                                }

                                const start =
                                    new Date(
                                        leave.startDate
                                    );

                                const end =
                                    new Date(
                                        leave.endDate
                                    );

                                start.setHours(
                                    0,
                                    0,
                                    0,
                                    0
                                );

                                end.setHours(
                                    0,
                                    0,
                                    0,
                                    0
                                );

                                return (
                                    start <=
                                    today &&
                                    end >=
                                    today
                                );
                            }
                        )
                        .map(
                            (leave) =>
                                leave.userId
                        )
                );

            const interventionTasks =
                tasks.filter(
                    (task) =>
                        Boolean(
                            task.assignedUserId
                        ) &&
                        currentLeaveUserIds.has(
                            task.assignedUserId!
                        ) &&
                        task.status !==
                        4 &&
                        task.status !==
                        5
                );

            return {
                employeeCount:
                    new Set(
                        interventionTasks
                            .map(
                                (task) =>
                                    task.assignedUserId
                            )
                            .filter(
                                Boolean
                            )
                    ).size,
                taskCount:
                    interventionTasks.length,
            };
        }, [
            managedLeaves,
            tasks,
        ]);

    const operationRisk =
        useMemo(() => {
            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            const twoDaysLater =
                new Date(
                    today
                );

            twoDaysLater.setDate(
                twoDaysLater.getDate() +
                2
            );

            const expiringDelegations =
                delegations.filter(
                    (delegation) => {
                        if (
                            !delegation.isActive ||
                            !delegation.isCurrentlyEffective
                        ) {
                            return false;
                        }

                        const end =
                            new Date(
                                delegation.endDate
                            );

                        end.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        return (
                            end >= today &&
                            end <= twoDaysLater
                        );
                    }
                ).length;

            const overdueTasks =
                tasks.filter(
                    (task) =>
                        task.isOverdue &&
                        task.status !== 4 &&
                        task.status !== 5
                ).length;

            return {
                leaveTaskCount:
                    leaveInterventionSummary.taskCount,
                overdueTasks,
                expiringDelegations,
                total:
                    leaveInterventionSummary.taskCount +
                    overdueTasks +
                    expiringDelegations,
            };
        }, [
            delegations,
            tasks,
            leaveInterventionSummary,
        ]);

    const activeTasks =
        useMemo(() => {
            return tasks
                .filter(
                    (
                        task
                    ) =>
                        task.status !==
                        4 &&
                        task.status !==
                        5
                )
                .sort(
                    (
                        first,
                        second
                    ) => {
                        if (
                            first.isOverdue !==
                            second.isOverdue
                        ) {
                            return first
                                .isOverdue
                                ? -1
                                : 1;
                        }

                        if (
                            first.dueDate &&
                            second.dueDate
                        ) {
                            return (
                                new Date(
                                    first.dueDate
                                ).getTime() -
                                new Date(
                                    second.dueDate
                                ).getTime()
                            );
                        }

                        if (
                            first.dueDate
                        ) {
                            return -1;
                        }

                        if (
                            second.dueDate
                        ) {
                            return 1;
                        }

                        return (
                            second.id -
                            first.id
                        );
                    }
                )
                .slice(
                    0,
                    7
                );
        }, [
            tasks,
        ]);

    const upcomingTasks =
        useMemo(() => {
            const now =
                new Date();

            return tasks
                .filter(
                    (
                        task
                    ) => {
                        if (
                            !task.dueDate
                        ) {
                            return false;
                        }

                        if (
                            task.status ===
                            4 ||
                            task.status ===
                            5
                        ) {
                            return false;
                        }

                        return (
                            new Date(
                                task.dueDate
                            ) >=
                            now
                        );
                    }
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        new Date(
                            first.dueDate!
                        ).getTime() -
                        new Date(
                            second.dueDate!
                        ).getTime()
                )
                .slice(
                    0,
                    4
                );
        }, [
            tasks,
        ]);

    const getStatusText = (
        status: number
    ) => {
        switch (status) {
            case 1:
                return "Yeni";

            case 2:
                return "Devam Ediyor";

            case 3:
                return "Beklemede";

            case 4:
                return "Tamamlandı";

            case 5:
                return "İptal Edildi";

            default:
                return "Bilinmiyor";
        }
    };



    const getPriorityText = (
        priority: number
    ) => {
        switch (
        priority
        ) {
            case 1:
                return "Düşük";

            case 2:
                return "Orta";

            case 3:
                return "Yüksek";

            case 4:
                return "Kritik";

            default:
                return "Bilinmiyor";
        }
    };

    const getPriorityStyle = (
        priority: number
    ) => {
        switch (
        priority
        ) {
            case 1:
                return {
                    color: isDark
                        ? "#9FC3AB"
                        : "#4F765E",

                    borderColor: isDark
                        ? "rgba(159,195,171,0.20)"
                        : "#D2E1D7",

                    backgroundColor: isDark
                        ? "rgba(79,118,94,0.09)"
                        : "#F1F6F3",
                };

            case 2:
                return {
                    color: isDark
                        ? "#CBD5E1"
                        : "#64748B",

                    borderColor: isDark
                        ? "rgba(203,213,225,0.16)"
                        : "#D7DEE6",

                    backgroundColor: isDark
                        ? "rgba(148,163,184,0.06)"
                        : "#F7F9FB",
                };

            case 3:
                return {
                    color: isDark
                        ? "#E3BD79"
                        : "#976720",

                    borderColor: isDark
                        ? "rgba(227,189,121,0.20)"
                        : "#E9D7AF",

                    backgroundColor: isDark
                        ? "rgba(185,133,58,0.09)"
                        : "#FBF6EC",
                };

            case 4:
                return {
                    color: isDark
                        ? "#D9A1A1"
                        : "#964D4D",

                    borderColor: isDark
                        ? "rgba(217,161,161,0.20)"
                        : "#E9CCCC",

                    backgroundColor: isDark
                        ? "rgba(168,90,90,0.09)"
                        : "#FAF1F1",
                };

            default:
                return {
                    color: "text.secondary",
                    borderColor: "divider",
                    backgroundColor: "transparent",
                };
        }
    };

    const formatDate = (
        date:
            string | null
    ) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(
                date
            );

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate
            .toLocaleDateString(
                "tr-TR",
                {
                    day:
                        "numeric",

                    month:
                        "short",
                }
            );
    };

    const getGroupName = (
        groupId:
            number | null
    ) => {
        if (!groupId) {
            return "Kişisel Atama";
        }

        const group =
            groups.find(
                (
                    currentGroup
                ) =>
                    currentGroup.id ===
                    groupId
            );

        return (
            group?.name ??
            "Çalışma Grubu"
        );
    };

    if (isUser) {
        return <UserDashboard />;
    }
    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight:
                        400,

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width:
                    "100%",

                maxWidth:
                    "none",

                mx:
                    "auto",

                px: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: 3.5,
                    xl: 4,
                },

                pb: 2,

                minHeight: {
                    xs: "auto",
                    lg: "calc(100vh - 110px)",
                },

                color:
                    "text.primary",
            }}
        >
            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,

                        borderRadius:
                            2,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {!errorMessage &&
                isEmployee && (
                    <>
                        <Paper
                            elevation={0}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                mb: 2.1,

                                p: {
                                    xs: 2,
                                    sm: 2.2,
                                    lg: 2.35,
                                },

                                minHeight: {
                                    xs: "auto",
                                    lg: 112,
                                },

                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 3.5,

                                background: isDark
                                    ? "linear-gradient(105deg, #111827 0%, #101B2B 58%, #172033 100%)"
                                    : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 58%, #EEF3F7 100%)",
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 280,
                                    height: 280,
                                    borderRadius: "50%",
                                    right: -90,
                                    top: -160,
                                    backgroundColor: isDark
                                        ? "rgba(49,95,140,0.07)"
                                        : "rgba(49,95,140,0.04)",
                                }}
                            />

                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    display: "flex",
                                    alignItems: {
                                        xs: "flex-start",
                                        md: "center",
                                    },
                                    justifyContent: "space-between",
                                    flexDirection: {
                                        xs: "column",
                                        md: "row",
                                    },
                                    gap: 2.5,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: {
                                                xs: 23,
                                                sm: 26,
                                            },
                                            fontWeight: 800,
                                            lineHeight: 1.2,
                                            letterSpacing: "-0.03em",
                                        }}
                                    >
                                        Hoş Geldiniz, {currentUserName}
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.65,
                                            maxWidth: 650,
                                            lineHeight: 1.5,
                                            fontSize: 13.5,
                                        }}
                                    >
                                        Size atanan görevlerin güncel durumunu,
                                        yaklaşan teslim tarihlerini ve çalışma
                                        ilerlemenizi buradan takip edebilirsiniz.
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            mt: 1.15,
                                            alignItems: "center",
                                            color: "text.secondary",
                                        }}
                                    >
                                        <CalendarTodayRoundedIcon
                                            sx={{
                                                fontSize: 17,
                                                color: "#64748B",
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                            }}
                                        >
                                            Kişisel görev takip paneli
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Button
                                    variant="contained"
                                    endIcon={
                                        <ArrowForwardRoundedIcon />
                                    }
                                    onClick={() =>
                                        navigate(
                                            "/tasks"
                                        )
                                    }
                                    sx={{
                                        minHeight: 40,
                                        px: 2.15,
                                        borderRadius: 2.3,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        backgroundColor: "#163A63",
                                        boxShadow:
                                            "0 7px 18px rgba(22,58,99,0.16)",

                                        "&:hover": {
                                            backgroundColor: "#102F51",
                                            boxShadow:
                                                "0 8px 20px rgba(22,58,99,0.20)",
                                        },
                                    }}
                                >
                                    Görevlerimi Gör
                                </Button>
                            </Box>
                        </Paper>

                        <Box
                            sx={{
                                mb: 1.15,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 750,
                                }}
                            >
                                Görev Özeti
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.3,
                                }}
                            >
                                Görevlerinizin mevcut durumuna hızlıca göz atın.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                {
                                    xs:
                                        "1fr",

                                    sm:
                                        "repeat(2, minmax(0, 1fr))",

                                    xl:
                                        "repeat(3, minmax(0, 1fr))",
                                },

                                gap: {
                                    xs: 1.4,
                                    md: 1.55,
                                    xl: 1.7,
                                },
                            }}
                        >
                            <DashboardCard
                                title="Toplam Görevim"
                                value={
                                    dashboardData.total
                                }
                                description="Size veya grubunuza atanmış tüm görevler"
                                icon={
                                    <AssignmentRoundedIcon />
                                }
                                iconColor="#315F8C"
                                iconBackground="#EDF3F8"
                                onClick={() =>
                                    navigate(
                                        "/tasks"
                                    )
                                }
                            />

                            <DashboardCard
                                title="Yeni Atananlar"
                                value={
                                    dashboardData.new
                                }
                                description="Henüz başlanmamış yeni görevler"
                                icon={
                                    <FiberNewRoundedIcon />
                                }
                                iconColor="#4A7294"
                                iconBackground="#EEF4F8"
                                onClick={() =>
                                    navigate(
                                        "/tasks?status=1"
                                    )
                                }
                            />

                            <DashboardCard
                                title="Devam Edenler"
                                value={
                                    dashboardData.inProgress
                                }
                                description="Üzerinde çalışmaya devam ettiğiniz görevler"
                                icon={
                                    <PlayCircleOutlineRoundedIcon />
                                }
                                iconColor="#7B6A8E"
                                iconBackground="#F4F1F6"
                                onClick={() =>
                                    navigate(
                                        "/tasks?status=2"
                                    )
                                }
                            />

                            <DashboardCard
                                title="Tamamlananlar"
                                value={
                                    dashboardData.completed
                                }
                                description="Başarıyla tamamladığınız görevler"
                                icon={
                                    <CheckCircleOutlineRoundedIcon />
                                }
                                iconColor="#4F7E61"
                                iconBackground="#EEF5F0"
                                onClick={() =>
                                    navigate(
                                        "/tasks?status=4"
                                    )
                                }
                            />

                            <DashboardCard
                                title="Yaklaşan Görevler"
                                value={
                                    dashboardData.upcoming
                                }
                                description="Bitiş tarihine 7 gün veya daha az kalan görevler"
                                icon={
                                    <ScheduleRoundedIcon />
                                }
                                iconColor="#9A6A24"
                                iconBackground="#FBF5EA"
                                onClick={() =>
                                    navigate(
                                        "/tasks?filter=upcoming"
                                    )
                                }
                            />

                            <DashboardCard
                                title="Geciken Görevler"
                                value={
                                    dashboardData.overdue
                                }
                                description="Bitiş tarihi geçmiş görevler"
                                icon={
                                    <WarningAmberRoundedIcon />
                                }
                                iconColor="#965151"
                                iconBackground="#FAF1F1"
                                onClick={() =>
                                    navigate(
                                        "/tasks?filter=overdue"
                                    )
                                }
                            />
                        </Box>

                        <DashboardCharts
                            total={
                                dashboardData.total
                            }
                            newCount={
                                dashboardData.new
                            }
                            inProgressCount={
                                dashboardData.inProgress
                            }
                            waitingCount={
                                dashboardData.waiting
                            }
                            completedCount={
                                dashboardData.completed
                            }
                            cancelledCount={
                                dashboardData.cancelled
                            }
                        />
                    </>
                )}

            {!errorMessage &&
                canManageTasks && (
                    <>
                        <Paper
                            elevation={0}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                mb: 2.1,

                                p: {
                                    xs: 2,
                                    sm: 2.2,
                                    lg: 2.35,
                                },

                                minHeight: {
                                    xs: "auto",
                                    lg: 112,
                                },

                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 3.5,

                                background: isDark
                                    ? "linear-gradient(105deg, #111827 0%, #101B2B 58%, #172033 100%)"
                                    : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 58%, #EEF3F7 100%)",
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 300,
                                    height: 300,
                                    borderRadius: "50%",
                                    right: -100,
                                    top: -175,
                                    backgroundColor: isDark
                                        ? "rgba(49,95,140,0.07)"
                                        : "rgba(49,95,140,0.04)",
                                }}
                            />

                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    display: "flex",
                                    alignItems: {
                                        xs: "flex-start",
                                        md: "center",
                                    },
                                    justifyContent: "space-between",
                                    flexDirection: {
                                        xs: "column",
                                        md: "row",
                                    },
                                    gap: 2.5,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: {
                                                xs: 23,
                                                sm: 26,
                                            },
                                            fontWeight: 800,
                                            lineHeight: 1.2,
                                            letterSpacing: "-0.03em",
                                        }}
                                    >
                                        {isAdmin
                                            ? "Yönetim Paneli"
                                            : "Grup Yönetim Paneli"}
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.65,
                                            maxWidth: 720,
                                            lineHeight: 1.5,
                                            fontSize: 13.5,
                                        }}
                                    >
                                        {isAdmin
                                            ? "Görevleri, çalışma gruplarını ve sistem genelindeki operasyonel durumu tek ekrandan takip edin."
                                            : "Grubunuza ait görevlerin durumunu, yaklaşan teslim tarihlerini ve ekip iş yükünü takip edin."}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            mt: 1.15,
                                            alignItems: "center",
                                            color: "text.secondary",
                                        }}
                                    >
                                        <CalendarTodayRoundedIcon
                                            sx={{
                                                fontSize: 17,
                                                color: "#64748B",
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 500,
                                            }}
                                        >
                                            {isAdmin
                                                ? "Sistem genel görünümü"
                                                : "Yönetici çalışma alanı"}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={
                                        <AddTaskRoundedIcon />
                                    }
                                    onClick={() =>
                                        navigate(
                                            "/tasks/create"
                                        )
                                    }
                                    sx={{
                                        minHeight: 40,
                                        px: 2.15,
                                        borderRadius: 2.3,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        backgroundColor: "#163A63",
                                        boxShadow:
                                            "0 7px 18px rgba(22,58,99,0.16)",

                                        "&:hover": {
                                            backgroundColor: "#102F51",
                                            boxShadow:
                                                "0 8px 20px rgba(22,58,99,0.20)",
                                        },
                                    }}
                                >
                                    Yeni Görev Oluştur
                                </Button>
                            </Box>
                        </Paper>

                        <Paper
                            elevation={0}
                            onClick={() =>
                                navigate(
                                    "/leaves#leave-task-interventions"
                                )
                            }
                            sx={{
                                mb: 2.1,
                                px: {
                                    xs: 1.8,
                                    sm: 2.2,
                                },
                                py: 1.55,
                                display:
                                    "flex",
                                alignItems:
                                {
                                    xs:
                                        "flex-start",
                                    md:
                                        "center",
                                },
                                justifyContent:
                                    "space-between",
                                flexDirection:
                                {
                                    xs:
                                        "column",
                                    md:
                                        "row",
                                },
                                gap: 1.4,
                                border:
                                    "1px solid",
                                borderColor:
                                    leaveInterventionSummary.taskCount >
                                        0
                                        ? isDark
                                            ? "rgba(227,189,121,0.24)"
                                            : "#E9D7AF"
                                        : "divider",
                                borderRadius:
                                    2.8,
                                cursor:
                                    "pointer",
                                backgroundColor:
                                    leaveInterventionSummary.taskCount >
                                        0
                                        ? isDark
                                            ? "rgba(185,133,58,0.07)"
                                            : "#FFFBF3"
                                        : "background.paper",
                                transition:
                                    "transform 0.18s ease, box-shadow 0.18s ease",
                                "&:hover":
                                {
                                    transform:
                                        "translateY(-1px)",
                                    boxShadow:
                                        "0 8px 22px rgba(15,23,42,0.055)",
                                },
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
                                            2.15,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        color:
                                            leaveInterventionSummary.taskCount >
                                                0
                                                ? "#976720"
                                                : "#4F765E",
                                        backgroundColor:
                                            leaveInterventionSummary.taskCount >
                                                0
                                                ? isDark
                                                    ? "rgba(185,133,58,0.12)"
                                                    : "#FBF5EA"
                                                : isDark
                                                    ? "rgba(79,118,94,0.12)"
                                                    : "#EEF5F0",
                                        flexShrink:
                                            0,
                                    }}
                                >
                                    {leaveInterventionSummary.taskCount >
                                        0 ? (
                                        <WarningAmberRoundedIcon />
                                    ) : (
                                        <CheckCircleOutlineRoundedIcon />
                                    )}
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Operasyon Riski
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display:
                                                "block",
                                            mt: 0.15,
                                        }}
                                    >
                                        {operationRisk.total >
                                            0
                                            ? `${operationRisk.leaveTaskCount} izin kaynaklı görev • ${operationRisk.overdueTasks} geciken görev • ${operationRisk.expiringDelegations} vekalet yakında bitiyor`
                                            : "Aktif operasyon riski bulunmuyor."}
                                    </Typography>
                                </Box>
                            </Box>

                            <Button
                                size="small"
                                endIcon={
                                    <ArrowForwardRoundedIcon />
                                }
                                sx={{
                                    textTransform:
                                        "none",
                                    fontWeight:
                                        750,
                                    color:
                                        isDark
                                            ? "primary.light"
                                            : "#315F8C",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                Operasyonları İncele
                            </Button>
                        </Paper>

                        <Box
                            sx={{
                                mb: 1.6,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 750,
                                }}
                            >
                                Yönetim Özeti
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.3,
                                }}
                            >
                                Güncel görev ve operasyon göstergelerine hızlıca göz atın.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                {
                                    xs:
                                        "1fr",

                                    xl:
                                        "minmax(0, 1fr) 350px",
                                },

                                gap: {
                                    xs: 2,
                                    md: 2.5,
                                    xl: 3,
                                },

                                alignItems:
                                    "start",
                            }}
                        >
                            <Box
                                sx={{
                                    minWidth:
                                        0,
                                }}
                            >
                                <Box
                                    sx={{
                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                        {
                                            xs:
                                                "1fr",

                                            md:
                                                "repeat(3, minmax(0, 1fr))",
                                        },

                                        gap: {
                                            xs: 1.8,
                                            md: 2.1,
                                            xl: 2.3,
                                        },
                                    }}
                                >
                                    <ManagementSummaryCard
                                        title="Yeni Görevler"
                                        value={
                                            dashboardData.new
                                        }
                                        description="Henüz başlanmamış görevler"
                                        icon={
                                            <FiberNewRoundedIcon />
                                        }
                                        backgroundColor="#3B82F6"
                                        color="#FFFFFF"
                                        onClick={() =>
                                            navigate(
                                                "/tasks?status=1"
                                            )
                                        }
                                    />

                                    <ManagementSummaryCard
                                        title="Devam Eden"
                                        value={
                                            dashboardData.inProgress
                                        }
                                        description="Çalışması devam eden görevler"
                                        icon={
                                            <TrendingUpRoundedIcon />
                                        }
                                        backgroundColor="#334155"
                                        color="#FFFFFF"
                                        onClick={() =>
                                            navigate(
                                                "/tasks?status=2"
                                            )
                                        }
                                    />

                                    <Paper
                                        elevation={
                                            0
                                        }
                                        sx={{
                                            p:
                                                3,

                                            minHeight: 170,

                                            border:
                                                "1px solid",

                                            borderColor:
                                                "divider",

                                            borderRadius:
                                                3,

                                            backgroundColor:
                                                "background.paper",

                                            display:
                                                "flex",

                                            flexDirection:
                                                "column",

                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Genel Tamamlanma
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={
                                                1
                                            }
                                            sx={{
                                                mt:
                                                    1.5,

                                                alignItems:
                                                    "flex-end",
                                            }}
                                        >
                                            <Typography
                                                variant="h2"
                                                sx={{ fontSize: 40,
                                                    fontWeight:
                                                        800,

                                                    lineHeight:
                                                        1,

                                                    letterSpacing:
                                                        "-0.05em",
                                                }}
                                            >
                                                {
                                                    dashboardData.completionRate
                                                }
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                color="text.secondary"
                                            >
                                                %
                                            </Typography>
                                        </Stack>

                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                dashboardData.completionRate
                                            }
                                            sx={{
                                                mt:
                                                    3,

                                                height:
                                                    10,

                                                borderRadius:
                                                    10,

                                                backgroundColor:
                                                    "action.hover",

                                                "& .MuiLinearProgress-bar":
                                                {
                                                    borderRadius:
                                                        10,

                                                    backgroundColor:
                                                        "primary.main",
                                                },
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt:
                                                    2,
                                            }}
                                        >
                                            {
                                                dashboardData.completed
                                            }{" "}
                                            görev tamamlandı
                                        </Typography>
                                    </Paper>
                                </Box>

                                <Box
                                    sx={{
                                        mt: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mb: 1.7,

                                            display: "flex",

                                            alignItems: {
                                                xs: "flex-start",
                                                sm: "center",
                                            },

                                            justifyContent: "space-between",

                                            flexDirection: {
                                                xs: "column",
                                                sm: "row",
                                            },

                                            gap: 1.2,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 750,
                                                }}
                                            >
                                                Aktif Görevler
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.35,
                                                }}
                                            >
                                                Öncelikli ve devam eden görevlerin kısa listesi.
                                            </Typography>
                                        </Box>

                                        <Button
                                            endIcon={
                                                <ArrowForwardRoundedIcon />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    "/tasks"
                                                )
                                            }
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 700,
                                                color: isDark
                                                    ? "primary.light"
                                                    : "#315F8C",
                                            }}
                                        >
                                            Tümünü Gör
                                        </Button>
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 1.4,
                                        }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                color: "text.primary",
                                                fontWeight: 800,
                                            }}
                                        >
                                            {activeTasks.length}
                                        </Box>{" "}
                                        görev gösteriliyor
                                    </Typography>

                                    {activeTasks.length === 0 ? (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                textAlign: "center",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                borderRadius: 3.2,
                                                backgroundColor: "background.paper",
                                            }}
                                        >
                                            <TaskAltRoundedIcon
                                                sx={{
                                                    fontSize: 40,
                                                    color: "text.disabled",
                                                    mb: 1,
                                                }}
                                            />

                                            <Typography
                                                color="text.secondary"
                                            >
                                                Aktif görev bulunmuyor.
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gap: 1.6,
                                            }}
                                        >
                                            {activeTasks.map(
                                                (
                                                    task
                                                ) => (
                                                    <Paper
                                                        key={
                                                            task.id
                                                        }
                                                        elevation={0}
                                                        onClick={() =>
                                                            navigate(
                                                                `/tasks/${task.id}`
                                                            )
                                                        }
                                                        sx={{
                                                            position: "relative",
                                                            overflow: "hidden",
                                                            cursor: "pointer",

                                                            border: "1px solid",

                                                            borderColor:
                                                                task.isOverdue
                                                                    ? isDark
                                                                        ? "rgba(185,133,58,0.45)"
                                                                        : "#C99238"
                                                                    : "divider",

                                                            borderRadius: 3.1,

                                                            backgroundColor:
                                                                "background.paper",

                                                            transition:
                                                                "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",

                                                            "&:hover": {
                                                                transform:
                                                                    "translateY(-2px)",

                                                                borderColor:
                                                                    task.isOverdue
                                                                        ? "#B9853A"
                                                                        : isDark
                                                                            ? "rgba(148,163,184,0.24)"
                                                                            : "rgba(22,58,99,0.20)",

                                                                boxShadow:
                                                                    isDark
                                                                        ? "0 10px 28px rgba(0,0,0,0.17)"
                                                                        : "0 12px 30px rgba(15,23,42,0.065)",
                                                            },

                                                            "&:hover .active-task-chevron":
                                                            {
                                                                transform:
                                                                    "translateX(3px)",

                                                                color:
                                                                    isDark
                                                                        ? "primary.light"
                                                                        : "#163A63",
                                                            },
                                                        }}
                                                    >
                                                        {task.isOverdue && (
                                                            <Box
                                                                sx={{
                                                                    position:
                                                                        "absolute",

                                                                    left: 0,
                                                                    top: 0,
                                                                    bottom: 0,

                                                                    width: 3,

                                                                    backgroundColor:
                                                                        "#B9853A",
                                                                }}
                                                            />
                                                        )}

                                                        <Box
                                                            sx={{
                                                                p: {
                                                                    xs: 2,
                                                                    sm: 2.3,
                                                                    md: 2.45,
                                                                },

                                                                display: "grid",

                                                                gridTemplateColumns:
                                                                {
                                                                    xs: "42px minmax(0, 1fr)",

                                                                    md: "44px minmax(0, 1fr) auto 22px",
                                                                },

                                                                alignItems: "center",

                                                                gap: {
                                                                    xs: 1.4,
                                                                    md: 1.7,
                                                                },
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 42,
                                                                    height: 42,

                                                                    borderRadius:
                                                                        2.25,

                                                                    display: "flex",

                                                                    alignItems:
                                                                        "center",

                                                                    justifyContent:
                                                                        "center",

                                                                    flexShrink: 0,

                                                                    color:
                                                                        "#315F8C",

                                                                    backgroundColor:
                                                                        isDark
                                                                            ? "rgba(49,95,140,0.11)"
                                                                            : "#EEF4F8",
                                                                }}
                                                            >
                                                                <DescriptionRoundedIcon
                                                                    sx={{
                                                                        fontSize:
                                                                            21,
                                                                    }}
                                                                />
                                                            </Box>

                                                            <Box
                                                                sx={{
                                                                    minWidth: 0,
                                                                }}
                                                            >
                                                                <Stack
                                                                    direction="row"
                                                                    sx={{
                                                                        alignItems:
                                                                            "center",

                                                                        flexWrap:
                                                                            "wrap",

                                                                        gap: 0.7,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{
                                                                            fontWeight:
                                                                                750,

                                                                            overflow:
                                                                                "hidden",

                                                                            textOverflow:
                                                                                "ellipsis",

                                                                            whiteSpace:
                                                                            {
                                                                                xs: "normal",
                                                                                sm: "nowrap",
                                                                            },
                                                                        }}
                                                                    >
                                                                        {
                                                                            task.title
                                                                        }
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight:
                                                                                700,

                                                                            color:
                                                                                "#315F8C",
                                                                        }}
                                                                    >
                                                                        #
                                                                        {
                                                                            task.id
                                                                        }
                                                                    </Typography>
                                                                </Stack>

                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        mt: 0.45,

                                                                        overflow:
                                                                            "hidden",

                                                                        textOverflow:
                                                                            "ellipsis",

                                                                        whiteSpace:
                                                                        {
                                                                            xs: "normal",
                                                                            sm: "nowrap",
                                                                        },

                                                                        lineHeight:
                                                                            1.5,
                                                                    }}
                                                                >
                                                                    {task.description ||
                                                                        "Görev açıklaması bulunmuyor."}
                                                                </Typography>

                                                                <Stack
                                                                    direction="row"
                                                                    sx={{
                                                                        mt: 0.9,

                                                                        alignItems:
                                                                            "center",

                                                                        flexWrap:
                                                                            "wrap",

                                                                        columnGap:
                                                                            0.8,

                                                                        rowGap:
                                                                            0.4,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {getGroupName(
                                                                            task.assignedGroupId
                                                                        )}
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.disabled"
                                                                    >
                                                                        •
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {
                                                                            getPriorityText(
                                                                                task.priority
                                                                            )
                                                                        }{" "}
                                                                        Öncelik
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.disabled"
                                                                    >
                                                                        •
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {formatDate(
                                                                            task.createdAt
                                                                        )}
                                                                    </Typography>

                                                                    {task.dueDate && (
                                                                        <>
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.disabled"
                                                                            >
                                                                                •
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{
                                                                                    fontWeight:
                                                                                        task.isOverdue
                                                                                            ? 700
                                                                                            : 400,

                                                                                    color:
                                                                                        task.isOverdue
                                                                                            ? "#A36E26"
                                                                                            : "text.secondary",
                                                                                }}
                                                                            >
                                                                                Bitiş:{" "}
                                                                                {formatDate(
                                                                                    task.dueDate
                                                                                )}
                                                                            </Typography>
                                                                        </>
                                                                    )}
                                                                </Stack>
                                                            </Box>

                                                            <Stack
                                                                direction="row"
                                                                sx={{
                                                                    display: {
                                                                        xs: "none",
                                                                        md: "flex",
                                                                    },

                                                                    alignItems:
                                                                        "center",

                                                                    justifyContent:
                                                                        "flex-end",

                                                                    flexWrap:
                                                                        "wrap",

                                                                    gap: 0.75,
                                                                }}
                                                            >
                                                                <Chip
                                                                    label={getPriorityText(
                                                                        task.priority
                                                                    )}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        height: 27,

                                                                        borderRadius:
                                                                            1.7,

                                                                        fontSize:
                                                                            11,

                                                                        fontWeight:
                                                                            700,

                                                                        ...getPriorityStyle(
                                                                            task.priority
                                                                        ),
                                                                    }}
                                                                />

                                                                <Chip
                                                                    label={getStatusText(
                                                                        task.status
                                                                    )}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        height: 27,

                                                                        borderRadius:
                                                                            1.7,

                                                                        fontSize:
                                                                            11,

                                                                        fontWeight:
                                                                            700,

                                                                        color:
                                                                            task.status ===
                                                                                1
                                                                                ? "#315F8C"
                                                                                : task.status ===
                                                                                    2
                                                                                    ? "#976720"
                                                                                    : "text.secondary",

                                                                        borderColor:
                                                                            task.status ===
                                                                                1
                                                                                ? isDark
                                                                                    ? "rgba(147,184,217,0.20)"
                                                                                    : "#C9D9E5"
                                                                                : task.status ===
                                                                                    2
                                                                                    ? isDark
                                                                                        ? "rgba(227,189,121,0.18)"
                                                                                        : "#E9D7AF"
                                                                                    : "divider",

                                                                        backgroundColor:
                                                                            task.status ===
                                                                                1
                                                                                ? isDark
                                                                                    ? "rgba(49,95,140,0.10)"
                                                                                    : "#EFF4F8"
                                                                                : task.status ===
                                                                                    2
                                                                                    ? isDark
                                                                                        ? "rgba(185,133,58,0.08)"
                                                                                        : "#FBF6EC"
                                                                                    : "transparent",
                                                                    }}
                                                                />

                                                                {task.isOverdue && (
                                                                    <Chip
                                                                        label="Gecikmiş"
                                                                        size="small"
                                                                        sx={{
                                                                            height: 27,

                                                                            borderRadius:
                                                                                1.7,

                                                                            fontSize:
                                                                                11,

                                                                            fontWeight:
                                                                                700,

                                                                            color:
                                                                                isDark
                                                                                    ? "#E2BB77"
                                                                                    : "#97651D",

                                                                            backgroundColor:
                                                                                isDark
                                                                                    ? "rgba(185,133,58,0.09)"
                                                                                    : "#FBF5E9",
                                                                        }}
                                                                    />
                                                                )}
                                                            </Stack>

                                                            <ChevronRightRoundedIcon
                                                                className="active-task-chevron"
                                                                sx={{
                                                                    display: {
                                                                        xs: "none",
                                                                        md: "block",
                                                                    },

                                                                    color:
                                                                        "text.disabled",

                                                                    fontSize: 21,

                                                                    transition:
                                                                        "transform 0.18s ease, color 0.18s ease",
                                                                }}
                                                            />
                                                        </Box>
                                                    </Paper>
                                                )
                                            )}
                                        </Box>
                                    )}
                                </Box>

                            </Box>

                            <Stack
                                spacing={
                                    3
                                }
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        borderRadius:
                                            3,

                                        backgroundColor:
                                            "background.paper",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        Hızlı İşlemler
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                            mb: 2.5,
                                        }}
                                    >
                                        Sık kullanılan yönetim işlemleri
                                    </Typography>

                                    <Stack
                                        spacing={
                                            1.2
                                        }
                                    >
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={
                                                <AddTaskRoundedIcon />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    "/tasks/create"
                                                )
                                            }
                                            sx={
                                                quickActionButtonSx
                                            }
                                        >
                                            Yeni Görev Oluştur
                                        </Button>

                                        {isAdmin && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={
                                                    <PeopleAltRoundedIcon />
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        "/users"
                                                    )
                                                }
                                                sx={
                                                    quickActionButtonSx
                                                }
                                            >
                                                Kullanıcıları Yönet
                                            </Button>
                                        )}

                                        {isAdmin && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={
                                                    <GroupsRoundedIcon />
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        "/groups"
                                                    )
                                                }
                                                sx={
                                                    quickActionButtonSx
                                                }
                                            >
                                                Grupları Yönet
                                            </Button>
                                        )}

                                        {isAdmin && (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={
                                                    <HowToRegRoundedIcon />
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        "/user-applications"
                                                    )
                                                }
                                                sx={
                                                    quickActionButtonSx
                                                }
                                            >
                                                Başvuruları İncele
                                            </Button>
                                        )}
                                    </Stack>
                                </Paper>

                                <Paper
                                    elevation={
                                        0
                                    }
                                    sx={{
                                        p:
                                            3,

                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        borderRadius:
                                            3,

                                        backgroundColor:
                                            "background.paper",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        Sistem Durumu
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt:
                                                0.5,

                                            mb:
                                                2.5,
                                        }}
                                    >
                                        Genel yönetim göstergeleri
                                    </Typography>

                                    <SnapshotRow
                                        label="Toplam Görev"
                                        value={
                                            dashboardData.total
                                        }
                                        icon={
                                            <AssignmentRoundedIcon />
                                        }
                                    />

                                    <SnapshotRow
                                        label="Çalışma Grupları"
                                        value={
                                            dashboardData.groups
                                        }
                                        icon={
                                            <GroupsRoundedIcon />
                                        }
                                    />

                                    <SnapshotRow
                                        label="Geciken Görev"
                                        value={
                                            dashboardData.overdue
                                        }
                                        icon={
                                            <WarningAmberRoundedIcon />
                                        }
                                        danger={
                                            dashboardData.overdue >
                                            0
                                        }
                                    />

                                    <SnapshotRow
                                        label="Yaklaşan Görev"
                                        value={
                                            dashboardData.upcoming
                                        }
                                        icon={
                                            <ScheduleRoundedIcon />
                                        }
                                    />

                                    {isAdmin && (
                                        <Box
                                            onClick={() =>
                                                navigate(
                                                    "/user-applications"
                                                )
                                            }
                                            sx={{
                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <SnapshotRow
                                                label="Bekleyen Başvuru"
                                                value={
                                                    dashboardData.pendingApplications
                                                }
                                                icon={
                                                    <HowToRegRoundedIcon />
                                                }
                                                warning={
                                                    dashboardData.pendingApplications >
                                                    0
                                                }
                                            />
                                        </Box>
                                    )}
                                </Paper>

                                <Paper
                                    elevation={
                                        0
                                    }
                                    sx={{
                                        border:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        borderRadius:
                                            3,

                                        overflow:
                                            "hidden",

                                        backgroundColor:
                                            "background.paper",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p:
                                                3,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            Yaklaşan Görevler
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt:
                                                    0.5,
                                            }}
                                        >
                                            Bitiş tarihi yaklaşan görevler
                                        </Typography>
                                    </Box>

                                    <Divider />

                                    {upcomingTasks.length ===
                                        0 ? (
                                        <Box
                                            sx={{
                                                p:
                                                    3,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Yaklaşan görev bulunmuyor.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        upcomingTasks.map(
                                            (
                                                task,
                                                index
                                            ) => (
                                                <Box
                                                    key={
                                                        task.id
                                                    }
                                                >
                                                    {index >
                                                        0 && (
                                                            <Divider />
                                                        )}

                                                    <Box
                                                        onClick={() =>
                                                            navigate(
                                                                `/tasks/${task.id}`
                                                            )
                                                        }
                                                        sx={{
                                                            p:
                                                                2.25,

                                                            cursor:
                                                                "pointer",

                                                            "&:hover":
                                                            {
                                                                backgroundColor:
                                                                    "action.hover",
                                                            },
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight:
                                                                    700,

                                                                lineHeight:
                                                                    1.45,
                                                            }}
                                                        >
                                                            {
                                                                task.title
                                                            }
                                                        </Typography>

                                                        <Stack
                                                            direction="row"
                                                            spacing={
                                                                1
                                                            }
                                                            sx={{
                                                                mt:
                                                                    1,

                                                                justifyContent:
                                                                    "space-between",

                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {getGroupName(
                                                                    task.assignedGroupId
                                                                )}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    fontWeight:
                                                                        700,

                                                                    color:
                                                                        "primary.main",
                                                                }}
                                                            >
                                                                {formatDate(
                                                                    task.dueDate
                                                                )}
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Box>
                                            )
                                        )
                                    )}

                                    <Divider />

                                    <Button
                                        fullWidth
                                        onClick={() =>
                                            navigate(
                                                "/tasks?filter=upcoming"
                                            )
                                        }
                                        endIcon={
                                            <ArrowForwardRoundedIcon />
                                        }
                                        sx={{
                                            py:
                                                1.5,
                                        }}
                                    >
                                        Tüm Görevleri Gör
                                    </Button>
                                </Paper>

                            </Stack>
                        </Box>
                    </>
                )}
        </Box>
    );
}

interface SnapshotRowProps {
    label: string;
    value: number;
    icon: ReactNode;
    danger?: boolean;
    warning?: boolean;
}

function SnapshotRow({
    label,
    value,
    icon,
    danger = false,
    warning = false,
}: SnapshotRowProps) {
    return (
        <Box
            sx={{
                py:
                    1.25,

                display:
                    "flex",

                alignItems:
                    "center",

                justifyContent:
                    "space-between",

                gap:
                    2,
            }}
        >
            <Stack
                direction="row"
                spacing={
                    1.25
                }
                sx={{
                    alignItems:
                        "center",
                }}
            >
                <Box
                    sx={{
                        width:
                            34,

                        height:
                            34,

                        borderRadius:
                            2,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        color:
                            danger
                                ? "error.main"
                                : warning
                                    ? "warning.main"
                                    : "text.secondary",

                        backgroundColor:
                            "action.hover",

                        "& svg":
                        {
                            fontSize:
                                18,
                        },
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {label}
                </Typography>
            </Stack>

            <Typography
                variant="body1"
                sx={{
                    fontWeight:
                        800,

                    color:
                        danger
                            ? "error.main"
                            : warning
                                ? "warning.main"
                                : "text.primary",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default DashboardPage;
