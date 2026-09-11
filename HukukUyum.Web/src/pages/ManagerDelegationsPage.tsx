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
    MenuItem,
    Paper,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import api from "../api/axios";

import {
    getCurrentUserRoles,
} from "../utils/auth";

interface DelegationItem {
    id: number;
    groupId: number;
    groupName: string;
    originalManagerUserId: string;
    originalManagerFullName: string;
    delegateUserId: string;
    delegateUserFullName: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isCurrentlyEffective: boolean;
    createdAt: string;
    createdByUserId: string;
    createdByUserFullName: string;
}

interface EmployeeOption {
    userId: string;
    fullName: string;
    email: string | null;
}

interface GroupOption {
    groupId: number;
    groupName: string;
    managerUserId: string;
    managerFullName: string;
    employees: EmployeeOption[];
}

interface DelegationOptions {
    groups: GroupOption[];
}

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

const getDaysUntilEnd =
    (value: string) => {
        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        const end =
            new Date(
                value
            );

        end.setHours(
            0,
            0,
            0,
            0
        );

        return Math.ceil(
            (
                end.getTime() -
                today.getTime()
            ) /
            86400000
        );
    };

function ManagerDelegationsPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const roles =
        getCurrentUserRoles();

    const isAdmin =
        roles.includes("Admin");

    const [
        delegations,
        setDelegations,
    ] =
        useState<
            DelegationItem[]
        >([]);

    const [
        options,
        setOptions,
    ] =
        useState<
            DelegationOptions
        >({
            groups: [],
        });

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] =
        useState(false);

    const [
        dialogOpen,
        setDialogOpen,
    ] =
        useState(false);

    const [
        groupId,
        setGroupId,
    ] =
        useState("");

    const [
        delegateUserId,
        setDelegateUserId,
    ] =
        useState("");

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
        errorMessage,
        setErrorMessage,
    ] =
        useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] =
        useState("");

    const loadData =
        async () => {
            try {
                setIsLoading(
                    true
                );

                setErrorMessage(
                    ""
                );

                const [
                    delegationResponse,
                    optionsResponse,
                ] =
                    await Promise.all([
                        isAdmin
                            ? api.get<
                                DelegationItem[]
                            >(
                                "/ManagerDelegations"
                            )
                            : api.get<
                                DelegationItem[]
                            >(
                                "/ManagerDelegations/my"
                            ),

                        api.get<
                            DelegationOptions
                        >(
                            "/ManagerDelegations/options"
                        ),
                    ]);

                setDelegations(
                    delegationResponse.data
                );

                setOptions(
                    optionsResponse.data
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
                    "Vekalet bilgileri yüklenemedi."
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

    const selectedGroup =
        useMemo(
            () =>
                options.groups.find(
                    (group) =>
                        group.groupId ===
                        Number(
                            groupId
                        )
                ) ??
                null,
            [
                groupId,
                options.groups,
            ]
        );

    const activeCount =
        delegations.filter(
            (item) =>
                item.isCurrentlyEffective
        ).length;

    const plannedCount =
        delegations.filter(
            (item) =>
                item.isActive &&
                !item.isCurrentlyEffective &&
                new Date(
                    item.startDate
                ).getTime() >
                Date.now()
        ).length;

    const expiringSoon =
        useMemo(
            () =>
                delegations.filter(
                    (item) => {
                        if (
                            !item.isActive ||
                            !item.isCurrentlyEffective
                        ) {
                            return false;
                        }

                        const days =
                            getDaysUntilEnd(
                                item.endDate
                            );

                        return (
                            days >= 0 &&
                            days <= 2
                        );
                    }
                ),
            [
                delegations,
            ]
        );

    const resetForm =
        () => {
            setGroupId(
                ""
            );

            setDelegateUserId(
                ""
            );

            setStartDate(
                ""
            );

            setEndDate(
                ""
            );
        };

    const handleCreate =
        async () => {
            if (
                !groupId ||
                !delegateUserId ||
                !startDate ||
                !endDate
            ) {
                setErrorMessage(
                    "Grup, vekil çalışan ve tarih aralığı zorunludur."
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

                await api.post(
                    "/ManagerDelegations",
                    {
                        groupId:
                            Number(
                                groupId
                            ),
                        delegateUserId,
                        startDate,
                        endDate,
                    }
                );

                setDialogOpen(
                    false
                );

                resetForm();

                await loadData();

                setSuccessMessage(
                    "Yönetici vekaleti başarıyla oluşturuldu."
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
                    "Vekalet oluşturulamadı."
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };

    const handleEnd =
        async (
            id: number
        ) => {
            try {
                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.patch(
                    `/ManagerDelegations/${id}/end`
                );

                await loadData();

                setSuccessMessage(
                    "Vekalet başarıyla sona erdirildi."
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
                    "Vekalet sona erdirilemedi."
                );
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
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    position:
                        "relative",
                    overflow:
                        "hidden",
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
                    display:
                        "flex",
                    alignItems:
                        "center",
                    border:
                        "1px solid",
                    borderColor:
                        "divider",
                    borderRadius:
                        3.5,
                    background:
                        isDark
                            ? "linear-gradient(105deg, #111827 0%, #101B2B 58%, #172033 100%)"
                            : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 58%, #EEF3F7 100%)",
                }}
            >
                <Box
                    sx={{
                        position:
                            "absolute",
                        width: 300,
                        height: 300,
                        borderRadius:
                            "50%",
                        right: -120,
                        top: -175,
                        backgroundColor:
                            isDark
                                ? "rgba(49,95,140,0.07)"
                                : "rgba(49,95,140,0.04)",
                    }}
                />

                <Box
                    sx={{
                        width: "100%",
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
                        position:
                            "relative",
                        zIndex: 1,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-0.03em",
                            }}
                        >
                            Yönetici Vekaletleri
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 0.9,
                                lineHeight:
                                    1.7,
                                maxWidth:
                                    760,
                            }}
                        >
                            {isAdmin
                                ? "Grup bazlı geçici yönetici vekaletlerini istediğiniz tarih aralığı için oluşturun ve takip edin."
                                : "İhtiyaç duyduğunuz herhangi bir tarih aralığı için kendi grubunuzdan geçici bir yönetici vekili belirleyin."}
                        </Typography>
                    </Box>

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

                            setDialogOpen(
                                true
                            );
                        }}
                        disabled={
                            options.groups
                                .length ===
                            0
                        }
                        sx={{
                            minHeight:
                                44,
                            px: 2.4,
                            borderRadius:
                                2.3,
                            boxShadow:
                                "none",
                            textTransform:
                                "none",
                            fontWeight:
                                700,
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
                        Vekil Belirle
                    </Button>
                </Box>
            </Paper>

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

            {expiringSoon.length >
                0 && (
                    <Alert
                        severity="warning"
                        icon={
                            <WarningAmberRoundedIcon />
                        }
                        sx={{
                            mb: 2.5,
                            borderRadius:
                                2.7,
                            border:
                                "1px solid",
                            borderColor:
                                "rgba(183,121,31,0.25)",
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight:
                                    800,
                            }}
                        >
                            {expiringSoon.length} aktif vekaletin süresi 2 gün içinde sona erecek.
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Gerekliyse yeni vekalet planını şimdiden oluşturun.
                        </Typography>
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
                            "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.75,
                    mb: 2.5,
                }}
            >
                {[
                    {
                        title:
                            "Toplam Vekalet",
                        value:
                            delegations.length,
                        icon:
                            <GroupsRoundedIcon />,
                    },
                    {
                        title:
                            "Şu Anda Aktif",
                        value:
                            activeCount,
                        icon:
                            <AdminPanelSettingsRoundedIcon />,
                    },
                    {
                        title:
                            "Planlanan",
                        value:
                            plannedCount,
                        icon:
                            <EventAvailableRoundedIcon />,
                    },
                ].map(
                    (item) => (
                        <Paper
                            key={
                                item.title
                            }
                            elevation={
                                0
                            }
                            sx={{
                                p: 2.3,
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius:
                                    3,
                            }}
                        >
                            <Box
                                sx={{
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
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontWeight:
                                                650,
                                        }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="h4"
                                        sx={{
                                            mt: 0.5,
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        {item.value}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
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
                                    }}
                                >
                                    {item.icon}
                                </Box>
                            </Box>
                        </Paper>
                    )
                )}
            </Box>

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
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2.2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                800,
                        }}
                    >
                        Vekalet Kayıtları
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.35,
                        }}
                    >
                        Aktif, planlanmış ve geçmiş vekalet kayıtları burada görüntülenir.
                    </Typography>
                </Box>

                <Divider />

                {isLoading ? (
                    <Box
                        sx={{
                            minHeight:
                                260,
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
                ) : delegations.length ===
                    0 ? (
                    <Box
                        sx={{
                            py: 7,
                            textAlign:
                                "center",
                        }}
                    >
                        <AdminPanelSettingsRoundedIcon
                            sx={{
                                fontSize:
                                    48,
                                color:
                                    "text.disabled",
                            }}
                        />

                        <Typography
                            sx={{
                                mt: 1,
                                fontWeight:
                                    750,
                            }}
                        >
                            Henüz vekalet kaydı yok
                        </Typography>
                    </Box>
                ) : (
                    delegations.map(
                        (
                            item,
                            index
                        ) => (
                            <Box
                                key={
                                    item.id
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
                                                "1fr 1fr 1.1fr 1fr auto",
                                        },
                                        gap: 2,
                                        alignItems:
                                            "center",
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
                                            Grup
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 0.3,
                                                fontWeight:
                                                    750,
                                            }}
                                        >
                                            {item.groupName}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Asıl Yönetici
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 0.3,
                                                fontWeight:
                                                    650,
                                            }}
                                        >
                                            {item.originalManagerFullName}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Vekil
                                        </Typography>

                                        <Box
                                            sx={{
                                                mt: 0.3,
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: 0.7,
                                            }}
                                        >
                                            <PersonRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        17,
                                                    color:
                                                        "text.secondary",
                                                }}
                                            />

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight:
                                                        750,
                                                }}
                                            >
                                                {item.delegateUserFullName}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Vekalet Dönemi
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 0.3,
                                                fontWeight:
                                                    650,
                                            }}
                                        >
                                            {formatDate(
                                                item.startDate
                                            )}
                                            {" – "}
                                            {formatDate(
                                                item.endDate
                                            )}
                                        </Typography>

                                        <Chip
                                            size="small"
                                            label={
                                                item.isCurrentlyEffective
                                                    ? "Aktif"
                                                    : item.isActive
                                                        ? "Planlandı"
                                                        : "Sona Erdi"
                                            }
                                            sx={{
                                                mt: 0.75,
                                                fontWeight:
                                                    700,
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        {item.isActive && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={
                                                    <StopCircleRoundedIcon />
                                                }
                                                onClick={() =>
                                                    void handleEnd(
                                                        item.id
                                                    )
                                                }
                                                sx={{
                                                    borderRadius:
                                                        2,
                                                    textTransform:
                                                        "none",
                                                    fontWeight:
                                                        700,
                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                Sona Erdir
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )
                    )
                )}
            </Paper>

            <Dialog
                open={
                    dialogOpen
                }
                onClose={() => {
                    if (
                        !isSubmitting
                    ) {
                        setDialogOpen(
                            false
                        );

                        resetForm();
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
                        Vekil Belirle
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Vekalet tarih aralığını belirleyin. Vekaleti daha sonra istediğiniz zaman sona erdirebilirsiniz.
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
                            label="Grup"
                            value={
                                groupId
                            }
                            onChange={(
                                event
                            ) => {
                                setGroupId(
                                    event.target.value
                                );

                                setDelegateUserId(
                                    ""
                                );
                            }}
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
                        >
                            {options.groups.map(
                                (
                                    group
                                ) => (
                                    <MenuItem
                                        key={
                                            group.groupId
                                        }
                                        value={
                                            String(
                                                group.groupId
                                            )
                                        }
                                    >
                                        {group.groupName}
                                        {" — "}
                                        {group.managerFullName}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <TextField
                            select
                            label="Vekil Çalışan"
                            value={
                                delegateUserId
                            }
                            onChange={(
                                event
                            ) =>
                                setDelegateUserId(
                                    event.target.value
                                )
                            }
                            disabled={
                                !selectedGroup
                            }
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
                        >
                            {selectedGroup?.employees.map(
                                (
                                    employee
                                ) => (
                                    <MenuItem
                                        key={
                                            employee.userId
                                        }
                                        value={
                                            employee.userId
                                        }
                                    >
                                        {employee.fullName}
                                        {employee.email
                                            ? ` — ${employee.email}`
                                            : ""}
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
                            sx={{
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
                            setDialogOpen(
                                false
                            );

                            resetForm();
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
                            void handleCreate()
                        }
                        disabled={
                            isSubmitting
                        }
                        sx={{
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
                                    "#102F51",
                            },
                        }}
                    >
                        {isSubmitting
                            ? "Oluşturuluyor..."
                            : "Vekalet Oluştur"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ManagerDelegationsPage;
