import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
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

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import FiberNewRoundedIcon from "@mui/icons-material/FiberNewRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import api from "../api/axios";

import {
    getCurrentUserName,
} from "../utils/auth";

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
    categoryId?: number | null;
    categoryName?: string | null;
}

interface SummaryCardProps {
    title: string;
    value: number;
    description: string;
    icon: ReactNode;
    iconColor: string;
    iconBackground: string;
    softBackground: string;
    lineColor: string;
    badge?: string;
    onClick?: () => void;
}

function MiniTrend({
    color,
}: {
    color: string;
}) {
    return (
        <Box
            component="svg"
            viewBox="0 0 260 42"
            preserveAspectRatio="none"
            sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: 38,
                opacity: 0.8,
                pointerEvents: "none",
            }}
        >
            <path
                d="M0,32 C18,31 20,18 39,19 C58,20 61,30 82,29 C103,28 104,35 125,34 C145,33 148,20 168,20 C189,21 191,31 212,31 C231,31 239,24 260,22"
                fill="none"
                stroke={color}
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
            />

            <path
                d="M0,32 C18,31 20,18 39,19 C58,20 61,30 82,29 C103,28 104,35 125,34 C145,33 148,20 168,20 C189,21 191,31 212,31 C231,31 239,24 260,22 L260,42 L0,42 Z"
                fill={color}
                opacity="0.04"
            />
        </Box>
    );
}

