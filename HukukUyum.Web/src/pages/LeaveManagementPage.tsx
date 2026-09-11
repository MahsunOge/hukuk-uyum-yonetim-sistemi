import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import {
    getCurrentUserRoles,
} from "../utils/auth";

const leaveFilterMenuProps = {
    slotProps: {
        paper: {
            sx: {
                mt: 0.75, p: 0.75, borderRadius: 3, maxHeight: 340,
                border: "1px solid", borderColor: "divider",
                boxShadow: "0 12px 36px rgba(15,23,42,0.14)",
                "& .MuiMenuItem-root": {
                    borderRadius: 2, minHeight: 42, my: 0.25, fontSize: 14,
                    "&.Mui-selected": { bgcolor: "action.selected", color: "primary.main", fontWeight: 700 },
                },
            },
        },
    },
};

interface LeaveRequestItem {
    id: number;
    userId: string;
    userFullName: string;
    groupId: number | null;
    groupName: string | null;
    leaveType: number;
    startDate: string;
    endDate: string;
    description: string | null;
    status: number;
    reviewedByUserId: string | null;
    reviewedByUserFullName: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    cancellationDescription?: string | null;
    createdAt: string;
}

interface TaskItem {
    id: number;
    title: string;
    priority: number;
    status: number;
    dueDate: string | null;
    isOverdue: boolean;
    assignedUserId: string | null;
    assignedGroupId: number | null;
}

interface GroupUserItem {
    userId: string;
    fullName: string;
    email: string;
    isManager: boolean;
}

interface SummaryCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    accentColor?: string;
    accentBackground?: string;
    onClick?: () => void;
}

type TabValue =
    | "mine"
    | "group"
    | "all";

const LEAVE_TYPES = [
    {
        value: 1,
        label: "Yıllık İzin",
    },
    {
        value: 2,
        label: "Sağlık İzni",
    },
    {
        value: 3,
        label: "Mazeret İzni",
    },
    {
        value: 4,
        label: "Ücretsiz İzin",
    },
    {
        value: 5,
        label: "Diğer",
    },
];

function SummaryCard({
    title,
    value,
    description,
    icon,
    accentColor = "#163A63",
    accentBackground = "#EEF4F8",
    onClick,
}: SummaryCardProps) {
    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                p: {
                    xs: 2,
                    md: 2,
                },
                minHeight: 120,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                backgroundColor:
                    "background.paper",
                cursor:
                    onClick
                        ? "pointer"
                        : "default",
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
                        accentColor,
                    opacity: 0.72,
                },
                "&:hover":
                    onClick
                        ? {
                            transform:
                                "translateY(-2px)",
                            boxShadow:
                                "0 10px 24px rgba(15,23,42,0.07)",
                            borderColor:
                                "rgba(22,58,99,0.18)",
                        }
                        : {},
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent:
                        "space-between",
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 750,
                            color:
                                "text.primary",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.65,
                            fontSize: {
                                xs: 29,
                                md: 32,
                            },
                            fontWeight: 850,
                            lineHeight: 1,
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
                        borderRadius: 2.25,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",
                        color:
                            accentColor,
                        backgroundColor:
                            accentBackground,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 1.25,
                    lineHeight: 1.4,
                    fontSize: 12.5,
                }}
            >
                {description}
            </Typography>
        </Paper>
    );
}

const getLeaveTypeText = (
    type: number
) => {
    return (
        LEAVE_TYPES.find(
            (item) =>
                item.value === type
        )?.label ??
        "Bilinmeyen"
    );
};

const getStatusText = (
    status: number
) => {
    switch (status) {
        case 1:
            return "Bekliyor";

        case 2:
            return "Onaylandı";

        case 3:
            return "Reddedildi";

        case 4:
            return "İptal Edildi";

        default:
            return "Bilinmeyen";
    }
};

const getStatusChipSx = (
    status: number
) => {
    switch (status) {
        case 1:
            return {
                color: "#9A6700",
                backgroundColor:
                    "#FFF8E1",
                borderColor:
                    "#F4D98A",
            };

        case 2:
            return {
                color: "#2F6B45",
                backgroundColor:
                    "#EDF7F0",
                borderColor:
                    "#B9DFC4",
            };

        case 3:
            return {
                color: "#B42318",
                backgroundColor:
                    "#FEF2F2",
                borderColor:
                    "#F7C7C7",
            };

        case 4:
            return {
                color: "#64748B",
                backgroundColor:
                    "#F1F5F9",
                borderColor:
                    "#CBD5E1",
            };

        default:
            return {};
    }
};

