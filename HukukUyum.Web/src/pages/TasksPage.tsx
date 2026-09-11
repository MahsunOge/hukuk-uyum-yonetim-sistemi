import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import api from "../api/axios";
import { isAwaitingAssignment } from "../utils/taskAssignment";
import EmptyState from "../components/common/EmptyState";
import PageLoading from "../components/common/PageLoading";

import {
    hasAnyRole,
} from "../utils/auth";

import type { Group } from "../types/Group";
import type { Task } from "../types/Task";
import type { User } from "../types/User";

function TasksPage() {
    const navigate =
        useNavigate();

    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const [
        searchParams,
        setSearchParams,
    ] =
        useSearchParams();

    const specialFilter =
        searchParams.get(
            "filter"
        ) ?? "";

    const [
        tasks,
        setTasks,
    ] =
        useState<Task[]>(
            []
        );

    const [
        users,
        setUsers,
    ] =
        useState<User[]>(
            []
        );

    const [
        groups,
        setGroups,
    ] =
        useState<Group[]>(
            []
        );

    const searchText = searchParams.get("q") ?? "";
    const statusFilter = Number(searchParams.get("status") ?? 0);
    const priorityFilter = Number(searchParams.get("priority") ?? 0);
    const assignedUserFilter = searchParams.get("assignedUserId") ?? "";
    const groupFilter = searchParams.get("groupId") ?? "";
    const memberName = users.find(user => user.id === assignedUserFilter)?.fullName
        || searchParams.get("memberName") || "Seçilen üye";

    const updateFilter = (key: string, value: string) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (value) {
                next.set(key, value);
            } else {
                next.delete(key);
            }
            return next;
        }, { replace: true });
    };

    const setSearchText = (value: string) => updateFilter("q", value);
    const setStatusFilter = (value: number) =>
        updateFilter("status", value === 0 ? "" : String(value));
    const setPriorityFilter = (value: number) =>
        updateFilter("priority", value === 0 ? "" : String(value));

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

    const hasDelegatedManagerAccess =
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true";

    const canManageTasks =
        hasAnyRole([
            "Admin",
            "Manager",
        ]) ||
        hasDelegatedManagerAccess;

    const isEmployee =
        hasAnyRole([
            "Employee",
        ]) &&
        !hasDelegatedManagerAccess;

    useEffect(() => {
        const loadData =
            async () => {
                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    const tasksRequest =
                        api.get<Task[]>(
                            "/Tasks"
                        );

                    const groupsRequest =
                        api.get<Group[]>(
                            "/Groups"
                        );

                    const usersRequest =
                        canManageTasks
                            ? api.get<
                                User[]
                            >(
                                "/Users"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as User[],
                                }
                            );

                    const [
                        tasksResponse,
                        usersResponse,
                        groupsResponse,
                    ] =
                        await Promise.all(
                            [
                                tasksRequest,
                                usersRequest,
                                groupsRequest,
                            ]
                        );

                    setTasks(
                        tasksResponse.data
                    );

                    setUsers(
                        usersResponse.data
                    );

                    setGroups(
                        groupsResponse.data
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "Görev listesi alınamadı:",
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
                            "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                        );
                    } else if (
                        status ===
                        403
                    ) {
                        setErrorMessage(
                            "Bu bilgilere erişim yetkiniz bulunmuyor."
                        );
                    } else {
                        setErrorMessage(
                            "Görev listesi backend üzerinden alınamadı."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadData();
    }, [
        canManageTasks,
    ]);

    const getPriorityText =
        (
            priority:
                number
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

    const getPriorityStyle =
        (
            priority:
                number
        ) => {
            switch (
            priority
            ) {
                case 1:
                    return {
                        color:
                            isDark
                                ? "#9FC3AB"
                                : "#4F765E",

                        borderColor:
                            isDark
                                ? "rgba(159,195,171,0.20)"
                                : "#D2E1D7",

                        backgroundColor:
                            isDark
                                ? "rgba(79,118,94,0.09)"
                                : "#F1F6F3",
                    };

                case 2:
                    return {
                        color:
                            isDark
                                ? "#CBD5E1"
                                : "#64748B",

                        borderColor:
                            isDark
                                ? "rgba(203,213,225,0.16)"
                                : "#D7DEE6",

                        backgroundColor:
                            isDark
                                ? "rgba(148,163,184,0.06)"
                                : "#F7F9FB",
                    };

                case 3:
                    return {
                        color:
                            isDark
                                ? "#E3BD79"
                                : "#976720",

                        borderColor:
                            isDark
                                ? "rgba(227,189,121,0.20)"
                                : "#E9D7AF",

                        backgroundColor:
                            isDark
                                ? "rgba(185,133,58,0.09)"
                                : "#FBF6EC",
                    };

                case 4:
                    return {
                        color:
                            isDark
                                ? "#D9A1A1"
                                : "#964D4D",

                        borderColor:
                            isDark
                                ? "rgba(217,161,161,0.20)"
                                : "#E9CCCC",

                        backgroundColor:
                            isDark
                                ? "rgba(168,90,90,0.09)"
                                : "#FAF1F1",
                    };

                default:
                    return {};
            }
        };

    const getStatusText =
        (
            status:
                number
        ) => {
            switch (
            status
            ) {
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

    const getStatusStyle =
        (
            status:
                number
        ) => {
            switch (
            status
            ) {
                case 1:
                    return {
                        color:
                            isDark
                                ? "#9BBAD4"
                                : "#315F8C",

                        borderColor:
                            isDark
                                ? "rgba(155,186,212,0.18)"
                                : "#C9D9E5",

                        backgroundColor:
                            isDark
                                ? "rgba(49,95,140,0.10)"
                                : "#EFF4F8",
                    };

                case 2:
                    return {
                        color:
                            isDark
                                ? "#E4BE7A"
                                : "#986820",

                        borderColor:
                            isDark
                                ? "rgba(228,190,122,0.18)"
                                : "#E9D7AF",

                        backgroundColor:
                            isDark
                                ? "rgba(185,133,58,0.08)"
                                : "#FBF6EC",
                    };

                case 3:
                    return {
                        color:
                            isDark
                                ? "#CBD5E1"
                                : "#64748B",

                        borderColor:
                            "divider",

                        backgroundColor:
                            isDark
                                ? "rgba(148,163,184,0.06)"
                                : "#F7F9FB",
                    };

                case 4:
                    return {
                        color:
                            isDark
                                ? "#9FC6AD"
                                : "#4F765E",

                        borderColor:
                            isDark
                                ? "rgba(159,198,173,0.18)"
                                : "#CEE0D4",

                        backgroundColor:
                            isDark
                                ? "rgba(79,118,94,0.08)"
                                : "#F0F6F2",
                    };

                case 5:
                    return {
                        color:
                            isDark
                                ? "#D8A0A0"
                                : "#965151",

                        borderColor:
                            isDark
                                ? "rgba(216,160,160,0.18)"
                                : "#E8CCCC",

                        backgroundColor:
                            isDark
                                ? "rgba(168,90,90,0.07)"
                                : "#FAF1F1",
                    };

                default:
                    return {};
            }
        };

    const formatDate =
        (
            date:
                string | null
        ) => {
            if (
                !date
            ) {
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

            return parsedDate.toLocaleDateString(
                "tr-TR",
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric",
                }
            );
        };

    const getAssignmentName =
        (
            assignedUserId:
                string | null,
            assignedGroupId:
                number | null
        ) => {
            if (
                assignedUserId
            ) {
                if (
                    isEmployee
                ) {
                    return "Bana atandı";
                }

                const user =
                    users.find(
                        (
                            item
                        ) =>
                            item.id ===
                            assignedUserId
                    );

                return user
                    ? user.fullName
                    : "Kullanıcı bulunamadı";
            }

            if (
                assignedGroupId
            ) {
                const group =
                    groups.find(
                        (
                            item
                        ) =>
                            item.id ===
                            assignedGroupId
                    );

                return group
                    ? group.name
                    : "Grubuma atandı";
            }

            return "Atanmamış";
        };

    const filteredTasks =
        useMemo(() => {
            const normalizedSearch =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            return [
                ...tasks,
            ]
                .filter(
                    (
                        task
                    ) => {
                        const matchesSearch =
                            !normalizedSearch ||
                            task.title
                                .toLocaleLowerCase(
                                    "tr-TR"
                                )
                                .includes(
                                    normalizedSearch
                                ) ||
                            task.description
                                ?.toLocaleLowerCase(
                                    "tr-TR"
                                )
                                .includes(
                                    normalizedSearch
                                );

                        const matchesStatus =
                            statusFilter ===
                            0 ||
                            task.status ===
                            statusFilter;

                        const matchesPriority =
                            priorityFilter ===
                            0 ||
                            task.priority ===
                            priorityFilter;

                        const matchesSpecialFilter =
                            (() => {
                                if (specialFilter === "active") return [1, 2, 3].includes(task.status);
                                if (specialFilter === "unassigned") return isAwaitingAssignment(task);
                                if (
                                    specialFilter ===
                                    "overdue"
                                ) {
                                    return task.isOverdue && [1, 2, 3].includes(task.status);
                                }

                                if (
                                    specialFilter !==
                                    "upcoming"
                                ) {
                                    return true;
                                }

                                if (
                                    !task.dueDate ||
                                    task.status ===
                                    4 ||
                                    task.status ===
                                    5
                                ) {
                                    return false;
                                }

                                const now =
                                    new Date();

                                const sevenDaysLater =
                                    new Date();

                                sevenDaysLater.setDate(
                                    sevenDaysLater.getDate() +
                                    7
                                );

                                const dueDate =
                                    new Date(
                                        task.dueDate
                                    );

                                return (
                                    dueDate >=
                                    now &&
                                    dueDate <=
                                    sevenDaysLater
                                );
                            })();

                        return (
                            (!assignedUserFilter || task.assignedUserId === assignedUserFilter) &&
                            (!groupFilter || String(task.assignedGroupId) === groupFilter) &&
                            matchesSearch &&
                            matchesStatus &&
                            matchesPriority &&
                            matchesSpecialFilter
                        );
                    }
                )
                .sort(
                    (
                        first,
                        second
                    ) => {
                        const firstCreatedAt = Date.parse(first.createdAt) || 0;
                        const secondCreatedAt = Date.parse(second.createdAt) || 0;
                        return secondCreatedAt - firstCreatedAt || second.id - first.id;
                    }
                );
        }, [
            tasks,
            searchText,
            statusFilter,
            priorityFilter,
            specialFilter,
            assignedUserFilter,
            groupFilter,
        ]);

    const assigneeOptions = useMemo(() => {
        const assignedIds = new Set(tasks
            .filter(task => !groupFilter || String(task.assignedGroupId) === groupFilter)
            .map(task => task.assignedUserId)
            .filter((id): id is string => Boolean(id)));
        if (assignedUserFilter) assignedIds.add(assignedUserFilter);
        return [...assignedIds].map(id => ({
            id,
            name: users.find(user => user.id === id)?.fullName ||
                (id === assignedUserFilter ? memberName : "Kullanıcı (" + id.slice(0, 8) + ")"),
        })).sort((a, b) => a.name.localeCompare(b.name, "tr"));
    }, [tasks, users, groupFilter, assignedUserFilter, memberName]);

    const filterMenuProps = {
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

    const clearFilters =
        () => {
            setSearchParams({}, { replace: true });
        };

    const hasActiveFilter =
        searchText.trim() !==
        "" ||
        statusFilter !== 0 ||
        priorityFilter !==
        0 ||
        specialFilter !== "" ||
        assignedUserFilter !== "" ||
        groupFilter !== "";

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

                pb: 3,

                minHeight: {
                    xs: "auto",
                    lg: "calc(100vh - 110px)",
                },

                color:
                    "text.primary",
            }}
        >
            {/* HEADER */}

            {(assignedUserFilter || groupFilter) && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 3 }}
                    action={hasAnyRole(["Admin"])
                        ? <Button color="inherit" onClick={() => navigate(groupFilter ? "/reports?tab=groups&groupId=" + groupFilter : "/reports")}>Raporlara Dön</Button>
                        : <Button color="inherit" onClick={() => navigate("/members")}>Üyelere Dön</Button>}>
                    {assignedUserFilter && <><strong>{memberName}</strong> için </>}
                    {groupFilter && <strong>{groups.find(group => String(group.id) === groupFilter)?.name || "Seçilen grup"} grubundaki </strong>}
                    görevler gösteriliyor.
                    {" "}Durum filtresiyle yalnızca istediğiniz görevleri listeleyebilirsiniz.
                </Alert>
            )}

            <Box
                sx={{
                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    alignItems: {
                        xs: "stretch",
                        sm: "center",
                    },

                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },

                    gap: 2,

                    mb: 2.6,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize: {
                                xs: 26,
                                sm: 30,
                            },

                            fontWeight:
                                800,

                            lineHeight:
                                1.2,

                            letterSpacing:
                                "-0.03em",
                        }}
                    >
                        {isEmployee
                            ? "Görevlerim"
                            : hasAnyRole(["Admin"])
                                ? "Tüm Görevler"
                                : "Ekibimin Görevleri"}
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mt: 0.7,

                            maxWidth:
                                720,

                            lineHeight:
                                1.6,
                        }}
                    >
                        {isEmployee
                            ? "Size veya üyesi olduğunuz gruplara atanan görevleri görüntüleyin ve güncel durumlarını takip edin."
                            : "Görevleri görüntüleyin, filtreleyin ve çalışma durumlarını yönetin."}
                    </Typography>
                </Box>

                {canManageTasks && (
                    <Button
                        variant="contained"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/tasks/create"
                            )
                        }
                        sx={{
                            minHeight:
                                44,

                            px: 2.5,

                            borderRadius:
                                2.25,

                            textTransform:
                                "none",

                            fontWeight:
                                700,

                            backgroundColor:
                                "#163A63",

                            boxShadow:
                                "0 6px 16px rgba(22,58,99,0.15)",

                            "&:hover":
                            {
                                backgroundColor:
                                    "#102F51",

                                boxShadow:
                                    "0 7px 18px rgba(22,58,99,0.20)",
                            },
                        }}
                    >
                        Yeni Görev
                    </Button>
                )}
            </Box>

            {specialFilter ===
                "upcoming" && (
                    <Alert
                        severity="info"
                        sx={{
                            mb: 2.25,
                            borderRadius:
                                2.5,
                        }}
                    >
                        Bitiş tarihi önümüzdeki 7 gün içinde olan görevler
                        gösteriliyor.
                    </Alert>
                )}

            {specialFilter ===
                "overdue" && (
                    <Alert
                        severity="warning"
                        icon={
                            <WarningAmberRoundedIcon />
                        }
                        sx={{
                            mb: 2.25,
                            borderRadius:
                                2.5,
                        }}
                    >
                        Bitiş tarihi geçmiş görevler gösteriliyor.
                    </Alert>
                )}

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2.25,
                        borderRadius:
                            2.5,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* FILTER */}
            <Paper elevation={0} sx={{
                mb: 2.5, p: { xs: 2, md: 2.5 }, border: "1px solid",
                borderColor: "divider", borderRadius: 3,
                backgroundColor: "background.paper",
                "& .MuiOutlinedInput-root": {
                    minHeight: 48, borderRadius: 2.5,
                    bgcolor: isDark ? "rgba(255,255,255,0.035)" : "#F7F9FC",
                    transition: "background-color 150ms, box-shadow 150ms",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover": { bgcolor: "action.hover" },
                    "&.Mui-focused": { bgcolor: "background.paper", boxShadow: "0 0 0 3px rgba(55,125,240,0.10)" },
                },
            }}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2.5 }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                        <Avatar variant="rounded" sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "action.hover", color: "primary.main" }}>
                            <FilterAltRoundedIcon fontSize="small" />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>Filtrele ve Ara</Typography>
                            <Typography variant="caption" color="text.secondary">Aradığınız göreve hızlıca ulaşın</Typography>
                        </Box>
                    </Stack>
                    {hasActiveFilter && (
                        <Button size="small" startIcon={<RestartAltRoundedIcon />} onClick={clearFilters}
                            sx={{ borderRadius: 2, textTransform: "none", flexShrink: 0 }}>
                            Temizle
                        </Button>
                    )}
                </Stack>
                <Box sx={{
                    display: "grid", gap: 2,
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        sm: canManageTasks ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
                        xl: canManageTasks ? "minmax(0, 1.6fr) repeat(3, minmax(0, 1fr))" : "minmax(0, 1.6fr) repeat(2, minmax(0, 1fr))",
                    },
                }}>
                    <TextField fullWidth size="small" placeholder="Görev başlığı veya açıklama ara..."
                        value={searchText} onChange={event => setSearchText(event.target.value)}
                        slotProps={{
                            htmlInput: { "aria-label": "Görev ara" },
                            input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
                        }}
                        sx={{ minWidth: 0, gridColumn: { sm: "1 / -1", xl: "auto" } }} />
                    {canManageTasks && (
                        <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                            <InputLabel shrink id="assignee-filter-label">Atanan Kullanıcı</InputLabel>
                            <Select labelId="assignee-filter-label" label="Atanan Kullanıcı"
                                displayEmpty value={assignedUserFilter}
                                startAdornment={<InputAdornment position="start"><PersonRoundedIcon fontSize="small" /></InputAdornment>}
                                renderValue={value => assigneeOptions.find(user => user.id === value)?.name || "Tüm Kullanıcılar"}
                                MenuProps={filterMenuProps}
                                onChange={event => {
                                    const value = event.target.value;
                                    setSearchParams(current => {
                                        const next = new URLSearchParams(current);
                                        next.delete("memberName");
                                        if (value) next.set("assignedUserId", value);
                                        else next.delete("assignedUserId");
                                        return next;
                                    }, { replace: true });
                                }}>
                                <MenuItem value="" sx={{ gap: 1.25 }}>
                                    <Avatar sx={{ width: 28, height: 28, bgcolor: "action.hover", color: "text.secondary" }}><PersonRoundedIcon fontSize="small" /></Avatar>
                                    <Box sx={{ flex: 1 }}>Tüm Kullanıcılar</Box>
                                    {!assignedUserFilter && <CheckRoundedIcon color="primary" fontSize="small" />}
                                </MenuItem>
                                {assigneeOptions.map(user => (
                                    <MenuItem key={user.id} value={user.id} sx={{ gap: 1.25 }}>
                                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>
                                            {user.name.slice(0, 1).toLocaleUpperCase("tr-TR")}
                                        </Avatar>
                                        <Box sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</Box>
                                        {assignedUserFilter === user.id && <CheckRoundedIcon color="primary" fontSize="small" />}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                        <InputLabel id="status-filter-label">Durum</InputLabel>
                        <Select labelId="status-filter-label" label="Durum" value={statusFilter}
                            MenuProps={filterMenuProps}
                            startAdornment={<InputAdornment position="start"><AssignmentRoundedIcon fontSize="small" /></InputAdornment>}
                            onChange={event => setStatusFilter(Number(event.target.value))}>
                            {[["Tüm Durumlar", 0], ["Yeni", 1], ["Devam Ediyor", 2], ["Beklemede", 3], ["Tamamlandı", 4], ["İptal Edildi", 5]].map(([label, value]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                        <InputLabel id="priority-filter-label">Öncelik</InputLabel>
                        <Select labelId="priority-filter-label" label="Öncelik" value={priorityFilter}
                            MenuProps={filterMenuProps}
                            startAdornment={<InputAdornment position="start"><FlagRoundedIcon fontSize="small" /></InputAdornment>}
                            onChange={event => setPriorityFilter(Number(event.target.value))}>
                            {[["Tüm Öncelikler", 0], ["Düşük", 1], ["Orta", 2], ["Yüksek", 3], ["Kritik", 4]].map(([label, value]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {hasActiveFilter && (
                    <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", mr: 0.5 }}>Seçili filtreler</Typography>
                        {searchText.trim() && <Chip size="small" label={searchText} onDelete={() => setSearchText("")} />}
                        {assignedUserFilter && <Chip size="small" icon={<PersonRoundedIcon />} label={memberName} onDelete={() => {
                            setSearchParams(current => {
                                const next = new URLSearchParams(current);
                                next.delete("assignedUserId");
                                next.delete("memberName");
                                return next;
                            }, { replace: true });
                        }} />}
                        {statusFilter !== 0 && <Chip size="small" label={getStatusText(statusFilter)} onDelete={() => setStatusFilter(0)} />}
                        {priorityFilter !== 0 && <Chip size="small" label={getPriorityText(priorityFilter)} onDelete={() => setPriorityFilter(0)} />}
                        {groupFilter && <Chip size="small" label={groups.find(group => String(group.id) === groupFilter)?.name || "Seçili grup"} onDelete={() => updateFilter("groupId", "")} />}
                        {specialFilter && <Chip size="small" label={({ overdue: "Gecikmiş", upcoming: "Yaklaşan", active: "Aktif", unassigned: "Atama Bekliyor" } as Record<string, string>)[specialFilter] || specialFilter} onDelete={() => updateFilter("filter", "")} />}
                    </Stack>
                )}
            </Paper>

            {/* RESULT HEADER */}

            <Box
                sx={{
                    mb: 1.5,

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
                    variant="body2"
                    color="text.secondary"
                >
                    <Box
                        component="span"
                        sx={{
                            color:
                                "text.primary",

                            fontWeight:
                                800,
                        }}
                    >
                        {
                            filteredTasks.length
                        }
                    </Box>{" "}
                    görev gösteriliyor
                </Typography>

                {hasActiveFilter && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Toplam{" "}
                        {
                            tasks.length
                        }{" "}
                        görev
                    </Typography>
                )}
            </Box>

            {isLoading ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,

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
                    <PageLoading
                        cardCount={
                            3
                        }
                    />
                </Paper>
            ) : filteredTasks.length ===
                0 ? (
                <EmptyState
                    title="Görev bulunamadı"
                    description={
                        hasActiveFilter
                            ? "Seçtiğiniz arama ve filtrelere uygun görev bulunmuyor."
                            : isEmployee
                                ? "Şu anda size atanmış bir görev bulunmuyor."
                                : "Sistemde henüz görüntülenecek bir görev bulunmuyor."
                    }
                    icon={
                        <AssignmentRoundedIcon
                            sx={{
                                fontSize:
                                    32,
                            }}
                        />
                    }
                    actionLabel={
                        hasActiveFilter
                            ? "Filtreleri Temizle"
                            : undefined
                    }
                    onAction={
                        hasActiveFilter
                            ? clearFilters
                            : undefined
                    }
                />
            ) : (
                <Box
                    sx={{
                        display:
                            "grid",

                        gap: 1.6,
                    }}
                >
                    {filteredTasks.map(
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
                                    position:
                                        "relative",

                                    overflow:
                                        "hidden",

                                    cursor:
                                        "pointer",

                                    border:
                                        "1px solid",

                                    borderColor:
                                        task.isOverdue
                                            ? isDark
                                                ? "rgba(217,161,161,0.34)"
                                                : "#D7A6A6"
                                            : isAwaitingAssignment(task) ? "warning.main" : "divider",

                                    borderRadius:
                                        3.1,

                                    backgroundColor: isAwaitingAssignment(task)
                                        ? (isDark ? "rgba(237, 167, 45, 0.09)" : "#FFF9ED")
                                        : "background.paper",

                                    transition:
                                        "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",

                                    "&:hover":
                                    {
                                        transform:
                                            "translateY(-2px)",

                                        borderColor:
                                            task.isOverdue
                                                ? "#A95555"
                                                : isDark
                                                    ? "rgba(148,163,184,0.24)"
                                                    : "rgba(22,58,99,0.20)",

                                        boxShadow:
                                            isDark
                                                ? "0 10px 28px rgba(0,0,0,0.17)"
                                                : "0 12px 30px rgba(15,23,42,0.065)",
                                    },

                                    "&:hover .task-chevron":
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
                                {(task.isOverdue || isAwaitingAssignment(task)) && (
                                    <Box
                                        sx={{
                                            position:
                                                "absolute",

                                            left: 0,
                                            top: 0,
                                            bottom:
                                                0,

                                            width: 3,

                                            backgroundColor:
                                                task.isOverdue ? "#8B1E1E" : "warning.main",
                                        }}
                                    />
                                )}

                                <Box
                                    sx={{
                                        p: {
                                            xs: 1.8,
                                            sm: 2.05,
                                            md: 2.15,
                                        },

                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                        {
                                            xs: "42px minmax(0, 1fr)",

                                            lg: canManageTasks
                                                ? "44px minmax(0, 1fr) minmax(170px, 0.35fr) 260px 22px"
                                                : "44px minmax(0, 1fr) auto 22px",
                                        },

                                        alignItems:
                                            "center",

                                        gap: {
                                            xs: 1.4,
                                            md: 1.8,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,

                                            borderRadius:
                                                2.25,

                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",

                                            flexShrink:
                                                0,

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
                                            minWidth:
                                                0,
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

                                                display:
                                                    "-webkit-box",

                                                WebkitLineClamp:
                                                    2,

                                                WebkitBoxOrient:
                                                    "vertical",

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
                                                {getAssignmentName(
                                                    task.assignedUserId,
                                                    task.assignedGroupId
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                            >
                                                •
                                            </Typography>

                                            <CalendarTodayRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        14,

                                                    color:
                                                        "text.disabled",
                                                }}
                                            />

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color:
                                                        task.isOverdue
                                                            ? isDark
                                                                ? "#F0B0B0"
                                                                : "#8B1E1E"
                                                            : "text.secondary",

                                                    fontWeight:
                                                        task.isOverdue
                                                            ? 700
                                                            : 400,
                                                }}
                                            >
                                                Bitiş:{" "}
                                                {formatDate(
                                                    task.dueDate
                                                )}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    {canManageTasks && (
                                        <Box
                                            sx={{
                                                display:
                                                {
                                                    xs: "none",
                                                lg: "block",
                                                },

                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                }}
                                            >
                                                Atanan
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.35,

                                                    fontWeight:
                                                        650,

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {getAssignmentName(
                                                    task.assignedUserId,
                                                    task.assignedGroupId
                                                )}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Stack
                                        direction="row"
                                        sx={{
                                            gridColumn:
                                            {
                                                xs: "2 / -1",
                                                lg: "auto",
                                            },

                                            justifyContent:
                                            {
                                                xs: "flex-start",
                                                lg: "flex-end",
                                            },

                                            alignItems:
                                                "center",

                                            flexWrap:
                                                "wrap",

                                            gap: 0.75,
                                        }}
                                    >
                                        {isAwaitingAssignment(task) && (
                                            <Chip size="small" color="warning" variant="outlined"
                                                icon={<WarningAmberRoundedIcon />}
                                                label="Atama Bekliyor" sx={{ fontWeight: 700 }} />
                                        )}
                                        <Chip
                                            icon={
                                                <FlagRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            "15px !important",
                                                    }}
                                                />
                                            }
                                            label={getPriorityText(
                                                task.priority
                                            )}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: 28,

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
                                                height: 28,

                                                borderRadius:
                                                    1.7,

                                                fontSize:
                                                    11,

                                                fontWeight:
                                                    700,

                                                ...getStatusStyle(
                                                    task.status
                                                ),
                                            }}
                                        />

                                        {task.isOverdue && (
                                            <Chip
                                                icon={
                                                    <WarningAmberRoundedIcon
                                                        sx={{
                                                            fontSize:
                                                                "15px !important",
                                                        }}
                                                    />
                                                }
                                                label="Gecikmiş"
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    height: 28,

                                                    borderRadius:
                                                        1.7,

                                                    fontSize:
                                                        11,

                                                    fontWeight:
                                                        800,

                                                    color:
                                                        isDark
                                                            ? "#F3B4B4"
                                                            : "#8B1E1E",

                                                    borderColor:
                                                        isDark
                                                            ? "rgba(243,180,180,0.28)"
                                                            : "#D7A6A6",

                                                    backgroundColor:
                                                        isDark
                                                            ? "rgba(139,30,30,0.18)"
                                                            : "#FBECEC",

                                                    "& .MuiChip-icon":
                                                    {
                                                        color:
                                                            isDark
                                                                ? "#F3B4B4"
                                                                : "#8B1E1E",
                                                    },
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <ChevronRightRoundedIcon
                                        className="task-chevron"
                                        sx={{
                                            display:
                                            {
                                                xs: "none",
                                                lg: "block",
                                            },

                                            color:
                                                "text.disabled",

                                            fontSize:
                                                21,

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
    );
}

export default TasksPage;
