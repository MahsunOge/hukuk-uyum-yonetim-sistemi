import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import api from "../api/axios";

import type {
    CreateTaskRequest,
} from "../types/CreateTaskRequest";

import type {
    Group,
} from "../types/Group";

import {
    getCurrentUserRoles,
} from "../utils/auth";

interface GroupUser {
    userId: string;
    fullName: string;
    email: string;
    isManager: boolean;
}

interface ManagedLeaveItem {
    userId: string;
    status: number;
    startDate: string;
    endDate: string;
}

interface WorkloadTaskItem {
    id: number;
    status: number;
    assignedUserId: string | null;
}

function CreateTaskPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const roles =
        getCurrentUserRoles();

    const hasDelegatedManagerAccess =
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true";

    const isManager =
        (
            roles.includes("Manager") ||
            (
                roles.includes("Employee") &&
                hasDelegatedManagerAccess
            )
        ) &&
        !roles.includes("Admin");

    const [
        title,
        setTitle,
    ] = useState("");

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        priority,
        setPriority,
    ] = useState<number>(2);

    const [
        assignedGroup,
        setAssignedGroup,
    ] = useState("");

    const [
        assignedUser,
        setAssignedUser,
    ] = useState("");

    const [
        dueDate,
        setDueDate,
    ] = useState("");

    const [
        groups,
        setGroups,
    ] = useState<Group[]>([]);

    const [
        groupUsers,
        setGroupUsers,
    ] = useState<GroupUser[]>([]);

    const [
        onLeaveUserIds,
        setOnLeaveUserIds,
    ] = useState<string[]>([]);

    const [
        workloadTasks,
        setWorkloadTasks,
    ] = useState<
        WorkloadTaskItem[]
    >([]);

    const [
        isLoadingData,
        setIsLoadingData,
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    useEffect(() => {
        const loadFormData =
            async () => {
                try {
                    setIsLoadingData(true);
                    setErrorMessage("");

                    const groupsResponse =
                        await api.get<Group[]>(
                            "/Groups"
                        );

                    const loadedGroups =
                        groupsResponse.data;

                    setGroups(
                        loadedGroups
                    );

                    if (isManager) {
                        if (
                            loadedGroups.length ===
                            0
                        ) {
                            setErrorMessage(
                                "Yönetici veya aktif vekil olarak erişebildiğiniz bir grup bulunamadı."
                            );

                            return;
                        }

                        const managerGroup =
                            loadedGroups[0];

                        setAssignedGroup(
                            String(
                                managerGroup.id
                            )
                        );

                        const [
                            usersResponse,
                            leavesResponse,
                            tasksResponse,
                        ] =
                            await Promise.all([
                                api.get<
                                    GroupUser[]
                                >(
                                    `/Groups/${managerGroup.id}/users`
                                ),
                                api.get<
                                    ManagedLeaveItem[]
                                >(
                                    "/LeaveRequests/managed-group"
                                ),
                                api.get<
                                    WorkloadTaskItem[]
                                >(
                                    "/Tasks"
                                ),
                            ]);

                        setGroupUsers(
                            usersResponse.data
                        );

                        setWorkloadTasks(
                            tasksResponse.data
                        );

                        const today =
                            new Date();

                        today.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        const leaveUserIds =
                            leavesResponse.data
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
                                );

                        setOnLeaveUserIds(
                            leaveUserIds
                        );
                    }
                } catch (error) {
                    console.error(
                        "Görev atama bilgileri alınamadı:",
                        error
                    );

                    setErrorMessage(
                        "Görev atama bilgileri backend üzerinden alınamadı."
                    );
                } finally {
                    setIsLoadingData(
                        false
                    );
                }
            };

        void loadFormData();
    }, [isManager]);

    const getPriorityStyle = (
        value: number
    ) => {
        switch (value) {
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
                return {};
        }
    };

    const getActiveTaskCount =
        (userId: string) =>
            workloadTasks.filter(
                (task) =>
                    task.assignedUserId ===
                    userId &&
                    task.status !==
                    4 &&
                    task.status !==
                    5
            ).length;

    const getWorkloadLabel =
        (userId: string) => {
            const count =
                getActiveTaskCount(
                    userId
                );

            if (count === 0) {
                return "Aktif görev yok";
            }

            if (count <= 2) {
                return `${count} aktif görev • Düşük iş yükü`;
            }

            if (count <= 5) {
                return `${count} aktif görev • Orta iş yükü`;
            }

            return `${count} aktif görev • Yoğun`;
        };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority(2);
        setAssignedUser("");
        setDueDate("");

        if (!isManager) {
            setAssignedGroup("");
        }
    };

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!title.trim()) {
            setErrorMessage(
                "Görev başlığı zorunludur."
            );

            return;
        }

        if (isManager) {
            if (!assignedUser) {
                setErrorMessage(
                    "Görevin atanacağı kişiyi seçiniz."
                );

                return;
            }
        } else {
            if (!assignedGroup) {
                setErrorMessage(
                    "Görevin atanacağı grubu seçiniz."
                );

                return;
            }
        }

        const request:
            CreateTaskRequest = {
            title:
                title.trim(),

            description:
                description.trim()
                    ? description.trim()
                    : null,

            priority,

            dueDate:
                dueDate
                    ? `${dueDate}T00:00:00`
                    : null,

            assignedUserId:
                isManager
                    ? assignedUser
                    : null,

            assignedGroupId:
                isManager
                    ? null
                    : Number(
                        assignedGroup
                    ),
        };

        try {
            setIsSubmitting(true);

            await api.post(
                "/Tasks",
                request
            );

            setSuccessMessage(
                "Görev başarıyla oluşturuldu."
            );

            resetForm();
        } catch (error: any) {
            console.error(
                "Görev oluşturulamadı:",
                error
            );

            const backendMessage =
                error.response?.data
                    ?.message ||
                error.response?.data
                    ?.title;

            if (
                error.response?.status ===
                401
            ) {
                setErrorMessage(
                    "Oturum süresi dolmuş olabilir. Lütfen yeniden giriş yapınız."
                );
            } else if (
                error.response?.status ===
                403
            ) {
                setErrorMessage(
                    backendMessage ||
                    "Bu kullanıcıya görev atama yetkiniz bulunmamaktadır."
                );
            } else if (
                backendMessage
            ) {
                setErrorMessage(
                    backendMessage
                );
            } else {
                setErrorMessage(
                    "Görev oluşturulurken bir hata meydana geldi."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
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
                        right: -110,
                        top: -175,
                        backgroundColor: isDark
                            ? "rgba(49,95,140,0.07)"
                            : "rgba(49,95,140,0.04)",
                    }}
                />

                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    spacing={2.5}
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        justifyContent: "space-between",
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 26,
                                    sm: 30,
                                },
                                fontWeight: 800,
                                lineHeight: 1.2,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Yeni Görev Oluştur
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 1,
                                maxWidth: 720,
                                lineHeight: 1.7,
                            }}
                        >
                            {isManager
                                ? "Görev bilgilerini belirleyin ve yönetici yetkiniz bulunan gruptaki ilgili kullanıcıya atayın."
                                : "Görev bilgilerini belirleyin ve ilgili çalışma grubuna yönlendirin."}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#315F8C",
                            backgroundColor: isDark
                                ? "rgba(49,95,140,0.14)"
                                : "#EAF1F7",
                        }}
                    >
                        <AddTaskRoundedIcon />
                    </Box>
                </Stack>
            </Paper>

            {successMessage && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2.25,
                        borderRadius: 2.5,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2.25,
                        borderRadius: 2.5,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {isLoadingData && (
                <Alert
                    severity="info"
                    icon={
                        <CircularProgress
                            size={20}
                        />
                    }
                    sx={{
                        mb: 2.25,
                        borderRadius: 2.5,
                    }}
                >
                    Görev atama bilgileri yükleniyor.
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "minmax(0, 1fr) 330px",
                        xl: "minmax(0, 1fr) 360px",
                    },
                    gap: {
                        xs: 2,
                        lg: 2.5,
                    },
                    alignItems: "start",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2.2,
                            sm: 2.7,
                            lg: 3,
                        },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3.2,
                        backgroundColor: "background.paper",
                        minHeight: {
                            xs: "auto",
                            lg: "auto",
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{
                            mb: 2.7,
                            alignItems: "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2.3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#315F8C",
                                backgroundColor: isDark
                                    ? "rgba(49,95,140,0.12)"
                                    : "#EEF4F8",
                            }}
                        >
                            <AssignmentRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 750,
                                }}
                            >
                                Görev Bilgileri
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Görevin temel detaylarını eksiksiz giriniz.
                            </Typography>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                md: "minmax(0, 1fr) minmax(220px, 0.45fr)",
                            },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="Görev Başlığı"
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                htmlInput: {
                                    maxLength: 200,
                                },
                            }}
                            required
                            fullWidth
                            sx={{
                                gridColumn: {
                                    md: "1 / -1",
                                },
                            }}
                        />

                        <TextField
                            label="Açıklama"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                htmlInput: {
                                    maxLength: 2000,
                                },
                            }}
                            multiline
                            minRows={5}
                            fullWidth
                            sx={{
                                gridColumn: {
                                    md: "1 / -1",
                                },
                            }}
                        />

                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Öncelik
                            </InputLabel>

                            <Select
                                value={priority}
                                label="Öncelik"
                                onChange={(event) =>
                                    setPriority(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            >
                                <MenuItem value={1}>
                                    Düşük
                                </MenuItem>

                                <MenuItem value={2}>
                                    Orta
                                </MenuItem>

                                <MenuItem value={3}>
                                    Yüksek
                                </MenuItem>

                                <MenuItem value={4}>
                                    Kritik
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Bitiş Tarihi"
                            type="date"
                            value={dueDate}
                            onChange={(event) =>
                                setDueDate(
                                    event.target.value
                                )
                            }
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            fullWidth
                        />

                        <Box
                            sx={{
                                gridColumn: {
                                    md: "1 / -1",
                                },
                                mt: 0.4,
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "block",
                                    mb: 0.9,
                                    fontWeight: 600,
                                }}
                            >
                                Seçili Öncelik
                            </Typography>

                            <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.7,
                                    px: 1.2,
                                    py: 0.7,
                                    border: "1px solid",
                                    borderRadius: 1.8,
                                    ...getPriorityStyle(
                                        priority
                                    ),
                                }}
                            >
                                <FlagRoundedIcon
                                    sx={{
                                        fontSize: 16,
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 800,
                                    }}
                                >
                                    {priority === 1
                                        ? "Düşük"
                                        : priority === 2
                                            ? "Orta"
                                            : priority === 3
                                                ? "Yüksek"
                                                : "Kritik"}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Stack
                    spacing={2}
                    sx={{
                        minHeight: {
                            xs: "auto",
                            lg: "auto",
                        },
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3.2,
                            backgroundColor: "background.paper",
                            
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.1}
                            sx={{
                                mb: 2.2,
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2.1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#315F8C",
                                    backgroundColor: isDark
                                        ? "rgba(49,95,140,0.12)"
                                        : "#EEF4F8",
                                }}
                            >
                                {isManager
                                    ? <PersonRoundedIcon />
                                    : <GroupRoundedIcon />}
                            </Box>

                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 750,
                                    }}
                                >
                                    Görev Ataması
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {isManager
                                        ? "Grubunuzdaki kullanıcıya atayın."
                                        : "İlgili çalışma grubuna yönlendirin."}
                                </Typography>
                            </Box>
                        </Stack>

                        {isManager ? (
                            <FormControl
                                fullWidth
                                required
                            >
                                <InputLabel>
                                    Atanan Kişi
                                </InputLabel>

                                <Select
                                    value={assignedUser}
                                    label="Atanan Kişi"
                                    disabled={isLoadingData}
                                    onChange={(event) =>
                                        setAssignedUser(
                                            event.target.value
                                        )
                                    }
                                    MenuProps={{
                                        slotProps: {
                                            paper: {
                                                sx: {
                                                    mt: 1,
                                                    maxHeight: 360,
                                                    borderRadius: 2.5,
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                    boxShadow:
                                                        "0 12px 32px rgba(15, 23, 42, 0.14)",
                                                    p: 0.75,
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="">
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Kişi seçiniz
                                        </Typography>
                                    </MenuItem>

                                    {groupUsers
                                        .filter(
                                            (user) =>
                                                !user.isManager
                                        )
                                        .map(
                                            (user) => {
                                                const isOnLeave =
                                                    onLeaveUserIds.includes(
                                                        user.userId
                                                    );

                                                return (
                                                    <MenuItem
                                                        key={
                                                            user.userId
                                                        }
                                                        value={
                                                            user.userId
                                                        }
                                                        disabled={
                                                            isOnLeave
                                                        }
                                                    >
                                                        <PersonRoundedIcon
                                                            sx={{
                                                                mr: 1.5,
                                                                fontSize: 20,
                                                                color: "#315F8C",
                                                                opacity: isOnLeave
                                                                    ? 0.35
                                                                    : 0.8,
                                                            }}
                                                        />

                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 650,
                                                                }}
                                                            >
                                                                {user.fullName}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color={
                                                                    isOnLeave
                                                                        ? "warning.main"
                                                                        : "text.secondary"
                                                                }
                                                                sx={{
                                                                    fontWeight:
                                                                        isOnLeave
                                                                            ? 700
                                                                            : 400,
                                                                }}
                                                            >
                                                                {user.email}
                                                                {isOnLeave
                                                                    ? " • Şu anda izinde"
                                                                    : ` • ${getWorkloadLabel(
                                                                        user.userId
                                                                    )}`}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                );
                                            }
                                        )}
                                </Select>
                            </FormControl>
                        ) : (
                            <FormControl
                                fullWidth
                                required
                            >
                                <InputLabel>
                                    Atanan Grup
                                </InputLabel>

                                <Select
                                    value={assignedGroup}
                                    label="Atanan Grup"
                                    disabled={isLoadingData}
                                    onChange={(event) =>
                                        setAssignedGroup(
                                            event.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="">
                                        Grup seçiniz
                                    </MenuItem>

                                    {groups.map(
                                        (group) => (
                                            <MenuItem
                                                key={group.id}
                                                value={String(
                                                    group.id
                                                )}
                                            >
                                                <GroupRoundedIcon
                                                    sx={{
                                                        mr: 1.5,
                                                        fontSize: 20,
                                                        color: "#315F8C",
                                                        opacity: 0.8,
                                                    }}
                                                />

                                                {group.name}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        )}

                        <Box
                            sx={{
                                mt: 2.2,
                                p: 1.6,
                                borderRadius: 2.2,
                                backgroundColor: isDark
                                    ? "rgba(49,95,140,0.06)"
                                    : "#F7FAFC",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    alignItems: "flex-start",
                                }}
                            >
                                <InfoOutlinedIcon
                                    sx={{
                                        mt: 0.1,
                                        fontSize: 18,
                                        color: "#64748B",
                                    }}
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        lineHeight: 1.65,
                                    }}
                                >
                                    {isManager
                                        ? "Manager olarak görev doğrudan seçtiğiniz grup üyesine atanacaktır."
                                        : "Admin tarafından oluşturulan görev önce seçilen gruba atanır. Grup yöneticisi daha sonra görevi kendi grubundaki kullanıcıya dağıtabilir."}
                                </Typography>
                            </Stack>
                        </Box>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3.2,
                            backgroundColor: "background.paper",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.1}
                            sx={{
                                alignItems: "center",
                                mb: 1.4,
                            }}
                        >
                            <CheckCircleOutlineRoundedIcon
                                sx={{
                                    color: "#4F765E",
                                    fontSize: 20,
                                }}
                            />

                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 750,
                                }}
                            >
                                Görevi Kaydet
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                lineHeight: 1.65,
                                mb: 2,
                            }}
                        >
                            Başlangıç tarihi görev oluşturulduğu anda otomatik olarak belirlenecektir.
                        </Typography>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={
                                isSubmitting ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <AddTaskRoundedIcon />
                                )
                            }
                            disabled={
                                isSubmitting ||
                                isLoadingData ||
                                (
                                    isManager
                                        ? !assignedUser
                                        : !assignedGroup
                                )
                            }
                            sx={{
                                minHeight: 46,
                                borderRadius: 2.3,
                                textTransform: "none",
                                fontWeight: 750,
                                backgroundColor: "#163A63",
                                boxShadow: "none",
                                "&:hover": {
                                    backgroundColor: "#102F51",
                                    boxShadow: "none",
                                },
                            }}
                        >
                            {isSubmitting
                                ? "Kaydediliyor..."
                                : "Görevi Oluştur"}
                        </Button>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );
}

export default CreateTaskPage;
