import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";

export interface ReportSummary {
    totalTasks: number;
    newTasks: number;
    inProgressTasks: number;
    onHoldTasks: number;
    completedTasks: number;
    cancelledTasks: number;
    overdueTasks: number;
    lowPriorityTasks: number;
    mediumPriorityTasks: number;
    highPriorityTasks: number;
    criticalPriorityTasks: number;
    userAssignedTasks: number;
    groupAssignedTasks: number;
    activeTasks: number;
    awaitingAssignmentTasks: number;
}

export function ReportContent({ report, isManager = false }: { report: ReportSummary; isManager?: boolean }) {
    const completionRate = report.totalTasks ? Math.round(report.completedTasks / report.totalTasks * 100) : 0;
    return (
        <Box>
            {/* ÖZET KARTLARI */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs: "1fr",

                        sm:
                            "repeat(2, minmax(0, 1fr))",

                        xl:
                            "repeat(4, minmax(0, 1fr))",
                    },

                    gap: 2,

                    mb: 3,
                }}
            >
                <SummaryCard
                    title="Toplam Görev"
                    value={
                        report.totalTasks
                    }
                    subtitle={
                        isManager
                            ? "Grubunuza ait silinmemiş tüm görevler"
                            : "Silinmemiş tüm görevler"
                    }
                    icon={
                        <AssignmentRoundedIcon />
                    }
                    iconColor="#2563EB"
                />

                <SummaryCard
                    title="Tamamlanan"
                    value={
                        report.completedTasks
                    }
                    subtitle={`${completionRate}% tamamlanma oranı`}
                    icon={
                        <CheckCircleRoundedIcon />
                    }
                    iconColor="#16A34A"
                />

                <SummaryCard
                    title="Devam Eden"
                    value={
                        report.inProgressTasks
                    }
                    subtitle={
                        isManager
                            ? "Grubunuzda üzerinde çalışılan görevler"
                            : "Üzerinde çalışılan görevler"
                    }
                    icon={
                        <AutorenewRoundedIcon />
                    }
                    iconColor="#D97706"
                />

                <SummaryCard
                    title="Geciken"
                    value={
                        report.overdueTasks
                    }
                    subtitle={
                        isManager
                            ? "Grubunuzdaki geciken görevler"
                            : "Bitiş tarihi geçen görevler"
                    }
                    icon={
                        <WarningAmberRoundedIcon />
                    }
                    iconColor="#DC2626"
                />
            </Box>

            {/* ANA RAPORLAR */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs: "1fr",

                        lg:
                            "repeat(2, minmax(0, 1fr))",
                    },

                    gap: 3,
                }}
            >
                {/* DURUM DAĞILIMI */}

                <ReportCard
                    title="Görev Durum Dağılımı"
                    description={
                        isManager
                            ? "Grubunuza ait görevlerin mevcut durumlara göre dağılımı."
                            : "Görevlerin mevcut durumlara göre dağılımı."
                    }
                    icon={
                        <AssessmentRoundedIcon />
                    }
                >
                    <Box
                        sx={{
                            display: "flex",

                            flexDirection:
                                "column",

                            gap: 2.25,
                        }}
                    >
                        <DistributionRow
                            label="Yeni"
                            value={
                                report.newTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#2563EB"
                        />

                        <DistributionRow
                            label="Devam Ediyor"
                            value={
                                report.inProgressTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#F59E0B"
                        />

                        <DistributionRow label="Beklemede" value={report.onHoldTasks} total={report.totalTasks} barColor="#8B5CF6" />
                        <DistributionRow
                            label="Tamamlandı"
                            value={
                                report.completedTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#22C55E"
                        />

                        <DistributionRow
                            label="İptal Edildi"
                            value={
                                report.cancelledTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#94A3B8"
                        />

                        <Typography variant="caption" color="text.secondary">
                            Geciken görevler yukarıdaki açık durumların bir alt kümesidir; toplama tekrar eklenmez.
                        </Typography>
                        <DistributionRow
                            label="Geciken"
                            value={
                                report.overdueTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#EF4444"
                        />
                    </Box>
                </ReportCard>

                {/* ÖNCELİK DAĞILIMI */}

                <ReportCard
                    title="Öncelik Dağılımı"
                    description={
                        isManager
                            ? "Grubunuza ait görevlerin öncelik seviyelerine göre dağılımı."
                            : "Görevlerin öncelik seviyelerine göre dağılımı."
                    }
                    icon={
                        <FlagRoundedIcon />
                    }
                >
                    <Box
                        sx={{
                            display: "flex",

                            flexDirection:
                                "column",

                            gap: 2.25,
                        }}
                    >
                        <DistributionRow
                            label="Düşük"
                            value={
                                report.lowPriorityTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#22C55E"
                        />

                        <DistributionRow
                            label="Orta"
                            value={
                                report.mediumPriorityTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#3B82F6"
                        />

                        <DistributionRow
                            label="Yüksek"
                            value={
                                report.highPriorityTasks
                            }
                            total={
                                report.totalTasks
                            }
                            barColor="#EF4444"
                        />
                        <DistributionRow label="Kritik" value={report.criticalPriorityTasks} total={report.totalTasks} barColor="#B91C1C" />
                    </Box>
                </ReportCard>

                {/* ATAMA DAĞILIMI */}

                <ReportCard
                    title="Atama Dağılımı"
                    description={
                        isManager
                            ? "Grubunuza ait görevlerin kişi ve grup atamalarına göre dağılımı."
                            : "Kişiye atanmış görev aynı zamanda bir gruba bağlı olabilir; bu sayılar toplanmaz."
                    }
                    icon={
                        <GroupsRoundedIcon />
                    }
                >
                    <Box
                        sx={{
                            display: "grid",

                            gridTemplateColumns: {
                                xs: "1fr",

                                sm:
                                    "repeat(2, minmax(0, 1fr))",
                            },

                            gap: 2,
                        }}
                    >
                        <AssignmentCard
                            title="Kişiye Atanan"
                            value={
                                report.userAssignedTasks
                            }
                            icon={
                                <PersonRoundedIcon />
                            }
                        />

                        <AssignmentCard
                            title="Gruba Atanan"
                            value={
                                report.groupAssignedTasks
                            }
                            icon={
                                <GroupsRoundedIcon />
                            }
                        />
                    </Box>
                </ReportCard>

                {/* GENEL PERFORMANS */}

                <ReportCard
                    title={
                        isManager
                            ? "Grup Görev Performansı"
                            : "Genel Görev Performansı"
                    }
                    description={
                        isManager
                            ? "Grubunuzun tamamlanma ve açık görev oranlarının özeti."
                            : "Tamamlanma ve açık görev oranlarının genel özeti."
                    }
                    icon={
                        <AssessmentRoundedIcon />
                    }
                >
                    <Box
                        sx={{
                            display: "flex",

                            flexDirection:
                                "column",

                            gap: 3,
                        }}
                    >
                        <Box>
                            <Box
                                sx={{
                                    display:
                                        "flex",

                                    justifyContent:
                                        "space-between",

                                    gap: 2,

                                    mb: 1,
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
                                    Tamamlanma Oranı
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            800,

                                        color:
                                            "success.main",
                                    }}
                                >
                                    {
                                        completionRate
                                    }
                                    %
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    height: 10,

                                    overflow:
                                        "hidden",

                                    borderRadius:
                                        999,

                                    backgroundColor:
                                        "action.hover",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: `${completionRate}%`,

                                        height:
                                            "100%",

                                        borderRadius:
                                            999,

                                        backgroundColor:
                                            "#22C55E",

                                        transition:
                                            "width 0.3s ease",
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "grid",

                                gridTemplateColumns:
                                {
                                    xs:
                                        "repeat(2, minmax(0, 1fr))",

                                    sm:
                                        "repeat(3, minmax(0, 1fr))",
                                },

                                gap: 1.5,
                            }}
                        >
                            <MiniStat
                                title="Açık"
                                value={
                                    report.totalTasks -
                                    report.completedTasks -
                                    report.cancelledTasks
                                }
                            />

                            <MiniStat
                                title="Tamamlanan"
                                value={
                                    report.completedTasks
                                }
                            />

                            <MiniStat
                                title="İptal"
                                value={
                                    report.cancelledTasks
                                }
                            />
                        </Box>
                    </Box>
                </ReportCard>
            </Box>
        </Box>
    );
}

interface SummaryCardProps {
    title: string;
    value: number;
    subtitle: string;
    icon: ReactNode;
    iconColor: string;
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
    iconColor,
}: SummaryCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,

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

                            fontWeight:
                                800,

                            letterSpacing:
                                "-0.03em",

                            color:
                                "text.primary",
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

                            mt: 0.35,
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 46,
                        height: 46,

                        flexShrink: 0,

                        display: "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        borderRadius:
                            2.5,

                        color:
                            iconColor,

                        backgroundColor:
                            "action.hover",

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

interface ReportCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
}

function ReportCard({
    title,
    description,
    icon,
    children,
}: ReportCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: {
                    xs: 2,
                    sm: 3,
                },

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

                    gap: 1.5,

                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        width: 42,
                        height: 42,

                        flexShrink: 0,

                        borderRadius:
                            2,

                        display: "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        color:
                            "primary.main",

                        backgroundColor:
                            "action.hover",
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                700,

                            color:
                                "text.primary",
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.25,
                        }}
                    >
                        {description}
                    </Typography>
                </Box>
            </Box>

            {children}
        </Paper>
    );
}