function SummaryCard({
    title,
    value,
    description,
    icon,
    iconColor,
    iconBackground,
    softBackground,
    lineColor,
    badge,
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
                minHeight: 174,
                p: 2.5,
                pb: 4,
                cursor: onClick
                    ? "pointer"
                    : "default",

                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3.25,

                background: isDark
                    ? "background.paper"
                    : `linear-gradient(145deg, #FFFFFF 35%, ${softBackground} 130%)`,

                transition:
                    "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

                "&:hover": onClick
                    ? {
                        transform: "translateY(-3px)",
                        borderColor:
                            "rgba(22, 58, 99, 0.15)",
                        boxShadow:
                            isDark
                                ? "0 14px 30px rgba(0,0,0,0.18)"
                                : "0 14px 30px rgba(15,23,42,0.07)",
                    }
                    : {},
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "flex-start",
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1.25,
                            fontSize: 34,
                            lineHeight: 1,
                            fontWeight: 800,
                            letterSpacing:
                                "-0.04em",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems:
                            "flex-start",
                    }}
                >
                    {badge && (
                        <Chip
                            label={badge}
                            size="small"
                            sx={{
                                height: 23,
                                fontSize: 10.5,
                                fontWeight: 700,
                                color: iconColor,
                                backgroundColor:
                                    isDark
                                        ? "rgba(255,255,255,0.05)"
                                        : iconBackground,
                            }}
                        />
                    )}

                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2.4,
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

                            boxShadow: isDark
                                ? "none"
                                : `0 7px 18px ${lineColor}18`,

                            "& svg": {
                                fontSize: 23,
                            },
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 2.6,
                    fontSize: 13,
                    lineHeight: 1.5,
                    position: "relative",
                    zIndex: 2,
                }}
            >
                {description}
            </Typography>

            <MiniTrend
                color={
                    lineColor
                }
            />
        </Paper>
    );
}
function HeroIllustration() {
    const theme = useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    return (
        <Box
            sx={{
                position: "relative",
                width: 230,
                height: 130,
                display: {
                    xs: "none",
                    lg: "block",
                },
                flexShrink: 0,
            }}
        >
            {/* Arka soft daire */}
            <Box
                sx={{
                    position: "absolute",
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    left: 42,
                    top: 2,

                    backgroundColor:
                        isDark
                            ? "rgba(49,95,140,0.08)"
                            : "rgba(49,95,140,0.06)",
                }}
            />

            {/* Ana clipboard */}
            <Box
                sx={{
                    position: "absolute",
                    width: 82,
                    height: 104,
                    left: 70,
                    top: 14,

                    borderRadius: 3,

                    backgroundColor:
                        "background.paper",

                    border:
                        "1px solid",

                    borderColor:
                        isDark
                            ? "rgba(148,163,184,0.14)"
                            : "#D8E3EC",

                    boxShadow:
                        isDark
                            ? "0 12px 28px rgba(0,0,0,0.16)"
                            : "0 14px 34px rgba(22,58,99,0.11)",
                }}
            >
                {/* Üst clipboard tutacağı */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -9,
                        left: "50%",
                        transform:
                            "translateX(-50%)",

                        width: 38,
                        height: 18,

                        borderRadius: 2,

                        backgroundColor:
                            "#315F8C",
                    }}
                />

                {/* Satırlar */}
                {[28, 48, 68].map(
                    (top) => (
                        <Box
                            key={top}
                            sx={{
                                position:
                                    "absolute",

                                left: 17,
                                right: 15,
                                top,

                                height: 6,

                                borderRadius:
                                    99,

                                backgroundColor:
                                    isDark
                                        ? "rgba(148,163,184,0.13)"
                                        : "#E6EDF3",
                            }}
                        />
                    )
                )}

                {/* Küçük check noktaları */}
                {[28, 48, 68].map(
                    (top) => (
                        <Box
                            key={`check-${top}`}
                            sx={{
                                position:
                                    "absolute",

                                left: 9,
                                top:
                                    top + 1,

                                width: 4,
                                height: 4,

                                borderRadius:
                                    "50%",

                                backgroundColor:
                                    "#7898B3",
                            }}
                        />
                    )
                )}
            </Box>

            {/* Sağ alt mini takvim */}
            <Box
                sx={{
                    position: "absolute",
                    width: 52,
                    height: 52,
                    right: 18,
                    bottom: 8,

                    borderRadius: 3,

                    display: "flex",
                    flexDirection: "column",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    backgroundColor:
                        isDark
                            ? "#172033"
                            : "#EDF3F8",

                    border:
                        "1px solid",

                    borderColor:
                        isDark
                            ? "rgba(148,163,184,0.10)"
                            : "#D8E3EC",

                    boxShadow:
                        isDark
                            ? "none"
                            : "0 10px 22px rgba(22,58,99,0.08)",
                }}
            >
                <CalendarTodayRoundedIcon
                    sx={{
                        fontSize: 23,
                        color: "#315F8C",
                    }}
                />
            </Box>

            {/* Sol küçük dekorasyon */}
            <Box
                sx={{
                    position: "absolute",

                    left: 29,
                    top: 42,

                    width: 10,
                    height: 10,

                    borderRadius: "50%",

                    backgroundColor:
                        "#A8BDCE",

                    opacity: 0.7,
                }}
            />

            {/* Sağ üst küçük dekorasyon */}
            <Box
                sx={{
                    position: "absolute",

                    right: 35,
                    top: 20,

                    width: 6,
                    height: 6,

                    borderRadius: "50%",

                    backgroundColor:
                        "#C7D5E1",

                    opacity: 0.8,
                }}
            />
        </Box>
    );
}


