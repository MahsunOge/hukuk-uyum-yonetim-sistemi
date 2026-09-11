import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import SyncAltRoundedIcon from "@mui/icons-material/SyncAltRounded";

import api from "../api/axios";

interface AuditLogItem {
    id: number;
    userId: string | null;
    userFullName: string;
    action: string;
    entityType: string;
    entityId: string | null;
    description: string;
    createdAt: string;
}

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}: SummaryCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.25,
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
            <Box
                sx={{
                    display:
                        "flex",
                    alignItems:
                        "flex-start",
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
                            mt: 0.6,
                            fontWeight:
                                800,
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
                            mt: 0.5,
                        }}
                    >
                        {subtitle}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius:
                            2.5,
                        display:
                            "flex",
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        color:
                            "#163A63",
                        backgroundColor:
                            "action.hover",
                        flexShrink:
                            0,
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

const getActionLabel = (
    action: string
) => {
    switch (action) {
        case "TASK_CREATED":
            return "Görev Oluşturuldu";

        case "TASK_ASSIGNED":
            return "Görev Atandı";

        case "TASK_STATUS_CHANGED":
            return "Durum Değiştirildi";

        case "REQUEST_CREATED":
            return "Talep Oluşturuldu";

        case "REQUEST_ASSIGNED":
            return "Talep Devredildi";

        case "USER_UPDATED":
            return "Kullanıcı Güncellendi";

        case "USER_DELETED":
            return "Kullanıcı Silindi";

        case "GROUP_MANAGER_CHANGED":
            return "Grup Yöneticisi Değişti";

        case "LEAVE_CREATED":
            return "İzin Talebi Oluşturuldu";

        case "LEAVE_APPROVED":
            return "İzin Onaylandı";

        case "LEAVE_REJECTED":
            return "İzin Reddedildi";

        case "LEAVE_CANCELLED":
            return "İzin İptal Edildi";

        case "DELEGATION_CREATED":
            return "Vekalet Oluşturuldu";

        case "DELEGATION_ENDED":
            return "Vekalet Sona Erdi";

        default:
            return action;
    }
};

const getActionIcon = (
    action: string
) => {
    switch (action) {
        case "TASK_CREATED":
            return (
                <AssignmentTurnedInRoundedIcon
                    fontSize="small"
                />
            );

        case "TASK_ASSIGNED":
            return (
                <SwapHorizRoundedIcon
                    fontSize="small"
                />
            );

        case "TASK_STATUS_CHANGED":
            return (
                <SyncAltRoundedIcon
                    fontSize="small"
                />
            );

        default:
            return (
                <HistoryRoundedIcon
                    fontSize="small"
                />
            );
    }
};

