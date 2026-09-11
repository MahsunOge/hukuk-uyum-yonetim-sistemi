import {
    Box,
    Chip,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

interface AdminDashboardAnalyticsProps {
    total: number;
    newCount: number;
    inProgressCount: number;
    waitingCount: number;
    completedCount: number;
    cancelledCount: number;
    overdueCount: number;
    upcomingCount: number;
    groupCount: number;
    pendingApplicationCount: number;
}

interface MetricRowProps {
    label: string;
    value: number;
    color?: string;
}

function MetricRow({
    label,
    value,
    color = "text.primary",
}: MetricRowProps) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 1,
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    fontWeight: 800,
                    color,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function AdminDashboardAnalytics({
    total,
    newCount,
    inProgressCount,
    waitingCount,
    completedCount,
    cancelledCount,
    overdueCount,
    upcomingCount,
    groupCount,
    pendingApplicationCount,
}: AdminDashboardAnalyticsProps) {
    const safeTotal =
        total > 0
            ? total
            : 1;

    const activeCount =
        newCount +
        inProgressCount +
        waitingCount;

    const resolvedCount =
        completedCount +
        cancelledCount;

    const completionRate =
        total > 0
            ? Math.round(
                (
                    completedCount /
                    total
                ) *
                100
            )
            : 0;

    const overdueRate =
        total > 0
            ? Math.round(
                (
                    overdueCount /
                    total
                ) *
                100
            )
            : 0;

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
        total === 0
            ? "#E2E8F0"
            : `conic-gradient(
                #0284C7 0% ${firstEnd}%,
                #7C3AED ${firstEnd}% ${secondEnd}%,
                #D97706 ${secondEnd}% ${thirdEnd}%,
                #16A34A ${thirdEnd}% ${fourthEnd}%,
                #64748B ${fourthEnd}% ${fifthEnd}%,
                #E2E8F0 ${fifthEnd}% 100%
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
                    Yönetim Analizi
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Sistem genelindeki görev,
                    operasyon ve kullanıcı
                    hareketlerini özetleyin.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2.5,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        minHeight: 330,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Sistem Görev Dağılımı
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 3,
                        }}
                    >
                        Görevlerin mevcut durumlara göre dağılımı.
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 160,
                                height: 160,
                                borderRadius: "50%",
                                background: donutBackground,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 104,
                                    height: 104,
                                    borderRadius: "50%",
                                    backgroundColor: "background.paper",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow:
                                        "0 0 0 1px rgba(148, 163, 184, 0.12)",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 800,
                                        lineHeight: 1,
                                    }}
                                >
                                    {total}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.75,
                                    }}
                                >
                                    Toplam Görev
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Stack spacing={0.25}>
                        <MetricRow
                            label="Yeni"
                            value={newCount}
                        />

                        <MetricRow
                            label="Devam Ediyor"
                            value={inProgressCount}
                        />

                        <MetricRow
                            label="Beklemede"
                            value={waitingCount}
                        />

                        <MetricRow
                            label="Tamamlandı"
                            value={completedCount}
                            color="#16A34A"
                        />

                        <MetricRow
                            label="İptal Edildi"
                            value={cancelledCount}
                            color="#64748B"
                        />
                    </Stack>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        minHeight: 330,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Operasyon Durumu
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 3,
                        }}
                    >
                        Aktif, sonuçlanan ve zaman açısından riskli görevler.
                    </Typography>

                    <Box
                        sx={{
                            mb: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 1,
                                mb: 1,
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    lineHeight: 1,
                                }}
                            >
                                {completionRate}
                            </Typography>

                            <Typography
                                variant="h6"
                                color="text.secondary"
                            >
                                %
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 1,
                            }}
                        >
                            Görev tamamlanma oranı
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={completionRate}
                            sx={{
                                height: 9,
                                borderRadius: 10,
                                backgroundColor: "#E2E8F0",

                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 10,
                                    backgroundColor: "#16A34A",
                                },
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            mt: 3,
                        }}
                    >
                        <MetricRow
                            label="Aktif Görev"
                            value={activeCount}
                        />

                        <MetricRow
                            label="Sonuçlanan Görev"
                            value={resolvedCount}
                        />

                        <MetricRow
                            label="Yaklaşan Görev"
                            value={upcomingCount}
                            color="#D97706"
                        />

                        <MetricRow
                            label="Geciken Görev"
                            value={overdueCount}
                            color="#DC2626"
                        />
                    </Box>

                    {overdueCount > 0 && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: "#FEF2F2",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Gecikme oranı
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 800,
                                    color: "#DC2626",
                                }}
                            >
                                %{overdueRate}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        minHeight: 330,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Sistem Bilgileri
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            mb: 3,
                        }}
                    >
                        Yönetim açısından önemli sistem göstergeleri.
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 2,
                        }}
                    >
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                backgroundColor: "#F8FAFC",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Çalışma Grupları
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 800,
                                }}
                            >
                                {groupCount}
                            </Typography>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                backgroundColor: "#F8FAFC",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Bekleyen Başvurular
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mt: 0.75,
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 800,
                                    }}
                                >
                                    {pendingApplicationCount}
                                </Typography>

                                {pendingApplicationCount > 0 && (
                                    <Chip
                                        size="small"
                                        color="warning"
                                        label="İşlem Bekliyor"
                                    />
                                )}
                            </Stack>
                        </Paper>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                backgroundColor: "#F8FAFC",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Toplam Sistem Görevi
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{
                                    mt: 0.5,
                                    fontWeight: 800,
                                }}
                            >
                                {total}
                            </Typography>
                        </Paper>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default AdminDashboardAnalytics;