function UserDashboard() {
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

    const [
        requests,
        setRequests,
    ] = useState<
        RequestItem[]
    >([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

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
                        "Dashboard talepleri alınamadı:",
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
                            "Talep bilgilerine erişim yetkiniz bulunmuyor."
                        );
                    } else {
                        setErrorMessage(
                            "Talep bilgileri yüklenemedi."
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

                cancelled:
                    requests.filter(
                        (
                            request
                        ) =>
                            request.status ===
                            5
                    ).length,
            };
        }, [
            requests,
        ]);

    const recentRequests =
        useMemo(() => {
            return [
                ...requests,
            ]
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
                )
                .slice(
                    0,
                    5
                );
        }, [
            requests,
        ]);

    const getStatusText = (
        status: number
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

    const getStatusStyle = (
        status: number
    ) => {
        switch (
        status
        ) {
            case 1:
                return {
                    color:
                        isDark
                            ? "#93B8D9"
                            : "#315F8C",

                    borderColor:
                        isDark
                            ? "rgba(147,184,217,0.22)"
                            : "#CADBE9",

                    backgroundColor:
                        isDark
                            ? "rgba(49,95,140,0.10)"
                            : "#F0F5F9",
                };

            case 2:
                return {
                    color:
                        isDark
                            ? "#E7C17D"
                            : "#96651D",

                    borderColor:
                        isDark
                            ? "rgba(231,193,125,0.20)"
                            : "#E8D5AA",

                    backgroundColor:
                        isDark
                            ? "rgba(185,133,58,0.08)"
                            : "#FBF7EE",
                };

            case 3:
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

            case 4:
                return {
                    color:
                        isDark
                            ? "#9CC7AC"
                            : "#47785A",

                    borderColor:
                        isDark
                            ? "rgba(156,199,172,0.19)"
                            : "#CDE0D4",

                    backgroundColor:
                        isDark
                            ? "rgba(79,135,100,0.08)"
                            : "#F0F6F2",
                };

            case 5:
                return {
                    color:
                        isDark
                            ? "#D9A2A2"
                            : "#965151",

                    borderColor:
                        isDark
                            ? "rgba(217,162,162,0.18)"
                            : "#E7CBCB",

                    backgroundColor:
                        isDark
                            ? "rgba(168,90,90,0.07)"
                            : "#FAF2F2",
                };

            default:
                return {};
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

    const getPriorityColor = (
        priority: number
    ) => {
        switch (
        priority
        ) {
            case 1:
                return "#5F7F6E";

            case 2:
                return "#7C8795";

            case 3:
                return "#A36E26";

            case 4:
                return "#9B4F4F";

            default:
                return "#64748B";
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

        return parsedDate.toLocaleDateString(
            "tr-TR",
            {
                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric",
            }
        );
    };

    const currentDate =
        new Date().toLocaleDateString(
            "tr-TR",
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric",
            }
        );

    const totalForChart =
        summary.total;

    const newPercentage =
        totalForChart > 0
            ? (
                summary.new /
                totalForChart
            ) *
            100
            : 0;

    const inProgressPercentage =
        totalForChart > 0
            ? (
                summary.inProgress /
                totalForChart
            ) *
            100
            : 0;

    const waitingPercentage =
        totalForChart > 0
            ? (
                summary.waiting /
                totalForChart
            ) *
            100
            : 0;

    const completedPercentage =
        totalForChart > 0
            ? (
                summary.completed /
                totalForChart
            ) *
            100
            : 0;

    const cancelledPercentage =
        totalForChart > 0
            ? (
                summary.cancelled /
                totalForChart
            ) *
            100
            : 0;

    const point1 =
        newPercentage;

    const point2 =
        point1 +
        inProgressPercentage;

    const point3 =
        point2 +
        waitingPercentage;

    const point4 =
        point3 +
        completedPercentage;

    const donutBackground =
        totalForChart === 0
            ? isDark
                ? "#1E293B"
                : "#E2E8F0"
            : `conic-gradient(
                #315F8C 0% ${point1}%,
                #B9853A ${point1}% ${point2}%,
                #94A3B8 ${point2}% ${point3}%,
                #4F8764 ${point3}% ${point4}%,
                #A85A5A ${point4}% ${point4 +
            cancelledPercentage
            }%
            )`;

    const chartItems = [
        {
            label: "Yeni",
            value: summary.new,
            color: "#315F8C",
        },
        {
            label: "Devam Ediyor",
            value:
                summary.inProgress,
            color: "#B9853A",
        },
        {
            label: "Beklemede",
            value:
                summary.waiting,
            color: "#94A3B8",
        },
        {
            label: "Tamamlandı",
            value:
                summary.completed,
            color: "#4F8764",
        },
        {
            label: "İptal Edildi",
            value:
                summary.cancelled,
            color: "#A85A5A",
        },
    ];

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight:
                        450,

                    display:
                        "flex",

                    flexDirection:
                        "column",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    gap: 2,
                }}
            >
                <CircularProgress
                    size={36}
                    sx={{
                        color:
                            "#163A63",
                    }}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Dashboard
                    yükleniyor...
                </Typography>
            </Box>
        );
    }

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
                            2.5,
                    }}
                >
                    {
                        errorMessage
                    }
                </Alert>
            )}

            {/* HERO */}

            <Paper
                elevation={0}
                sx={{
                    position:
                        "relative",

                    overflow:
                        "hidden",

                    mb: 2.75,

                    minHeight: {
                        xs: "auto",
                        lg: 190,
                    },

                    p: {
                        xs: 2.75,
                        sm: 3.25,
                        lg: 3.75,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius:
                        3.5,

                    background:
                        isDark
                            ? "linear-gradient(105deg, #111827 0%, #101B2B 55%, #172033 100%)"
                            : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 55%, #EEF3F7 100%)",
                }}
            >
                <Box
                    sx={{
                        position:
                            "absolute",

                        width: 390,
                        height: 390,

                        borderRadius:
                            "50%",

                        right: -130,
                        top: -225,

                        backgroundColor:
                            isDark
                                ? "rgba(72,104,138,0.06)"
                                : "rgba(49,95,140,0.035)",
                    }}
                />

                <Box
                    sx={{
                        position:
                            "relative",

                        zIndex: 1,

                        display:
                            "grid",

                        gridTemplateColumns:
                        {
                            xs: "1fr",
                            lg: "minmax(0, 1fr) 250px auto",
                        },

                        alignItems:
                            "center",

                        gap: {
                            xs: 3,
                            lg: 3.5,
                        },
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: 27,
                                    sm: 31,
                                },

                                fontWeight:
                                    800,

                                lineHeight:
                                    1.2,

                                letterSpacing:
                                    "-0.035em",
                            }}
                        >
                            Hoş Geldiniz,{" "}
                            {
                                currentUserName
                            }
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 1.25,

                                maxWidth:
                                    610,

                                lineHeight:
                                    1.75,
                            }}
                        >
                            Taleplerinizin
                            güncel
                            durumunu
                            buradan takip
                            edebilir ve
                            ihtiyaç
                            duyduğunuzda
                            yeni bir talep
                            oluşturabilirsiniz.
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                mt: 2.2,

                                alignItems:
                                    "center",

                                color:
                                    "text.secondary",
                            }}
                        >
                            <CalendarTodayRoundedIcon
                                sx={{
                                    fontSize:
                                        17,
                                    color:
                                        "#64748B",
                                }}
                            />

                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight:
                                        500,

                                    textTransform:
                                        "capitalize",
                                }}
                            >
                                {
                                    currentDate
                                }
                            </Typography>
                        </Stack>
                    </Box>

                    <HeroIllustration />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={
                            <AddRoundedIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/requests/create"
                            )
                        }
                        sx={{
                            justifySelf: {
                                xs: "start",
                                lg: "end",
                            },

                            minHeight:
                                47,

                            px: 2.75,

                            whiteSpace:
                                "nowrap",

                            borderRadius:
                                2.4,

                            textTransform:
                                "none",

                            fontWeight:
                                700,

                            backgroundColor:
                                "#163A63",

                            boxShadow:
                                "0 8px 18px rgba(22,58,99,0.17)",

                            "&:hover":
                            {
                                backgroundColor:
                                    "#102F51",

                                boxShadow:
                                    "0 9px 22px rgba(22,58,99,0.22)",
                            },
                        }}
                    >
                        Yeni Talep
                        Oluştur
                    </Button>
                </Box>
            </Paper>

            {/* SUMMARY */}

            <Box
                sx={{
                    mb: 1.6,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight:
                            750,
                    }}
                >
                    Talep Özeti
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 0.3,
                    }}
                >
                    Taleplerinizin
                    mevcut
                    durumuna hızlıca
                    göz atın.
                </Typography>
            </Box>

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        sm: "repeat(2, minmax(0, 1fr))",

                        xl: "repeat(4, minmax(0, 1fr))",
                    },

                    gap: 2.1,
                }}
            >
                <SummaryCard
                    title="Toplam Talebim"
                    value={
                        summary.total
                    }
                    description="Oluşturduğunuz tüm talepler"
                    icon={
                        <AssignmentRoundedIcon />
                    }
                    iconColor="#315F8C"
                    iconBackground="#EDF3F8"
                    softBackground="#F2F6FA"
                    lineColor="#315F8C"
                    onClick={() =>
                        navigate(
                            "/my-requests"
                        )
                    }
                />

                <SummaryCard
                    title="Yeni Talepler"
                    value={
                        summary.new
                    }
                    description="Henüz işleme alınmamış talepler"
                    icon={
                        <FiberNewRoundedIcon />
                    }
                    iconColor="#4A7294"
                    iconBackground="#EEF4F8"
                    softBackground="#F5F8FA"
                    lineColor="#4A7294"
                    badge={
                        summary.new > 0
                            ? "Yeni"
                            : undefined
                    }
                    onClick={() =>
                        navigate(
                            "/my-requests?status=1"
                        )
                    }
                />

                <SummaryCard
                    title="İşleme Alınan"
                    value={
                        summary.inProgress
                    }
                    description="Üzerinde çalışma devam eden talepler"
                    icon={
                        <PlayCircleOutlineRoundedIcon />
                    }
                    iconColor="#A47126"
                    iconBackground="#FBF5E9"
                    softBackground="#FCF8F1"
                    lineColor="#B9853A"
                    onClick={() =>
                        navigate(
                            "/my-requests?status=2"
                        )
                    }
                />

                <SummaryCard
                    title="Tamamlanan"
                    value={
                        summary.completed
                    }
                    description="Sonuçlandırılmış talepleriniz"
                    icon={
                        <CheckCircleOutlineRoundedIcon />
                    }
                    iconColor="#4F7E61"
                    iconBackground="#EEF5F0"
                    softBackground="#F4F8F5"
                    lineColor="#4F8764"
                    onClick={() =>
                        navigate(
                            "/my-requests?status=4"
                        )
                    }
                />
            </Box>

            {/* WAITING INFO */}

            {summary.waiting >
                0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 2.2,

                            px: 2.25,
                            py: 1.6,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                2.7,

                            backgroundColor:
                                isDark
                                    ? "rgba(185,133,58,0.04)"
                                    : "#FBF9F5",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.4}
                            sx={{
                                alignItems:
                                    "center",
                            }}
                        >
                            <AccessTimeRoundedIcon
                                sx={{
                                    color:
                                        "#A47126",
                                    fontSize:
                                        20,
                                }}
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Beklemede olan{" "}
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
                                        summary.waiting
                                    }
                                </Box>{" "}
                                talebiniz
                                bulunuyor.
                            </Typography>
                        </Stack>
                    </Paper>
                )}

            {/* CHART + RECENT */}

            <Box
                sx={{
                    mt: 2.7,

                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        lg: "390px minmax(0, 1fr)",

                        xl: "410px minmax(0, 1fr)",
                    },

                    gap: 2.4,
                }}
            >
                {/* CHART */}

                <Paper
                    elevation={0}
                    sx={{
                        p: 2.75,

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3.25,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                750,
                        }}
                    >
                        Taleplerimin
                        Dağılımı
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.35,
                        }}
                    >
                        Durumlarına
                        göre genel
                        dağılım.
                    </Typography>

                    <Box
                        sx={{
                            mt: 2.5,

                            display:
                                "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",
                                sm: "170px minmax(0, 1fr)",
                                lg: "1fr",
                                xl: "170px minmax(0, 1fr)",
                            },

                            alignItems:
                                "center",

                            gap: 2.6,
                        }}
                    >
                        <Box
                            sx={{
                                mx: "auto",

                                width:
                                    168,

                                height:
                                    168,

                                borderRadius:
                                    "50%",

                                background:
                                    donutBackground,

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                position:
                                    "relative",

                                boxShadow:
                                    isDark
                                        ? "none"
                                        : "0 10px 26px rgba(22,58,99,0.07)",

                                "&::after":
                                {
                                    content:
                                        '""',

                                    position:
                                        "absolute",

                                    width:
                                        "69%",

                                    height:
                                        "69%",

                                    borderRadius:
                                        "50%",

                                    backgroundColor:
                                        "background.paper",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    position:
                                        "relative",

                                    zIndex: 2,

                                    textAlign:
                                        "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize:
                                            31,

                                        lineHeight:
                                            1,

                                        fontWeight:
                                            800,
                                    }}
                                >
                                    {
                                        summary.total
                                    }
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display:
                                            "block",

                                        mt: 0.6,
                                    }}
                                >
                                    Toplam
                                </Typography>
                            </Box>
                        </Box>

                        <Stack
                            spacing={1.45}
                        >
                            {chartItems.map(
                                (
                                    item
                                ) => (
                                    <Box
                                        key={
                                            item.label
                                        }
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
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{
                                                alignItems:
                                                    "center",

                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width:
                                                        8,

                                                    height:
                                                        8,

                                                    borderRadius:
                                                        "50%",

                                                    flexShrink:
                                                        0,

                                                    backgroundColor:
                                                        item.color,
                                                }}
                                            />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize:
                                                        12.5,
                                                }}
                                            >
                                                {
                                                    item.label
                                                }
                                            </Typography>
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight:
                                                    750,
                                            }}
                                        >
                                            {
                                                item.value
                                            }
                                        </Typography>
                                    </Box>
                                )
                            )}
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            mt: 2.6,
                            pt: 2,

                            borderTop:
                                "1px solid",

                            borderColor:
                                "divider",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            gap: 0.8,

                            color:
                                "text.secondary",
                        }}
                    >
                        <TaskAltRoundedIcon
                            sx={{
                                fontSize:
                                    17,
                                color:
                                    "#5F7F6E",
                            }}
                        />

                        <Typography
                            variant="caption"
                        >
                            Taleplerinizin
                            güncel durumu
                            gösteriliyor.
                        </Typography>
                    </Box>
                </Paper>

                {/* RECENT REQUESTS */}

                <Paper
                    elevation={0}
                    sx={{
                        overflow:
                            "hidden",

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3.25,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            px: {
                                xs: 2.5,
                                sm: 3,
                            },

                            py: 2.6,

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
                                        750,
                                }}
                            >
                                Son
                                Taleplerim
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.35,
                                }}
                            >
                                En son
                                oluşturduğunuz
                                talepler ve
                                güncel
                                durumları.
                            </Typography>
                        </Box>

                        <Button
                            endIcon={
                                <ArrowForwardRoundedIcon />
                            }
                            onClick={() =>
                                navigate(
                                    "/my-requests"
                                )
                            }
                            sx={{
                                flexShrink:
                                    0,

                                textTransform:
                                    "none",

                                fontWeight:
                                    700,

                                color:
                                    isDark
                                        ? "primary.light"
                                        : "#163A63",
                            }}
                        >
                            Tüm
                            Taleplerimi
                            Gör
                        </Button>
                    </Box>

                    <Divider />

                    {recentRequests.length ===
                        0 ? (
                        <Box
                            sx={{
                                minHeight:
                                    290,

                                px: 3,
                                py: 6,

                                textAlign:
                                    "center",

                                display:
                                    "flex",

                                flexDirection:
                                    "column",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width:
                                        58,

                                    height:
                                        58,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    borderRadius:
                                        3,

                                    backgroundColor:
                                        isDark
                                            ? "rgba(255,255,255,0.04)"
                                            : "#F0F4F7",
                                }}
                            >
                                <DescriptionRoundedIcon
                                    sx={{
                                        color:
                                            "text.disabled",

                                        fontSize:
                                            29,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h6"
                                sx={{
                                    mt: 1.5,
                                    fontWeight:
                                        700,
                                }}
                            >
                                Henüz
                                talebiniz
                                bulunmuyor
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                }}
                            >
                                İlk
                                talebinizi
                                oluşturarak
                                başlayabilirsiniz.
                            </Typography>

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
                                    mt: 2.4,

                                    borderRadius:
                                        2.2,

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        700,

                                    backgroundColor:
                                        "#163A63",

                                    boxShadow:
                                        "none",

                                    "&:hover":
                                    {
                                        backgroundColor:
                                            "#102F51",

                                        boxShadow:
                                            "none",
                                    },
                                }}
                            >
                                İlk Talebi
                                Oluştur
                            </Button>
                        </Box>
                    ) : (
                        recentRequests.map(
                            (
                                request,
                                index
                            ) => (
                                <Box
                                    key={
                                        request.id
                                    }
                                >
                                    {index >
                                        0 && (
                                            <Divider />
                                        )}

                                    <Box
                                        onClick={() =>
                                            navigate(
                                                `/requests/${request.id}`
                                            )
                                        }
                                        sx={{
                                            px: {
                                                xs: 2.4,
                                                sm: 2.8,
                                            },

                                            py: 2.05,

                                            display:
                                                "grid",

                                            gridTemplateColumns:
                                            {
                                                xs: "44px minmax(0, 1fr)",

                                                md: "46px minmax(0, 1fr) auto 22px",
                                            },

                                            alignItems:
                                                "center",

                                            gap: 1.6,

                                            cursor:
                                                "pointer",

                                            transition:
                                                "background-color 0.17s ease",

                                            "&:hover":
                                            {
                                                backgroundColor:
                                                    isDark
                                                        ? "rgba(255,255,255,0.025)"
                                                        : "#F8FAFC",
                                            },

                                            "&:hover .request-arrow":
                                            {
                                                transform:
                                                    "translateX(2px)",

                                                color:
                                                    isDark
                                                        ? "primary.light"
                                                        : "#163A63",
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width:
                                                    44,

                                                height:
                                                    44,

                                                borderRadius:
                                                    2.3,

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                justifyContent:
                                                    "center",

                                                backgroundColor:
                                                    isDark
                                                        ? "rgba(49,95,140,0.11)"
                                                        : "#EFF4F8",

                                                color:
                                                    "#315F8C",
                                            }}
                                        >
                                            {request.priority >=
                                                3 ? (
                                                <ShieldOutlinedIcon
                                                    sx={{
                                                        fontSize:
                                                            22,
                                                    }}
                                                />
                                            ) : (
                                                <DescriptionRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            21,
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{
                                                    alignItems:
                                                        "center",

                                                    minWidth:
                                                        0,
                                                }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        minWidth:
                                                            0,

                                                        maxWidth:
                                                            "100%",

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
                                                    {
                                                        request.title
                                                    }
                                                </Typography>

                                                {request.isOverdue && (
                                                    <Chip
                                                        label="Gecikmiş"
                                                        size="small"
                                                        sx={{
                                                            display:
                                                            {
                                                                xs: "none",
                                                                sm: "inline-flex",
                                                            },

                                                            height:
                                                                21,

                                                            fontSize:
                                                                10,

                                                            fontWeight:
                                                                700,

                                                            color:
                                                                "#9B4F4F",

                                                            backgroundColor:
                                                                isDark
                                                                    ? "rgba(168,90,90,0.09)"
                                                                    : "#FAF1F1",
                                                        }}
                                                    />
                                                )}
                                            </Stack>

                                            <Stack
                                                direction="row"
                                                sx={{
                                                    mt: 0.65,

                                                    alignItems:
                                                        "center",

                                                    flexWrap:
                                                        "wrap",

                                                    columnGap:
                                                        0.8,

                                                    rowGap:
                                                        0.3,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Talep
                                                    #
                                                    {
                                                        request.id
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                >
                                                    •
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color:
                                                            getPriorityColor(
                                                                request.priority
                                                            ),

                                                        fontWeight:
                                                            600,
                                                    }}
                                                >
                                                    {getPriorityText(
                                                        request.priority
                                                    )}{" "}
                                                    Öncelik
                                                </Typography>

                                                {request.categoryName && (
                                                    <>
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
                                                                request.categoryName
                                                            }
                                                        </Typography>
                                                    </>
                                                )}

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
                                                        request.createdAt
                                                    )}
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Chip
                                            label={getStatusText(
                                                request.status
                                            )}
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                display:
                                                {
                                                    xs: "none",
                                                    md: "inline-flex",
                                                },

                                                justifySelf:
                                                    "end",

                                                height:
                                                    27,

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

                                        <ChevronRightRoundedIcon
                                            className="request-arrow"
                                            sx={{
                                                display:
                                                {
                                                    xs: "none",
                                                    md: "block",
                                                },

                                                color:
                                                    "text.disabled",

                                                fontSize:
                                                    21,

                                                transition:
                                                    "transform 0.17s ease, color 0.17s ease",
                                            }}
                                        />
                                    </Box>
                                </Box>
                            )
                        )
                    )}

                    {recentRequests.length >
                        0 && (
                            <>
                                <Divider />

                                <Box
                                    sx={{
                                        py: 1.3,

                                        display:
                                            "flex",

                                        justifyContent:
                                            "center",
                                    }}
                                >
                                    <Button
                                        endIcon={
                                            <ArrowForwardRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        "18px !important",
                                                }}
                                            />
                                        }
                                        onClick={() =>
                                            navigate(
                                                "/my-requests"
                                            )
                                        }
                                        sx={{
                                            textTransform:
                                                "none",

                                            fontSize:
                                                13,

                                            fontWeight:
                                                700,

                                            color:
                                                isDark
                                                    ? "primary.light"
                                                    : "#315F8C",
                                        }}
                                    >
                                        Tüm
                                        Taleplerimi
                                        Gör
                                    </Button>
                                </Box>
                            </>
                        )}
                </Paper>
            </Box>

            {/* INFORMATION BANNER */}

            <Paper
                elevation={0}
                sx={{
                    position:
                        "relative",

                    overflow:
                        "hidden",

                    mt: 2.4,

                    p: {
                        xs: 2.3,
                        sm: 2.6,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        isDark
                            ? "rgba(148,163,184,0.12)"
                            : "#DCE5EC",

                    borderRadius:
                        3.1,

                    background:
                        isDark
                            ? "linear-gradient(100deg, rgba(49,95,140,0.09), rgba(15,23,42,0))"
                            : "linear-gradient(100deg, #F3F7FA, #F9FBFC)",
                }}
            >
                <Box
                    sx={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        gap: 1.8,

                        pr: {
                            xs: 0,
                            sm: 9,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 42,

                            height: 42,

                            flexShrink:
                                0,

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
                                isDark
                                    ? "rgba(49,95,140,0.13)"
                                    : "#E7EFF5",
                        }}
                    >
                        <InfoOutlinedIcon
                            sx={{
                                fontSize:
                                    21,
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight:
                                    750,
                            }}
                        >
                            Bilgilendirme
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.35,

                                lineHeight:
                                    1.6,
                            }}
                        >
                            Taleplerinizle
                            ilgili
                            gelişmeler
                            olduğunda
                            bildirimler
                            üzerinden
                            bilgilendirileceksiniz.
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        position:
                            "absolute",

                        right: 25,

                        top: "50%",

                        transform:
                            "translateY(-50%)",

                        display:
                        {
                            xs: "none",
                            sm: "flex",
                        },

                        width: 58,

                        height: 48,

                        borderRadius:
                            2.5,

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        color:
                            "#6D8CA7",

                        backgroundColor:
                            isDark
                                ? "rgba(255,255,255,0.025)"
                                : "#EAF1F6",
                    }}
                >
                    <MailOutlineRoundedIcon
                        sx={{
                            fontSize:
                                26,
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}

export default UserDashboard;
