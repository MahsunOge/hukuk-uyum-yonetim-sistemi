import {
    Box,
    Chip,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

interface DashboardChartsProps {
    total: number;
    newCount: number;
    inProgressCount: number;
    waitingCount: number;
    completedCount: number;
    cancelledCount: number;
}

interface StatusLegendItemProps {
    label: string;
    value: number;
    color: string;
}

function StatusLegendItem({
    label,
    value,
    color,
}: StatusLegendItemProps) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                    "space-between",
                gap: 2,
                py: 0.75,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor:
                            color,
                        flexShrink: 0,
                    }}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {label}
                </Typography>
            </Box>

            <Typography
                variant="body2"
                sx={{
                    fontWeight: 700,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function DashboardCharts({
    total,
    newCount,
    inProgressCount,
    waitingCount,
    completedCount,
    cancelledCount,
}: DashboardChartsProps) {
    const safeTotal =
        total > 0
            ? total
            : 1;

    const newPercent =
        (newCount /
            safeTotal) *
        100;

    const inProgressPercent =
        (inProgressCount /
            safeTotal) *
        100;

    const waitingPercent =
        (waitingCount /
            safeTotal) *
        100;

    const completedPercent =
        (completedCount /
            safeTotal) *
        100;

    const cancelledPercent =
        (cancelledCount /
            safeTotal) *
        100;

    const completedRate =
        total > 0
            ? Math.round(
                (
                    completedCount /
                    total
                ) *
                100
            )
            : 0;

    const activeTaskCount =
        newCount +
        inProgressCount +
        waitingCount;

    const resolvedTaskCount =
        completedCount +
        cancelledCount;

    const firstEnd =
        newPercent;

    const secondEnd =
        firstEnd +
        inProgressPercent;

    const thirdEnd =
        secondEnd +
        waitingPercent;

    const fourthEnd =
        thirdEnd +
        completedPercent;

    const fifthEnd =
        fourthEnd +
        cancelledPercent;

    const donutBackground =
        `conic-gradient(
            #0284C7 0% ${firstEnd}%,
            #7C3AED ${firstEnd}% ${secondEnd}%,
            #D97706 ${secondEnd}% ${thirdEnd}%,
            #16A34A ${thirdEnd}% ${fourthEnd}%,
            #64748B ${fourthEnd}% ${fifthEnd}%,
            #64748B ${fifthEnd}% 100%
        )`;

    return (
        <Box
            sx={{
                mt: 4,
            }}
        >
            <Box
                sx={{
                    mb: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                    }}
                >
                    Görev Analizi
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Görevlerin durum dağılımını
                    ve genel tamamlanma oranını
                    inceleyin.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",
                        lg: "repeat(2, minmax(0, 1fr))",
                    },

                    gap: 2.5,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2.5,
                            sm: 3,
                        },

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3,

                        minHeight:
                            340,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            Görev Durum
                            Dağılımı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Sistemdeki görevlerin
                            mevcut durumlara göre
                            dağılımı.
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
                                    "180px 1fr",
                            },

                            gap: 3,

                            alignItems:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                display:
                                    "flex",

                                justifyContent:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width:
                                        170,

                                    height:
                                        170,

                                    borderRadius:
                                        "50%",

                                    background:
                                        total === 0
                                            ? "action.hover"
                                            : donutBackground,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    position:
                                        "relative",
                                }}
                            >
                                <Box
                                    sx={{
                                        width:
                                            112,

                                        height:
                                            112,

                                        borderRadius:
                                            "50%",

                                        backgroundColor:
                                            "background.paper",

                                        display:
                                            "flex",

                                        flexDirection:
                                            "column",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        boxShadow:
                                            "0 0 0 1px rgba(148, 163, 184, 0.12)",
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight:
                                                800,

                                            lineHeight:
                                                1,
                                        }}
                                    >
                                        {
                                            total
                                        }
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.75,
                                        }}
                                    >
                                        Toplam
                                        Görev
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <StatusLegendItem
                                label="Yeni"
                                value={
                                    newCount
                                }
                                color="#0284C7"
                            />

                            <StatusLegendItem
                                label="Devam Ediyor"
                                value={
                                    inProgressCount
                                }
                                color="#7C3AED"
                            />

                            <StatusLegendItem
                                label="Beklemede"
                                value={
                                    waitingCount
                                }
                                color="#D97706"
                            />

                            <StatusLegendItem
                                label="Tamamlandı"
                                value={
                                    completedCount
                                }
                                color="#16A34A"
                            />

                            <StatusLegendItem
                                label="İptal Edildi"
                                value={
                                    cancelledCount
                                }
                                color="#64748B"
                            />
                        </Box>
                    </Box>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2.5,
                            sm: 3,
                        },

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3,

                        minHeight:
                            340,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            Genel İlerleme
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Tamamlanan görevlerin
                            toplam görevlere oranı.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",

                            alignItems:
                                "flex-end",

                            gap: 1,

                            mb: 1.5,
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight:
                                    800,

                                lineHeight:
                                    1,

                                letterSpacing:
                                    "-0.05em",
                            }}
                        >
                            {
                                completedRate
                            }
                        </Typography>

                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{
                                pb: 0.5,

                                fontWeight:
                                    600,
                            }}
                        >
                            %
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={
                            completedRate
                        }
                        sx={{
                            height: 10,

                            borderRadius:
                                10,

                            mb: 3,

                            backgroundColor:
                                "action.hover",

                            "& .MuiLinearProgress-bar":
                            {
                                borderRadius:
                                    10,

                                backgroundColor:
                                    "#16A34A",
                            },
                        }}
                    />

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
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,

                                borderRadius:
                                    2,

                                backgroundColor:
                                    "action.hover",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Aktif Görevler
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    mt: 0.5,

                                    fontWeight:
                                        800,
                                }}
                            >
                                {
                                    activeTaskCount
                                }
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mt: 1,

                                    flexWrap:
                                        "wrap",

                                    gap: 0.75,
                                }}
                            >
                                <Chip
                                    size="small"
                                    label={`${newCount} Yeni`}
                                    sx={{
                                        backgroundColor:
                                            "rgba(2, 132, 199, 0.14)",

                                        color:
                                            "info.main",
                                    }}
                                />

                                <Chip
                                    size="small"
                                    label={`${inProgressCount} Devam`}
                                    sx={{
                                        backgroundColor:
                                            "rgba(124, 58, 237, 0.14)",

                                        color:
                                            "#8B5CF6",
                                    }}
                                />
                            </Stack>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,

                                borderRadius:
                                    2,

                                backgroundColor:
                                    "action.hover",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Sonuçlanan
                                Görevler
                            </Typography>

                            <Typography
                                variant="h4"
                                sx={{
                                    mt: 0.5,

                                    fontWeight:
                                        800,
                                }}
                            >
                                {
                                    resolvedTaskCount
                                }
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mt: 1,

                                    flexWrap:
                                        "wrap",

                                    gap: 0.75,
                                }}
                            >
                                <Chip
                                    size="small"
                                    label={`${completedCount} Tamam`}
                                    sx={{
                                        backgroundColor:
                                            "rgba(22, 163, 74, 0.14)",

                                        color:
                                            "success.main",
                                    }}
                                />

                                <Chip
                                    size="small"
                                    label={`${cancelledCount} İptal`}
                                    sx={{
                                        backgroundColor:
                                            "action.hover",

                                        color:
                                            "text.secondary",
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default DashboardCharts;
