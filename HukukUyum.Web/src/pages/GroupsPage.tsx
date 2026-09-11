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

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";

import api from "../api/axios";

import type { Group } from "../types/Group";
import type { User } from "../types/User";

interface GroupUser {
    userId: string;
    fullName: string;
    email: string;
    isManager: boolean;
}

type GroupItem = Group & {
    managerUserId?: string | null;
    managerFullName?: string | null;
    managerEmail?: string | null;
};

type UserWithRoles = User & {
    role?: string;
    roles?: string[];
};

function GroupsPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const [
        groups,
        setGroups,
    ] = useState<GroupItem[]>([]);

    const [
        allUsers,
        setAllUsers,
    ] = useState<User[]>([]);

    const [
        selectedGroup,
        setSelectedGroup,
    ] = useState<GroupItem | null>(
        null
    );

    const [
        groupUsers,
        setGroupUsers,
    ] = useState<GroupUser[]>([]);

    const [
        selectedUserId,
        setSelectedUserId,
    ] = useState("");

    const [
        createDialogOpen,
        setCreateDialogOpen,
    ] = useState(false);

    const [
        newGroupName,
        setNewGroupName,
    ] = useState("");

    const [
        selectedManagerId,
        setSelectedManagerId,
    ] = useState("");

    const [
        managerDialogGroup,
        setManagerDialogGroup,
    ] = useState<GroupItem | null>(
        null
    );

    const [
        updateManagerUserId,
        setUpdateManagerUserId,
    ] = useState("");

    const [
        isUpdatingManager,
        setIsUpdatingManager,
    ] = useState(false);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isLoadingUsers,
        setIsLoadingUsers,
    ] = useState(false);

    const [
        isCreatingGroup,
        setIsCreatingGroup,
    ] = useState(false);

    const [
        isUpdatingMember,
        setIsUpdatingMember,
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const loadGroups = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response =
                await api.get<GroupItem[]>(
                    "/Groups"
                );

            setGroups(response.data);
        } catch (error: any) {
            console.error(
                "Gruplar alınamadı:",
                error
            );

            if (
                error.response?.status ===
                401
            ) {
                setErrorMessage(
                    "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                );
            } else {
                setErrorMessage(
                    "Grup bilgileri backend üzerinden alınamadı."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            const response =
                await api.get<User[]>(
                    "/Users"
                );

            setAllUsers(
                response.data
            );
        } catch (error: any) {
            console.error(
                "Kullanıcılar alınamadı:",
                error
            );

            if (
                error.response?.status ===
                401
            ) {
                setErrorMessage(
                    "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                setErrorMessage(
                    "Kullanıcı listesini görüntülemek için Admin veya Manager rolüne sahip olmanız gerekir."
                );
            } else {
                setErrorMessage(
                    "Kullanıcı listesi alınamadı."
                );
            }
        }
    };

    useEffect(() => {
        void loadGroups();
        void loadAllUsers();
    }, []);

    const refreshSelectedGroupUsers =
        async (
            groupId: number
        ) => {
            const response =
                await api.get<
                    GroupUser[]
                >(
                    `/Groups/${groupId}/users`
                );

            setGroupUsers(
                response.data
            );
        };

    const handleOpenManagerDialog = (
        group: GroupItem
    ) => {
        setSuccessMessage("");
        setErrorMessage("");

        setManagerDialogGroup(
            group
        );

        setUpdateManagerUserId(
            group.managerUserId ??
            ""
        );
    };

    const handleCloseManagerDialog =
        () => {
            if (isUpdatingManager) {
                return;
            }

            setManagerDialogGroup(
                null
            );

            setUpdateManagerUserId(
                ""
            );
        };

    const handleUpdateManager =
        async () => {
            if (!managerDialogGroup) {
                return;
            }

            if (!updateManagerUserId) {
                setErrorMessage(
                    "Grup yöneticisi seçmelisiniz."
                );

                return;
            }

            try {
                setIsUpdatingManager(
                    true
                );

                setSuccessMessage("");
                setErrorMessage("");

                await api.put(
                    `/Groups/${managerDialogGroup.id}/manager`,
                    {
                        managerUserId:
                            updateManagerUserId,
                    }
                );

                await loadGroups();

                setManagerDialogGroup(
                    null
                );

                setUpdateManagerUserId(
                    ""
                );

                setSuccessMessage(
                    "Grup yöneticisi başarıyla güncellendi."
                );
            } catch (error: any) {
                console.error(
                    "Grup yöneticisi güncellenemedi:",
                    error
                );

                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                if (
                    error.response
                        ?.status === 401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                    );
                } else if (
                    error.response
                        ?.status === 403
                ) {
                    setErrorMessage(
                        "Grup yöneticisini yalnızca Admin değiştirebilir."
                    );
                } else if (
                    backendMessage
                ) {
                    setErrorMessage(
                        backendMessage
                    );
                } else {
                    setErrorMessage(
                        "Grup yöneticisi güncellenirken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsUpdatingManager(
                    false
                );
            }
        };

    const handleShowUsers = async (
        group: GroupItem
    ) => {
        try {
            setSelectedGroup(group);
            setSelectedUserId("");
            setIsLoadingUsers(true);
            setGroupUsers([]);
            setSuccessMessage("");
            setErrorMessage("");

            await refreshSelectedGroupUsers(
                group.id
            );
        } catch (error: any) {
            console.error(
                "Grup üyeleri alınamadı:",
                error
            );

            if (
                error.response?.status ===
                401
            ) {
                setErrorMessage(
                    "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                );
            } else if (
                error.response?.status ===
                404
            ) {
                setErrorMessage(
                    "Grup bulunamadı."
                );
            } else {
                setErrorMessage(
                    "Grup üyeleri alınamadı."
                );
            }

            setSelectedGroup(null);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleCreateGroup =
        async () => {
            const trimmedName =
                newGroupName.trim();

            setSuccessMessage("");
            setErrorMessage("");

            if (!trimmedName) {
                setErrorMessage(
                    "Grup adı zorunludur."
                );

                return;
            }

            if (!selectedManagerId) {
                setErrorMessage(
                    "Grup yöneticisi seçmelisiniz."
                );

                return;
            }

            try {
                setIsCreatingGroup(
                    true
                );

                await api.post(
                    "/Groups",
                    {
                        name: trimmedName,
                        managerUserId:
                            selectedManagerId,
                    }
                );

                setCreateDialogOpen(
                    false
                );

                setNewGroupName("");
                setSelectedManagerId("");

                await loadGroups();

                setSuccessMessage(
                    "Grup başarıyla oluşturuldu."
                );
            } catch (error: any) {
                console.error(
                    "Grup oluşturulamadı:",
                    error
                );

                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                if (
                    error.response
                        ?.status === 401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                    );
                } else if (
                    error.response
                        ?.status === 403
                ) {
                    setErrorMessage(
                        "Grup oluşturmak için Admin veya Manager rolüne sahip olmanız gerekir."
                    );
                } else if (
                    error.response
                        ?.status === 409
                ) {
                    setErrorMessage(
                        backendMessage ||
                        "Bu isimde bir grup zaten bulunuyor."
                    );
                } else if (
                    backendMessage
                ) {
                    setErrorMessage(
                        backendMessage
                    );
                } else {
                    setErrorMessage(
                        "Grup oluşturulurken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsCreatingGroup(
                    false
                );
            }
        };

    const handleAddUserToGroup =
        async () => {
            if (!selectedGroup) {
                return;
            }

            if (!selectedUserId) {
                setErrorMessage(
                    "Gruba eklenecek kullanıcıyı seçiniz."
                );

                return;
            }

            try {
                setIsUpdatingMember(
                    true
                );

                setSuccessMessage("");
                setErrorMessage("");

                await api.post(
                    `/Groups/${selectedGroup.id}/users`,
                    {
                        userId:
                            selectedUserId,
                    }
                );

                await refreshSelectedGroupUsers(
                    selectedGroup.id
                );

                await loadGroups();

                setSelectedUserId("");

                setSuccessMessage(
                    "Kullanıcı gruba başarıyla eklendi."
                );
            } catch (error: any) {
                console.error(
                    "Kullanıcı gruba eklenemedi:",
                    error
                );

                const backendMessage =
                    error.response
                        ?.data
                        ?.message ||
                    error.response
                        ?.data
                        ?.title;

                if (
                    error.response
                        ?.status === 401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                    );
                } else if (
                    error.response
                        ?.status === 403
                ) {
                    setErrorMessage(
                        "Gruba kullanıcı eklemek için Admin veya Manager rolüne sahip olmanız gerekir."
                    );
                } else if (
                    backendMessage
                ) {
                    setErrorMessage(
                        backendMessage
                    );
                } else {
                    setErrorMessage(
                        "Kullanıcı gruba eklenirken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsUpdatingMember(
                    false
                );
            }
        };

    const handleRemoveUserFromGroup =
        async (
            userId: string
        ) => {
            if (!selectedGroup) {
                return;
            }

            try {
                setIsUpdatingMember(
                    true
                );

                setSuccessMessage("");
                setErrorMessage("");

                await api.delete(
                    `/Groups/${selectedGroup.id}/users/${userId}`
                );

                await refreshSelectedGroupUsers(
                    selectedGroup.id
                );

                await loadGroups();

                setSuccessMessage(
                    "Kullanıcı gruptan başarıyla çıkarıldı."
                );
            } catch (error: any) {
                console.error(
                    "Kullanıcı gruptan çıkarılamadı:",
                    error
                );

                if (
                    error.response
                        ?.status === 401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen çıkış yapıp yeniden giriş yapınız."
                    );
                } else if (
                    error.response
                        ?.status === 403
                ) {
                    setErrorMessage(
                        "Kullanıcıyı gruptan çıkarmak için Admin veya Manager rolüne sahip olmanız gerekir."
                    );
                } else if (
                    error.response
                        ?.status === 404
                ) {
                    setErrorMessage(
                        "Kullanıcı bu grupta bulunamadı."
                    );
                } else {
                    setErrorMessage(
                        "Kullanıcı gruptan çıkarılırken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsUpdatingMember(
                    false
                );
            }
        };

    const handleCloseCreateDialog =
        () => {
            if (isCreatingGroup) {
                return;
            }

            setCreateDialogOpen(
                false
            );

            setNewGroupName("");
            setSelectedManagerId("");
        };

    const handleCloseMembersDialog =
        () => {
            if (isUpdatingMember) {
                return;
            }

            setSelectedGroup(null);
            setSelectedUserId("");
            setGroupUsers([]);
        };

    const formatDate = (
        date: string
    ) => {
        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return "-";
        }

        return value.toLocaleDateString(
            "tr-TR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const availableUsers =
        allUsers.filter(
            (user) =>
                !groupUsers.some(
                    (groupUser) =>
                        groupUser.userId ===
                        user.id
                )
        );

    const managerUsers =
        allUsers.filter(
            (user) => {
                const userWithRoles =
                    user as UserWithRoles;

                return (
                    userWithRoles.role ===
                    "Manager" ||
                    userWithRoles.roles?.includes(
                        "Manager"
                    ) === true
                );
            }
        );

    const filteredGroups =
        useMemo(() => {
            const searchValue =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            if (!searchValue) {
                return groups;
            }

            return groups.filter(
                (group) =>
                    group.name
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            searchValue
                        ) ||
                    (
                        group.managerFullName ??
                        ""
                    )
                        .toLocaleLowerCase(
                            "tr-TR"
                        )
                        .includes(
                            searchValue
                        )
            );
        }, [
            groups,
            searchText,
        ]);

    const totalMembers =
        useMemo(() => {
            return groups.reduce(
                (
                    total,
                    group
                ) =>
                    total +
                    group.userCount,
                0
            );
        }, [groups]);

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

                color:
                    "text.primary",
            }}
        >
            {/* BAŞLIK */}

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

                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: {
                            xs: "stretch",
                            sm: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            sm: "row",
                        },
                        gap: 2,
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
                            Grup Yönetimi
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 0.9,
                                lineHeight: 1.7,
                                maxWidth: 700,
                            }}
                        >
                            Sistemdeki grupları, yöneticileri ve grup üyeliklerini yönetin.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        onClick={() => {
                            setSuccessMessage("");
                            setErrorMessage("");
                            setCreateDialogOpen(true);
                        }}
                        sx={{
                            width: {
                                xs: "100%",
                                sm: "auto",
                            },
                            minHeight: 44,
                            px: 2.4,
                            borderRadius: 2.3,
                            boxShadow: "none",
                            textTransform: "none",
                            fontWeight: 700,
                            backgroundColor: "#163A63",
                            "&:hover": {
                                backgroundColor: "#102F51",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Yeni Grup Oluştur
                    </Button>
                </Box>
            </Paper>

            {successMessage && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

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

            {/* ÖZET KARTLARI */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                    },

                    gap: 1.75,
                    mb: 2.5,
                }}
            >
                <SummaryCard
                    title="Toplam Grup"
                    value={String(
                        groups.length
                    )}
                    subtitle="Sistemde kayıtlı grup"
                    icon={
                        <GroupsRoundedIcon />
                    }
                    iconColor="#2563EB"
                    iconBackground="#EFF6FF"
                />

                <SummaryCard
                    title="Toplam Üyelik"
                    value={String(
                        totalMembers
                    )}
                    subtitle="Gruplardaki toplam üyelik"
                    icon={
                        <PeopleAltRoundedIcon />
                    }
                    iconColor="#16A34A"
                    iconBackground="#F0FDF4"
                />
            </Box>

            {/* ARAMA */}

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
                <TextField
                    placeholder="Grup veya yönetici ara..."
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
                        width: "100%",
                        maxWidth: "none",

                        "& .MuiOutlinedInput-root":
                        {
                            borderRadius:
                                2,
                        },
                    }}
                />
            </Paper>

            {/* GRUP LİSTESİ */}

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

                        gap: 2,

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
                            <GroupsRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Grup Listesi
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {
                                    filteredGroups.length
                                }{" "}
                                grup gösteriliyor
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
                ) : filteredGroups.length ===
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
                            <GroupsRoundedIcon
                                sx={{
                                    fontSize: 32,
                                }}
                            />
                        </Box>

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            Grup bulunamadı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Aramanıza uygun
                            bir grup bulunmuyor.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table
                            sx={{
                                minWidth: 800,
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
                                        Grup
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Oluşturulma Tarihi
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,

                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Üye Sayısı
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
                                {filteredGroups.map(
                                    (
                                        group
                                    ) => (
                                        <TableRow
                                            key={
                                                group.id
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
                                                    <Box
                                                        sx={{
                                                            width:
                                                                42,

                                                            height:
                                                                42,

                                                            borderRadius:
                                                                2,

                                                            flexShrink:
                                                                0,

                                                            display:
                                                                "flex",

                                                            alignItems:
                                                                "center",

                                                            justifyContent:
                                                                "center",

                                                            backgroundColor:
                                                                isDark
                                                                    ? "rgba(49,95,140,0.10)"
                                                                    : "#EEF4F8",

                                                            color:
                                                                "#315F8C",
                                                        }}
                                                    >
                                                        <GroupsRoundedIcon />
                                                    </Box>

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
                                                                group.name
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Grup #
                                                            {
                                                                group.id
                                                            }
                                                        </Typography>
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
                                                        alignItems:
                                                            "center",
                                                    }}
                                                >
                                                    <CalendarMonthRoundedIcon
                                                        sx={{
                                                            fontSize:
                                                                17,

                                                            color:
                                                                "text.disabled",
                                                        }}
                                                    />

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {formatDate(
                                                            group.createdAt
                                                        )}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                <Stack
                                                    spacing={0.75}
                                                >
                                                    <Chip
                                                        label={`${group.userCount} üye`}
                                                        size="small"
                                                        icon={
                                                            <PeopleAltRoundedIcon />
                                                        }
                                                        variant="outlined"
                                                        sx={{
                                                            width:
                                                                "fit-content",
                                                            fontWeight:
                                                                600,
                                                        }}
                                                    />

                                                    {group.managerUserId ? (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Yönetici:{" "}
                                                            {group.managerFullName ||
                                                                "Belirtilmedi"}
                                                        </Typography>
                                                    ) : (
                                                        <Chip
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                            label="Yönetici atanmadı"
                                                            sx={{
                                                                width:
                                                                    "fit-content",
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Stack
                                                    direction={{
                                                        xs:
                                                            "column",
                                                        md:
                                                            "row",
                                                    }}
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
                                                            <ManageAccountsRoundedIcon />
                                                        }
                                                        onClick={() =>
                                                            handleOpenManagerDialog(
                                                                group
                                                            )
                                                        }
                                                        sx={{
                                                            borderRadius:
                                                                2,

                                                            textTransform:
                                                                "none",

                                                            fontWeight:
                                                                600,

                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {group.managerUserId
                                                            ? "Yönetici Değiştir"
                                                            : "Yönetici Ata"}
                                                    </Button>

                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <VisibilityRoundedIcon />
                                                        }
                                                        onClick={() =>
                                                            void handleShowUsers(
                                                                group
                                                            )
                                                        }
                                                        sx={{
                                                            borderRadius:
                                                                2,

                                                            textTransform:
                                                                "none",

                                                            fontWeight:
                                                                600,

                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        Üyeleri Gör
                                                    </Button>
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

            {/* YENİ GRUP DIALOG */}

            <Dialog
                open={
                    createDialogOpen
                }
                onClose={
                    handleCloseCreateDialog
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
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        fontWeight: 800,
                    }}
                >
                    Yeni Grup Oluştur
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 2.5,
                            lineHeight: 1.7,
                        }}
                    >
                        Yeni grubunuz için
                        açıklayıcı ve benzersiz
                        bir grup adı belirleyin.
                    </Typography>

                    <TextField
                        autoFocus
                        fullWidth
                        required
                        label="Grup Adı"
                        placeholder="Örn. Hukuk Departmanı"
                        value={
                            newGroupName
                        }
                        onChange={(event) =>
                            setNewGroupName(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={(
                            event
                        ) => {
                            if (
                                event.key ===
                                "Enter" &&
                                newGroupName.trim() &&
                                !isCreatingGroup
                            ) {
                                event.preventDefault();

                                void handleCreateGroup();
                            }
                        }}
                        slotProps={{
                            htmlInput: {
                                maxLength:
                                    100,
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root":
                            {
                                borderRadius:
                                    2,
                            },
                        }}
                    />

                    <FormControl
                        fullWidth
                        required
                        sx={{
                            mt: 2,
                        }}
                    >
                        <InputLabel id="manager-select-label">
                            Grup Yöneticisi
                        </InputLabel>

                        <Select
                            labelId="manager-select-label"
                            label="Grup Yöneticisi"
                            value={
                                selectedManagerId
                            }
                            onChange={(event) =>
                                setSelectedManagerId(
                                    event.target.value
                                )
                            }
                            disabled={
                                isCreatingGroup
                            }
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value="">
                                Yönetici seçiniz
                            </MenuItem>

                            {managerUsers.map(
                                (user) => (
                                    <MenuItem
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.fullName}
                                        {" - "}
                                        {user.email}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Button
                        onClick={
                            handleCloseCreateDialog
                        }
                        disabled={
                            isCreatingGroup
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() =>
                            void handleCreateGroup()
                        }
                        disabled={
                            isCreatingGroup ||
                            !newGroupName.trim() ||
                            !selectedManagerId
                        }
                        startIcon={
                            !isCreatingGroup
                                ? <AddRoundedIcon />
                                : undefined
                        }
                        sx={{
                            borderRadius: 2,
                            boxShadow: "none",
                            textTransform:
                                "none",
                            fontWeight: 700,
                        }}
                    >
                        {isCreatingGroup
                            ? "Oluşturuluyor..."
                            : "Grubu Oluştur"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* GRUP YÖNETİCİSİ DIALOG */}

            <Dialog
                open={
                    managerDialogGroup !==
                    null
                }
                onClose={
                    handleCloseManagerDialog
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
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        fontWeight: 800,
                    }}
                >
                    {managerDialogGroup
                        ?.managerUserId
                        ? "Grup Yöneticisini Değiştir"
                        : "Grup Yöneticisi Ata"}
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 2.5,
                            lineHeight: 1.7,
                        }}
                    >
                        {managerDialogGroup
                            ?.name}{" "}
                        grubu için Manager rolüne
                        sahip bir kullanıcı seçin.
                        Seçilen yönetici grupta
                        değilse otomatik olarak
                        gruba eklenecektir.
                    </Typography>

                    <FormControl
                        fullWidth
                        required
                    >
                        <InputLabel id="update-manager-select-label">
                            Grup Yöneticisi
                        </InputLabel>

                        <Select
                            labelId="update-manager-select-label"
                            label="Grup Yöneticisi"
                            value={
                                updateManagerUserId
                            }
                            onChange={(event) =>
                                setUpdateManagerUserId(
                                    event.target.value
                                )
                            }
                            disabled={
                                isUpdatingManager
                            }
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value="">
                                Yönetici seçiniz
                            </MenuItem>

                            {managerUsers.map(
                                (user) => (
                                    <MenuItem
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.fullName}
                                        {" - "}
                                        {user.email}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>

                    {managerUsers.length ===
                        0 && (
                            <Alert
                                severity="warning"
                                sx={{
                                    mt: 2,
                                    borderRadius:
                                        2,
                                }}
                            >
                                Manager rolüne sahip
                                kullanıcı bulunamadı.
                            </Alert>
                        )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Button
                        onClick={
                            handleCloseManagerDialog
                        }
                        disabled={
                            isUpdatingManager
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            !isUpdatingManager
                                ? <ManageAccountsRoundedIcon />
                                : undefined
                        }
                        onClick={() =>
                            void handleUpdateManager()
                        }
                        disabled={
                            isUpdatingManager ||
                            !updateManagerUserId
                        }
                        sx={{
                            borderRadius: 2,
                            boxShadow: "none",
                            textTransform:
                                "none",
                            fontWeight: 700,
                        }}
                    >
                        {isUpdatingManager
                            ? "Kaydediliyor..."
                            : "Yöneticiyi Kaydet"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* GRUP ÜYELERİ DIALOG */}

            <Dialog
                open={
                    selectedGroup !==
                    null
                }
                onClose={
                    handleCloseMembersDialog
                }
                fullWidth
                maxWidth="md"
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
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{
                            alignItems:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,

                                borderRadius: 2,

                                display: "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                backgroundColor:
                                    "action.hover",

                                color:
                                    "primary.main",
                            }}
                        >
                            <GroupsRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight:
                                        800,
                                }}
                            >
                                {selectedGroup
                                    ? selectedGroup.name
                                    : "Grup Üyeleri"}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Grup üyelerini
                                görüntüleyin ve
                                yönetin
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mt: 1,
                            mb: 3,

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
                                mb: 1.5,
                                fontWeight:
                                    700,
                            }}
                        >
                            Gruba Kullanıcı Ekle
                        </Typography>

                        <Box
                            sx={{
                                display:
                                    "flex",

                                gap: 1.5,

                                flexDirection:
                                {
                                    xs:
                                        "column",

                                    sm:
                                        "row",
                                },
                            }}
                        >
                            <FormControl
                                fullWidth
                            >
                                <InputLabel id="user-select-label">
                                    Kullanıcı
                                </InputLabel>

                                <Select
                                    labelId="user-select-label"
                                    label="Kullanıcı"
                                    value={
                                        selectedUserId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSelectedUserId(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        isUpdatingMember
                                    }
                                    sx={{
                                        borderRadius:
                                            2,
                                    }}
                                >
                                    <MenuItem value="">
                                        Kullanıcı seçiniz
                                    </MenuItem>

                                    {availableUsers.map(
                                        (
                                            user
                                        ) => (
                                            <MenuItem
                                                key={
                                                    user.id
                                                }
                                                value={
                                                    user.id
                                                }
                                            >
                                                {
                                                    user.fullName
                                                }{" "}
                                                -{" "}
                                                {
                                                    user.email
                                                }
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                onClick={() =>
                                    void handleAddUserToGroup()
                                }
                                disabled={
                                    isUpdatingMember ||
                                    !selectedUserId
                                }
                                startIcon={
                                    !isUpdatingMember
                                        ? <PersonAddAlt1RoundedIcon />
                                        : undefined
                                }
                                sx={{
                                    minWidth: {
                                        xs:
                                            "100%",

                                        sm:
                                            160,
                                    },

                                    borderRadius:
                                        2,

                                    boxShadow:
                                        "none",

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        700,
                                }}
                            >
                                {isUpdatingMember
                                    ? "İşleniyor..."
                                    : "Gruba Ekle"}
                            </Button>
                        </Box>
                    </Paper>

                    {isLoadingUsers ? (
                        <Box
                            sx={{
                                display:
                                    "flex",

                                justifyContent:
                                    "center",

                                py: 5,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : groupUsers.length ===
                        0 ? (
                        <Box
                            sx={{
                                py: 5,

                                textAlign:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,

                                    mx: "auto",
                                    mb: 1.5,

                                    borderRadius:
                                        "50%",

                                    display:
                                        "flex",

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
                                        fontSize:
                                            30,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Henüz üye yok
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                }}
                            >
                                Yukarıdaki alandan
                                bu gruba kullanıcı
                                ekleyebilirsiniz.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer
                            sx={{
                                border:
                                    "1px solid",

                                borderColor:
                                    "divider",

                                borderRadius:
                                    2.5,
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow
                                        sx={{
                                            backgroundColor:
                                                "action.hover",
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
                                            E-posta
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
                                    {groupUsers.map(
                                        (
                                            user
                                        ) => (
                                            <TableRow
                                                key={
                                                    user.userId
                                                }
                                                hover
                                            >
                                                <TableCell>
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
                                                        <Avatar
                                                            sx={{
                                                                width:
                                                                    36,

                                                                height:
                                                                    36,

                                                                bgcolor:
                                                                    "#163A63",

                                                                fontSize:
                                                                    14,

                                                                fontWeight:
                                                                    700,
                                                            }}
                                                        >
                                                            {user.fullName
                                                                .trim()
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase() ||
                                                                "K"}
                                                        </Avatar>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight:
                                                                    600,
                                                            }}
                                                        >
                                                            {
                                                                user.fullName
                                                            }

                                                            {user.isManager && (
                                                                <Chip
                                                                    label="Yönetici"
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        ml: 1,
                                                                    }}
                                                                />
                                                            )}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            user.email
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Button
                                                        color="error"
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            <PersonRemoveRoundedIcon />
                                                        }
                                                        onClick={() =>
                                                            void handleRemoveUserFromGroup(
                                                                user.userId
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdatingMember ||
                                                            user.isManager
                                                        }
                                                        sx={{
                                                            borderRadius:
                                                                2,

                                                            textTransform:
                                                                "none",

                                                            fontWeight:
                                                                600,
                                                        }}
                                                    >
                                                        Gruptan Çıkar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Button
                        onClick={
                            handleCloseMembersDialog
                        }
                        disabled={
                            isUpdatingMember
                        }
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            boxShadow: "none",
                            textTransform:
                                "none",
                        }}
                    >
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

interface SummaryCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconColor: string;
    iconBackground: string;
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    iconColor,
    iconBackground,
}: SummaryCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,

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
                    display: "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "space-between",

                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        minWidth: 0,
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
                        {title}
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            mt: 0.5,

                            fontWeight: 800,
                        fontSize: 30,

                            letterSpacing:
                                "-0.03em",
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display:
                                "block",

                            mt: 0.25,

                            overflow:
                                "hidden",

                            textOverflow:
                                "ellipsis",

                            whiteSpace:
                                "nowrap",
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 36,
                        height: 36,

                        flexShrink: 0,

                        borderRadius:
                            2.5,

                        display: "flex",

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

                        "& svg": {
                            fontSize:
                                23,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

export default GroupsPage;