interface DistributionRowProps {
    label: string;
    value: number;
    total: number;
    barColor: string;
}

function DistributionRow({
    label,
    value,
    total,
    barColor,
}: DistributionRowProps) {
    const percentage =
        total === 0
            ? 0
            : Math.round(
                (value / total) *
                100
            );

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",

                    justifyContent:
                        "space-between",

                    gap: 2,

                    mb: 0.75,
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,

                        color:
                            "text.primary",
                    }}
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    <strong>
                        {value}
                    </strong>
                    {" · "}
                    {percentage}%
                </Typography>
            </Box>

            <Box
                sx={{
                    height: 9,

                    overflow: "hidden",

                    borderRadius: 999,

                    backgroundColor:
                        "action.hover",
                }}
            >
                <Box
                    sx={{
                        width: `${percentage}%`,

                        minWidth:
                            value > 0
                                ? 5
                                : 0,

                        height: "100%",

                        borderRadius:
                            999,

                        backgroundColor:
                            barColor,

                        transition:
                            "width 0.3s ease",
                    }}
                />
            </Box>
        </Box>
    );
}

interface AssignmentCardProps {
    title: string;
    value: number;
    icon: ReactNode;
}

function AssignmentCard({
    title,
    value,
    icon,
}: AssignmentCardProps) {
    return (
        <Box
            sx={{
                p: 2.5,

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
            <Box
                sx={{
                    width: 40,
                    height: 40,

                    mb: 2,

                    borderRadius:
                        2,

                    display: "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    color:
                        "primary.main",

                    backgroundColor:
                        "background.paper",
                }}
            >
                {icon}
            </Box>

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
                    mt: 0.5,

                    fontWeight:
                        800,

                    color:
                        "text.primary",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

interface MiniStatProps {
    title: string;
    value: number;
}

function MiniStat({
    title,
    value,
}: MiniStatProps) {
    return (
        <Box
            sx={{
                p: 2,

                textAlign:
                    "center",

                border:
                    "1px solid",

                borderColor:
                    "divider",

                borderRadius: 2,

                backgroundColor:
                    "action.hover",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 800,

                    color:
                        "text.primary",
                }}
            >
                {value}
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
            >
                {title}
            </Typography>
        </Box>
    );
}
