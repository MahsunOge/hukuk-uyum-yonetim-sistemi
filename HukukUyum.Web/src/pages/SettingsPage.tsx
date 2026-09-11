import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

import api from "../api/axios";

import {
    getCurrentUserId,
    getCurrentUserRoles,
} from "../utils/auth";

interface SystemSettings {
    environmentName: string;
    emailHost: string;
    emailPort: number;
    senderEmail: string;
    senderName: string;
    emailConfigured: boolean;
    maximumFileSizeMb: number;
    allowedFileExtensions: string[];
}

type ThemePreference =
    | "light"
    | "dark"
    | "system";

interface SettingsCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
    iconColor?: string;
    iconBackground?: string;
}

function SettingsPage() {
    const navigate =
        useNavigate();

    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const currentUserId =
        getCurrentUserId();

    const currentUserRoles =
        getCurrentUserRoles();

    const isAdmin =
        currentUserRoles.includes(
            "Admin"
        );

    const themeStorageKey =
        currentUserId
            ? `themePreference_${currentUserId}`
            : "themePreference_guest";

    const [
        settings,
        setSettings,
    ] =
        useState<SystemSettings | null>(
            null
        );

    const [
        maximumFileSizeMb,
        setMaximumFileSizeMb,
    ] =
        useState(10);

    const [
        allowPdf,
        setAllowPdf,
    ] =
        useState(true);

    const [
        allowWord,
        setAllowWord,
    ] =
        useState(true);

    const [
        allowExcel,
        setAllowExcel,
    ] =
        useState(true);

    const [
        smtpHost,
        setSmtpHost,
    ] =
        useState("");

    const [
        smtpPort,
        setSmtpPort,
    ] =
        useState(587);

    const [
        senderName,
        setSenderName,
    ] =
        useState("");

    const [
        senderEmail,
        setSenderEmail,
    ] =
        useState("");

    const [
        themePreference,
        setThemePreference,
    ] =
        useState<ThemePreference>(
            () => {
                const stored =
                    localStorage.getItem(
                        themeStorageKey
                    );

                if (
                    stored ===
                    "light" ||
                    stored ===
                    "dark" ||
                    stored ===
                    "system"
                ) {
                    return stored;
                }

                return "system";
            }
        );

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(
            isAdmin
        );

    const [
        isSaving,
        setIsSaving,
    ] =
        useState(false);

    const [
        isSendingTestEmail,
        setIsSendingTestEmail,
    ] =
        useState(false);

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

    useEffect(() => {
        if (
            !isAdmin
        ) {
            setIsLoading(
                false
            );

            return;
        }

        const loadSettings =
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
                            SystemSettings
                        >(
                            "/Settings"
                        );

                    const data =
                        response.data;

                    setSettings(
                        data
                    );

                    setMaximumFileSizeMb(
                        data.maximumFileSizeMb
                    );

                    setAllowPdf(
                        data.allowedFileExtensions.includes(
                            ".pdf"
                        )
                    );

                    setAllowWord(
                        data.allowedFileExtensions.includes(
                            ".doc"
                        ) ||
                        data.allowedFileExtensions.includes(
                            ".docx"
                        )
                    );

                    setAllowExcel(
                        data.allowedFileExtensions.includes(
                            ".xls"
                        ) ||
                        data.allowedFileExtensions.includes(
                            ".xlsx"
                        )
                    );

                    setSmtpHost(
                        data.emailHost
                    );

                    setSmtpPort(
                        data.emailPort
                    );

                    setSenderName(
                        data.senderName
                    );

                    setSenderEmail(
                        data.senderEmail
                    );
                } catch (
                error
                ) {
                    console.error(
                        "Ayarlar yüklenemedi:",
                        error
                    );

                    setErrorMessage(
                        "Sistem ayarları yüklenemedi."
                    );
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadSettings();
    }, [
        isAdmin,
    ]);

    const handleSaveSettings =
        async () => {
            if (
                !isAdmin
            ) {
                return;
            }

            if (
                maximumFileSizeMb <
                1 ||
                maximumFileSizeMb >
                100
            ) {
                setErrorMessage(
                    "Maksimum dosya boyutu 1 ile 100 MB arasında olmalıdır."
                );

                return;
            }

            if (
                !allowPdf &&
                !allowWord &&
                !allowExcel
            ) {
                setErrorMessage(
                    "En az bir dosya türüne izin verilmelidir."
                );

                return;
            }

            try {
                setIsSaving(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                const response =
                    await api.put(
                        "/Settings",
                        {
                            maximumFileSizeMb,
                            allowPdf,
                            allowWord,
                            allowExcel,
                            smtpHost,
                            smtpPort,
                            senderName,
                            senderEmail,
                        }
                    );

                setSuccessMessage(
                    response.data
                        ?.message ??
                    "Sistem ayarları başarıyla güncellendi."
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Ayarlar kaydedilemedi:",
                    error
                );

                setErrorMessage(
                    error.response?.data
                        ?.message ??
                    "Sistem ayarları kaydedilemedi."
                );
            } finally {
                setIsSaving(
                    false
                );
            }
        };

    const handleSendTestEmail =
        async () => {
            if (
                !isAdmin
            ) {
                return;
            }

            try {
                setIsSendingTestEmail(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                const response =
                    await api.post(
                        "/Settings/test-email"
                    );

                setSuccessMessage(
                    response.data
                        ?.message ??
                    "Test e-postası başarıyla gönderildi."
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Test e-postası gönderilemedi:",
                    error
                );

                setErrorMessage(
                    error.response?.data
                        ?.message ??
                    "Test e-postası gönderilemedi."
                );
            } finally {
                setIsSendingTestEmail(
                    false
                );
            }
        };

    const handleThemeChange = (
        value:
            ThemePreference
    ) => {
        setThemePreference(
            value
        );

        localStorage.setItem(
            themeStorageKey,
            value
        );

        window.dispatchEvent(
            new CustomEvent(
                "theme-preference-changed",
                {
                    detail:
                        value,
                }
            )
        );

        setErrorMessage(
            ""
        );

        setSuccessMessage(
            "Görünüm tercihi kaydedildi."
        );
    };

    const getThemeLabel = (
        value:
            ThemePreference
    ) => {
        switch (
        value
        ) {
            case "light":
                return "Açık Tema";

            case "dark":
                return "Koyu Tema";

            default:
                return "Sistem Teması";
        }
    };

    if (
        isAdmin &&
        isLoading
    ) {
        return (
            <Box
                sx={{
                    minHeight:
                        420,

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
                    size={
                        36
                    }
                    sx={{
                        color:
                            "#163A63",
                    }}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Ayarlar
                    yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (
        isAdmin &&
        !settings
    ) {
        return (
            <Alert
                severity="error"
                sx={{
                    borderRadius:
                        2.5,
                }}
            >
                {errorMessage ||
                    "Sistem ayarları bulunamadı."}
            </Alert>
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

                color:
                    "text.primary",
            }}
        >
            {/* HEADER */}

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
                        lg: 3.25,
                    },

                    minHeight: {
                        xs: "auto",
                        lg: 150,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius:
                        3.25,

                    background:
                        isDark
                            ? "linear-gradient(105deg, #111827, #101B2B)"
                            : "linear-gradient(105deg, #FFFFFF, #F3F7FA)",
                }}
            >
                <Box
                    sx={{
                        position:
                            "absolute",

                        width:
                            220,

                        height:
                            220,

                        borderRadius:
                            "50%",

                        right:
                            -75,

                        top:
                            -120,

                        backgroundColor:
                            isDark
                                ? "rgba(49,95,140,0.06)"
                                : "rgba(49,95,140,0.04)",
                    }}
                />

                <Stack
                    direction="row"
                    spacing={
                        1.6
                    }
                    sx={{
                        position:
                            "relative",

                        zIndex:
                            1,

                        alignItems:
                            "center",
                    }}
                >
                    <Box
                        sx={{
                            width:
                                48,

                            height:
                                48,

                            flexShrink:
                                0,

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            borderRadius:
                                2.5,

                            color:
                                "#315F8C",

                            backgroundColor:
                                isDark
                                    ? "rgba(49,95,140,0.12)"
                                    : "#EAF1F6",
                        }}
                    >
                        <SettingsRoundedIcon
                            sx={{
                                fontSize:
                                    24,
                            }}
                        />
                    </Box>

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
                            Ayarlar
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.55,

                                lineHeight:
                                    1.6,
                            }}
                        >
                            {isAdmin
                                ? "Hesap, görünüm ve sistem yapılandırma seçeneklerini yönetin."
                                : "Hesap güvenliğinizi ve görünüm tercihlerinizi yönetin."}
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2.25,

                        borderRadius:
                            2.5,
                    }}
                >
                    {
                        errorMessage
                    }
                </Alert>
            )}

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2.25,

                        borderRadius:
                            2.5,
                    }}
                >
                    {
                        successMessage
                    }
                </Alert>
            )}

            {/* USER SETTINGS */}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        lg: isAdmin
                            ? "repeat(2, minmax(0, 1fr))"
                            : "minmax(0, 1fr) minmax(360px, 0.78fr)",
                    },

                    gap: {
                        xs: 2,
                        md: 2.4,
                        xl: 2.8,
                    },

                    alignItems: "stretch",
                }}
            >
                {/* THEME */}

                <SettingsCard
                    title="Görünüm"
                    description="Arayüz tema tercihinizi belirleyin."
                    icon={
                        <PaletteRoundedIcon />
                    }
                    iconColor="#315F8C"
                    iconBackground="#EDF3F8"
                >
                    <Box
                        sx={{
                            display:
                                "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",

                                sm: "repeat(3, minmax(0, 1fr))",
                            },

                            gap: 1.4,
                        }}
                    >
                        {[
                            {
                                value:
                                    "light" as ThemePreference,

                                label:
                                    "Açık",

                                description:
                                    "Aydınlık arayüz",

                                icon:
                                    <LightModeRoundedIcon />,
                            },

                            {
                                value:
                                    "dark" as ThemePreference,

                                label:
                                    "Koyu",

                                description:
                                    "Koyu arayüz",

                                icon:
                                    <DarkModeRoundedIcon />,
                            },

                            {
                                value:
                                    "system" as ThemePreference,

                                label:
                                    "Sistem",

                                description:
                                    "Cihaz temasını kullan",

                                icon:
                                    <ComputerRoundedIcon />,
                            },
                        ].map(
                            (
                                option
                            ) => {
                                const selected =
                                    themePreference ===
                                    option.value;

                                return (
                                    <Paper
                                        key={
                                            option.value
                                        }
                                        elevation={
                                            0
                                        }
                                        onClick={() =>
                                            handleThemeChange(
                                                option.value
                                            )
                                        }
                                        sx={{
                                            p: 1.8,

                                            minHeight: {
                                                xs: "auto",
                                                sm: 132,
                                            },

                                            cursor:
                                                "pointer",

                                            border:
                                                "1px solid",

                                            borderColor:
                                                selected
                                                    ? isDark
                                                        ? "rgba(147,184,217,0.40)"
                                                        : "#9FB8CC"
                                                    : "divider",

                                            borderRadius:
                                                2.5,

                                            backgroundColor:
                                                selected
                                                    ? isDark
                                                        ? "rgba(49,95,140,0.10)"
                                                        : "#F2F6F9"
                                                    : "background.paper",

                                            transition:
                                                "border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease",

                                            "&:hover":
                                            {
                                                transform:
                                                    "translateY(-1px)",

                                                borderColor:
                                                    selected
                                                        ? "#7F9DB6"
                                                        : "text.disabled",
                                            },
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

                                                gap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width:
                                                        36,

                                                    height:
                                                        36,

                                                    display:
                                                        "flex",

                                                    alignItems:
                                                        "center",

                                                    justifyContent:
                                                        "center",

                                                    borderRadius:
                                                        2,

                                                    color:
                                                        selected
                                                            ? "#315F8C"
                                                            : "text.secondary",

                                                    backgroundColor:
                                                        selected
                                                            ? isDark
                                                                ? "rgba(49,95,140,0.14)"
                                                                : "#E5EDF3"
                                                            : "action.hover",

                                                    "& svg":
                                                    {
                                                        fontSize:
                                                            19,
                                                    },
                                                }}
                                            >
                                                {
                                                    option.icon
                                                }
                                            </Box>

                                            {selected && (
                                                <CheckCircleOutlineRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            19,

                                                        color:
                                                            "#5B7891",
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 1.3,

                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            {
                                                option.label
                                            }
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display:
                                                    "block",

                                                mt: 0.25,
                                            }}
                                        >
                                            {
                                                option.description
                                            }
                                        </Typography>
                                    </Paper>
                                );
                            }
                        )}
                    </Box>

                    <Box
                        sx={{
                            p: 1.8,

                            borderRadius:
                                2.3,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            backgroundColor:
                                isDark
                                    ? "rgba(255,255,255,0.02)"
                                    : "#FAFBFC",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Mevcut
                            tercih
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.3,

                                fontWeight:
                                    700,
                            }}
                        >
                            {getThemeLabel(
                                themePreference
                            )}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display:
                                    "block",

                                mt: 0.5,

                                lineHeight:
                                    1.5,
                            }}
                        >
                            Tema tercihi
                            bu kullanıcı
                            hesabı için bu
                            tarayıcıda
                            saklanır.
                        </Typography>
                    </Box>
                </SettingsCard>

                {/* SECURITY */}

                <SettingsCard
                    title="Hesap ve Güvenlik"
                    description="Hesap güvenliği seçeneklerinizi yönetin."
                    icon={
                        <SecurityRoundedIcon />
                    }
                    iconColor="#5A7085"
                    iconBackground="#F0F3F6"
                >
                    <Box
                        sx={{
                            p: 2,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                2.5,

                            backgroundColor:
                                isDark
                                    ? "rgba(255,255,255,0.02)"
                                    : "#FAFBFC",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={
                                1.5
                            }
                            sx={{
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <Box
                                sx={{
                                    width:
                                        42,

                                    height:
                                        42,

                                    flexShrink:
                                        0,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    borderRadius:
                                        2.2,

                                    color:
                                        "#5A7085",

                                    backgroundColor:
                                        isDark
                                            ? "rgba(148,163,184,0.07)"
                                            : "#EDF1F4",
                                }}
                            >
                                <LockResetRoundedIcon />
                            </Box>

                            <Box
                                sx={{
                                    flexGrow:
                                        1,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Şifre
                                    Güvenliği
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.5,

                                        lineHeight:
                                            1.6,
                                    }}
                                >
                                    Hesap
                                    şifrenizi
                                    belirli
                                    aralıklarla
                                    güncelleyerek
                                    hesabınızın
                                    güvenliğini
                                    artırabilirsiniz.
                                </Typography>

                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            "/account/change-password"
                                        )
                                    }
                                    startIcon={
                                        <LockResetRoundedIcon />
                                    }
                                    sx={{
                                        mt: 2,

                                        minHeight:
                                            41,

                                        borderRadius:
                                            2.1,

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            650,

                                        color:
                                            "#315F8C",

                                        borderColor:
                                            isDark
                                                ? "rgba(147,184,217,0.25)"
                                                : "#B9CBD9",

                                        "&:hover":
                                        {
                                            borderColor:
                                                "#7798B2",

                                            backgroundColor:
                                                isDark
                                                    ? "rgba(49,95,140,0.07)"
                                                    : "#F3F7FA",
                                        },
                                    }}
                                >
                                    Şifreyi
                                    Değiştir
                                </Button>
                            </Box>
                        </Stack>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.9,

                            border:
                                "1px solid",

                            borderColor:
                                isDark
                                    ? "rgba(148,163,184,0.11)"
                                    : "#DDE5EB",

                            borderRadius:
                                2.5,

                            background:
                                isDark
                                    ? "rgba(49,95,140,0.04)"
                                    : "#F6F9FB",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={
                                1.25
                            }
                            sx={{
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <ShieldOutlinedIcon
                                sx={{
                                    mt: 0.1,

                                    fontSize:
                                        20,

                                    color:
                                        "#5A7893",
                                }}
                            />

                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Güvenlik
                                    Önerisi
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
                                    Güçlü ve
                                    başka
                                    sistemlerde
                                    kullanmadığınız
                                    bir şifre
                                    tercih
                                    etmeniz
                                    önerilir.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </SettingsCard>

                {/* ADMIN FILE SETTINGS */}

                {isAdmin && (
                    <>
                        <SettingsCard
                            title="Dosya Yükleme Ayarları"
                            description="Dosya boyutu ve izin verilen dosya türlerini yönetin."
                            icon={
                                <FolderRoundedIcon />
                            }
                            iconColor="#64748B"
                            iconBackground="#F1F3F5"
                        >
                            <TextField
                                label="Maksimum Dosya Boyutu"
                                type="number"
                                value={
                                    maximumFileSizeMb
                                }
                                onChange={(
                                    event
                                ) =>
                                    setMaximumFileSizeMb(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                                fullWidth
                                slotProps={{
                                    htmlInput:
                                    {
                                        min: 1,

                                        max: 100,
                                    },
                                }}
                                helperText="1 - 100 MB arasında bir değer girin."
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <Divider />

                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                İzin
                                Verilen
                                Dosya
                                Türleri
                            </Typography>

                            <Stack
                                spacing={
                                    0.5
                                }
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                allowPdf
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAllowPdf(
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="PDF"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                allowWord
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAllowWord(
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Word (.doc, .docx)"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                allowExcel
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAllowExcel(
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Excel (.xls, .xlsx)"
                                />
                            </Stack>
                        </SettingsCard>

                        {/* ADMIN EMAIL */}

                        <SettingsCard
                            title="E-posta Ayarları"
                            description="SMTP sunucusu ve gönderen bilgilerini yönetin."
                            icon={
                                <EmailRoundedIcon />
                            }
                            iconColor="#315F8C"
                            iconBackground="#EDF3F8"
                        >
                            <TextField
                                label="SMTP Sunucusu"
                                value={
                                    smtpHost
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSmtpHost(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <TextField
                                label="SMTP Portu"
                                type="number"
                                value={
                                    smtpPort
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSmtpPort(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <TextField
                                label="Gönderen Adı"
                                value={
                                    senderName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSenderName(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <TextField
                                label="Gönderen E-posta"
                                type="email"
                                value={
                                    senderEmail
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSenderEmail(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <Button
                                variant="outlined"
                                startIcon={
                                    isSendingTestEmail
                                        ? (
                                            <CircularProgress
                                                size={
                                                    18
                                                }
                                            />
                                        )
                                        : (
                                            <SendRoundedIcon />
                                        )
                                }
                                disabled={
                                    isSendingTestEmail
                                }
                                onClick={() =>
                                    void handleSendTestEmail()
                                }
                                sx={{
                                    alignSelf:
                                        "flex-start",

                                    minHeight:
                                        42,

                                    textTransform:
                                        "none",

                                    borderRadius:
                                        2.1,

                                    fontWeight:
                                        650,
                                }}
                            >
                                {isSendingTestEmail
                                    ? "Gönderiliyor..."
                                    : "Test E-postası Gönder"}
                            </Button>
                        </SettingsCard>
                    </>
                )}
            </Box>

            {/* ADMIN SAVE */}

            {isAdmin && (
                <Paper
                    elevation={0}
                    sx={{
                        mt: 2.5,

                        p: 2.5,

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3,

                        backgroundColor:
                            "background.paper",

                        display:
                            "flex",

                        flexDirection:
                        {
                            xs: "column",

                            sm: "row",
                        },

                        alignItems:
                        {
                            xs: "stretch",

                            sm: "center",
                        },

                        justifyContent:
                            "space-between",

                        gap: 2,
                    }}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={
                                1
                            }
                            sx={{
                                alignItems:
                                    "center",
                            }}
                        >
                            <SettingsRoundedIcon
                                sx={{
                                    color:
                                        "#64748B",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Sistem
                                Yapılandırması
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            Dosya ve
                            e-posta
                            ayarlarındaki
                            değişiklikleri
                            kaydedin.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={
                            isSaving
                                ? (
                                    <CircularProgress
                                        size={
                                            18
                                        }
                                        color="inherit"
                                    />
                                )
                                : (
                                    <SaveRoundedIcon />
                                )
                        }
                        disabled={
                            isSaving
                        }
                        onClick={() =>
                            void handleSaveSettings()
                        }
                        sx={{
                            minWidth:
                                190,

                            minHeight:
                                45,

                            borderRadius:
                                2.2,

                            backgroundColor:
                                "#163A63",

                            boxShadow:
                                "0 6px 16px rgba(22,58,99,0.15)",

                            textTransform:
                                "none",

                            fontWeight:
                                700,

                            "&:hover":
                            {
                                backgroundColor:
                                    "#102F51",

                                boxShadow:
                                    "0 7px 18px rgba(22,58,99,0.20)",
                            },
                        }}
                    >
                        {isSaving
                            ? "Kaydediliyor..."
                            : "Değişiklikleri Kaydet"}
                    </Button>
                </Paper>
            )}
        </Box>
    );
}

function SettingsCard({
    title,
    description,
    icon,
    children,
    iconColor = "#315F8C",
    iconBackground = "#EDF3F8",
}: SettingsCardProps) {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    return (
        <Paper
            elevation={0}
            sx={{
                p: {
                    xs: 2.2,
                    sm: 2.7,
                    lg: 3,
                },

                minHeight: {
                    xs: "auto",
                    lg: 420,
                },

                height: {
                    xs: "auto",
                    lg: "100%",
                },

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
                    display:
                        "flex",

                    gap: 1.5,

                    mb: 2.6,
                }}
            >
                <Box
                    sx={{
                        width:
                            43,

                        height:
                            43,

                        flexShrink:
                            0,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        borderRadius:
                            2.25,

                        color:
                            iconColor,

                        backgroundColor:
                            isDark
                                ? "rgba(255,255,255,0.05)"
                                : iconBackground,

                        "& svg":
                        {
                            fontSize:
                                21,
                        },
                    }}
                >
                    {icon}
                </Box>

                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                750,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.3,

                            lineHeight:
                                1.55,
                        }}
                    >
                        {
                            description
                        }
                    </Typography>
                </Box>
            </Box>

            <Stack
                spacing={
                    2
                }
            >
                {
                    children
                }
            </Stack>
        </Paper>
    );
}

export default SettingsPage;
