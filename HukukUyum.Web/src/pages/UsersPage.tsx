import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import api from "../api/axios";

import type { User } from "../types/User";
import { getCurrentUserRoles } from "../utils/auth";

interface UserStatCardProps {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    accent: string;
    softBg: string;
}

const roleOptions = [
    { value: "All", label: "Tüm Roller", description: "Tüm kullanıcıları göster", icon: <PeopleAltRoundedIcon />, color: "primary.main" },
    { value: "Admin", label: "Admin", description: "Sistem yöneticisi", icon: <AdminPanelSettingsRoundedIcon />, color: "error.main" },
    { value: "Manager", label: "Manager", description: "Grup yöneticisi", icon: <ManageAccountsRoundedIcon />, color: "warning.main" },
    { value: "Employee", label: "Employee", description: "Çalışan", icon: <BadgeRoundedIcon />, color: "info.main" },
    { value: "User", label: "User", description: "Talep kullanıcısı", icon: <GroupsRoundedIcon />, color: "success.main" },
];

const userFilterMenuProps = {
    slotProps: { paper: { sx: {
        mt: 0.75, p: 0.5, borderRadius: 3, maxHeight: 360,
        border: "1px solid", borderColor: "divider",
        boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
        "& .MuiMenuItem-root": {
            gap: 1.25, borderRadius: 2, my: 0.5, py: 1,
            "&.Mui-selected": { bgcolor: "action.selected" },
        },
    } } },
};

function UserStatCard({
    title,
    value,
    description,
    icon,
    accent,
    softBg,
}: UserStatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                p: 2,
                minHeight: 150,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                    borderColor: accent,
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1.25,
                    position: "relative",
                    zIndex: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.primary",
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                        fontSize: 34,
                            lineHeight: 1,
                            color: "#0F172A",
                            mb: 1,
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.45,
                        fontSize: 12.5,
                        }}
                    >
                        {description}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: softBg,
                        color: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
                        "& svg": {
                            fontSize: 20,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 42,
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            >
                <svg
                    width="100%"
                    height="42"
                    viewBox="0 0 400 42"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0 28C20 28 20 20 40 20C60 20 60 28 80 28C100 28 100 24 120 24C140 24 140 30 160 30C180 30 180 20 200 20C220 20 220 28 240 28C260 28 260 30 280 30C300 30 300 20 320 20C340 20 340 28 360 28C380 28 380 22 400 22"
                        fill="none"
                        stroke={accent}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        opacity="0.9"
                    />
                </svg>
            </Box>
        </Paper>
    );
}
interface GroupItem {
    id: number;
    name: string;
}

function UsersPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const [
        users,
        setUsers,
    ] = useState<User[]>([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const [
        selectedRole,
        setSelectedRole,
    ] = useState("All");

    const [
        selectedUser,
        setSelectedUser,
    ] = useState<User | null>(
        null
    );

    const [
        isDetailOpen,
        setIsDetailOpen,
    ] = useState(false);

    const [
        groups,
        setGroups,
    ] = useState<GroupItem[]>([]);
    const [selectedGroup, setSelectedGroup] = useState("All");

    const [
        editRoles,
        setEditRoles,
    ] = useState<string[]>([]);

    const [
        editGroupIds,
        setEditGroupIds,
    ] = useState<number[]>([]);

    const [
        isSavingUser,
        setIsSavingUser,
    ] = useState(false);

    const [
        deleteDialogOpen,
        setDeleteDialogOpen,
    ] = useState(false);

    const [
        isDeletingUser,
        setIsDeletingUser,
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        detailErrorMessage,
        setDetailErrorMessage,
    ] = useState("");

    const [
        detailSuccessMessage,
        setDetailSuccessMessage,
    ] = useState("");

    const isAdmin =
        getCurrentUserRoles().includes(
            "Admin"
        );

    const loadUsersAndGroups =
        async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const usersRequest =
                    api.get<User[]>(
                        "/Users"
                    );

                const groupsRequest =
                    isAdmin
                        ? api.get<GroupItem[]>(
                            "/Groups"
                        )
                        : Promise.resolve({
                            data: [] as GroupItem[],
                        });

                const [
                    usersResponse,
                    groupsResponse,
                ] = await Promise.all([
                    usersRequest,
                    groupsRequest,
                ]);

                setUsers(
                    usersResponse.data
                );

                setGroups(
                    groupsResponse.data
                );
            } catch (error) {
                console.error(
                    "Kullanıcı listesi alınamadı:",
                    error
                );

                setErrorMessage(
                    "Kullanıcı listesi alınamadı."
                );
            } finally {
                setIsLoading(false);
            }
        };

    useEffect(() => {
        void loadUsersAndGroups();
    }, []);

    const filteredUsers =
        useMemo(() => {
            const searchValue =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            return users.filter(
                (user) => {
                    const matchesSearch =
                        !searchValue ||
                        user.fullName
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                searchValue
                            ) ||
                        user.email
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                searchValue
                            );

                    const matchesRole =
                        selectedRole ===
                        "All" ||
                        user.roles.includes(
                            selectedRole
                        );

                    return (
                        matchesSearch &&
                        matchesRole &&
                        (selectedGroup === "All" ||
                            (selectedGroup === "none" ? user.groups.length === 0 :
                                user.groups.includes(groups.find(group => String(group.id) === selectedGroup)?.name ?? "")))
                    );
                }
            );
        }, [
            users,
            searchText,
            selectedRole,
            selectedGroup,
            groups,
        ]);

   

    const handleOpenDetail = (
        user: User
    ) => {
        setSelectedUser(user);

        setEditRoles(
            [...user.roles]
        );

        setEditGroupIds(
            groups
                .filter(group =>
                    user.groups.includes(
                        group.name
                    )
                )
                .map(group =>
                    group.id
                )
        );

        setDetailSuccessMessage("");
        setDetailErrorMessage("");
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        if (
            isSavingUser ||
            isDeletingUser
        ) {
            return;
        }

        setIsDetailOpen(false);
        setSelectedUser(null);
        setEditRoles([]);
        setEditGroupIds([]);
        setDetailErrorMessage("");
        setDetailSuccessMessage("");
    };

    const handleRoleChange = (
        value: string[]
    ) => {
        if (value.includes("User")) {
            setEditRoles(["User"]);
            setEditGroupIds([]);
            return;
        }

        setEditRoles(value);
    };

    const handleOpenDelete = (
        user: User
    ) => {
        setSelectedUser(user);
        setDetailErrorMessage("");
        setDetailSuccessMessage("");
        setDeleteDialogOpen(true);
    };

    const handleSaveUser =
        async () => {
            if (!selectedUser) {
                return;
            }

            if (editRoles.length === 0) {
                setDetailErrorMessage(
                    "En az bir rol seçmelisiniz."
                );
                return;
            }

            try {
                setIsSavingUser(true);
                setDetailErrorMessage("");
                setDetailSuccessMessage("");

                const response =
                    await api.put<User>(
                        `/Users/${selectedUser.id}`,
                        {
                            roles: editRoles,
                            groupIds:
                                editGroupIds,
                        }
                    );

                setSelectedUser(
                    response.data
                );

                setUsers(currentUsers =>
                    currentUsers.map(user =>
                        user.id ===
                            response.data.id
                            ? response.data
                            : user
                    )
                );

                setEditRoles(
                    [...response.data.roles]
                );

                setEditGroupIds(
                    groups
                        .filter(group =>
                            response.data.groups.includes(
                                group.name
                            )
                        )
                        .map(group =>
                            group.id
                        )
                );

                setDetailSuccessMessage(
                    "Kullanıcı rol ve grup bilgileri başarıyla güncellendi."
                );
            } catch (error: any) {
                console.error(
                    "Kullanıcı güncellenemedi:",
                    error
                );

                setDetailErrorMessage(
                    error.response?.data
                        ?.message ||
                    error.response?.data
                        ?.title ||
                    "Kullanıcı güncellenemedi."
                );
            } finally {
                setIsSavingUser(false);
            }
        };

    const handleDeleteUser =
        async () => {
            if (!selectedUser) {
                return;
            }

            try {
                setIsDeletingUser(true);
                setDetailErrorMessage("");

                await api.delete(
                    `/Users/${selectedUser.id}`
                );

                setUsers(currentUsers =>
                    currentUsers.filter(
                        user =>
                            user.id !==
                            selectedUser.id
                    )
                );

                setDeleteDialogOpen(false);
                setIsDetailOpen(false);
                setSelectedUser(null);

                setSuccessMessage(
                    "Kullanıcı başarıyla silindi."
                );
            } catch (error: any) {
                console.error(
                    "Kullanıcı silinemedi:",
                    error
                );

                setDeleteDialogOpen(false);

                setDetailErrorMessage(
                    error.response?.data
                        ?.message ||
                    error.response?.data
                        ?.title ||
                    "Kullanıcı silinemedi."
                );
            } finally {
                setIsDeletingUser(false);
            }
        };

    const getRoleChip = (
        role: string
    ) => {
        if (role === "Admin") {
            return (
                <Chip
                    key={role}
                    label="Admin"
                    color="error"
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 600,
                    }}
                />
            );
        }

        if (role === "Manager") {
            return (
                <Chip
                    key={role}
                    label="Manager"
                    color="warning"
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 600,
                    }}
                />
            );
        }

        if (role === "User") {
            return (
                <Chip
                    key={role}
                    label="User"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{
                        fontWeight: 600,
                    }}
                />
            );
        }

        return (
            <Chip
                key={role}
                label="Employee"
                color="primary"
                size="small"
                variant="outlined"
                sx={{
                    fontWeight: 600,
                }}
            />
        );
    };

    const getInitial = (
        fullName: string
    ) => {
        return (
            fullName
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "K"
        );
    };

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "none",
                mx: "auto",
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
                color: "text.primary",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    mb: 2.75,
                    p: {
                        xs: 2.4,
                        sm: 3,
                        lg: 2.25,
                    },
                    minHeight: {
                        xs: "auto",
                        lg: 112,
                    },
                    display: "flex",
                    alignItems: "center",
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
                        right: -120,
                        top: -175,
                        backgroundColor: isDark
                            ? "rgba(49,95,140,0.07)"
                            : "rgba(49,95,140,0.04)",
                    }}
                />

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Kullanıcı Yönetimi
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 0.9,
                                maxWidth: 720,
                                lineHeight: 1.7,
                            }}
                        >
                            Sistemdeki kullanıcıları, rollerini ve grup üyeliklerini görüntüleyin.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            display: {
                                xs: "none",
                                sm: "flex",
                            },
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2.6,
                            color: "#315F8C",
                            backgroundColor: isDark
                                ? "rgba(49,95,140,0.14)"
                                : "#EAF1F7",
                        }}
                    >
                        <PeopleAltRoundedIcon />
                    </Box>
                </Stack>
            </Paper>

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage("")
                    }
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(5, minmax(0, 1fr))",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <UserStatCard
                    title="Toplam Kullanıcı"
                    value={users.length}
                    description="Sistemde kayıtlı tüm kullanıcılar"
                    icon={<PeopleAltRoundedIcon />}
                    accent="#3B82F6"
                    softBg="rgba(59,130,246,0.10)"
                />

                <UserStatCard
                    title="Admin"
                    value={
                        users.filter((user) =>
                            user.roles.includes("Admin")
                        ).length
                    }
                    description="Yönetim yetkisine sahip kullanıcılar"
                    icon={<AdminPanelSettingsRoundedIcon />}
                    accent="#EF4444"
                    softBg="rgba(239,68,68,0.10)"
                />

                <UserStatCard
                    title="Manager"
                    value={
                        users.filter((user) =>
                            user.roles.includes("Manager")
                        ).length
                    }
                    description="Grup ve süreç yöneticileri"
                    icon={<ManageAccountsRoundedIcon />}
                    accent="#F59E0B"
                    softBg="rgba(245,158,11,0.10)"
                />

                <UserStatCard
                    title="Employee"
                    value={
                        users.filter((user) =>
                            user.roles.includes("Employee")
                        ).length
                    }
                    description="Aktif görev alan personeller"
                    icon={<BadgeRoundedIcon />}
                    accent="#2563EB"
                    softBg="rgba(37,99,235,0.10)"
                />

                <UserStatCard
                    title="User"
                    value={
                        users.filter((user) =>
                            user.roles.includes("User")
                        ).length
                    }
                    description="Talep oluşturan son kullanıcılar"
                    icon={<GroupsRoundedIcon />}
                    accent="#16A34A"
                    softBg="rgba(22,163,74,0.10)"
                />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 1.8,
                        sm: 2.1,
                    },
                    mb: 2.5,

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 3.2,

                    backgroundColor:
                        "background.paper",
                }}
            >
                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr)",
                        },

                        gap: 1.5,
                    }}
                >
                    <TextField
                        placeholder="Ad soyad veya e-posta ara..."
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(
                                event.target
                                    .value
                            )
                        }
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment:
                                    (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root":
                            {
                                borderRadius: 2,
                            },
                        }}
                    />

                    <FormControl
                        fullWidth
                        size="small"
                    >
                        <InputLabel id="role-filter-label">
                            Rol
                        </InputLabel>

                        <Select
                            labelId="role-filter-label"
                            MenuProps={userFilterMenuProps}
                            renderValue={value => roleOptions.find(role => role.value === value)?.label ?? value}
                            startAdornment={<InputAdornment position="start"><ManageAccountsRoundedIcon fontSize="small" /></InputAdornment>}
                            value={
                                selectedRole
                            }
                            label="Rol"
                            onChange={(event) =>
                                setSelectedRole(
                                    event.target
                                        .value
                                )
                            }
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            {roleOptions.map(role => (
                                <MenuItem key={role.value} value={role.value}>
                                    <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: "action.hover", color: role.color, borderRadius: 2 }}>
                                        {role.icon}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{role.label}</Typography>
                                        <Typography variant="caption" color="text.secondary">{role.description}</Typography>
                                    </Box>
                                    {selectedRole === role.value && <CheckRoundedIcon color="primary" fontSize="small" />}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                        <InputLabel id="user-group-filter-label">Grup</InputLabel>
                        <Select labelId="user-group-filter-label" label="Grup" value={selectedGroup}
                            onChange={event => setSelectedGroup(event.target.value)} MenuProps={userFilterMenuProps}
                            startAdornment={<InputAdornment position="start"><GroupsRoundedIcon fontSize="small" /></InputAdornment>}
                            sx={{ borderRadius: 2 }}>
                            <MenuItem value="All">Tüm Gruplar</MenuItem>
                            <MenuItem value="none">Grubu Olmayanlar</MenuItem>
                            {groups.map(group => <MenuItem key={group.id} value={String(group.id)}>{group.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>
                {(searchText.trim() || selectedRole !== "All" || selectedGroup !== "All") && (
                    <Stack direction="row" sx={{ mt: 1.5, gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                        {selectedRole !== "All" && <Chip size="small" label={selectedRole} onDelete={() => setSelectedRole("All")} />}
                        {selectedGroup !== "All" && <Chip size="small" label={selectedGroup === "none" ? "Grubu Olmayanlar" : groups.find(group => String(group.id) === selectedGroup)?.name} onDelete={() => setSelectedGroup("All")} />}
                        <Button size="small" onClick={() => { setSearchText(""); setSelectedRole("All"); setSelectedGroup("All"); }}>Filtreleri Temizle</Button>
                    </Stack>
                )}
            </Paper>

            <Paper
                elevation={0}
                sx={{
                    overflow: "hidden",

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 3,

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

                        py: 2,

                        display: "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "space-between",

                        borderBottom:
                            "1px solid",

                        borderColor:
                            "divider",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{
                            alignItems:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,

                                borderRadius: 2,

                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                backgroundColor:
                                    isDark
                                        ? "rgba(49,95,140,0.12)"
                                        : "#EEF4F8",

                                color:
                                    "#315F8C",
                            }}
                        >
                            <PeopleAltRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Kullanıcı Listesi
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {
                                    filteredUsers.length
                                }{" "}
                                kullanıcı gösteriliyor
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {isLoading ? (
                    <Box
                        sx={{
                            display: "flex",

                            justifyContent:
                                "center",

                            py: 8,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : filteredUsers.length ===
                    0 ? (
                    <Box
                        sx={{
                            py: 8,
                            px: 2,

                            textAlign:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,

                                mx: "auto",
                                mb: 2,

                                borderRadius:
                                    "50%",

                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                backgroundColor:
                                    "action.hover",

                                color:
                                    "text.disabled",
                            }}
                        >
                            <PeopleAltRoundedIcon
                                sx={{
                                    fontSize: 32,
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Kullanıcı bulunamadı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Arama veya rol
                            filtrenize uygun kullanıcı
                            bulunmuyor.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table
                            sx={{
                                minWidth: 900,
                            }}
                        >
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor:
                                            isDark
                                                ? "rgba(255,255,255,0.025)"
                                                : "#F8FAFC",
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Kullanıcı
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Roller
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Gruplar
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        İşlemler
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredUsers.map(
                                    (
                                        user
                                    ) => (
                                        <TableRow
                                            key={
                                                user.id
                                            }
                                            hover
                                            sx={{
                                                transition:
                                                    "background-color 0.15s ease",

                                                "&:hover":
                                                {
                                                    backgroundColor:
                                                        "action.hover !important",
                                                },

                                                "&:last-child td":
                                                {
                                                    borderBottom:
                                                        0,
                                                },
                                            }}
                                        >
                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        1.5
                                                    }
                                                    sx={{
                                                        alignItems:
                                                            "center",
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width:
                                                                42,

                                                            height:
                                                                42,

                                                            bgcolor:
                                                                "#163A63",

                                                            fontWeight:
                                                                700,
                                                        }}
                                                    >
                                                        {getInitial(
                                                            user.fullName
                                                        )}
                                                    </Avatar>

                                                    <Box>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight:
                                                                    700,

                                                                color:
                                                                    "text.primary",
                                                            }}
                                                        >
                                                            {
                                                                user.fullName
                                                            }
                                                        </Typography>

                                                        <Stack
                                                            direction="row"
                                                            spacing={
                                                                0.6
                                                            }
                                                            sx={{
                                                                mt:
                                                                    0.35,

                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            <EmailRoundedIcon
                                                                sx={{
                                                                    fontSize:
                                                                        14,

                                                                    color:
                                                                        "text.disabled",
                                                                }}
                                                            />

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    user.email
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        0.75
                                                    }
                                                    sx={{
                                                        flexWrap:
                                                            "wrap",

                                                        gap:
                                                            0.75,
                                                    }}
                                                >
                                                    {user.roles.length >
                                                        0
                                                        ? user.roles.map(
                                                            (
                                                                role
                                                            ) =>
                                                                getRoleChip(
                                                                    role
                                                                )
                                                        )
                                                        : (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                -
                                                            </Typography>
                                                        )}
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                {user.groups.length >
                                                    0 ? (
                                                    <Stack
                                                        direction="row"
                                                        spacing={
                                                            0.75
                                                        }
                                                        sx={{
                                                            flexWrap:
                                                                "wrap",

                                                            gap:
                                                                0.75,
                                                        }}
                                                    >
                                                        {user.groups.map(
                                                            (
                                                                group
                                                            ) => (
                                                                <Chip
                                                                    key={
                                                                        group
                                                                    }
                                                                    label={
                                                                        group
                                                                    }
                                                                    size="small"
                                                                    icon={
                                                                        <GroupsRoundedIcon />
                                                                    }
                                                                    variant="outlined"
                                                                    sx={{
                                                                        fontWeight:
                                                                            500,
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            <TableCell align="right">
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{
                                                        justifyContent:
                                                            "flex-end",
                                                    }}
                                                >
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <VisibilityRoundedIcon />
                                                        }
                                                        onClick={() =>
                                                            handleOpenDetail(
                                                                user
                                                            )
                                                        }
                                                        sx={{
                                                            borderRadius:
                                                                2,
                                                            textTransform:
                                                                "none",
                                                            fontWeight:
                                                                650,
                                                            color:
                                                                "#315F8C",
                                                            borderColor:
                                                                isDark
                                                                    ? "rgba(151,185,214,0.28)"
                                                                    : "#C9D7E3",
                                                            "&:hover":
                                                            {
                                                                borderColor:
                                                                    "#315F8C",
                                                                backgroundColor:
                                                                    isDark
                                                                        ? "rgba(49,95,140,0.08)"
                                                                        : "#F3F7FA",
                                                            },
                                                        }}
                                                    >
                                                        Detay
                                                    </Button>

                                                    {isAdmin && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={
                                                                <DeleteOutlineRoundedIcon />
                                                            }
                                                            onClick={() =>
                                                                handleOpenDelete(
                                                                    user
                                                                )
                                                            }
                                                            sx={{
                                                                borderRadius:
                                                                    2,
                                                                textTransform:
                                                                    "none",
                                                                fontWeight:
                                                                    650,
                                                            }}
                                                        >
                                                            Sil
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog
                open={isDetailOpen}
                onClose={
                    handleCloseDetail
                }
                fullWidth
                maxWidth="sm"
                sx={{
                    "& .MuiDialog-paper":
                    {
                        borderRadius:
                            3.2,
                        backgroundColor:
                            "background.paper",
                        border:
                            "1px solid",
                        borderColor:
                            "divider",
                        boxShadow:
                            isDark
                                ? "0 24px 70px rgba(0,0,0,0.35)"
                                : "0 24px 70px rgba(15,23,42,0.16)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 800,
                        pb: 1,
                    }}
                >
                    Kullanıcı Detayı
                </DialogTitle>

                <DialogContent>
                    {selectedUser && (
                        <Box
                            sx={{
                                mt: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                sx={{
                                    alignItems:
                                        "center",
                                    mb: 3,
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        bgcolor:
                                            "#163A63",
                                        fontSize: 22,
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    {getInitial(
                                        selectedUser.fullName
                                    )}
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        {
                                            selectedUser.fullName
                                        }
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {
                                            selectedUser.email
                                        }
                                    </Typography>
                                </Box>
                            </Stack>

                            {detailErrorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                    }}
                                >
                                    {detailErrorMessage}
                                </Alert>
                            )}

                            {detailSuccessMessage && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 2,
                                        borderRadius: 2,
                                    }}
                                >
                                    {detailSuccessMessage}
                                </Alert>
                            )}

                            <DetailRow
                                label="Ad Soyad"
                                value={
                                    selectedUser.fullName
                                }
                            />

                            <DetailRow
                                label="E-posta"
                                value={
                                    selectedUser.email
                                }
                            />

                            {isAdmin ? (
                                <Stack
                                    spacing={2}
                                    sx={{
                                        mt: 2.5,
                                    }}
                                >
                                    <FormControl
                                        fullWidth
                                    >
                                        <InputLabel id="user-detail-role-label">
                                            Roller
                                        </InputLabel>

                                        <Select
                                            labelId="user-detail-role-label"
                                            multiple
                                            label="Roller"
                                            value={
                                                editRoles
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleRoleChange(
                                                    typeof event
                                                        .target
                                                        .value ===
                                                        "string"
                                                        ? event
                                                            .target
                                                            .value
                                                            .split(
                                                                ","
                                                            )
                                                        : event
                                                            .target
                                                            .value
                                                )
                                            }
                                            renderValue={(
                                                selected
                                            ) => (
                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        0.75
                                                    }
                                                    sx={{
                                                        flexWrap:
                                                            "wrap",
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    {selected.map(
                                                        role =>
                                                            getRoleChip(
                                                                role
                                                            )
                                                    )}
                                                </Stack>
                                            )}
                                            sx={{
                                                borderRadius:
                                                    2,
                                            }}
                                        >
                                            {[
                                                "Admin",
                                                "Manager",
                                                "Employee",
                                                "User",
                                            ].map(
                                                role => (
                                                    <MenuItem
                                                        key={
                                                            role
                                                        }
                                                        value={
                                                            role
                                                        }
                                                    >
                                                        {
                                                            role
                                                        }
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>

                                    <FormControl
                                        fullWidth
                                        disabled={
                                            editRoles.includes(
                                                "User"
                                            )
                                        }
                                    >
                                        <InputLabel id="user-detail-group-label">
                                            Gruplar
                                        </InputLabel>

                                        <Select
                                            labelId="user-detail-group-label"
                                            multiple
                                            label="Gruplar"
                                            value={
                                                editGroupIds
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEditGroupIds(
                                                    typeof event
                                                        .target
                                                        .value ===
                                                        "string"
                                                        ? event
                                                            .target
                                                            .value
                                                            .split(
                                                                ","
                                                            )
                                                            .map(
                                                                Number
                                                            )
                                                        : event
                                                            .target
                                                            .value as number[]
                                                )
                                            }
                                            renderValue={(
                                                selected
                                            ) => (
                                                <Stack
                                                    direction="row"
                                                    spacing={
                                                        0.75
                                                    }
                                                    sx={{
                                                        flexWrap:
                                                            "wrap",
                                                        gap: 0.75,
                                                    }}
                                                >
                                                    {selected.map(
                                                        groupId => {
                                                            const group =
                                                                groups.find(
                                                                    item =>
                                                                        item.id ===
                                                                        groupId
                                                                );

                                                            return (
                                                                <Chip
                                                                    key={
                                                                        groupId
                                                                    }
                                                                    size="small"
                                                                    icon={
                                                                        <GroupsRoundedIcon />
                                                                    }
                                                                    label={
                                                                        group?.name ??
                                                                        `Grup #${groupId}`
                                                                    }
                                                                    variant="outlined"
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </Stack>
                                            )}
                                            sx={{
                                                borderRadius:
                                                    2,
                                            }}
                                        >
                                            {groups.map(
                                                group => (
                                                    <MenuItem
                                                        key={
                                                            group.id
                                                        }
                                                        value={
                                                            group.id
                                                        }
                                                    >
                                                        {
                                                            group.name
                                                        }
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                    </FormControl>

                                    {editRoles.includes(
                                        "User"
                                    ) && (
                                            <Alert
                                                severity="info"
                                                sx={{
                                                    borderRadius:
                                                        2,
                                                }}
                                            >
                                                User rolüne sahip kullanıcılar grup üyesi olamaz.
                                            </Alert>
                                        )}
                                </Stack>
                            ) : (
                                <>
                                    <Box
                                        sx={{
                                            py: 1.5,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display:
                                                    "block",
                                                mb: 0.75,
                                            }}
                                        >
                                            Roller
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={
                                                0.75
                                            }
                                            sx={{
                                                flexWrap:
                                                    "wrap",
                                                gap: 0.75,
                                            }}
                                        >
                                            {selectedUser.roles
                                                .length >
                                                0 ? (
                                                selectedUser.roles.map(
                                                    role =>
                                                        getRoleChip(
                                                            role
                                                        )
                                                )
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    -
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>

                                    <Box
                                        sx={{
                                            py: 1.5,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display:
                                                    "block",
                                                mb: 0.75,
                                            }}
                                        >
                                            Gruplar
                                        </Typography>

                                        <Stack
                                            direction="row"
                                            spacing={
                                                0.75
                                            }
                                            sx={{
                                                flexWrap:
                                                    "wrap",
                                                gap: 0.75,
                                            }}
                                        >
                                            {selectedUser.groups
                                                .length >
                                                0 ? (
                                                selectedUser.groups.map(
                                                    group => (
                                                        <Chip
                                                            key={
                                                                group
                                                            }
                                                            label={
                                                                group
                                                            }
                                                            size="small"
                                                            icon={
                                                                <GroupsRoundedIcon />
                                                            }
                                                            variant="outlined"
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    -
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                        justifyContent:
                            isAdmin
                                ? "space-between"
                                : "flex-end",
                    }}
                >
                    {isAdmin && (
                        <Button
                            color="error"
                            variant="outlined"
                            startIcon={
                                <DeleteOutlineRoundedIcon />
                            }
                            onClick={() =>
                                selectedUser &&
                                handleOpenDelete(
                                    selectedUser
                                )
                            }
                            disabled={
                                isSavingUser
                            }
                            sx={{
                                borderRadius: 2,
                                textTransform:
                                    "none",
                                fontWeight: 650,
                            }}
                        >
                            Kullanıcıyı Sil
                        </Button>
                    )}

                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            onClick={
                                handleCloseDetail
                            }
                            disabled={
                                isSavingUser
                            }
                            sx={{
                                borderRadius: 2,
                                textTransform:
                                    "none",
                            }}
                        >
                            Kapat
                        </Button>

                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={
                                    !isSavingUser
                                        ? <SaveRoundedIcon />
                                        : undefined
                                }
                                onClick={() =>
                                    void handleSaveUser()
                                }
                                disabled={
                                    isSavingUser ||
                                    editRoles.length ===
                                    0
                                }
                                sx={{
                                    borderRadius: 2,
                                    boxShadow:
                                        "none",
                                    textTransform:
                                        "none",
                                    fontWeight: 700,
                                    backgroundColor:
                                        "#163A63",
                                    "&:hover":
                                    {
                                        backgroundColor:
                                            "#102F51",
                                        boxShadow:
                                            "none",
                                    },
                                }}
                            >
                                {isSavingUser
                                    ? "Kaydediliyor..."
                                    : "Değişiklikleri Kaydet"}
                            </Button>
                        )}
                    </Stack>
                </DialogActions>
            </Dialog>

            <Dialog
                open={
                    deleteDialogOpen
                }
                onClose={() => {
                    if (
                        !isDeletingUser
                    ) {
                        setDeleteDialogOpen(
                            false
                        );
                    }
                }}
                fullWidth
                maxWidth="xs"
                sx={{
                    "& .MuiDialog-paper":
                    {
                        borderRadius:
                            3.2,
                        border:
                            "1px solid",
                        borderColor:
                            "divider",
                    },
                }}
            >
                <DialogTitle>
                    <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{
                            alignItems:
                                "center",
                        }}
                    >
                        <WarningAmberRoundedIcon
                            color="error"
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight:
                                    800,
                            }}
                        >
                            Kullanıcıyı Sil
                        </Typography>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            lineHeight: 1.7,
                        }}
                    >
                        <strong>
                            {
                                selectedUser?.fullName
                            }
                        </strong>{" "}
                        kullanıcısını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                    }}
                >
                    <Button
                        onClick={() =>
                            setDeleteDialogOpen(
                                false
                            )
                        }
                        disabled={
                            isDeletingUser
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={() =>
                            void handleDeleteUser()
                        }
                        disabled={
                            isDeletingUser
                        }
                        startIcon={
                            !isDeletingUser
                                ? <DeleteOutlineRoundedIcon />
                                : undefined
                        }
                        sx={{
                            boxShadow: "none",
                            textTransform:
                                "none",
                            fontWeight: 700,
                        }}
                    >
                        {isDeletingUser
                            ? "Siliniyor..."
                            : "Evet, Kullanıcıyı Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

interface DetailRowProps {
    label: string;
    value: string;
}

function DetailRow({
    label,
    value,
}: DetailRowProps) {
    return (
        <Box
            sx={{
                py: 1.5,

                borderBottom:
                    "1px solid",

                borderColor:
                    "divider",
            }}
        >
            <Typography
                variant="caption"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    mt: 0.4,
                    fontWeight: 600,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default UsersPage;