const formatDate = (
    value: string
) => {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleDateString(
        "tr-TR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

const calculateDayCount = (
    startDate: string,
    endDate: string
) => {
    const start =
        new Date(startDate);

    const end =
        new Date(endDate);

    if (
        Number.isNaN(
            start.getTime()
        ) ||
        Number.isNaN(
            end.getTime()
        )
    ) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    return (
        Math.floor(
            difference /
            86400000
        ) + 1
    );
};

function LeaveManagementPage() {
    const navigate =
        useNavigate();

    const roles =
        getCurrentUserRoles();

    const isAdmin =
        roles.includes(
            "Admin"
        );

    const isPermanentManager =
        roles.includes(
            "Manager"
        );

    const hasDelegatedManagerAccess =
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true";

    const isManager =
        isPermanentManager ||
        hasDelegatedManagerAccess;

    const isEmployee =
        roles.includes(
            "Employee"
        );

    const canReassignTasks =
        isAdmin ||
        isManager;

    const [
        myLeaves,
        setMyLeaves,
    ] =
        useState<
            LeaveRequestItem[]
        >([]);

    const [
        groupLeaves,
        setGroupLeaves,
    ] =
        useState<
            LeaveRequestItem[]
        >([]);

    const [
        allLeaves,
        setAllLeaves,
    ] =
        useState<
            LeaveRequestItem[]
        >([]);

    const [
        tasks,
        setTasks,
    ] =
        useState<TaskItem[]>(
            []
        );

    const [
        groupMembersByGroup,
        setGroupMembersByGroup,
    ] =
        useState<
            Record<
                number,
                GroupUserItem[]
            >
        >({});

    const [
        reassignmentSelections,
        setReassignmentSelections,
    ] =
        useState<
            Record<number, string>
        >({});

    const [
        reassigningTaskId,
        setReassigningTaskId,
    ] =
        useState<
            number | null
        >(null);

    const [
        planningLeaveUserId,
        setPlanningLeaveUserId,
    ] =
        useState<
            string | null
        >(null);

    const [
        activeTab,
        setActiveTab,
    ] =
        useState<TabValue>(
            isAdmin
                ? "all"
                : "mine"
        );

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

    const [
        successMessage,
        setSuccessMessage,
    ] =
        useState("");

    const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequestItem | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");
    const [cancelReason, setCancelReason] = useState("");

    const [
        createDialogOpen,
        setCreateDialogOpen,
    ] =
        useState(false);

    const [
        reviewDialogOpen,
        setReviewDialogOpen,
    ] =
        useState(false);

    const [
        selectedLeave,
        setSelectedLeave,
    ] =
        useState<
            LeaveRequestItem | null
        >(null);

    const [
        leaveType,
        setLeaveType,
    ] =
        useState(1);

    const [
        startDate,
        setStartDate,
    ] =
        useState("");

    const [
        endDate,
        setEndDate,
    ] =
        useState("");

    const [
        description,
        setDescription,
    ] =
        useState("");

    const [
        rejectionReason,
        setRejectionReason,
    ] =
        useState("");

    const [
        isSubmitting,
        setIsSubmitting,
    ] =
        useState(false);

    const [
        groupFilter,
        setGroupFilter,
    ] =
        useState("all");

    const [
        statusFilter,
        setStatusFilter,
    ] =
        useState("all");

    const [
        leaveTypeFilter,
        setLeaveTypeFilter,
    ] =
        useState("all");

    const [
        onlyCurrentlyOnLeave,
        setOnlyCurrentlyOnLeave,
    ] =
        useState(false);

    const loadData =
        async () => {
            try {
                setIsLoading(
                    true
                );

                setErrorMessage(
                    ""
                );

                if (isAdmin) {
                    const [
                        leavesResponse,
                        tasksResponse,
                    ] =
                        await Promise.all([
                            api.get<
                                LeaveRequestItem[]
                            >(
                                "/LeaveRequests"
                            ),
                            api.get<
                                TaskItem[]
                            >(
                                "/Tasks"
                            ),
                        ]);

                    setAllLeaves(
                        leavesResponse.data
                    );

                    setTasks(
                        tasksResponse.data
                    );

                    const adminGroupIds =
                        Array.from(
                            new Set(
                                leavesResponse.data
                                    .map(
                                        (leave) =>
                                            leave.groupId
                                    )
                                    .filter(
                                        (
                                            groupId
                                        ): groupId is number =>
                                            groupId !==
                                            null
                                    )
                            )
                        );

                    const adminMemberEntries =
                        await Promise.all(
                            adminGroupIds.map(
                                async (
                                    groupId
                                ) => {
                                    const response =
                                        await api.get<
                                            GroupUserItem[]
                                        >(
                                            `/Groups/${groupId}/users`
                                        );

                                    return [
                                        groupId,
                                        response.data,
                                    ] as const;
                                }
                            )
                        );

                    setGroupMembersByGroup(
                        Object.fromEntries(
                            adminMemberEntries
                        )
                    );

                    return;
                }

                if (isManager) {
                    const [
                        myResponse,
                        groupResponse,
                        tasksResponse,
                    ] =
                        await Promise.all([
                            api.get<
                                LeaveRequestItem[]
                            >(
                                "/LeaveRequests/my"
                            ),
                            api.get<
                                LeaveRequestItem[]
                            >(
                                "/LeaveRequests/managed-group"
                            ),
                            api.get<
                                TaskItem[]
                            >(
                                "/Tasks"
                            ),
                        ]);

                    setMyLeaves(
                        myResponse.data
                    );

                    setGroupLeaves(
                        groupResponse.data
                    );

                    setTasks(
                        tasksResponse.data
                    );

                    const groupIds =
                        Array.from(
                            new Set(
                                groupResponse.data
                                    .map(
                                        (leave) =>
                                            leave.groupId
                                    )
                                    .filter(
                                        (
                                            groupId
                                        ): groupId is number =>
                                            groupId !==
                                            null
                                    )
                            )
                        );

                    const memberEntries =
                        await Promise.all(
                            groupIds.map(
                                async (
                                    groupId
                                ) => {
                                    const response =
                                        await api.get<
                                            GroupUserItem[]
                                        >(
                                            `/Groups/${groupId}/users`
                                        );

                                    return [
                                        groupId,
                                        response.data,
                                    ] as const;
                                }
                            )
                        );

                    setGroupMembersByGroup(
                        Object.fromEntries(
                            memberEntries
                        )
                    );

                    return;
                }

                const myResponse =
                    await api.get<
                        LeaveRequestItem[]
                    >(
                        "/LeaveRequests/my"
                    );

                setMyLeaves(
                    myResponse.data
                );
            } catch (
            error: any
            ) {
                console.error(
                    "İzin bilgileri yüklenemedi:",
                    error
                );

                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                setErrorMessage(
                    backendMessage ||
                    "İzin bilgileri yüklenemedi."
                );
            } finally {
                setIsLoading(
                    false
                );
            }
        };

    useEffect(() => {
        void loadData();
    }, []);

    const baseDisplayedLeaves =
        useMemo(() => {
            if (
                activeTab ===
                "all"
            ) {
                return allLeaves;
            }

            if (
                activeTab ===
                "group"
            ) {
                return groupLeaves;
            }

            return myLeaves;
        }, [
            activeTab,
            allLeaves,
            groupLeaves,
            myLeaves,
        ]);

    const summarySource =
        useMemo(
            () =>
                isAdmin
                    ? allLeaves
                    : [
                        ...myLeaves,
                        ...groupLeaves,
                    ],
            [
                allLeaves,
                groupLeaves,
                myLeaves,
                isAdmin,
            ]
        );

    const today =
        useMemo(() => {
            const value =
                new Date();

            value.setHours(
                0,
                0,
                0,
                0
            );

            return value;
        }, []);

    const toDay =
        (value: string) => {
            const date =
                new Date(value);

            date.setHours(
                0,
                0,
                0,
                0
            );

            return date;
        };

    const isApprovedAndCurrent =
        (leave: LeaveRequestItem) => {
            if (
                leave.status !==
                2
            ) {
                return false;
            }

            const start =
                toDay(
                    leave.startDate
                );

            const end =
                toDay(
                    leave.endDate
                );

            return (
                start <= today &&
                end >= today
            );
        };

    const currentlyOnLeave =
        useMemo(
            () =>
                summarySource
                    .filter(
                        isApprovedAndCurrent
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            toDay(
                                first.endDate
                            ).getTime() -
                            toDay(
                                second.endDate
                            ).getTime()
                    ),
            [
                summarySource,
                today,
            ]
        );

    const upcomingLeaves =
        useMemo(() => {
            const limit =
                new Date(
                    today
                );

            limit.setDate(
                limit.getDate() +
                7
            );

            return summarySource
                .filter(
                    (leave) => {
                        if (
                            leave.status !==
                            2
                        ) {
                            return false;
                        }

                        const start =
                            toDay(
                                leave.startDate
                            );

                        return (
                            start >
                            today &&
                            start <=
                            limit
                        );
                    }
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        toDay(
                            first.startDate
                        ).getTime() -
                        toDay(
                            second.startDate
                        ).getTime()
                );
        }, [
            summarySource,
            today,
        ]);

    const pendingCount =
        useMemo(
            () =>
                summarySource.filter(
                    (leave) =>
                        leave.status ===
                        1
                ).length,
            [
                summarySource,
            ]
        );

    const groupNames =
        useMemo(
            () =>
                Array.from(
                    new Set(
                        summarySource
                            .map(
                                (leave) =>
                                    leave.groupName
                            )
                            .filter(
                                (
                                    groupName
                                ): groupName is string =>
                                    Boolean(
                                        groupName
                                    )
                            )
                    )
                ).sort(
                    (first, second) =>
                        first.localeCompare(
                            second,
                            "tr"
                        )
                ),
            [
                summarySource,
            ]
        );

    const operationalLeaveSource =
        useMemo(
            () =>
                isAdmin
                    ? allLeaves
                    : groupLeaves,
            [
                allLeaves,
                groupLeaves,
                isAdmin,
            ]
        );

    const operationalCurrentLeaves =
        useMemo(
            () =>
                operationalLeaveSource
                    .filter(
                        isApprovedAndCurrent
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            first.userFullName.localeCompare(
                                second.userFullName,
                                "tr"
                            )
                    ),
            [
                operationalLeaveSource,
                today,
            ]
        );

    const onLeaveUserIds =
        useMemo(
            () =>
                new Set(
                    operationalCurrentLeaves.map(
                        (leave) =>
                            leave.userId
                    )
                ),
            [
                operationalCurrentLeaves,
            ]
        );

    const activeTasksForLeaveUsers =
        useMemo(
            () =>
                tasks.filter(
                    (task) =>
                        Boolean(
                            task.assignedUserId
                        ) &&
                        onLeaveUserIds.has(
                            task.assignedUserId!
                        ) &&
                        task.status !==
                        4 &&
                        task.status !==
                        5
                ),
            [
                tasks,
                onLeaveUserIds,
            ]
        );

    const leaveTaskInterventions =
        useMemo(
            () =>
                operationalCurrentLeaves
                    .map(
                        (leave) => ({
                            leave,
                            tasks:
                                activeTasksForLeaveUsers
                                    .filter(
                                        (task) =>
                                            task.assignedUserId ===
                                            leave.userId
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
                                                return first.isOverdue
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

                                            return (
                                                second.id -
                                                first.id
                                            );
                                        }
                                    ),
                        }))
                    .filter(
                        (item) =>
                            item.tasks.length >
                            0
                    ),
            [
                operationalCurrentLeaves,
                activeTasksForLeaveUsers,
            ]
        );

    const upcomingOperationalLeaves =
        useMemo(() => {
            const limit =
                new Date(
                    today
                );

            limit.setDate(
                limit.getDate() +
                7
            );

            return operationalLeaveSource
                .filter(
                    (leave) => {
                        if (
                            leave.status !==
                            2
                        ) {
                            return false;
                        }

                        const start =
                            toDay(
                                leave.startDate
                            );

                        return (
                            start >
                            today &&
                            start <=
                            limit
                        );
                    }
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        toDay(
                            first.startDate
                        ).getTime() -
                        toDay(
                            second.startDate
                        ).getTime()
                );
        }, [
            operationalLeaveSource,
            today,
        ]);

    const upcomingLeaveTaskRisks =
        useMemo(
            () =>
                upcomingOperationalLeaves
                    .map(
                        (leave) => {
                            const openTasks =
                                tasks
                                    .filter(
                                        (task) =>
                                            task.assignedUserId ===
                                            leave.userId &&
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
                                                return first.isOverdue
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

                                            return (
                                                second.id -
                                                first.id
                                            );
                                        }
                                    );

                            const daysUntilLeave =
                                Math.max(
                                    1,
                                    Math.ceil(
                                        (
                                            toDay(
                                                leave.startDate
                                            ).getTime() -
                                            today.getTime()
                                        ) /
                                        86400000
                                    )
                                );

                            return {
                                leave,
                                tasks:
                                    openTasks,
                                daysUntilLeave,
                            };
                        }
                    )
                    .filter(
                        (item) =>
                            item.tasks.length >
                            0
                    ),
            [
                upcomingOperationalLeaves,
                tasks,
                today,
            ]
        );

    const upcomingRiskTaskCount =
        useMemo(
            () =>
                upcomingLeaveTaskRisks.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.tasks.length,
                    0
                ),
            [
                upcomingLeaveTaskRisks,
            ]
        );

    const selectedLeaveOpenTasks =
        useMemo(() => {
            if (
                !selectedLeave
            ) {
                return [];
            }

            return tasks
                .filter(
                    (task) =>
                        task.assignedUserId ===
                        selectedLeave.userId &&
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
                            return first.isOverdue
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

                        return (
                            second.id -
                            first.id
                        );
                    }
                );
        }, [
            selectedLeave,
            tasks,
        ]);

    const displayedLeaves =
        useMemo(() => {
            return baseDisplayedLeaves.filter(
                (leave) => {
                    if (
                        groupFilter !==
                        "all" &&
                        leave.groupName !==
                        groupFilter
                    ) {
                        return false;
                    }

                    if (
                        statusFilter !==
                        "all" &&
                        leave.status !==
                        Number(
                            statusFilter
                        )
                    ) {
                        return false;
                    }

                    if (
                        leaveTypeFilter !==
                        "all" &&
                        leave.leaveType !==
                        Number(
                            leaveTypeFilter
                        )
                    ) {
                        return false;
                    }

                    if (
                        onlyCurrentlyOnLeave &&
                        !isApprovedAndCurrent(
                            leave
                        )
                    ) {
                        return false;
                    }

                    return true;
                }
            );
        }, [
            baseDisplayedLeaves,
            groupFilter,
            statusFilter,
            leaveTypeFilter,
            onlyCurrentlyOnLeave,
            today,
        ]);

    const employeeLeaveSummary =
        useMemo(() => {
            const approved =
                myLeaves.filter(
                    (leave) =>
                        leave.status ===
                        2
                );

            const current =
                approved.filter(
                    isApprovedAndCurrent
                ).length;

            const upcoming =
                approved.filter(
                    (leave) =>
                        toDay(
                            leave.startDate
                        ) >
                        today
                ).length;

            const pending =
                myLeaves.filter(
                    (leave) =>
                        leave.status ===
                        1
                ).length;

            return {
                current,
                pending,
                approved:
                    approved.length,
                upcoming,
                total:
                    myLeaves.length,
            };
        }, [
            myLeaves,
            today,
        ]);

    const summary = {
        current:
            currentlyOnLeave.length,
        interventionEmployees:
            leaveTaskInterventions.length,
        interventionTasks:
            activeTasksForLeaveUsers.length,
        upcoming:
            upcomingLeaves.length,
        pending:
            pendingCount,
    };

    const resetCreateForm =
        () => {
            setLeaveType(
                1
            );

            setStartDate(
                ""
            );

            setEndDate(
                ""
            );

            setDescription(
                ""
            );
        };

    const handleCreateLeave =
        async () => {
            if (
                !startDate ||
                !endDate
            ) {
                setErrorMessage(
                    "Başlangıç ve bitiş tarihlerini seçiniz."
                );

                return;
            }

            try {
                setIsSubmitting(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.post(
                    "/LeaveRequests",
                    {
                        leaveType,
                        startDate,
                        endDate,
                        description:
                            description.trim() ||
                            null,
                    }
                );

                setCreateDialogOpen(
                    false
                );

                resetCreateForm();

                await loadData();

                setSuccessMessage(
                    "İzin talebiniz başarıyla oluşturuldu."
                );
            } catch (
            error: any
            ) {
                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                setErrorMessage(
                    backendMessage ||
                    "İzin talebi oluşturulamadı."
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };

    const openReviewDialog =
        (
            leave:
                LeaveRequestItem
        ) => {
            setSelectedLeave(
                leave
            );

            setRejectionReason(
                ""
            );

            setReviewDialogOpen(
                true
            );
        };

    const handleReview =
        async (
            approved:
                boolean,
            viewTasksAfterApproval =
                false
        ) => {
            if (
                !selectedLeave
            ) {
                return;
            }

            if (
                !approved &&
                !rejectionReason.trim()
            ) {
                setErrorMessage(
                    "İzin reddedilecekse red nedeni girilmelidir."
                );

                return;
            }

            const leaveStartDate =
                toDay(
                    selectedLeave.startDate
                );

            const reviewedLeaveUserId =
                selectedLeave.userId;

            const isCurrentOrStartedLeave =
                leaveStartDate <=
                today;

            const targetSectionId =
                isCurrentOrStartedLeave
                    ? `leave-intervention-user-${reviewedLeaveUserId}`
                    : `upcoming-risk-user-${reviewedLeaveUserId}`;

            try {
                setIsSubmitting(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.patch(
                    `/LeaveRequests/${selectedLeave.id}/review`,
                    {
                        status:
                            approved
                                ? 2
                                : 3,

                        rejectionReason:
                            approved
                                ? null
                                : rejectionReason.trim(),
                    }
                );

                setReviewDialogOpen(
                    false
                );

                setSelectedLeave(
                    null
                );

                await loadData();

                setSuccessMessage(
                    approved
                        ? viewTasksAfterApproval
                            ? "İzin talebi onaylandı. Çalışanın açık görevleri incelemeye hazır."
                            : "İzin talebi onaylandı."
                        : "İzin talebi reddedildi."
                );

                if (
                    approved &&
                    viewTasksAfterApproval
                ) {
                    if (
                        !isCurrentOrStartedLeave
                    ) {
                        setPlanningLeaveUserId(
                            reviewedLeaveUserId
                        );
                    }

                    window.setTimeout(
                        () => {
                            document
                                .getElementById(
                                    targetSectionId
                                )
                                ?.scrollIntoView({
                                    behavior:
                                        "smooth",
                                    block:
                                        "center",
                                });
                        },
                        180
                    );
                }
            } catch (
            error: any
            ) {
                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                setErrorMessage(
                    backendMessage ||
                    "İzin talebi değerlendirilemedi."
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };

    const handleCancel = async () => {
        if (!leaveToCancel || isCancelling) return;
        if (cancelReason.trim().length < 3) { setCancelError("Lütfen en az 3 karakterlik bir gerekçe yazın."); return; }
        setIsCancelling(true);
        setCancelError("");
        setErrorMessage("");
        setSuccessMessage("");
        try {
            await api.patch(`/LeaveRequests/${leaveToCancel.id}/cancel`, { reason: cancelReason.trim() });
            setLeaveToCancel(null);
            await loadData();
            setSuccessMessage("İzin iptal edildi.");
        } catch (error: any) {
            setCancelError(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "İzin iptal edilemedi."
            );
        } finally {
            setIsCancelling(false);
        }
    };

    const getTaskStatusText =
        (status: number) => {
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

    const getPriorityText =
        (priority: number) => {
            switch (priority) {
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

    const getPriorityChipSx =
        (priority: number) => {
            switch (priority) {
                case 4:
                    return {
                        color:
                            "#A13B3B",
                        backgroundColor:
                            "#FAF1F1",
                        borderColor:
                            "#E9CCCC",
                    };
                case 3:
                    return {
                        color:
                            "#976720",
                        backgroundColor:
                            "#FBF6EC",
                        borderColor:
                            "#E9D7AF",
                    };
                case 1:
                    return {
                        color:
                            "#4F765E",
                        backgroundColor:
                            "#F1F6F3",
                        borderColor:
                            "#D2E1D7",
                    };
                default:
                    return {
                        color:
                            "#64748B",
                        backgroundColor:
                            "#F7F9FB",
                        borderColor:
                            "#D7DEE6",
                    };
            }
        };

    const handleReassignTask =
        async (
            taskId: number
        ) => {
            const selectedUserId =
                reassignmentSelections[
                taskId
                ];

            if (
                !selectedUserId
            ) {
                setErrorMessage(
                    "Görevin devredileceği çalışanı seçiniz."
                );

                return;
            }

            try {
                setReassigningTaskId(
                    taskId
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.patch(
                    `/Tasks/${taskId}/assign-group-member`,
                    {
                        userId:
                            selectedUserId,
                    }
                );

                setReassignmentSelections(
                    (current) => {
                        const next = {
                            ...current,
                        };

                        delete next[
                            taskId
                        ];

                        return next;
                    }
                );

                await loadData();

                setSuccessMessage(
                    "Görev uygun başka bir çalışana başarıyla devredildi."
                );
            } catch (
            error: any
            ) {
                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                setErrorMessage(
                    backendMessage ||
                    "Görev devredilemedi."
                );
            } finally {
                setReassigningTaskId(
                    null
                );
            }
        };

    const canCreateLeave =
        isManager ||
        isEmployee;

    const pageTitle =
        isAdmin
            ? "İzin Yönetimi"
            : isManager
                ? "İzin ve Ekip Yönetimi"
                : "İzinlerim";

    const pageDescription =
        isAdmin
            ? "Çalışan ve yönetici izin taleplerini merkezi olarak takip edin ve yönetin."
            : isManager
                ? "Kendi izinlerinizi takip edin ve grubunuzdaki çalışanların izin taleplerini yönetin."
                : "Kendi izin taleplerinizi oluşturun, onay durumlarını ve yaklaşan izinlerinizi tek ekrandan takip edin.";

    return (
        <Box
            sx={{
                width:
                    "100%",
                maxWidth:
                    "none",
                mx: "auto",
                px: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: 3.5,
                    xl: 4,
                },
                pb: 3,
            }}
        >
            <Box
                sx={{
                    display:
                        "flex",
                    alignItems:
                    {
                        xs:
                            "stretch",
                        sm:
                            "center",
                    },
                    justifyContent:
                        "space-between",
                    flexDirection:
                    {
                        xs:
                            "column",
                        sm:
                            "row",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius:
                                2.5,
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            backgroundColor:
                                "action.hover",
                            color:
                                "#163A63",
                            flexShrink:
                                0,
                        }}
                    >
                        <EventAvailableRoundedIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-0.02em",
                            }}
                        >
                            {pageTitle}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.4,
                            }}
                        >
                            {pageDescription}
                        </Typography>
                    </Box>
                </Box>

                {canCreateLeave && (
                    <Button
                        variant="contained"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        onClick={() => {
                            setErrorMessage(
                                ""
                            );

                            setSuccessMessage(
                                ""
                            );

                            setCreateDialogOpen(
                                true
                            );
                        }}
                        sx={{
                            minHeight:
                                44,
                            px: 2.25,
                            borderRadius:
                                2.5,
                            textTransform:
                                "none",
                            fontWeight:
                                700,
                            backgroundColor:
                                "#163A63",
                            "&:hover":
                            {
                                backgroundColor:
                                    "#102E50",
                            },
                        }}
                    >
                        Yeni İzin Talebi
                    </Button>
                )}
            </Box>

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2.5,
                        borderRadius:
                            2.5,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2.5,
                        borderRadius:
                            2.5,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

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
                        lg: "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                {isAdmin ||
                    isManager ? (
                    <>
                        <SummaryCard
                            title="Şu An İzinli"
                            value={
                                summary.current
                            }
                            description="Bugün aktif onaylı izni bulunan kişi"
                            icon={
                                <PersonRoundedIcon />
                            }
                            accentColor="#315F8C"
                            accentBackground="#EEF4F8"
                        />

                        <SummaryCard
                            title="Müdahale Gereken"
                            value={
                                summary.interventionEmployees
                            }
                            description={`${summary.interventionTasks} aktif görev izinli çalışanlarda`}
                            icon={
                                <WarningAmberRoundedIcon />
                            }
                            accentColor={
                                summary.interventionEmployees >
                                    0
                                    ? "#B7791F"
                                    : "#4F765E"
                            }
                            accentBackground={
                                summary.interventionEmployees >
                                    0
                                    ? "#FBF5EA"
                                    : "#EEF5F0"
                            }
                            onClick={() => {
                                document
                                    .getElementById(
                                        "leave-task-interventions"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth",
                                        block:
                                            "start",
                                    });
                            }}
                        />

                        <SummaryCard
                            title="Bekleyen Talep"
                            value={
                                summary.pending
                            }
                            description="Değerlendirme bekleyen izin talepleri"
                            icon={
                                <HourglassTopRoundedIcon />
                            }
                            accentColor="#7B6A8E"
                            accentBackground="#F4F1F6"
                        />

                        <SummaryCard
                            title="Yaklaşan İzin"
                            value={
                                summary.upcoming
                            }
                            description={
                                upcomingLeaveTaskRisks.length >
                                    0
                                    ? `${upcomingLeaveTaskRisks.length} çalışanda görev planlaması gerekiyor`
                                    : "Önümüzdeki 7 gün içinde başlayacak"
                            }
                            icon={
                                <EventAvailableRoundedIcon />
                            }
                            accentColor="#4F7E61"
                            accentBackground="#EEF5F0"
                            onClick={() => {
                                document
                                    .getElementById(
                                        "upcoming-leave-task-risks"
                                    )
                                    ?.scrollIntoView({
                                        behavior:
                                            "smooth",
                                        block:
                                            "start",
                                    });
                            }}
                        />
                    </>
                ) : (
                    <>
                        <SummaryCard
                            title="Aktif İznim"
                            value={
                                employeeLeaveSummary.current
                            }
                            description="Bugün devam eden onaylı izin kaydınız"
                            icon={
                                <EventAvailableRoundedIcon />
                            }
                            accentColor="#315F8C"
                            accentBackground="#EEF4F8"
                        />

                        <SummaryCard
                            title="Bekleyen Talebim"
                            value={
                                employeeLeaveSummary.pending
                            }
                            description="Henüz değerlendirilmemiş izin başvurunuz"
                            icon={
                                <HourglassTopRoundedIcon />
                            }
                            accentColor="#8A6E9E"
                            accentBackground="#F4F1F6"
                        />

                        <SummaryCard
                            title="Onaylanan"
                            value={
                                employeeLeaveSummary.approved
                            }
                            description="Bugüne kadar onaylanan izin talepleriniz"
                            icon={
                                <CheckCircleRoundedIcon />
                            }
                            accentColor="#4F765E"
                            accentBackground="#EEF5F0"
                        />

                        <SummaryCard
                            title="Yaklaşan İznim"
                            value={
                                employeeLeaveSummary.upcoming
                            }
                            description="Başlangıç tarihi henüz gelmemiş onaylı izniniz"
                            icon={
                                <CalendarMonthRoundedIcon />
                            }
                            accentColor="#527495"
                            accentBackground="#EEF4F8"
                        />
                    </>
                )}
            </Box>

            {(isAdmin ||
                isManager) && (
                    <>
                        <Paper
                            id="leave-task-interventions"
                            elevation={0}
                            sx={{
                                mb: 2.5,
                                overflow:
                                    "hidden",
                                border:
                                    "1px solid",
                                borderColor:
                                    leaveTaskInterventions.length >
                                        0
                                        ? "rgba(183,121,31,0.28)"
                                        : "divider",
                                borderRadius:
                                    3.25,
                                backgroundColor:
                                    "background.paper",
                                scrollMarginTop:
                                    92,
                            }}
                        >
                            <Box
                                sx={{
                                    position:
                                        "relative",
                                    overflow:
                                        "hidden",
                                    px: {
                                        xs: 2,
                                        sm: 2.5,
                                    },
                                    py: {
                                        xs: 2,
                                        sm: 2.25,
                                    },
                                    background:
                                        leaveTaskInterventions.length >
                                            0
                                            ? "linear-gradient(105deg, rgba(183,121,31,0.10) 0%, rgba(255,255,255,0) 68%)"
                                            : "linear-gradient(105deg, rgba(79,118,94,0.08) 0%, rgba(255,255,255,0) 68%)",
                                }}
                            >
                                <Box
                                    sx={{
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
                                        gap: 1.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            gap: 1.4,
                                            alignItems:
                                                "flex-start",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius:
                                                    2.3,
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                color:
                                                    leaveTaskInterventions.length >
                                                        0
                                                        ? "#9A6700"
                                                        : "#4F765E",
                                                backgroundColor:
                                                    leaveTaskInterventions.length >
                                                        0
                                                        ? "#FFF8E1"
                                                        : "#EEF5F0",
                                                flexShrink:
                                                    0,
                                            }}
                                        >
                                            {leaveTaskInterventions.length >
                                                0 ? (
                                                <WarningAmberRoundedIcon />
                                            ) : (
                                                <CheckCircleRoundedIcon />
                                            )}
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight:
                                                        850,
                                                    letterSpacing:
                                                        "-0.015em",
                                                }}
                                            >
                                                Müdahale Gereken Görevler
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 0.35,
                                                    maxWidth:
                                                        760,
                                                    lineHeight:
                                                        1.55,
                                                }}
                                            >
                                                Aktif izindeki çalışanların üzerindeki açık görevleri burada görün ve görev detayına girmeden uygun ekip arkadaşına devredin.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            flexWrap:
                                                "wrap",
                                            rowGap: 1,
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={`${leaveTaskInterventions.length} çalışan`}
                                            sx={{
                                                fontWeight:
                                                    750,
                                                backgroundColor:
                                                    "background.paper",
                                            }}
                                        />

                                        <Chip
                                            size="small"
                                            label={`${activeTasksForLeaveUsers.length} aktif görev`}
                                            sx={{
                                                fontWeight:
                                                    750,
                                                backgroundColor:
                                                    leaveTaskInterventions.length >
                                                        0
                                                        ? "#FFF8E1"
                                                        : "#EEF5F0",
                                                color:
                                                    leaveTaskInterventions.length >
                                                        0
                                                        ? "#9A6700"
                                                        : "#4F765E",
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Box>

                            <Divider />

                            {leaveTaskInterventions.length ===
                                0 ? (
                                <Box
                                    sx={{
                                        px: 2.5,
                                        py: 3.5,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <Box>
                                        <CheckCircleRoundedIcon
                                            sx={{
                                                fontSize:
                                                    36,
                                                color:
                                                    "#4F765E",
                                            }}
                                        />

                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                mt: 0.8,
                                                fontWeight:
                                                    800,
                                            }}
                                        >
                                            Aktif müdahale gerekmiyor
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.35,
                                            }}
                                        >
                                            Şu anda izinde olan çalışanların üzerinde açık görev bulunmuyor.
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        p: {
                                            xs: 1.5,
                                            sm: 2,
                                        },
                                        display:
                                            "grid",
                                        gap: 1.6,
                                    }}
                                >
                                    {leaveTaskInterventions.map(
                                        (
                                            intervention
                                        ) => (
                                            <Paper
                                                id={`leave-intervention-user-${intervention.leave.userId}`}
                                                key={
                                                    intervention.leave.id
                                                }
                                                elevation={
                                                    0
                                                }
                                                sx={{
                                                    scrollMarginTop:
                                                        110,
                                                    overflow:
                                                        "hidden",
                                                    border:
                                                        "1px solid",
                                                    borderColor:
                                                        "divider",
                                                    borderRadius:
                                                        2.8,
                                                    backgroundColor:
                                                        "background.paper",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: {
                                                            xs:
                                                                1.8,
                                                            md:
                                                                2.2,
                                                        },
                                                        py: 1.65,
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
                                                        gap: 1.25,
                                                        backgroundColor:
                                                            "action.hover",
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
                                                                width:
                                                                    38,
                                                                height:
                                                                    38,
                                                                borderRadius:
                                                                    "50%",
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                backgroundColor:
                                                                    "#EEF4F8",
                                                                color:
                                                                    "#315F8C",
                                                                fontWeight:
                                                                    850,
                                                                fontSize:
                                                                    13,
                                                                flexShrink:
                                                                    0,
                                                            }}
                                                        >
                                                            {intervention.leave.userFullName
                                                                .split(
                                                                    " "
                                                                )
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .slice(
                                                                    0,
                                                                    2
                                                                )
                                                                .map(
                                                                    (
                                                                        part
                                                                    ) =>
                                                                        part[
                                                                        0
                                                                        ]
                                                                )
                                                                .join(
                                                                    ""
                                                                )
                                                                .toUpperCase()}
                                                        </Box>

                                                        <Box>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight:
                                                                        850,
                                                                }}
                                                            >
                                                                {intervention.leave.userFullName}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {intervention.leave.groupName ??
                                                                    "Grup bilgisi yok"}
                                                                {" • "}
                                                                {getLeaveTypeText(
                                                                    intervention.leave.leaveType
                                                                )}
                                                                {" • "}
                                                                {formatDate(
                                                                    intervention.leave.startDate
                                                                )}
                                                                {" – "}
                                                                {formatDate(
                                                                    intervention.leave.endDate
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 1,
                                                            flexWrap:
                                                                "wrap",
                                                        }}
                                                    >
                                                        <Chip
                                                            size="small"
                                                            icon={
                                                                <AssignmentRoundedIcon />
                                                            }
                                                            label={`${intervention.tasks.length} açık görev`}
                                                            sx={{
                                                                fontWeight:
                                                                    750,
                                                                color:
                                                                    "#9A6700",
                                                                backgroundColor:
                                                                    "#FFF8E1",
                                                            }}
                                                        />

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                fontWeight:
                                                                    650,
                                                            }}
                                                        >
                                                            Dönüş:{" "}
                                                            {formatDate(
                                                                new Date(
                                                                    toDay(
                                                                        intervention.leave.endDate
                                                                    ).getTime() +
                                                                    86400000
                                                                ).toISOString()
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box>
                                                    {intervention.tasks.map(
                                                        (
                                                            task,
                                                            index
                                                        ) => {
                                                            const members =
                                                                task.assignedGroupId
                                                                    ? groupMembersByGroup[
                                                                    task.assignedGroupId
                                                                    ] ??
                                                                    []
                                                                    : [];

                                                            return (
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
                                                                        sx={{
                                                                            px: {
                                                                                xs:
                                                                                    1.8,
                                                                                md:
                                                                                    2.2,
                                                                            },
                                                                            py: 1.6,
                                                                            display:
                                                                                "grid",
                                                                            gridTemplateColumns:
                                                                            {
                                                                                xs:
                                                                                    "1fr",
                                                                                xl:
                                                                                    "minmax(260px, 1.45fr) minmax(190px, 0.8fr) minmax(220px, 0.9fr) auto",
                                                                            },
                                                                            alignItems:
                                                                                "center",
                                                                            gap: {
                                                                                xs:
                                                                                    1.2,
                                                                                xl:
                                                                                    1.6,
                                                                            },
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                minWidth:
                                                                                    0,
                                                                            }}
                                                                        >
                                                                            <Stack
                                                                                direction="row"
                                                                                sx={{
                                                                                    alignItems:
                                                                                        "center",
                                                                                    gap: 0.8,
                                                                                    flexWrap:
                                                                                        "wrap",
                                                                                }}
                                                                            >
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{
                                                                                        fontWeight:
                                                                                            800,
                                                                                        overflow:
                                                                                            "hidden",
                                                                                        textOverflow:
                                                                                            "ellipsis",
                                                                                    }}
                                                                                >
                                                                                    {task.title}
                                                                                </Typography>

                                                                                <Typography
                                                                                    variant="caption"
                                                                                    sx={{
                                                                                        color:
                                                                                            "#315F8C",
                                                                                        fontWeight:
                                                                                            800,
                                                                                    }}
                                                                                >
                                                                                    #{task.id}
                                                                                </Typography>
                                                                            </Stack>

                                                                            <Stack
                                                                                direction="row"
                                                                                sx={{
                                                                                    mt: 0.7,
                                                                                    gap: 0.7,
                                                                                    alignItems:
                                                                                        "center",
                                                                                    flexWrap:
                                                                                        "wrap",
                                                                                }}
                                                                            >
                                                                                <Chip
                                                                                    label={
                                                                                        getPriorityText(
                                                                                            task.priority
                                                                                        )
                                                                                    }
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        height:
                                                                                            24,
                                                                                        fontSize:
                                                                                            10.5,
                                                                                        fontWeight:
                                                                                            750,
                                                                                        ...getPriorityChipSx(
                                                                                            task.priority
                                                                                        ),
                                                                                    }}
                                                                                />

                                                                                <Chip
                                                                                    label={
                                                                                        getTaskStatusText(
                                                                                            task.status
                                                                                        )
                                                                                    }
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    sx={{
                                                                                        height:
                                                                                            24,
                                                                                        fontSize:
                                                                                            10.5,
                                                                                        fontWeight:
                                                                                            750,
                                                                                    }}
                                                                                />

                                                                                {task.isOverdue && (
                                                                                    <Chip
                                                                                        label="Gecikmiş"
                                                                                        size="small"
                                                                                        sx={{
                                                                                            height:
                                                                                                24,
                                                                                            fontSize:
                                                                                                10.5,
                                                                                            fontWeight:
                                                                                                750,
                                                                                            color:
                                                                                                "#A13B3B",
                                                                                            backgroundColor:
                                                                                                "#FAF1F1",
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Stack>
                                                                        </Box>

                                                                        <Box>
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    display:
                                                                                        "block",
                                                                                    fontWeight:
                                                                                        650,
                                                                                }}
                                                                            >
                                                                                Son teslim
                                                                            </Typography>

                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    mt: 0.25,
                                                                                    fontWeight:
                                                                                        700,
                                                                                    color:
                                                                                        task.isOverdue
                                                                                            ? "#A13B3B"
                                                                                            : "text.primary",
                                                                                }}
                                                                            >
                                                                                {task.dueDate
                                                                                    ? formatDate(
                                                                                        task.dueDate
                                                                                    )
                                                                                    : "Tarih belirtilmedi"}
                                                                            </Typography>
                                                                        </Box>

                                                                        {canReassignTasks ? (
                                                                            <TextField
                                                                                select
                                                                                size="small"
                                                                                label="Yeni Sorumlu"
                                                                                value={
                                                                                    reassignmentSelections[
                                                                                    task.id
                                                                                    ] ??
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) =>
                                                                                    setReassignmentSelections(
                                                                                        (
                                                                                            current
                                                                                        ) => ({
                                                                                            ...current,
                                                                                            [
                                                                                                task.id
                                                                                            ]:
                                                                                                event
                                                                                                    .target
                                                                                                    .value,
                                                                                        })
                                                                                    )
                                                                                }
                                                                                fullWidth
                                                                                sx={{
                                                                                    "& .MuiOutlinedInput-root":
                                                                                    {
                                                                                        borderRadius:
                                                                                            2.15,
                                                                                    },
                                                                                }}
                                                                            >
                                                                                {members
                                                                                    .filter(
                                                                                        (
                                                                                            member
                                                                                        ) =>
                                                                                            !member.isManager &&
                                                                                            member.userId !==
                                                                                            intervention
                                                                                                .leave
                                                                                                .userId
                                                                                    )
                                                                                    .map(
                                                                                        (
                                                                                            member
                                                                                        ) => {
                                                                                            const memberIsOnLeave =
                                                                                                onLeaveUserIds.has(
                                                                                                    member.userId
                                                                                                );

                                                                                            return (
                                                                                                <MenuItem
                                                                                                    key={
                                                                                                        member.userId
                                                                                                    }
                                                                                                    value={
                                                                                                        member.userId
                                                                                                    }
                                                                                                    disabled={
                                                                                                        memberIsOnLeave
                                                                                                    }
                                                                                                >
                                                                                                    <Box>
                                                                                                        <Typography
                                                                                                            variant="body2"
                                                                                                            sx={{
                                                                                                                fontWeight:
                                                                                                                    650,
                                                                                                            }}
                                                                                                        >
                                                                                                            {member.fullName}
                                                                                                        </Typography>

                                                                                                        <Typography
                                                                                                            variant="caption"
                                                                                                            color={
                                                                                                                memberIsOnLeave
                                                                                                                    ? "warning.main"
                                                                                                                    : "text.secondary"
                                                                                                            }
                                                                                                        >
                                                                                                            {member.email}
                                                                                                            {memberIsOnLeave
                                                                                                                ? " • İzinde"
                                                                                                                : ""}
                                                                                                        </Typography>
                                                                                                    </Box>
                                                                                                </MenuItem>
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                            </TextField>
                                                                        ) : (
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                            >
                                                                                Görev devri Admin, grup yöneticisi veya aktif vekil tarafından yapılabilir.
                                                                            </Typography>
                                                                        )}

                                                                        <Button
                                                                            variant="contained"
                                                                            startIcon={
                                                                                <SwapHorizRoundedIcon />
                                                                            }
                                                                            disabled={
                                                                                !canReassignTasks ||
                                                                                !reassignmentSelections[
                                                                                task
                                                                                    .id
                                                                                ] ||
                                                                                reassigningTaskId ===
                                                                                task.id
                                                                            }
                                                                            onClick={() =>
                                                                                void handleReassignTask(
                                                                                    task.id
                                                                                )
                                                                            }
                                                                            sx={{
                                                                                minHeight:
                                                                                    40,
                                                                                px: 1.8,
                                                                                borderRadius:
                                                                                    2.15,
                                                                                textTransform:
                                                                                    "none",
                                                                                fontWeight:
                                                                                    750,
                                                                                whiteSpace:
                                                                                    "nowrap",
                                                                                backgroundColor:
                                                                                    "#163A63",
                                                                                "&:hover":
                                                                                {
                                                                                    backgroundColor:
                                                                                        "#102E50",
                                                                                },
                                                                            }}
                                                                        >
                                                                            {reassigningTaskId ===
                                                                                task.id
                                                                                ? "Devrediliyor..."
                                                                                : "Görevi Devret"}
                                                                        </Button>
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        }
                                                    )}
                                                </Box>
                                            </Paper>
                                        )
                                    )}
                                </Box>
                            )}
                        </Paper>

                        <Paper
                            id="upcoming-leave-task-risks"
                            elevation={0}
                            sx={{
                                mb: 2.5,
                                overflow:
                                    "hidden",
                                border:
                                    "1px solid",
                                borderColor:
                                    upcomingLeaveTaskRisks.length >
                                        0
                                        ? "rgba(49,95,140,0.22)"
                                        : "divider",
                                borderRadius:
                                    3.25,
                                backgroundColor:
                                    "background.paper",
                                scrollMarginTop:
                                    92,
                            }}
                        >
                            <Box
                                sx={{
                                    px: {
                                        xs: 2,
                                        sm: 2.5,
                                    },
                                    py: 2,
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
                                    background:
                                        upcomingLeaveTaskRisks.length >
                                            0
                                            ? "linear-gradient(105deg, rgba(49,95,140,0.09) 0%, rgba(255,255,255,0) 70%)"
                                            : "transparent",
                                }}
                            >
                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        gap: 1.35,
                                        alignItems:
                                            "flex-start",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius:
                                                2.3,
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            color:
                                                "#315F8C",
                                            backgroundColor:
                                                "#EEF4F8",
                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        <CalendarMonthRoundedIcon />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight:
                                                    850,
                                                letterSpacing:
                                                    "-0.015em",
                                            }}
                                        >
                                            Yaklaşan İzinlerde Görev Riski
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.35,
                                                maxWidth:
                                                    760,
                                                lineHeight:
                                                    1.55,
                                            }}
                                        >
                                            Önümüzdeki 7 gün içinde izne çıkacak ve üzerinde açık görev bulunan çalışanları önceden görün.
                                        </Typography>
                                    </Box>
                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        flexWrap:
                                            "wrap",
                                        rowGap: 1,
                                    }}
                                >
                                    <Chip
                                        size="small"
                                        label={`${upcomingLeaveTaskRisks.length} çalışan`}
                                        sx={{
                                            fontWeight:
                                                750,
                                            backgroundColor:
                                                "#EEF4F8",
                                            color:
                                                "#315F8C",
                                        }}
                                    />

                                    <Chip
                                        size="small"
                                        label={`${upcomingRiskTaskCount} açık görev`}
                                        variant="outlined"
                                        sx={{
                                            fontWeight:
                                                750,
                                        }}
                                    />
                                </Stack>
                            </Box>

                            <Divider />

                            {upcomingLeaveTaskRisks.length ===
                                0 ? (
                                <Box
                                    sx={{
                                        py: 3.2,
                                        px: 2,
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <CheckCircleRoundedIcon
                                        sx={{
                                            fontSize:
                                                34,
                                            color:
                                                "#4F765E",
                                        }}
                                    />

                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            mt: 0.7,
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Yaklaşan izinlerde görev riski yok
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.3,
                                        }}
                                    >
                                        Önümüzdeki 7 gün içinde izne çıkacak çalışanlarda açık görev bulunmuyor.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        p: {
                                            xs: 1.5,
                                            sm: 1.8,
                                        },
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                        {
                                            xs:
                                                "1fr",
                                            xl:
                                                "repeat(2, minmax(0, 1fr))",
                                        },
                                        gap: 1.35,
                                    }}
                                >
                                    {upcomingLeaveTaskRisks.map(
                                        (
                                            risk
                                        ) => (
                                            <Paper
                                                id={`upcoming-risk-user-${risk.leave.userId}`}
                                                key={
                                                    risk.leave.id
                                                }
                                                elevation={
                                                    0
                                                }
                                                sx={{
                                                    p: 1.7,
                                                    scrollMarginTop:
                                                        110,
                                                    border:
                                                        "1px solid",
                                                    borderColor:
                                                        "divider",
                                                    borderRadius:
                                                        2.7,
                                                    backgroundColor:
                                                        "background.paper",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "flex-start",
                                                        gap: 1.2,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight:
                                                                    850,
                                                            }}
                                                        >
                                                            {risk.leave.userFullName}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mt: 0.2,
                                                            }}
                                                        >
                                                            {risk.leave.groupName ??
                                                                "Grup bilgisi yok"}
                                                            {" • "}
                                                            {getLeaveTypeText(
                                                                risk.leave.leaveType
                                                            )}
                                                        </Typography>
                                                    </Box>

                                                    <Chip
                                                        size="small"
                                                        label={
                                                            risk.daysUntilLeave ===
                                                                1
                                                                ? "Yarın izne çıkıyor"
                                                                : `${risk.daysUntilLeave} gün sonra izne çıkıyor`
                                                        }
                                                        sx={{
                                                            height:
                                                                25,
                                                            fontSize:
                                                                10.5,
                                                            fontWeight:
                                                                800,
                                                            color:
                                                                "#315F8C",
                                                            backgroundColor:
                                                                "#EEF4F8",
                                                            flexShrink:
                                                                0,
                                                        }}
                                                    />
                                                </Box>

                                                <Box
                                                    sx={{
                                                        mt: 1.3,
                                                        p: 1.2,
                                                        borderRadius:
                                                            2.1,
                                                        backgroundColor:
                                                            "action.hover",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "space-between",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Açık iş yükü
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 0.15,
                                                                fontWeight:
                                                                    800,
                                                            }}
                                                        >
                                                            {risk.tasks.length} aktif görev
                                                        </Typography>
                                                    </Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            textAlign:
                                                                "right",
                                                        }}
                                                    >
                                                        İzin başlangıcı
                                                        <br />
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                color:
                                                                    "text.primary",
                                                                fontWeight:
                                                                    750,
                                                            }}
                                                        >
                                                            {formatDate(
                                                                risk.leave.startDate
                                                            )}
                                                        </Box>
                                                    </Typography>
                                                </Box>

                                                <Stack
                                                    spacing={0.75}
                                                    sx={{
                                                        mt: 1.2,
                                                    }}
                                                >
                                                    {risk.tasks
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                task
                                                            ) => (
                                                                <Box
                                                                    key={
                                                                        task.id
                                                                    }
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "space-between",
                                                                        gap: 1,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight:
                                                                                700,
                                                                            overflow:
                                                                                "hidden",
                                                                            textOverflow:
                                                                                "ellipsis",
                                                                            whiteSpace:
                                                                                "nowrap",
                                                                        }}
                                                                    >
                                                                        #{task.id} {task.title}
                                                                    </Typography>

                                                                    {task.dueDate && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            color={
                                                                                task.isOverdue
                                                                                    ? "error.main"
                                                                                    : "text.secondary"
                                                                            }
                                                                            sx={{
                                                                                flexShrink:
                                                                                    0,
                                                                                fontWeight:
                                                                                    task.isOverdue
                                                                                        ? 750
                                                                                        : 500,
                                                                            }}
                                                                        >
                                                                            {formatDate(
                                                                                task.dueDate
                                                                            )}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            )
                                                        )}

                                                    {risk.tasks.length >
                                                        3 && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontWeight:
                                                                        650,
                                                                }}
                                                            >
                                                                +{risk.tasks.length - 3} görev daha
                                                            </Typography>
                                                        )}
                                                </Stack>

                                                <Button
                                                    size="small"
                                                    endIcon={
                                                        <ArrowForwardRoundedIcon
                                                            sx={{
                                                                transform:
                                                                    planningLeaveUserId ===
                                                                        risk.leave.userId
                                                                        ? "rotate(90deg)"
                                                                        : "none",
                                                                transition:
                                                                    "transform 0.18s ease",
                                                            }}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        const willOpen =
                                                            planningLeaveUserId !==
                                                            risk.leave.userId;

                                                        setPlanningLeaveUserId(
                                                            willOpen
                                                                ? risk.leave.userId
                                                                : null
                                                        );

                                                        if (
                                                            willOpen
                                                        ) {
                                                            window.setTimeout(
                                                                () => {
                                                                    document
                                                                        .getElementById(
                                                                            `upcoming-risk-user-${risk.leave.userId}`
                                                                        )
                                                                        ?.scrollIntoView({
                                                                            behavior:
                                                                                "smooth",
                                                                            block:
                                                                                "center",
                                                                        });
                                                                },
                                                                80
                                                            );
                                                        }
                                                    }}
                                                    sx={{
                                                        mt: 1.1,
                                                        p: 0,
                                                        minWidth:
                                                            0,
                                                        textTransform:
                                                            "none",
                                                        fontWeight:
                                                            750,
                                                        color:
                                                            "#315F8C",
                                                    }}
                                                >
                                                    {planningLeaveUserId ===
                                                        risk.leave.userId
                                                        ? "Planlamayı Kapat"
                                                        : "Görevleri Planla"}
                                                </Button>

                                                {planningLeaveUserId ===
                                                    risk.leave.userId && (
                                                        <Box
                                                            sx={{
                                                                mt: 1.5,
                                                                pt: 1.5,
                                                                borderTop:
                                                                    "1px solid",
                                                                borderColor:
                                                                    "divider",
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    mb: 1.2,
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "space-between",
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <Box>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        sx={{
                                                                            fontWeight:
                                                                                850,
                                                                        }}
                                                                    >
                                                                        Görev Planlama
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        İzin başlamadan önce açık görevleri uygun ekip arkadaşlarına devredebilirsiniz.
                                                                    </Typography>
                                                                </Box>

                                                                <Chip
                                                                    size="small"
                                                                    label={`${risk.tasks.length} görev`}
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontWeight:
                                                                            750,
                                                                    }}
                                                                />
                                                            </Box>

                                                            <Stack
                                                                spacing={1}
                                                            >
                                                                {risk.tasks.map(
                                                                    (
                                                                        task
                                                                    ) => {
                                                                        const members =
                                                                            task.assignedGroupId
                                                                                ? groupMembersByGroup[
                                                                                task.assignedGroupId
                                                                                ] ??
                                                                                []
                                                                                : [];

                                                                        return (
                                                                            <Box
                                                                                key={
                                                                                    task.id
                                                                                }
                                                                                sx={{
                                                                                    p: 1.25,
                                                                                    border:
                                                                                        "1px solid",
                                                                                    borderColor:
                                                                                        "divider",
                                                                                    borderRadius:
                                                                                        2.15,
                                                                                    backgroundColor:
                                                                                        "background.paper",
                                                                                    display:
                                                                                        "grid",
                                                                                    gridTemplateColumns:
                                                                                    {
                                                                                        xs:
                                                                                            "1fr",
                                                                                        lg:
                                                                                            "minmax(220px, 1fr) minmax(220px, 0.9fr) auto",
                                                                                    },
                                                                                    alignItems:
                                                                                        "center",
                                                                                    gap: 1,
                                                                                }}
                                                                            >
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
                                                                                                800,
                                                                                            overflow:
                                                                                                "hidden",
                                                                                            textOverflow:
                                                                                                "ellipsis",
                                                                                            whiteSpace:
                                                                                                "nowrap",
                                                                                        }}
                                                                                    >
                                                                                        #{task.id} {task.title}
                                                                                    </Typography>

                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        color="text.secondary"
                                                                                    >
                                                                                        {getTaskStatusText(
                                                                                            task.status
                                                                                        )}
                                                                                        {" • "}
                                                                                        {getPriorityText(
                                                                                            task.priority
                                                                                        )}
                                                                                        {task.dueDate
                                                                                            ? ` • Son teslim: ${formatDate(
                                                                                                task.dueDate
                                                                                            )}`
                                                                                            : ""}
                                                                                    </Typography>
                                                                                </Box>

                                                                                {canReassignTasks ? (
                                                                                    <TextField
                                                                                        select
                                                                                        size="small"
                                                                                        label="Yeni Sorumlu"
                                                                                        value={
                                                                                            reassignmentSelections[
                                                                                            task.id
                                                                                            ] ??
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            event
                                                                                        ) =>
                                                                                            setReassignmentSelections(
                                                                                                (
                                                                                                    current
                                                                                                ) => ({
                                                                                                    ...current,
                                                                                                    [
                                                                                                        task.id
                                                                                                    ]:
                                                                                                        event.target.value,
                                                                                                })
                                                                                            )
                                                                                        }
                                                                                        fullWidth
                                                                                        sx={{
                                                                                            "& .MuiOutlinedInput-root":
                                                                                            {
                                                                                                borderRadius:
                                                                                                    2,
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        {members
                                                                                            .filter(
                                                                                                (
                                                                                                    member
                                                                                                ) =>
                                                                                                    !member.isManager &&
                                                                                                    member.userId !==
                                                                                                    risk.leave.userId
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    member
                                                                                                ) => {
                                                                                                    const memberIsOnLeave =
                                                                                                        onLeaveUserIds.has(
                                                                                                            member.userId
                                                                                                        );

                                                                                                    return (
                                                                                                        <MenuItem
                                                                                                            key={
                                                                                                                member.userId
                                                                                                            }
                                                                                                            value={
                                                                                                                member.userId
                                                                                                            }
                                                                                                            disabled={
                                                                                                                memberIsOnLeave
                                                                                                            }
                                                                                                        >
                                                                                                            <Box>
                                                                                                                <Typography
                                                                                                                    variant="body2"
                                                                                                                    sx={{
                                                                                                                        fontWeight:
                                                                                                                            650,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {member.fullName}
                                                                                                                </Typography>

                                                                                                                <Typography
                                                                                                                    variant="caption"
                                                                                                                    color={
                                                                                                                        memberIsOnLeave
                                                                                                                            ? "warning.main"
                                                                                                                            : "text.secondary"
                                                                                                                    }
                                                                                                                >
                                                                                                                    {member.email}
                                                                                                                    {memberIsOnLeave
                                                                                                                        ? " • İzinde"
                                                                                                                        : ""}
                                                                                                                </Typography>
                                                                                                            </Box>
                                                                                                        </MenuItem>
                                                                                                    );
                                                                                                }
                                                                                            )}
                                                                                    </TextField>
                                                                                ) : (
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        color="text.secondary"
                                                                                    >
                                                                                        Görev devri için Admin, yönetici veya aktif vekil yetkisi gerekir.
                                                                                    </Typography>
                                                                                )}

                                                                                <Button
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    startIcon={
                                                                                        <SwapHorizRoundedIcon />
                                                                                    }
                                                                                    disabled={
                                                                                        !canReassignTasks ||
                                                                                        !reassignmentSelections[
                                                                                        task.id
                                                                                        ] ||
                                                                                        reassigningTaskId ===
                                                                                        task.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        void handleReassignTask(
                                                                                            task.id
                                                                                        )
                                                                                    }
                                                                                    sx={{
                                                                                        minHeight:
                                                                                            38,
                                                                                        px: 1.5,
                                                                                        borderRadius:
                                                                                            2,
                                                                                        textTransform:
                                                                                            "none",
                                                                                        fontWeight:
                                                                                            750,
                                                                                        whiteSpace:
                                                                                            "nowrap",
                                                                                        backgroundColor:
                                                                                            "#163A63",
                                                                                        "&:hover":
                                                                                        {
                                                                                            backgroundColor:
                                                                                                "#102E50",
                                                                                        },
                                                                                    }}
                                                                                >
                                                                                    {reassigningTaskId ===
                                                                                        task.id
                                                                                        ? "Devrediliyor..."
                                                                                        : "Devret"}
                                                                                </Button>
                                                                            </Box>
                                                                        );
                                                                    }
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    )}
                                            </Paper>
                                        )
                                    )}
                                </Box>
                            )}
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                mb: 2.5,
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius:
                                    3.1,
                                overflow:
                                    "hidden",
                                backgroundColor:
                                    "background.paper",
                            }}
                        >
                            <Box
                                sx={{
                                    px: {
                                        xs: 2,
                                        sm: 2.5,
                                    },
                                    py: 1.9,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Şu An İzinli Olanlar
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.25,
                                        }}
                                    >
                                        Aktif izin durumu ve üzerindeki açık görev sayısı.
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`${operationalCurrentLeaves.length} kişi`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontWeight:
                                            750,
                                    }}
                                />
                            </Box>

                            <Divider />

                            {operationalCurrentLeaves.length ===
                                0 ? (
                                <Box
                                    sx={{
                                        py: 3.5,
                                        px: 2,
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Şu anda aktif izinde görünen çalışan bulunmuyor.
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        p: {
                                            xs: 1.4,
                                            sm: 1.8,
                                        },
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                        {
                                            xs:
                                                "1fr",
                                            md:
                                                "repeat(2, minmax(0, 1fr))",
                                            xl:
                                                "repeat(3, minmax(0, 1fr))",
                                        },
                                        gap: 1.2,
                                    }}
                                >
                                    {operationalCurrentLeaves.map(
                                        (
                                            leave
                                        ) => {
                                            const openTaskCount =
                                                activeTasksForLeaveUsers.filter(
                                                    (
                                                        task
                                                    ) =>
                                                        task.assignedUserId ===
                                                        leave.userId
                                                ).length;

                                            return (
                                                <Box
                                                    key={
                                                        leave.id
                                                    }
                                                    sx={{
                                                        p: 1.55,
                                                        border:
                                                            "1px solid",
                                                        borderColor:
                                                            openTaskCount >
                                                                0
                                                                ? "rgba(183,121,31,0.24)"
                                                                : "divider",
                                                        borderRadius:
                                                            2.5,
                                                        backgroundColor:
                                                            "background.paper",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            gap: 1,
                                                            alignItems:
                                                                "flex-start",
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight:
                                                                        800,
                                                                }}
                                                            >
                                                                {leave.userFullName}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {leave.groupName ??
                                                                    "Grup bilgisi yok"}
                                                            </Typography>
                                                        </Box>

                                                        <Chip
                                                            size="small"
                                                            label={
                                                                openTaskCount >
                                                                    0
                                                                    ? `${openTaskCount} açık görev`
                                                                    : "Görev yok"
                                                            }
                                                            sx={{
                                                                height:
                                                                    24,
                                                                fontSize:
                                                                    10.5,
                                                                fontWeight:
                                                                    750,
                                                                color:
                                                                    openTaskCount >
                                                                        0
                                                                        ? "#9A6700"
                                                                        : "#4F765E",
                                                                backgroundColor:
                                                                    openTaskCount >
                                                                        0
                                                                        ? "#FFF8E1"
                                                                        : "#EEF5F0",
                                                            }}
                                                        />
                                                    </Box>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display:
                                                                "block",
                                                            mt: 1,
                                                        }}
                                                    >
                                                        {getLeaveTypeText(
                                                            leave.leaveType
                                                        )}
                                                        {" • "}
                                                        {formatDate(
                                                            leave.startDate
                                                        )}
                                                        {" – "}
                                                        {formatDate(
                                                            leave.endDate
                                                        )}
                                                    </Typography>

                                                    {openTaskCount >
                                                        0 && (
                                                            <Button
                                                                size="small"
                                                                endIcon={
                                                                    <ArrowForwardRoundedIcon />
                                                                }
                                                                onClick={() => {
                                                                    document
                                                                        .getElementById(
                                                                            `leave-intervention-user-${leave.userId}`
                                                                        )
                                                                        ?.scrollIntoView({
                                                                            behavior:
                                                                                "smooth",
                                                                            block:
                                                                                "center",
                                                                        });
                                                                }}
                                                                sx={{
                                                                    mt: 0.8,
                                                                    p: 0,
                                                                    minWidth:
                                                                        0,
                                                                    textTransform:
                                                                        "none",
                                                                    fontWeight:
                                                                        750,
                                                                    color:
                                                                        "#315F8C",
                                                                }}
                                                            >
                                                                Görevleri Gör
                                                            </Button>
                                                        )}
                                                </Box>
                                            );
                                        }
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </>
                )}

            {isPermanentManager && (
                <Paper
                    elevation={0}
                    sx={{
                        mb: 2.5,
                        p: {
                            xs: 1.8,
                            sm: 2,
                        },
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
                    <Box
                        sx={{
                            display:
                                "flex",
                            alignItems:
                            {
                                xs:
                                    "stretch",
                                sm:
                                    "center",
                            },
                            justifyContent:
                                "space-between",
                            flexDirection:
                            {
                                xs:
                                    "column",
                                sm:
                                    "row",
                            },
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 46,
                                    height: 46,
                                    borderRadius:
                                        2.4,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    backgroundColor:
                                        "action.hover",
                                    color:
                                        "#163A63",
                                    flexShrink:
                                        0,
                                }}
                            >
                                <AdminPanelSettingsRoundedIcon />
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight:
                                            800,
                                    }}
                                >
                                    Yönetici Vekaleti
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.35,
                                    }}
                                >
                                    İhtiyaç duyduğunuz zaman kendi grubunuzdan bir çalışanı geçici vekil olarak belirleyebilir ve vekaleti istediğiniz zaman sona erdirebilirsiniz.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={() =>
                                navigate(
                                    "/manager-delegations"
                                )
                            }
                            sx={{
                                minHeight:
                                    42,
                                px: 2.2,
                                borderRadius:
                                    2.3,
                                textTransform:
                                    "none",
                                fontWeight:
                                    750,
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            Vekil Belirle
                        </Button>
                    </Box>
                </Paper>
            )}

            <Paper
                elevation={0}
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
                {(isManager ||
                    isAdmin) && (
                        <>
                            <Box
                                sx={{
                                    px: {
                                        xs:
                                            1,
                                        sm:
                                            2,
                                    },
                                    pt: 1,
                                }}
                            >
                                <Tabs
                                    value={
                                        activeTab
                                    }
                                    onChange={(
                                        _event,
                                        value:
                                            TabValue
                                    ) =>
                                        setActiveTab(
                                            value
                                        )
                                    }
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        "& .MuiTab-root":
                                        {
                                            minHeight:
                                                52,
                                            textTransform:
                                                "none",
                                            fontWeight:
                                                700,
                                        },
                                    }}
                                >
                                    {isManager && (
                                        <Tab
                                            value="mine"
                                            icon={
                                                <PersonRoundedIcon />
                                            }
                                            iconPosition="start"
                                            label="Kendi İzinlerim"
                                        />
                                    )}

                                    {isManager && (
                                        <Tab
                                            value="group"
                                            icon={
                                                <GroupsRoundedIcon />
                                            }
                                            iconPosition="start"
                                            label="Grup İzinleri"
                                        />
                                    )}

                                    {isAdmin && (
                                        <Tab
                                            value="all"
                                            icon={
                                                <CalendarMonthRoundedIcon />
                                            }
                                            iconPosition="start"
                                            label="Tüm İzinler"
                                        />
                                    )}
                                </Tabs>
                            </Box>

                            <Divider />
                        </>
                    )}

                <Box
                    sx={{
                        px: {
                            xs: 2,
                            sm: 2.5,
                        },
                        py: 2.25,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                750,
                        }}
                    >
                        {activeTab ===
                            "group"
                            ? "Grup İzin Talepleri"
                            : activeTab ===
                                "all"
                                ? "Tüm İzin Talepleri"
                                : "İzin Taleplerim"}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.35,
                        }}
                    >
                        En yeni izin talepleri ilk sırada gösterilir.
                    </Typography>
                </Box>

                {(isAdmin || isManager) && (
                    <Box sx={{
                        mx: { xs: 2, sm: 2.5 }, mb: 2.5, p: 2, borderRadius: 3,
                        border: "1px solid", borderColor: "divider", bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                            minHeight: 48, borderRadius: 2.5, bgcolor: "action.hover",
                            transition: "background-color 150ms, box-shadow 150ms",
                            "& fieldset": { borderColor: "divider" },
                            "&.Mui-focused": { bgcolor: "background.paper", boxShadow: "0 0 0 3px rgba(55,125,240,0.10)" },
                        },
                    }}>
                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>İzinleri Filtrele</Typography>
                            {(groupFilter !== "all" || statusFilter !== "all" || leaveTypeFilter !== "all" || onlyCurrentlyOnLeave) && (
                                <Button size="small" onClick={() => {
                                    setGroupFilter("all");
                                    setStatusFilter("all");
                                    setLeaveTypeFilter("all");
                                    setOnlyCurrentlyOnLeave(false);
                                }}>Temizle</Button>
                            )}
                        </Stack>
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" } }}>
                            <TextField select size="small" label="Grup" value={groupFilter}
                                onChange={event => setGroupFilter(event.target.value)}
                                slotProps={{
                                    input: { startAdornment: <InputAdornment position="start"><GroupsRoundedIcon fontSize="small" /></InputAdornment> },
                                    select: { MenuProps: leaveFilterMenuProps },
                                }}>
                                <MenuItem value="all">Tüm Gruplar</MenuItem>
                                {groupNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                            </TextField>
                            <TextField select size="small" label="Durum" value={statusFilter}
                                onChange={event => setStatusFilter(event.target.value)}
                                slotProps={{
                                    input: { startAdornment: <InputAdornment position="start"><CheckCircleRoundedIcon fontSize="small" /></InputAdornment> },
                                    select: { MenuProps: leaveFilterMenuProps },
                                }}>
                                <MenuItem value="all">Tüm Durumlar</MenuItem>
                                <MenuItem value="1">Bekliyor</MenuItem>
                                <MenuItem value="2">Onaylandı</MenuItem>
                                <MenuItem value="3">Reddedildi</MenuItem>
                                <MenuItem value="4">İptal Edildi</MenuItem>
                            </TextField>
                            <TextField select size="small" label="İzin Türü" value={leaveTypeFilter}
                                onChange={event => setLeaveTypeFilter(event.target.value)}
                                slotProps={{
                                    input: { startAdornment: <InputAdornment position="start"><CalendarMonthRoundedIcon fontSize="small" /></InputAdornment> },
                                    select: { MenuProps: leaveFilterMenuProps },
                                }}>
                                <MenuItem value="all">Tüm İzin Türleri</MenuItem>
                                {LEAVE_TYPES.map(item => <MenuItem key={item.value} value={String(item.value)}>{item.label}</MenuItem>)}
                            </TextField>
                            <Button variant={onlyCurrentlyOnLeave ? "contained" : "outlined"}
                                startIcon={<EventAvailableRoundedIcon />}
                                aria-pressed={onlyCurrentlyOnLeave}
                                onClick={() => setOnlyCurrentlyOnLeave(current => !current)}
                                sx={{ minHeight: 48, borderRadius: 2.5, textTransform: "none", fontWeight: 700, boxShadow: "none" }}>
                                Şu An İzinde
                            </Button>
                        </Box>
                        {(groupFilter !== "all" || statusFilter !== "all" || leaveTypeFilter !== "all" || onlyCurrentlyOnLeave) && (
                            <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                                {groupFilter !== "all" && <Chip size="small" label={groupFilter} onDelete={() => setGroupFilter("all")} />}
                                {statusFilter !== "all" && <Chip size="small" label={getStatusText(Number(statusFilter))} onDelete={() => setStatusFilter("all")} />}
                                {leaveTypeFilter !== "all" && <Chip size="small" label={getLeaveTypeText(Number(leaveTypeFilter))} onDelete={() => setLeaveTypeFilter("all")} />}
                                {onlyCurrentlyOnLeave && <Chip size="small" color="primary" variant="outlined" label="Şu An İzinde" onDelete={() => setOnlyCurrentlyOnLeave(false)} />}
                            </Stack>
                        )}
                    </Box>
                )}

                <Divider />

                {isLoading ? (
                    <Box
                        sx={{
                            minHeight:
                                300,
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >
                        <CircularProgress
                            size={
                                30
                            }
                        />
                    </Box>
                ) : displayedLeaves.length ===
                    0 ? (
                    <Box
                        sx={{
                            py: 7,
                            px: 2,
                            textAlign:
                                "center",
                        }}
                    >
                        <EventAvailableRoundedIcon
                            sx={{
                                fontSize:
                                    46,
                                color:
                                    "text.disabled",
                                mb: 1,
                            }}
                        />

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            İzin kaydı bulunamadı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Bu bölümde henüz görüntülenecek bir izin talebi bulunmuyor.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {displayedLeaves.map(
                            (
                                leave,
                                index
                            ) => (
                                <Box
                                    key={
                                        leave.id
                                    }
                                >
                                    {index >
                                        0 && (
                                            <Divider />
                                        )}

                                    <Box
                                        sx={{
                                            px: {
                                                xs:
                                                    2,
                                                md:
                                                    2.5,
                                            },
                                            py: 2.25,
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                            {
                                                xs:
                                                    "1fr",
                                                lg:
                                                    "minmax(180px, 0.8fr) minmax(180px, 0.8fr) minmax(170px, 0.7fr) minmax(260px, 1.4fr) auto",
                                            },
                                            alignItems:
                                                "center",
                                            gap: {
                                                xs:
                                                    1.25,
                                                lg:
                                                    2,
                                            },
                                            transition:
                                                "background-color 0.16s ease",
                                            "&:hover":
                                            {
                                                backgroundColor:
                                                    "action.hover",
                                            },
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Kullanıcı
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.25,
                                                    fontWeight:
                                                        750,
                                                }}
                                            >
                                                {leave.userFullName}
                                            </Typography>

                                            {leave.groupName && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display:
                                                            "block",
                                                        mt: 0.15,
                                                    }}
                                                >
                                                    {leave.groupName}
                                                </Typography>
                                            )}

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                            >
                                                Talep #{leave.id}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                İzin Türü
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.25,
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                {getLeaveTypeText(
                                                    leave.leaveType
                                                )}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Tarih Aralığı
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.25,
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                {formatDate(
                                                    leave.startDate
                                                )}
                                                {" – "}
                                                {formatDate(
                                                    leave.endDate
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                            >
                                                {calculateDayCount(
                                                    leave.startDate,
                                                    leave.endDate
                                                )}{" "}
                                                gün
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 1,
                                                    flexWrap:
                                                        "wrap",
                                                }}
                                            >
                                                <Chip
                                                    label={
                                                        getStatusText(
                                                            leave.status
                                                        )
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight:
                                                            700,
                                                        ...getStatusChipSx(
                                                            leave.status
                                                        ),
                                                    }}
                                                />

                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                >
                                                    {formatDate(
                                                        leave.createdAt
                                                    )}
                                                </Typography>
                                            </Box>

                                            {leave.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mt: 0.75,
                                                        lineHeight:
                                                            1.5,
                                                    }}
                                                >
                                                    {leave.description}
                                                </Typography>
                                            )}

                                            {leave.cancellationDescription && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{leave.cancellationDescription}</Typography>}
                                            {leave.rejectionReason && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display:
                                                            "block",
                                                        mt: 0.7,
                                                        color:
                                                            "error.main",
                                                        fontWeight:
                                                            650,
                                                    }}
                                                >
                                                    Red nedeni:{" "}
                                                    {leave.rejectionReason}
                                                </Typography>
                                            )}

                                            {leave.reviewedByUserFullName && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{
                                                        display:
                                                            "block",
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    Değerlendiren:{" "}
                                                    {leave.reviewedByUserFullName}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box
                                            sx={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                {
                                                    xs:
                                                        "flex-start",
                                                    lg:
                                                        "flex-end",
                                                },
                                                gap: 1,
                                                flexWrap:
                                                    "wrap",
                                            }}
                                        >
                                            {(
                                                (isAdmin && (leave.status === 1 || leave.status === 2)) ||
                                                (activeTab === "mine" && leave.status === 1) ||
                                                (activeTab === "group" && isManager &&
                                                    (leave.status === 1 || leave.status === 2))
                                            ) && (
                                                    <Button
                                                        size="small"
                                                        color="inherit"
                                                        variant="outlined"
                                                        onClick={() => {
                                                            setCancelError("");
                                                            setCancelReason("");
                                                            setLeaveToCancel(leave);
                                                        }}
                                                        sx={{
                                                            textTransform:
                                                                "none",
                                                            borderRadius:
                                                                2,
                                                            fontWeight:
                                                                700,
                                                        }}
                                                    >
                                                        İptal Et
                                                    </Button>
                                                )}

                                            {leave.status ===
                                                1 &&
                                                (
                                                    isAdmin ||
                                                    (
                                                        isManager &&
                                                        activeTab ===
                                                        "group"
                                                    )
                                                ) && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() =>
                                                            openReviewDialog(
                                                                leave
                                                            )
                                                        }
                                                        sx={{
                                                            textTransform:
                                                                "none",
                                                            borderRadius:
                                                                2,
                                                            fontWeight:
                                                                700,
                                                            backgroundColor:
                                                                "#163A63",
                                                            "&:hover":
                                                            {
                                                                backgroundColor:
                                                                    "#102E50",
                                                            },
                                                        }}
                                                    >
                                                        Değerlendir
                                                    </Button>
                                                )}
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        )}
                    </Box>
                )}
            </Paper>

            <Dialog
                open={Boolean(leaveToCancel)}
                onClose={() => {
                    if (!isCancelling) setLeaveToCancel(null);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>İzni iptal et</DialogTitle>
                <DialogContent>
                    {cancelError && <Alert severity="error" sx={{ mb: 2 }}>{cancelError}</Alert>}
                    <TextField fullWidth required multiline minRows={2} label="İptal gerekçesi" value={cancelReason}
                        onChange={event => setCancelReason(event.target.value)} disabled={isCancelling}
                        slotProps={{ htmlInput: { maxLength: 500 } }} helperText={`${cancelReason.length}/500`} sx={{ mt: 1, mb: 2 }} />
                    <Typography>
                        {leaveToCancel?.userFullName} için {leaveToCancel ? formatDate(leaveToCancel.startDate) : ""}
                        {" – "}
                        {leaveToCancel ? formatDate(leaveToCancel.endDate) : ""} tarihli izni iptal etmek istiyor musunuz?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Kayıt silinmez, “İptal Edildi” olarak saklanır. Aktif bir izin iptal edilirse
                        çalışan artık bu izin nedeniyle izinli sayılmaz. Daha önce devredilen görevler otomatik geri atanmaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button disabled={isCancelling} onClick={() => setLeaveToCancel(null)}>Vazgeç</Button>
                    <Button color="error" variant="contained" disabled={isCancelling} onClick={() => void handleCancel()}>
                        {isCancelling ? "İptal ediliyor…" : "İzni İptal Et"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={
                    createDialogOpen
                }
                onClose={() => {
                    if (
                        !isSubmitting
                    ) {
                        setCreateDialogOpen(
                            false
                        );

                        resetCreateForm();
                    }
                }}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius:
                                3,
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                800,
                        }}
                    >
                        Yeni İzin Talebi
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.4,
                        }}
                    >
                        İzin türünü ve tarih aralığını seçerek talebinizi oluşturun.
                    </Typography>
                </DialogTitle>

                <DialogContent
                    dividers
                >
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
                            },
                            gap: 2,
                            pt: 0.5,
                        }}
                    >
                        <TextField
                            select
                            label="İzin Türü"
                            value={
                                leaveType
                            }
                            onChange={(
                                event
                            ) =>
                                setLeaveType(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                            fullWidth
                            sx={{
                                gridColumn:
                                {
                                    xs:
                                        "auto",
                                    sm:
                                        "1 / -1",
                                },
                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.5,
                                },
                            }}
                        >
                            {LEAVE_TYPES.map(
                                (
                                    item
                                ) => (
                                    <MenuItem
                                        key={
                                            item.value
                                        }
                                        value={
                                            item.value
                                        }
                                    >
                                        {item.label}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <TextField
                            type="date"
                            label="Başlangıç Tarihi"
                            value={
                                startDate
                            }
                            onChange={(
                                event
                            ) =>
                                setStartDate(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                inputLabel:
                                {
                                    shrink:
                                        true,
                                },
                            }}
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.5,
                                },
                            }}
                        />

                        <TextField
                            type="date"
                            label="Bitiş Tarihi"
                            value={
                                endDate
                            }
                            onChange={(
                                event
                            ) =>
                                setEndDate(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                inputLabel:
                                {
                                    shrink:
                                        true,
                                },
                            }}
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.5,
                                },
                            }}
                        />

                        <TextField
                            label="Açıklama"
                            placeholder="İzin talebinizle ilgili kısa bir açıklama ekleyebilirsiniz."
                            value={
                                description
                            }
                            onChange={(
                                event
                            ) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            multiline
                            minRows={4}
                            fullWidth
                            sx={{
                                gridColumn:
                                    "1 / -1",
                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.5,
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={() => {
                            setCreateDialogOpen(
                                false
                            );

                            resetCreateForm();
                        }}
                        disabled={
                            isSubmitting
                        }
                        sx={{
                            textTransform:
                                "none",
                            fontWeight:
                                700,
                        }}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            void handleCreateLeave()
                        }
                        disabled={
                            isSubmitting
                        }
                        sx={{
                            px: 2.5,
                            borderRadius:
                                2.25,
                            textTransform:
                                "none",
                            fontWeight:
                                700,
                            backgroundColor:
                                "#163A63",
                            "&:hover":
                            {
                                backgroundColor:
                                    "#102E50",
                            },
                        }}
                    >
                        {isSubmitting
                            ? "Oluşturuluyor..."
                            : "Talep Oluştur"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={
                    reviewDialogOpen
                }
                onClose={() => {
                    if (
                        !isSubmitting
                    ) {
                        setReviewDialogOpen(
                            false
                        );

                        setSelectedLeave(
                            null
                        );
                    }
                }}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius:
                                3,
                        },
                    },
                }}
            >
                <DialogTitle>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                800,
                        }}
                    >
                        İzin Talebini Değerlendir
                    </Typography>
                </DialogTitle>

                <DialogContent
                    dividers
                >
                    {selectedLeave && (
                        <>
                            <Paper
                                elevation={
                                    0
                                }
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    border:
                                        "1px solid",
                                    borderColor:
                                        "divider",
                                    borderRadius:
                                        2.5,
                                    backgroundColor:
                                        "action.hover",
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight:
                                            800,
                                    }}
                                >
                                    {selectedLeave.userFullName}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.5,
                                    }}
                                >
                                    {getLeaveTypeText(
                                        selectedLeave.leaveType
                                    )}
                                    {" • "}
                                    {formatDate(
                                        selectedLeave.startDate
                                    )}
                                    {" – "}
                                    {formatDate(
                                        selectedLeave.endDate
                                    )}
                                    {" • "}
                                    {calculateDayCount(
                                        selectedLeave.startDate,
                                        selectedLeave.endDate
                                    )}{" "}
                                    gün
                                </Typography>

                                {selectedLeave.description && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1.2,
                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        {selectedLeave.description}
                                    </Typography>
                                )}
                            </Paper>

                            {selectedLeaveOpenTasks.length >
                                0 && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.8,
                                            mb: 2,
                                            border:
                                                "1px solid",
                                            borderColor:
                                                "#E9D7AF",
                                            borderRadius:
                                                2.5,
                                            backgroundColor:
                                                "#FFFBF3",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "flex-start",
                                                gap: 1.2,
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
                                                    color:
                                                        "#9A6700",
                                                    backgroundColor:
                                                        "#FFF3CD",
                                                    flexShrink:
                                                        0,
                                                }}
                                            >
                                                <WarningAmberRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            20,
                                                    }}
                                                />
                                            </Box>

                                            <Box
                                                sx={{
                                                    minWidth:
                                                        0,
                                                    flex: 1,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight:
                                                            850,
                                                        color:
                                                            "#7A5200",
                                                    }}
                                                >
                                                    Açık görev kontrolü gerekli
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        mt: 0.35,
                                                        lineHeight:
                                                            1.55,
                                                        color:
                                                            "text.secondary",
                                                    }}
                                                >
                                                    Bu çalışanın üzerinde {selectedLeaveOpenTasks.length} aktif görev bulunuyor. İzin onaylandıktan sonra görevlerin yeniden planlanması önerilir.
                                                </Typography>

                                                <Stack
                                                    spacing={0.65}
                                                    sx={{
                                                        mt: 1.15,
                                                    }}
                                                >
                                                    {selectedLeaveOpenTasks
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                task
                                                            ) => (
                                                                <Box
                                                                    key={
                                                                        task.id
                                                                    }
                                                                    sx={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "space-between",
                                                                        gap: 1,
                                                                        px: 1,
                                                                        py: 0.7,
                                                                        borderRadius:
                                                                            1.7,
                                                                        backgroundColor:
                                                                            "rgba(255,255,255,0.72)",
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight:
                                                                                750,
                                                                            overflow:
                                                                                "hidden",
                                                                            textOverflow:
                                                                                "ellipsis",
                                                                            whiteSpace:
                                                                                "nowrap",
                                                                        }}
                                                                    >
                                                                        #{task.id} {task.title}
                                                                    </Typography>

                                                                    <Chip
                                                                        size="small"
                                                                        label={
                                                                            getTaskStatusText(
                                                                                task.status
                                                                            )
                                                                        }
                                                                        variant="outlined"
                                                                        sx={{
                                                                            height:
                                                                                22,
                                                                            fontSize:
                                                                                10,
                                                                            fontWeight:
                                                                                700,
                                                                            flexShrink:
                                                                                0,
                                                                        }}
                                                                    />
                                                                </Box>
                                                            )
                                                        )}

                                                    {selectedLeaveOpenTasks.length >
                                                        3 && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontWeight:
                                                                        650,
                                                                }}
                                                            >
                                                                +{selectedLeaveOpenTasks.length - 3} görev daha
                                                            </Typography>
                                                        )}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </Paper>
                                )}

                            <TextField
                                label="Red Nedeni"
                                placeholder="Talebi reddedecekseniz nedeni zorunlu olarak giriniz."
                                value={
                                    rejectionReason
                                }
                                onChange={(
                                    event
                                ) =>
                                    setRejectionReason(
                                        event.target.value
                                    )
                                }
                                multiline
                                minRows={3}
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.5,
                                    },
                                }}
                            />
                        </>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                        {
                            xs:
                                "stretch",
                            sm:
                                "center",
                        },
                        flexDirection:
                        {
                            xs:
                                "column",
                            sm:
                                "row",
                        },
                        gap: 1,
                    }}
                >
                    <Button
                        startIcon={
                            <CloseRoundedIcon />
                        }
                        color="error"
                        variant="outlined"
                        onClick={() =>
                            void handleReview(
                                false
                            )
                        }
                        disabled={
                            isSubmitting
                        }
                        sx={{
                            textTransform:
                                "none",
                            borderRadius:
                                2.25,
                            fontWeight:
                                700,
                        }}
                    >
                        Reddet
                    </Button>

                    <Stack
                        direction={{
                            xs:
                                "column",
                            sm:
                                "row",
                        }}
                        spacing={1}
                        sx={{
                            width: {
                                xs:
                                    "100%",
                                sm:
                                    "auto",
                            },
                        }}
                    >
                        <Button
                            startIcon={
                                <CheckCircleRoundedIcon />
                            }
                            color="success"
                            variant={
                                selectedLeaveOpenTasks.length >
                                    0
                                    ? "outlined"
                                    : "contained"
                            }
                            onClick={() =>
                                void handleReview(
                                    true
                                )
                            }
                            disabled={
                                isSubmitting
                            }
                            sx={{
                                textTransform:
                                    "none",
                                borderRadius:
                                    2.25,
                                fontWeight:
                                    700,
                            }}
                        >
                            Onayla
                        </Button>

                        {selectedLeaveOpenTasks.length >
                            0 && (
                                <Button
                                    startIcon={
                                        <AssignmentRoundedIcon />
                                    }
                                    variant="contained"
                                    onClick={() =>
                                        void handleReview(
                                            true,
                                            true
                                        )
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                    sx={{
                                        textTransform:
                                            "none",
                                        borderRadius:
                                            2.25,
                                        fontWeight:
                                            750,
                                        backgroundColor:
                                            "#163A63",
                                        "&:hover":
                                        {
                                            backgroundColor:
                                                "#102E50",
                                        },
                                    }}
                                >
                                    Onayla ve Görevleri Gör
                                </Button>
                            )}
                    </Stack>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default LeaveManagementPage;