const formatDateTime = (
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

    return date.toLocaleString(
        "tr-TR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

function AuditLogsPage() {
    const [
        logs,
        setLogs,
    ] =
        useState<
            AuditLogItem[]
        >([]);

    const [
        searchText,
        setSearchText,
    ] =
        useState("");

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

    useEffect(() => {
        const loadLogs =
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
                            AuditLogItem[]
                        >(
                            "/AuditLogs?limit=500"
                        );

                    setLogs(
                        response.data
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "Sistem hareketleri yüklenemedi:",
                        error
                    );

                    if (
                        error.response
                            ?.status ===
                        403
                    ) {
                        setErrorMessage(
                            "Sistem hareketlerini görüntülemek için Admin yetkisi gereklidir."
                        );
                    } else {
                        setErrorMessage(
                            "Sistem hareketleri yüklenemedi."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadLogs();
    }, []);

    const filteredLogs =
        useMemo(() => {
            const search =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            if (!search) {
                return logs;
            }

            return logs.filter(
                (
                    log
                ) => {
                    const actionLabel =
                        getActionLabel(
                            log.action
                        );

                    return [
                        log.userFullName,
                        log.action,
                        actionLabel,
                        log.entityType,
                        log.entityId ??
                        "",
                        log.description,
                    ].some(
                        (
                            value
                        ) =>
                            value
                                .toLocaleLowerCase(
                                    "tr-TR"
                                )
                                .includes(
                                    search
                                )
                    );
                }
            );
        }, [
            logs,
            searchText,
        ]);

    const todayCount =
        useMemo(() => {
            const now =
                new Date();

            return logs.filter(
                (
                    log
                ) => {
                    const date =
                        new Date(
                            log.createdAt
                        );

                    return (
                        date.getFullYear() ===
                        now.getFullYear() &&
                        date.getMonth() ===
                        now.getMonth() &&
                        date.getDate() ===
                        now.getDate()
                    );
                }
            ).length;
        }, [
            logs,
        ]);

    const uniqueUsers =
        useMemo(() => {
            return new Set(
                logs
                    .map(
                        (
                            log
                        ) =>
                            log.userId
                    )
                    .filter(
                        Boolean
                    )
            ).size;
        }, [
            logs,
        ]);

    const lastActivity =
        logs.length > 0
            ? formatDateTime(
                logs[0]
                    .createdAt
            )
            : "-";

    return (
        <Box
            sx={{
                width:
                    "100%",
                maxWidth:
                    "none",
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
            <Box
                sx={{
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display:
                            "flex",
                        flexDirection:
                            "row",
                        alignItems:
                            "center",
                        gap: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius:
                                2.5,
                            display:
                                "flex",
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            color:
                                "#163A63",
                            backgroundColor:
                                "action.hover",
                        }}
                    >
                        <HistoryRoundedIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight:
                                    800,
                                letterSpacing:
                                    "-0.02em",
                            }}
                        >
                            Sistem Hareketleri
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.4,
                            }}
                        >
                            Sistem üzerinde gerçekleştirilen önemli işlemleri ve kullanıcı hareketlerini takip edin.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius:
                            2.5,
                    }}
                >
                    {errorMessage}
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
                            "repeat(2, minmax(0, 1fr))",
                        xl:
                            "repeat(4, minmax(0, 1fr))",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <SummaryCard
                    title="Toplam Hareket"
                    value={
                        logs.length
                    }
                    subtitle="Kayıtlı sistem işlemi"
                    icon={
                        <HistoryRoundedIcon />
                    }
                />

                <SummaryCard
                    title="Bugünkü Hareket"
                    value={
                        todayCount
                    }
                    subtitle="Bugün gerçekleştirilen işlem"
                    icon={
                        <TodayRoundedIcon />
                    }
                />

                <SummaryCard
                    title="Aktif Kullanıcı"
                    value={
                        uniqueUsers
                    }
                    subtitle="İşlem gerçekleştiren kullanıcı"
                    icon={
                        <PersonSearchRoundedIcon />
                    }
                />

                <SummaryCard
                    title="Son Hareket"
                    value={
                        logs.length >
                            0
                            ? "Mevcut"
                            : "-"
                    }
                    subtitle={
                        lastActivity
                    }
                    icon={
                        <AccessTimeRoundedIcon />
                    }
                />
            </Box>

            <Paper
                elevation={
                    0
                }
                sx={{
                    border:
                        "1px solid",
                    borderColor:
                        "divider",
                    borderRadius:
                        3,
                    overflow:
                        "hidden",
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
                        py: 2.25,
                        display:
                            "flex",
                        alignItems:
                        {
                            xs:
                                "stretch",
                            md:
                                "center",
                        },
                        justifyContent:
                            "space-between",
                        flexDirection:
                        {
                            xs:
                                "column",
                            md:
                                "row",
                        },
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
                            Hareket Geçmişi
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            En yeni hareketler ilk sırada gösterilir.
                        </Typography>
                    </Box>

                    <TextField
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
                        placeholder="Kullanıcı, işlem veya açıklama ara..."
                        size="small"
                        sx={{
                            width: {
                                xs:
                                    "100%",
                                md:
                                    360,
                            },
                            "& .MuiOutlinedInput-root":
                            {
                                borderRadius:
                                    2.5,
                                backgroundColor:
                                    "background.paper",
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment:
                                    (
                                        <InputAdornment
                                            position="start"
                                        >
                                            <SearchRoundedIcon
                                                sx={{
                                                    fontSize:
                                                        20,
                                                    color:
                                                        "text.secondary",
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                            },
                        }}
                    />
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
                ) : filteredLogs.length ===
                    0 ? (
                    <Box
                        sx={{
                            py: 7,
                            px: 2,
                            textAlign:
                                "center",
                        }}
                    >
                        <HistoryRoundedIcon
                            sx={{
                                fontSize:
                                    44,
                                color:
                                    "text.disabled",
                                mb: 1,
                            }}
                        />

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            Sistem hareketi bulunamadı
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            {searchText
                                ? "Arama kriterlerinize uygun bir kayıt bulunamadı."
                                : "Henüz kaydedilmiş bir sistem hareketi bulunmuyor."}
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {filteredLogs.map(
                            (
                                log,
                                index
                            ) => (
                                <Box
                                    key={
                                        log.id
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
                                                sm:
                                                    2.5,
                                            },
                                            py: 2,
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                            {
                                                xs:
                                                    "1fr",
                                                md:
                                                    "190px minmax(170px, 0.7fr) minmax(190px, 0.8fr) minmax(260px, 1.8fr)",
                                            },
                                            alignItems:
                                                "center",
                                            gap: {
                                                xs:
                                                    1,
                                                md:
                                                    2,
                                            },
                                            transition:
                                                "background-color 0.16s ease",
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
                                                sx={{
                                                    display:
                                                        "block",
                                                    mb: 0.2,
                                                }}
                                            >
                                                Tarih
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight:
                                                        650,
                                                }}
                                            >
                                                {formatDateTime(
                                                    log.createdAt
                                                )}
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mb: 0.2,
                                                }}
                                            >
                                                Kullanıcı
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
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
                                                {log.userFullName ||
                                                    "Sistem"}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mb: 0.45,
                                                }}
                                            >
                                                İşlem
                                            </Typography>

                                            <Chip
                                                icon={
                                                    getActionIcon(
                                                        log.action
                                                    )
                                                }
                                                label={
                                                    getActionLabel(
                                                        log.action
                                                    )
                                                }
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight:
                                                        700,
                                                    borderColor:
                                                        "divider",
                                                    backgroundColor:
                                                        "background.paper",
                                                }}
                                            />
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mb: 0.2,
                                                }}
                                            >
                                                Açıklama
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.primary"
                                                sx={{
                                                    lineHeight:
                                                        1.55,
                                                }}
                                            >
                                                {log.description}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{
                                                    display:
                                                        "block",
                                                    mt: 0.35,
                                                }}
                                            >
                                                {log.entityType}
                                                {log.entityId
                                                    ? ` #${log.entityId}`
                                                    : ""}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        )}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default AuditLogsPage;
