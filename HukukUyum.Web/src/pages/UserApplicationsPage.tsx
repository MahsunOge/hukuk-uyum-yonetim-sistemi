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
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";

import api from "../api/axios";

interface UserApplication {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    department: string | null;
    personnelNumber: string | null;
    description: string | null;
    status: number;
    createdAt: string;
    reviewedAt: string | null;
    reviewedByUserId: string | null;
    rejectionReason: string | null;
}

interface GroupItem {
    id: number;
    name: string;
}

function UserApplicationsPage() {
    const [
        applications,
        setApplications,
    ] = useState<UserApplication[]>([]);

    const [
        selectedApplication,
        setSelectedApplication,
    ] = useState<UserApplication | null>(
        null
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isProcessing,
        setIsProcessing,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        approveDialogOpen,
        setApproveDialogOpen,
    ] = useState(false);

    const [
        rejectDialogOpen,
        setRejectDialogOpen,
    ] = useState(false);

    const [
        role,
        setRole,
    ] = useState("Employee");

    const [
        groupId,
        setGroupId,
    ] = useState("");

    const [
        rejectionReason,
        setRejectionReason,
    ] = useState("");

    const [
        groups,
        setGroups,
    ] = useState<GroupItem[]>([]);

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState(0);

    const loadApplications = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const [
                applicationsResponse,
                groupsResponse,
            ] = await Promise.all([
                api.get<UserApplication[]>(
                    "/UserApplications"
                ),

                api.get<GroupItem[]>(
                    "/groups"
                ),
            ]);

            setApplications(
                applicationsResponse.data
            );

            setGroups(
                groupsResponse.data
            );
        } catch (error) {
            console.error(
                "Başvurular yüklenemedi:",
                error
            );

            setErrorMessage(
                "Kullanıcı başvuruları yüklenemedi."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadApplications();
    }, []);

    const openApproveDialog = (
        application: UserApplication
    ) => {
        setSelectedApplication(
            application
        );

        setRole("Employee");
        setGroupId("");
        setApproveDialogOpen(true);
    };

    const openRejectDialog = (
        application: UserApplication
    ) => {
        setSelectedApplication(
            application
        );

        setRejectionReason("");
        setRejectDialogOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedApplication) {
            return;
        }

        try {
            setIsProcessing(true);
            setErrorMessage("");
            setSuccessMessage("");

            await api.post(
                `/UserApplications/${selectedApplication.id}/approve`,
                {
                    role,

                    groupId:
                        groupId.trim() === ""
                            ? null
                            : Number(groupId),
                }
            );

            setApproveDialogOpen(false);

            setSuccessMessage(
                `${selectedApplication.fullName} adlı kullanıcının başvurusu onaylandı.`
            );

            await loadApplications();
        } catch (error) {
            console.error(
                "Başvuru onaylanamadı:",
                error
            );

            setErrorMessage(
                "Başvuru onaylanamadı. Rol ve grup bilgilerini kontrol edin."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) {
            return;
        }

        if (!rejectionReason.trim()) {
            setErrorMessage(
                "Ret nedeni zorunludur."
            );

            return;
        }

        try {
            setIsProcessing(true);
            setErrorMessage("");
            setSuccessMessage("");

            await api.post(
                `/UserApplications/${selectedApplication.id}/reject`,
                {
                    rejectionReason:
                        rejectionReason.trim(),
                }
            );

            setRejectDialogOpen(false);

            setSuccessMessage(
                `${selectedApplication.fullName} adlı kullanıcının başvurusu reddedildi.`
            );

            await loadApplications();
        } catch (error) {
            console.error(
                "Başvuru reddedilemedi:",
                error
            );

            setErrorMessage(
                "Başvuru reddedilemedi."
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusChip = (
        status: number
    ) => {
        if (status === 2) {
            return (
                <Chip
                    label="Onaylandı"
                    color="success"
                    size="small"
                    variant="outlined"
                    icon={
                        <CheckCircleRoundedIcon />
                    }
                    sx={{
                        fontWeight: 600,
                    }}
                />
            );
        }

        if (status === 3) {
            return (
                <Chip
                    label="Reddedildi"
                    color="error"
                    size="small"
                    variant="outlined"
                    icon={
                        <CancelRoundedIcon />
                    }
                    sx={{
                        fontWeight: 600,
                    }}
                />
            );
        }

        return (
            <Chip
                label="Bekliyor"
                color="warning"
                size="small"
                variant="outlined"
                icon={
                    <ScheduleRoundedIcon />
                }
                sx={{
                    fontWeight: 600,
                }}
            />
        );
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

    const summary =
        useMemo(() => {
            return {
                total:
                    applications.length,

                pending:
                    applications.filter(
                        (application) =>
                            application.status === 1
                    ).length,

                approved:
                    applications.filter(
                        (application) =>
                            application.status === 2
                    ).length,

                rejected:
                    applications.filter(
                        (application) =>
                            application.status === 3
                    ).length,
            };
        }, [applications]);

    const filteredApplications =
        useMemo(() => {
            const normalizedSearch =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            return applications.filter(
                (application) => {
                    const matchesStatus =
                        statusFilter === 0 ||
                        application.status ===
                        statusFilter;

                    const matchesSearch =
                        !normalizedSearch ||
                        application.fullName
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            ) ||
                        application.email
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            ) ||
                        application.department
                            ?.toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            ) ||
                        application.personnelNumber
                            ?.toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            );

                    return (
                        matchesStatus &&
                        matchesSearch
                    );
                }
            );
        }, [
            applications,
            searchText,
            statusFilter,
        ]);

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
            {/* BAŞLIK */}

            <Box
                sx={{
                    mb: 3,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 800,
                        letterSpacing:
                            "-0.03em",
                    }}
                >
                    Kullanıcı Başvuruları
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.75,
                    }}
                >
                    Sisteme katılmak isteyen
                    kullanıcıların başvurularını
                    inceleyin ve sonuçlandırın.
                </Typography>
            </Box>

            {/* MESAJLAR */}

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
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

            {/* ÖZET KARTLARI */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs: "1fr",
                        sm:
                            "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(4, minmax(0, 1fr))",
                    },

                    gap: 2,
                    mb: 3,
                }}
            >
                <SummaryCard
                    title="Toplam Başvuru"
                    value={summary.total}
                    icon={
                        <PeopleAltRoundedIcon />
                    }
                    iconColor="#2563EB"
                    iconBackground="#EFF6FF"
                />

                <SummaryCard
                    title="Bekleyen"
                    value={summary.pending}
                    icon={
                        <ScheduleRoundedIcon />
                    }
                    iconColor="#D97706"
                    iconBackground="#FFFBEB"
                />

                <SummaryCard
                    title="Onaylanan"
                    value={summary.approved}
                    icon={
                        <CheckCircleRoundedIcon />
                    }
                    iconColor="#16A34A"
                    iconBackground="#F0FDF4"
                />

                <SummaryCard
                    title="Reddedilen"
                    value={summary.rejected}
                    icon={
                        <CancelRoundedIcon />
                    }
                    iconColor="#DC2626"
                    iconBackground="#FEF2F2"
                />
            </Box>

            {/* FİLTRELER */}

            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,

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
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            md:
                                "minmax(280px, 1fr) 220px",
                        },

                        gap: 2,
                    }}
                >
                    <TextField
                        placeholder="Ad, e-posta, departman veya personel no ara..."
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(
                                event.target.value
                            )
                        }
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
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
                    >
                        <InputLabel id="application-status-label">
                            Durum
                        </InputLabel>

                        <Select
                            labelId="application-status-label"
                            label="Durum"
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    Number(
                                        event.target
                                            .value
                                    )
                                )
                            }
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            <MenuItem value={0}>
                                Tüm Durumlar
                            </MenuItem>

                            <MenuItem value={1}>
                                Bekliyor
                            </MenuItem>

                            <MenuItem value={2}>
                                Onaylandı
                            </MenuItem>

                            <MenuItem value={3}>
                                Reddedildi
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* TABLO */}

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
                                    "action.hover",

                                color:
                                    "primary.main",
                            }}
                        >
                            <HowToRegRoundedIcon />
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Başvuru Listesi
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {
                                    filteredApplications.length
                                }{" "}
                                başvuru gösteriliyor
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
                ) : filteredApplications.length ===
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
                            Başvuru bulunamadı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Seçtiğiniz filtrelere
                            uygun kullanıcı başvurusu
                            bulunmuyor.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table
                            sx={{
                                minWidth: 1000,
                            }}
                        >
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
                                        Departman
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,
                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Personel No
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,
                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Başvuru Tarihi
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight:
                                                700,
                                            color:
                                                "text.secondary",
                                        }}
                                    >
                                        Durum
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
                                {filteredApplications.map(
                                    (
                                        application
                                    ) => (
                                        <TableRow
                                            key={
                                                application.id
                                            }
                                            hover
                                            sx={{
                                                transition:
                                                    "background-color 0.15s ease",

                                                borderLeft:
                                                    application.status ===
                                                        1
                                                        ? "3px solid #F59E0B"
                                                        : application.status ===
                                                            2
                                                            ? "3px solid #22C55E"
                                                            : "3px solid #EF4444",

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
                                                <Box
                                                    sx={{
                                                        minWidth:
                                                            200,
                                                    }}
                                                >
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
                                                            application.fullName
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display:
                                                                "block",

                                                            mt:
                                                                0.35,
                                                        }}
                                                    >
                                                        {
                                                            application.email
                                                        }
                                                    </Typography>

                                                    {application.phoneNumber && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display:
                                                                    "block",

                                                                mt:
                                                                    0.2,
                                                            }}
                                                        >
                                                            {
                                                                application.phoneNumber
                                                            }
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {application.department ??
                                                        "-"}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {application.personnelNumber ??
                                                        "-"}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {formatDate(
                                                        application.createdAt
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {getStatusChip(
                                                    application.status
                                                )}
                                            </TableCell>

                                            <TableCell align="right">
                                                {application.status ===
                                                    1 ? (
                                                    <Stack
                                                        direction="row"
                                                        spacing={
                                                            1
                                                        }
                                                        sx={{
                                                            justifyContent:
                                                                "flex-end",
                                                        }}
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            startIcon={
                                                                <CheckRoundedIcon />
                                                            }
                                                            onClick={() =>
                                                                openApproveDialog(
                                                                    application
                                                                )
                                                            }
                                                            sx={{
                                                                borderRadius:
                                                                    2,

                                                                boxShadow:
                                                                    "none",

                                                                textTransform:
                                                                    "none",

                                                                fontWeight:
                                                                    600,
                                                            }}
                                                        >
                                                            Onayla
                                                        </Button>

                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            size="small"
                                                            startIcon={
                                                                <CloseRoundedIcon />
                                                            }
                                                            onClick={() =>
                                                                openRejectDialog(
                                                                    application
                                                                )
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
                                                            Reddet
                                                        </Button>
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Sonuçlandırıldı
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* ONAY DIALOG */}

            <Dialog
                open={approveDialogOpen}
                onClose={() => {
                    if (!isProcessing) {
                        setApproveDialogOpen(false);
                    }
                }}
                fullWidth
                maxWidth="sm"
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        backgroundColor:
                            "background.paper",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        fontWeight: 800,
                    }}
                >
                    Başvuruyu Onayla
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 3,
                            mt: 0.5,
                            lineHeight: 1.7,
                        }}
                    >
                        <strong>
                            {
                                selectedApplication?.fullName
                            }
                        </strong>{" "}
                        adlı kullanıcı için rol ve
                        isteğe bağlı grup seçin.
                    </Typography>

                    <Stack spacing={2}>
                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Rol
                            </InputLabel>

                            <Select
                                value={role}
                                label="Rol"
                                onChange={(
                                    event
                                ) =>
                                    setRole(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                sx={{
                                    borderRadius:
                                        2,
                                }}
                            >
                                <MenuItem value="Employee">
                                    Çalışan
                                </MenuItem>

                                <MenuItem value="Manager">
                                    Yönetici
                                </MenuItem>

                                <MenuItem value="Admin">
                                    Admin
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Grup
                            </InputLabel>

                            <Select
                                value={groupId}
                                label="Grup"
                                onChange={(
                                    event
                                ) =>
                                    setGroupId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                sx={{
                                    borderRadius:
                                        2,
                                }}
                            >
                                <MenuItem value="">
                                    Grup Atama
                                </MenuItem>

                                {groups.map(
                                    (
                                        group
                                    ) => (
                                        <MenuItem
                                            key={
                                                group.id
                                            }
                                            value={String(
                                                group.id
                                            )}
                                        >
                                            {
                                                group.name
                                            }
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Button
                        onClick={() =>
                            setApproveDialogOpen(
                                false
                            )
                        }
                        disabled={
                            isProcessing
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        İptal
                    </Button>

                    <Button
                        onClick={
                            handleApprove
                        }
                        variant="contained"
                        color="success"
                        disabled={
                            isProcessing
                        }
                        startIcon={
                            !isProcessing
                                ? <CheckRoundedIcon />
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
                        {isProcessing
                            ? "Onaylanıyor..."
                            : "Onayla"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* RED DIALOG */}

            <Dialog
                open={rejectDialogOpen}
                onClose={() => {
                    if (
                        !isProcessing
                    ) {
                        setRejectDialogOpen(
                            false
                        );
                    }
                }}
                fullWidth
                maxWidth="sm"
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        backgroundColor:
                            "background.paper",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        pb: 1,
                        fontWeight: 800,
                    }}
                >
                    Başvuruyu Reddet
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 2.5,
                            mt: 0.5,
                            lineHeight: 1.7,
                        }}
                    >
                        <strong>
                            {
                                selectedApplication?.fullName
                            }
                        </strong>{" "}
                        adlı kullanıcının
                        başvurusunu reddetme
                        nedenini belirtin.
                    </Typography>

                    <TextField
                        label="Ret Nedeni"
                        value={
                            rejectionReason
                        }
                        onChange={(event) =>
                            setRejectionReason(
                                event.target
                                    .value
                            )
                        }
                        multiline
                        minRows={4}
                        required
                        fullWidth
                        placeholder="Başvurunun neden reddedildiğini açıklayın..."
                        sx={{
                            "& .MuiOutlinedInput-root":
                            {
                                borderRadius:
                                    2,
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                    }}
                >
                    <Button
                        onClick={() =>
                            setRejectDialogOpen(
                                false
                            )
                        }
                        disabled={
                            isProcessing
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        İptal
                    </Button>

                    <Button
                        onClick={
                            handleReject
                        }
                        variant="contained"
                        color="error"
                        disabled={
                            isProcessing
                        }
                        startIcon={
                            !isProcessing
                                ? <CloseRoundedIcon />
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
                        {isProcessing
                            ? "Reddediliyor..."
                            : "Reddet"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    iconColor: string;
    iconBackground: string;
}

function SummaryCard({
    title,
    value,
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
                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            mt: 0.75,

                            fontWeight: 800,
                        fontSize: 30,

                            letterSpacing:
                                "-0.03em",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 36,
                        height: 36,

                        borderRadius: 2.5,

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
                            fontSize: 23,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

export default UserApplicationsPage;
