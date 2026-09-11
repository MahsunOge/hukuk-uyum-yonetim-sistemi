import {
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    InputAdornment,
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
    type ReactNode,
} from "react";

import {
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";

import api from "../api/axios";

import EmptyState from "../components/common/EmptyState";
import PageLoading from "../components/common/PageLoading";

interface RequestItem {
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
    parentTaskId: number | null;
    categoryId: number | null;
    categoryName: string | null;
}

interface LocationState {
    successMessage?: string;
}

interface SummaryCardProps {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    iconColor: string;
    iconBackground: string;
    accentColor: string;
    onClick?: () => void;
}

function SummaryCard({
    title,
    value,
    description,
    icon,
    iconColor,
    iconBackground,
    accentColor,
    onClick,
}: SummaryCardProps) {
    const theme = useTheme();

    const isDark =
        theme.palette.mode === "dark";

    return (
        <Paper
            elevation={0}
            onClick={onClick}
            sx={{
                position: "relative",
                overflow: "hidden",
                minHeight: {
                    xs: 132,
                    lg: 148,
                },
                p: 2.25,
                cursor: onClick
                    ? "pointer"
                    : "default",

                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor:
                    "background.paper",

                transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",

                "&:hover": onClick
                    ? {
                        transform:
                            "translateY(-2px)",

                        borderColor:
                            isDark
                                ? "rgba(148,163,184,0.22)"
                                : "rgba(22,58,99,0.16)",

                        boxShadow:
                            isDark
                                ? "0 10px 25px rgba(0,0,0,0.17)"
                                : "0 10px 26px rgba(15,23,42,0.06)",
                    }
                    : {},
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    backgroundColor:
                        accentColor,
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    alignItems:
                        "flex-start",
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
                            fontWeight: 650,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.75,
                            fontSize: 30,
                            fontWeight: 800,
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
                        width: 42,
                        height: 42,
                        borderRadius: 2.2,
                        display: "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        color: iconColor,
                        backgroundColor:
                            isDark
                                ? "rgba(255,255,255,0.05)"
                                : iconBackground,

                        "& svg": {
                            fontSize: 21,
                        },
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: "block",
                    mt: 1.6,
                    lineHeight: 1.5,
                }}
            >
                {description}
            </Typography>
        </Paper>
    );
}

function MyRequestsPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

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

    const locationState =
        location.state as
        | LocationState
        | null;

    const [
        requests,
        setRequests,
    ] =
        useState<RequestItem[]>(
            []
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
        useState(
            locationState
                ?.successMessage ??
            ""
        );

    const searchText = searchParams.get("q") ?? "";
    const statusFilter = searchParams.get("status") ?? "all";
    const priorityFilter = searchParams.get("priority") ?? "all";

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
    const setStatusFilter = (value: string) =>
        updateFilter("status", value === "all" ? "" : value);
    const setPriorityFilter = (value: string) =>
        updateFilter("priority", value === "all" ? "" : value);

    useEffect(() => {
        const loadRequests =
            async () => {
                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    const response =
                        await api.get<
                            RequestItem[]
                        >(
                            "/tasks/my-requests"
                        );

                    setRequests(
                        response.data
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "Talepler alınamadı:",
                        error
                    );

                    if (
                        error.response
                            ?.status ===
                        401
                    ) {
                        setErrorMessage(
                            "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                        );
                    } else if (
                        error.response
                            ?.status ===
                        403
                    ) {
                        setErrorMessage(
                            "Taleplerinizi görüntüleme yetkiniz bulunmuyor."
                        );
                    } else {
                        setErrorMessage(
                            "Talepleriniz yüklenirken bir hata oluştu."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadRequests();
    }, []);

    const summary =
        useMemo(() => {
            return {
                total:
                    requests.length,

                new:
                    requests.filter(
                        (
                            request
                        ) =>
                            request.status ===
                            1
                    ).length,

                inProgress:
                    requests.filter(
                        (
                            request
                        ) =>
                            request.status ===
                            2
                    ).length,

                waiting:
                    requests.filter(
                        (
                            request
                        ) =>
                            request.status ===
                            3
                    ).length,

                completed:
                    requests.filter(
                        (
                            request
                        ) =>
                            request.status ===
                            4
                    ).length,
            };
        }, [
            requests,
        ]);

    const filteredRequests =
        useMemo(() => {
            const normalizedSearch =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            return [
                ...requests,
            ]
                .filter(
                    (
                        request
                    ) => {
                        if (
                            normalizedSearch
                        ) {
                            const title =
                                request.title.toLocaleLowerCase(
                                    "tr-TR"
                                );

                            const description =
                                (
                                    request.description ??
                                    ""
                                ).toLocaleLowerCase(
                                    "tr-TR"
                                );

                            const requestId =
                                request.id.toString();

                            const categoryName =
                                (
                                    request.categoryName ??
                                    ""
                                ).toLocaleLowerCase(
                                    "tr-TR"
                                );

                            const matchesSearch =
                                title.includes(
                                    normalizedSearch
                                ) ||
                                description.includes(
                                    normalizedSearch
                                ) ||
                                requestId.includes(
                                    normalizedSearch
                                ) ||
                                categoryName.includes(
                                    normalizedSearch
                                );

                            if (
                                !matchesSearch
                            ) {
                                return false;
                            }
                        }

                        if (
                            statusFilter !==
                            "all" &&
                            request.status !==
                            Number(
                                statusFilter
                            )
                        ) {
                            return false;
                        }

                        if (
                            priorityFilter !==
                            "all" &&
                            request.priority !==
                            Number(
                                priorityFilter
                            )
                        ) {
                            return false;
                        }

                        return true;
                    }
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        new Date(
                            second.createdAt
                        ).getTime() -
                        new Date(
                            first.createdAt
                        ).getTime()
                );
        }, [
            requests,
            searchText,
            statusFilter,
            priorityFilter,
        ]);

    const hasActiveFilters =
        searchText.trim().length >
        0 ||
        statusFilter !==
        "all" ||
        priorityFilter !==
        "all";

    const clearFilters =
        () => {
            setSearchParams({}, { replace: true });
        };

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

                        backgroundColor:
                            isDark
                                ? "rgba(79,118,94,0.08)"
                                : "#F1F6F3",

                        borderColor:
                            isDark
                                ? "rgba(159,195,171,0.18)"
                                : "#D2E1D7",
                    };

                case 2:
                    return {
                        color:
                            "text.secondary",

                        backgroundColor:
                            isDark
                                ? "rgba(148,163,184,0.05)"
                                : "#F7F9FB",

                        borderColor:
                            "divider",
                    };

                case 3:
                    return {
                        color:
                            isDark
                                ? "#E3BD79"
                                : "#976720",

                        backgroundColor:
                            isDark
                                ? "rgba(185,133,58,0.08)"
                                : "#FBF6EC",

                        borderColor:
                            isDark
                                ? "rgba(227,189,121,0.18)"
                                : "#EAD9B6",
                    };

                case 4:
                    return {
                        color:
                            isDark
                                ? "#D9A1A1"
                                : "#964D4D",

                        backgroundColor:
                            isDark
                                ? "rgba(168,90,90,0.07)"
                                : "#FAF1F1",

                        borderColor:
                            isDark
                                ? "rgba(217,161,161,0.18)"
                                : "#E9CCCC",
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

                        backgroundColor:
                            isDark
                                ? "rgba(49,95,140,0.10)"
                                : "#EFF4F8",

                        borderColor:
                            isDark
                                ? "rgba(155,186,212,0.18)"
                                : "#C9D9E5",
                    };

                case 2:
                    return {
                        color:
                            isDark
                                ? "#E4BE7A"
                                : "#986820",

                        backgroundColor:
                            isDark
                                ? "rgba(185,133,58,0.08)"
                                : "#FBF6EC",

                        borderColor:
                            isDark
                                ? "rgba(228,190,122,0.18)"
                                : "#E9D7AF",
                    };

                case 3:
                    return {
                        color:
                            isDark
                                ? "#CBD5E1"
                                : "#64748B",

                        backgroundColor:
                            isDark
                                ? "rgba(148,163,184,0.06)"
                                : "#F7F9FB",

                        borderColor:
                            "divider",
                    };

                case 4:
                    return {
                        color:
                            isDark
                                ? "#9FC6AD"
                                : "#4F765E",

                        backgroundColor:
                            isDark
                                ? "rgba(79,118,94,0.08)"
                                : "#F0F6F2",

                        borderColor:
                            isDark
                                ? "rgba(159,198,173,0.18)"
                                : "#CEE0D4",
                    };

                case 5:
                    return {
                        color:
                            isDark
                                ? "#D8A0A0"
                                : "#965151",

                        backgroundColor:
                            isDark
                                ? "rgba(168,90,90,0.07)"
                                : "#FAF1F1",

                        borderColor:
                            isDark
                                ? "rgba(216,160,160,0.18)"
                                : "#E8CCCC",
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
                        "2-digit",

                    year:
                        "numeric",
                }
            );
        };

    if (
        isLoading
    ) {
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
                }}
            >
                <PageLoading
                    cardCount={
                        5
                    }
                />
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

                pb: 3,

                minHeight: {
                    xs: "auto",
                    lg: "calc(100vh - 110px)",
                },
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    mb: 3,

                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    alignItems:
                    {
                        xs: "stretch",

                        sm: "center",
                    },

                    flexDirection:
                    {
                        xs: "column",

                        sm: "row",
                    },

                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontSize:
                            {
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
                        Taleplerim
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mt: 0.75,

                            maxWidth:
                                650,

                            lineHeight:
                                1.6,
                        }}
                    >
                        Oluşturduğunuz
                        talepleri
                        görüntüleyin,
                        filtreleyin ve
                        güncel
                        durumlarını
                        takip edin.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={
                        <AddRoundedIcon />
                    }
                    onClick={() =>
                        navigate(
                            "/requests/create"
                        )
                    }
                    sx={{
                        minHeight:
                            44,

                        px: 2.4,

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
                    Yeni Talep
                    Oluştur
                </Button>
            </Box>

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
                    {
                        successMessage
                    }
                </Alert>
            )}

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2.5,

                        borderRadius:
                            2.5,
                    }}
                >
                    {
                        errorMessage
                    }
                </Alert>
            )}

            {!errorMessage &&
                requests.length >
                0 && (
                    <>
                        {/* SUMMARY */}

                        <Box
                            sx={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                {
                                    xs: "1fr",

                                    sm: "repeat(2, minmax(0, 1fr))",

                                    lg: "repeat(5, minmax(0, 1fr))",
                                },

                                gap: 1.8,

                                mb: 2.6,
                            }}
                        >
                            <SummaryCard
                                title="Toplam"
                                value={
                                    summary.total
                                }
                                description="Tüm talepleriniz"
                                icon={
                                    <AssignmentRoundedIcon />
                                }
                                iconColor="#315F8C"
                                iconBackground="#EDF3F8"
                                accentColor="#315F8C"
                                onClick={() =>
                                    setStatusFilter(
                                        "all"
                                    )
                                }
                            />

                            <SummaryCard
                                title="Yeni"
                                value={
                                    summary.new
                                }
                                description="İşleme alınmamış"
                                icon={
                                    <FiberNewRoundedIcon />
                                }
                                iconColor="#4A7294"
                                iconBackground="#EEF4F8"
                                accentColor="#5B7E99"
                                onClick={() =>
                                    setStatusFilter(
                                        "1"
                                    )
                                }
                            />

                            <SummaryCard
                                title="Devam Ediyor"
                                value={
                                    summary.inProgress
                                }
                                description="İşlem süreci devam eden"
                                icon={
                                    <PlayCircleRoundedIcon />
                                }
                                iconColor="#9A6A24"
                                iconBackground="#FBF5EA"
                                accentColor="#B9853A"
                                onClick={() =>
                                    setStatusFilter(
                                        "2"
                                    )
                                }
                            />

                            <SummaryCard
                                title="Beklemede"
                                value={
                                    summary.waiting
                                }
                                description="Beklemeye alınan"
                                icon={
                                    <HourglassEmptyRoundedIcon />
                                }
                                iconColor="#64748B"
                                iconBackground="#F3F5F7"
                                accentColor="#94A3B8"
                                onClick={() =>
                                    setStatusFilter(
                                        "3"
                                    )
                                }
                            />

                            <SummaryCard
                                title="Tamamlandı"
                                value={
                                    summary.completed
                                }
                                description="Sonuçlandırılan"
                                icon={
                                    <CheckCircleRoundedIcon />
                                }
                                iconColor="#50795E"
                                iconBackground="#EEF5F0"
                                accentColor="#5B8168"
                                onClick={() =>
                                    setStatusFilter(
                                        "4"
                                    )
                                }
                            />
                        </Box>

                        {/* FILTER PANEL */}

                        <Paper
                            elevation={0}
                            sx={{
                                mb: 2.5,

                                p: {
                                    xs: 2,
                                    sm: 2.4,
                                    lg: 2.6,
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
                            <Stack
                                direction="row"
                                spacing={
                                    1
                                }
                                sx={{
                                    mb: 1.7,

                                    alignItems:
                                        "center",
                                }}
                            >
                                <TuneRoundedIcon
                                    sx={{
                                        fontSize:
                                            20,

                                        color:
                                            "#64748B",
                                    }}
                                />

                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Filtrele ve
                                    Ara
                                </Typography>
                            </Stack>

                            <Box
                                sx={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                    {
                                        xs: "1fr",

                                        md: "minmax(280px, 1fr) 190px 190px auto",
                                    },

                                    gap: 1.6,

                                    alignItems:
                                        "center",
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Başlık, açıklama, kategori veya talep no ara..."
                                    value={
                                        searchText
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearchText(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    slotProps={{
                                        input: {
                                            startAdornment:
                                                (
                                                    <InputAdornment
                                                        position="start"
                                                    >
                                                        <SearchRoundedIcon
                                                            sx={{
                                                                color:
                                                                    "text.secondary",

                                                                fontSize:
                                                                    20,
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                        },
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root":
                                        {
                                            borderRadius:
                                                2.2,

                                            backgroundColor:
                                                isDark
                                                    ? "rgba(255,255,255,0.025)"
                                                    : "#FAFBFC",
                                        },
                                    }}
                                />

                                <FormControl
                                    fullWidth
                                    size="small"
                                >
                                    <Select
                                        value={
                                            statusFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setStatusFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        sx={{
                                            borderRadius:
                                                2.2,
                                        }}
                                    >
                                        <MenuItem value="all">
                                            Tüm
                                            Durumlar
                                        </MenuItem>

                                        <MenuItem value="1">
                                            Yeni
                                        </MenuItem>

                                        <MenuItem value="2">
                                            Devam
                                            Ediyor
                                        </MenuItem>

                                        <MenuItem value="3">
                                            Beklemede
                                        </MenuItem>

                                        <MenuItem value="4">
                                            Tamamlandı
                                        </MenuItem>

                                        <MenuItem value="5">
                                            İptal
                                            Edildi
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                >
                                    <Select
                                        value={
                                            priorityFilter
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPriorityFilter(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        sx={{
                                            borderRadius:
                                                2.2,
                                        }}
                                    >
                                        <MenuItem value="all">
                                            Tüm
                                            Öncelikler
                                        </MenuItem>

                                        <MenuItem value="1">
                                            Düşük
                                        </MenuItem>

                                        <MenuItem value="2">
                                            Orta
                                        </MenuItem>

                                        <MenuItem value="3">
                                            Yüksek
                                        </MenuItem>

                                        <MenuItem value="4">
                                            Kritik
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <ClearRoundedIcon />
                                    }
                                    disabled={
                                        !hasActiveFilters
                                    }
                                    onClick={
                                        clearFilters
                                    }
                                    sx={{
                                        minHeight:
                                            40,

                                        minWidth:
                                            135,

                                        borderRadius:
                                            2.2,

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            650,

                                        whiteSpace:
                                            "nowrap",

                                        borderColor:
                                            "divider",

                                        color:
                                            "text.secondary",

                                        "&:hover":
                                        {
                                            borderColor:
                                                "text.disabled",

                                            backgroundColor:
                                                "action.hover",
                                        },
                                    }}
                                >
                                    Temizle
                                </Button>
                            </Box>
                        </Paper>

                        {/* RESULT HEADER */}

                        <Box
                            sx={{
                                mb: 1.6,

                                display:
                                    "flex",

                                justifyContent:
                                    "space-between",

                                alignItems:
                                    "center",

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
                                            750,
                                    }}
                                >
                                    {
                                        filteredRequests.length
                                    }
                                </Box>{" "}
                                talep
                                gösteriliyor
                            </Typography>

                            {hasActiveFilters && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Toplam{" "}
                                    {
                                        requests.length
                                    }{" "}
                                    talep
                                </Typography>
                            )}
                        </Box>

                        {/* NO FILTER RESULT */}

                        {filteredRequests.length ===
                            0 && (
                                <EmptyState
                                    title="Eşleşen talep bulunamadı"
                                    description="Arama veya filtre kriterlerinize uygun bir talep bulunamadı."
                                    icon={
                                        <SearchRoundedIcon
                                            sx={{
                                                fontSize:
                                                    32,
                                            }}
                                        />
                                    }
                                    actionLabel="Filtreleri Temizle"
                                    onAction={
                                        clearFilters
                                    }
                                />
                            )}

                        {/* REQUEST LIST */}

                        {filteredRequests.length >
                            0 && (
                                <Box
                                    sx={{
                                        display:
                                            "grid",

                                        gap: 1.6,
                                    }}
                                >
                                    {filteredRequests.map(
                                        (
                                            request
                                        ) => (
                                            <Paper
                                                key={
                                                    request.id
                                                }
                                                elevation={
                                                    0
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/requests/${request.id}`
                                                    )
                                                }
                                                sx={{
                                                    position:
                                                        "relative",

                                                    overflow:
                                                        "hidden",

                                                    minHeight: {
                                                        xs: "auto",
                                                        md: 132,
                                                    },

                                                    cursor:
                                                        "pointer",

                                                    border:
                                                        "1px solid",

                                                    borderColor:
                                                        request.isOverdue
                                                            ? isDark
                                                                ? "rgba(185,133,58,0.35)"
                                                                : "#E5D0A6"
                                                            : "divider",

                                                    borderRadius:
                                                        3,

                                                    backgroundColor:
                                                        "background.paper",

                                                    transition:
                                                        "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",

                                                    "&:hover":
                                                    {
                                                        transform:
                                                            "translateY(-2px)",

                                                        borderColor:
                                                            request.isOverdue
                                                                ? "#B9853A"
                                                                : isDark
                                                                    ? "rgba(148,163,184,0.22)"
                                                                    : "rgba(22,58,99,0.20)",

                                                        boxShadow:
                                                            isDark
                                                                ? "0 10px 28px rgba(0,0,0,0.16)"
                                                                : "0 10px 28px rgba(15,23,42,0.06)",
                                                    },

                                                    "&:hover .request-chevron":
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
                                                {request.isOverdue && (
                                                    <Box
                                                        sx={{
                                                            position:
                                                                "absolute",

                                                            left: 0,

                                                            top: 0,

                                                            bottom: 0,

                                                            width:
                                                                3,

                                                            backgroundColor:
                                                                "#B9853A",
                                                        }}
                                                    />
                                                )}

                                                <Box
                                                    sx={{
                                                        p: {
                                                            xs: 2,
                                                            sm: 2.4,
                                                            md: 2.6,
                                                        },

                                                        display:
                                                            "grid",

                                                        gridTemplateColumns:
                                                        {
                                                            xs: "1fr",

                                                            md: "48px minmax(0, 1fr) auto 24px",
                                                        },

                                                        alignItems:
                                                            "center",

                                                        gap: {
                                                            xs: 1.7,

                                                            md: 2,
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width:
                                                                46,

                                                            height:
                                                                46,

                                                            display:
                                                            {
                                                                xs: "none",

                                                                md: "flex",
                                                            },

                                                            alignItems:
                                                                "center",

                                                            justifyContent:
                                                                "center",

                                                            borderRadius:
                                                                2.3,

                                                            backgroundColor:
                                                                isDark
                                                                    ? "rgba(49,95,140,0.10)"
                                                                    : "#EFF4F8",

                                                            color:
                                                                "#315F8C",
                                                        }}
                                                    >
                                                        <DescriptionRoundedIcon
                                                            sx={{
                                                                fontSize:
                                                                    22,
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

                                                                gap: 0.8,
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    fontSize:
                                                                        17,

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
                                                                    request.title
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontWeight:
                                                                        650,
                                                                }}
                                                            >
                                                                #
                                                                {
                                                                    request.id
                                                                }
                                                            </Typography>
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 0.65,

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
                                                                    1.55,
                                                            }}
                                                        >
                                                            {request.description ||
                                                                "Açıklama bulunmamaktadır."}
                                                        </Typography>

                                                        <Stack
                                                            direction="row"
                                                            sx={{
                                                                mt: 1.2,

                                                                alignItems:
                                                                    "center",

                                                                flexWrap:
                                                                    "wrap",

                                                                gap: 0.8,
                                                            }}
                                                        >
                                                            {request.categoryName && (
                                                                <Stack
                                                                    direction="row"
                                                                    spacing={
                                                                        0.5
                                                                    }
                                                                    sx={{
                                                                        alignItems:
                                                                            "center",
                                                                    }}
                                                                >
                                                                    <CategoryRoundedIcon
                                                                        sx={{
                                                                            fontSize:
                                                                                15,

                                                                            color:
                                                                                "text.disabled",
                                                                        }}
                                                                    />

                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {
                                                                            request.categoryName
                                                                        }
                                                                    </Typography>
                                                                </Stack>
                                                            )}

                                                            {request.categoryName && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.disabled"
                                                                >
                                                                    •
                                                                </Typography>
                                                            )}

                                                            <Stack
                                                                direction="row"
                                                                spacing={
                                                                    0.5
                                                                }
                                                                sx={{
                                                                    alignItems:
                                                                        "center",
                                                                }}
                                                            >
                                                                <CalendarMonthRoundedIcon
                                                                    sx={{
                                                                        fontSize:
                                                                            15,

                                                                        color:
                                                                            "text.disabled",
                                                                    }}
                                                                />

                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {formatDate(
                                                                        request.createdAt
                                                                    )}
                                                                </Typography>
                                                            </Stack>

                                                            {request.dueDate && (
                                                                <>
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.disabled"
                                                                    >
                                                                        •
                                                                    </Typography>

                                                                    <Typography
                                                                        variant="caption"
                                                                        color={
                                                                            request.isOverdue
                                                                                ? "#A36E26"
                                                                                : "text.secondary"
                                                                        }
                                                                        sx={{
                                                                            fontWeight:
                                                                                request.isOverdue
                                                                                    ? 700
                                                                                    : 400,
                                                                        }}
                                                                    >
                                                                        Bitiş:{" "}
                                                                        {formatDate(
                                                                            request.dueDate
                                                                        )}
                                                                    </Typography>
                                                                </>
                                                            )}
                                                        </Stack>
                                                    </Box>

                                                    <Stack
                                                        direction="row"
                                                        sx={{
                                                            flexWrap:
                                                                "wrap",

                                                            gap: 0.8,

                                                            justifyContent:
                                                            {
                                                                xs: "flex-start",

                                                                md: "flex-end",
                                                            },
                                                        }}
                                                    >
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
                                                                request.priority
                                                            )}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                height:
                                                                    28,

                                                                borderRadius:
                                                                    1.7,

                                                                fontSize:
                                                                    11,

                                                                fontWeight:
                                                                    650,

                                                                ...getPriorityStyle(
                                                                    request.priority
                                                                ),
                                                            }}
                                                        />

                                                        <Chip
                                                            label={getStatusText(
                                                                request.status
                                                            )}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                height:
                                                                    28,

                                                                borderRadius:
                                                                    1.7,

                                                                fontSize:
                                                                    11,

                                                                fontWeight:
                                                                    700,

                                                                ...getStatusStyle(
                                                                    request.status
                                                                ),
                                                            }}
                                                        />

                                                        {request.isOverdue && (
                                                            <Chip
                                                                label="Gecikmiş"
                                                                size="small"
                                                                sx={{
                                                                    height:
                                                                        28,

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
                                                        className="request-chevron"
                                                        sx={{
                                                            display:
                                                            {
                                                                xs: "none",

                                                                md: "block",
                                                            },

                                                            color:
                                                                "text.disabled",

                                                            fontSize:
                                                                22,

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
                    </>
                )}

            {/* NO REQUEST */}

            {!errorMessage &&
                requests.length ===
                0 && (
                    <EmptyState
                        title="Henüz talebiniz bulunmuyor"
                        description="Yeni bir düzeltme veya destek talebi oluşturarak başlayabilirsiniz."
                        icon={
                            <AssignmentRoundedIcon
                                sx={{
                                    fontSize:
                                        32,
                                }}
                            />
                        }
                        actionLabel="İlk Talebi Oluştur"
                        onAction={() =>
                            navigate(
                                "/requests/create"
                            )
                        }
                    />
                )}
        </Box>
    );
}

export default MyRequestsPage;
