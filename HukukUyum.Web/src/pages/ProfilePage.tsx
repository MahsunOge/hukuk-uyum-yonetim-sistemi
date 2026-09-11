import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
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

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import api from "../api/axios";

interface ProfileData {
    userId: string;
    fullName: string;
    email: string;
    roles: string[];
}

interface UpdateProfileResponse {
    message: string;
    profile: ProfileData;
}

interface InfoCardProps {
    icon: ReactNode;
    title: string;
    value: string;
    iconColor?: string;
    iconBackground?: string;
}

function ProfilePage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode === "dark";

    const [
        profile,
        setProfile,
    ] =
        useState<ProfileData | null>(
            null
        );

    const [
        editedFullName,
        setEditedFullName,
    ] =
        useState("");

    const [
        isEditing,
        setIsEditing,
    ] =
        useState(false);

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        isSaving,
        setIsSaving,
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
        const loadProfile =
            async () => {
                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    const response =
                        await api.get<ProfileData>(
                            "/Auth/profile"
                        );

                    setProfile(
                        response.data
                    );

                    setEditedFullName(
                        response.data.fullName
                    );
                } catch (
                error
                ) {
                    console.error(
                        "Profil yüklenemedi:",
                        error
                    );

                    setErrorMessage(
                        "Profil bilgileri yüklenemedi."
                    );
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadProfile();
    }, []);

    const handleEdit =
        () => {
            if (
                !profile
            ) {
                return;
            }

            setEditedFullName(
                profile.fullName
            );

            setErrorMessage(
                ""
            );

            setSuccessMessage(
                ""
            );

            setIsEditing(
                true
            );
        };

    const handleCancel =
        () => {
            if (
                !profile
            ) {
                return;
            }

            setEditedFullName(
                profile.fullName
            );

            setErrorMessage(
                ""
            );

            setSuccessMessage(
                ""
            );

            setIsEditing(
                false
            );
        };

    const handleSave =
        async () => {
            if (
                !profile
            ) {
                return;
            }

            const trimmedFullName =
                editedFullName.trim();

            if (
                !trimmedFullName
            ) {
                setErrorMessage(
                    "Ad soyad boş bırakılamaz."
                );

                return;
            }

            if (
                trimmedFullName.length >
                150
            ) {
                setErrorMessage(
                    "Ad soyad en fazla 150 karakter olabilir."
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
                    await api.put<UpdateProfileResponse>(
                        "/Auth/profile",
                        {
                            fullName:
                                trimmedFullName,
                        }
                    );

                setProfile(
                    response.data.profile
                );

                setEditedFullName(
                    response.data.profile
                        .fullName
                );

                setIsEditing(
                    false
                );

                setSuccessMessage(
                    response.data.message ??
                    "Profil bilgileri başarıyla güncellendi."
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "profile-updated",
                        {
                            detail:
                                response.data
                                    .profile,
                        }
                    )
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Profil güncellenemedi:",
                    error
                );

                setErrorMessage(
                    error.response?.data
                        ?.message ??
                    "Profil bilgileri güncellenemedi."
                );
            } finally {
                setIsSaving(
                    false
                );
            }
        };

    const getRoleLabel = (
        role: string
    ) => {
        switch (
        role
        ) {
            case "Admin":
                return "Sistem Yöneticisi";

            case "Manager":
                return "Yönetici";

            case "Employee":
                return "Çalışan";

            case "User":
                return "Talep Kullanıcısı";

            default:
                return role;
        }
    };

    const initials =
        useMemo(() => {
            if (
                !profile
            ) {
                return "";
            }

            return profile.fullName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    (
                        part
                    ) =>
                        part
                            .charAt(0)
                            .toUpperCase()
                )
                .join("");
        }, [
            profile,
        ]);

    if (
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
                    Profil bilgileri yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (
        !profile
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
                    "Profil bilgileri bulunamadı."}
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
            }}
        >
            {/* HERO */}

            <Paper
                elevation={0}
                sx={{
                    position:
                        "relative",

                    overflow:
                        "hidden",

                    mb: 2.5,

                    p: {
                        xs: 2.5,
                        sm: 3,
                        lg: 3.25,
                    },

                    minHeight: {
                        xs: "auto",
                        lg: 170,
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
                            230,

                        height:
                            230,

                        borderRadius:
                            "50%",

                        right:
                            -80,

                        top:
                            -125,

                        backgroundColor:
                            isDark
                                ? "rgba(49,95,140,0.06)"
                                : "rgba(49,95,140,0.04)",
                    }}
                />

                <Box
                    sx={{
                        position:
                            "relative",

                        zIndex: 1,

                        display:
                            "flex",

                        flexDirection:
                        {
                            xs: "column",
                            sm: "row",
                        },

                        alignItems:
                        {
                            xs: "flex-start",
                            sm: "center",
                        },

                        justifyContent:
                            "space-between",

                        gap: 2.5,
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            alignItems:
                                "center",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: {
                                    xs: 72,
                                    sm: 82,
                                },

                                height: {
                                    xs: 72,
                                    sm: 82,
                                },

                                fontSize: {
                                    xs: 24,
                                    sm: 28,
                                },

                                fontWeight:
                                    800,

                                bgcolor:
                                    "#163A63",

                                color:
                                    "#FFFFFF",

                                boxShadow:
                                    isDark
                                        ? "none"
                                        : "0 10px 25px rgba(22,58,99,0.16)",

                                border:
                                    "4px solid",

                                borderColor:
                                    isDark
                                        ? "#1E293B"
                                        : "#FFFFFF",
                            }}
                        >
                            {initials ||
                                profile.fullName
                                    .charAt(0)
                                    .toUpperCase()}
                        </Avatar>

                        <Box>
                            <Stack
                                direction="row"
                                sx={{
                                    alignItems:
                                        "center",

                                    gap: 0.8,

                                    flexWrap:
                                        "wrap",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize:
                                        {
                                            xs: 23,
                                            sm: 27,
                                        },

                                        fontWeight:
                                            800,

                                        lineHeight:
                                            1.2,

                                        letterSpacing:
                                            "-0.025em",
                                    }}
                                >
                                    {profile.fullName}
                                </Typography>

                                <VerifiedUserRoundedIcon
                                    sx={{
                                        fontSize:
                                            20,

                                        color:
                                            "#5B7891",
                                    }}
                                />
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.6,
                                }}
                            >
                                {profile.email}
                            </Typography>

                            <Stack
                                direction="row"
                                sx={{
                                    mt: 1.2,

                                    flexWrap:
                                        "wrap",

                                    gap: 0.8,
                                }}
                            >
                                {profile.roles.map(
                                    (
                                        role
                                    ) => (
                                        <Chip
                                            key={
                                                role
                                            }
                                            label={getRoleLabel(
                                                role
                                            )}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height:
                                                    26,

                                                borderRadius:
                                                    1.6,

                                                fontWeight:
                                                    650,

                                                color:
                                                    "#315F8C",

                                                borderColor:
                                                    isDark
                                                        ? "rgba(147,184,217,0.20)"
                                                        : "#C9D7E2",

                                                backgroundColor:
                                                    isDark
                                                        ? "rgba(49,95,140,0.07)"
                                                        : "#F3F7FA",
                                            }}
                                        />
                                    )
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    {!isEditing && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <EditRoundedIcon />
                            }
                            onClick={
                                handleEdit
                            }
                            sx={{
                                minHeight:
                                    42,

                                px: 2.2,

                                borderRadius:
                                    2.2,

                                textTransform:
                                    "none",

                                fontWeight:
                                    650,

                                color:
                                    "#315F8C",

                                borderColor:
                                    isDark
                                        ? "rgba(147,184,217,0.24)"
                                        : "#B8CBD9",

                                "&:hover":
                                {
                                    borderColor:
                                        "#7899B3",

                                    backgroundColor:
                                        isDark
                                            ? "rgba(49,95,140,0.07)"
                                            : "#F2F6F9",
                                },
                            }}
                        >
                            Profili Düzenle
                        </Button>
                    )}
                </Box>
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
                    {errorMessage}
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
                    {successMessage}
                </Alert>
            )}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        lg: "minmax(0, 1fr) 340px",

                        xl: "minmax(0, 1fr) 370px",
                    },

                    gap: {
                        xs: 2,
                        md: 2.4,
                        xl: 2.8,
                    },

                    alignItems:
                        "stretch",
                }}
            >
                {/* MAIN PROFILE */}

                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2.3,
                            sm: 3,
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
                    <Stack
                        direction="row"
                        spacing={1.3}
                        sx={{
                            alignItems:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                borderRadius:
                                    2.2,

                                color:
                                    "#315F8C",

                                backgroundColor:
                                    isDark
                                        ? "rgba(49,95,140,0.11)"
                                        : "#EDF3F8",
                            }}
                        >
                            <AccountCircleRoundedIcon
                                sx={{
                                    fontSize:
                                        22,
                                }}
                            />
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight:
                                        750,
                                }}
                            >
                                Profil Bilgileri
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.2,
                                }}
                            >
                                Hesabınıza ait temel bilgiler.
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider
                        sx={{
                            my: 2.7,
                        }}
                    />

                    {isEditing && (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 2.5,

                                p: {
                                    xs: 2,
                                    sm: 2.3,
                                },

                                border:
                                    "1px solid",

                                borderColor:
                                    isDark
                                        ? "rgba(147,184,217,0.14)"
                                        : "#D9E4EC",

                                borderRadius:
                                    2.6,

                                backgroundColor:
                                    isDark
                                        ? "rgba(49,95,140,0.045)"
                                        : "#F7FAFC",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.2}
                                sx={{
                                    mb: 2,

                                    alignItems:
                                        "center",
                                }}
                            >
                                <EditRoundedIcon
                                    sx={{
                                        fontSize:
                                            19,

                                        color:
                                            "#5B7891",
                                    }}
                                />

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Profil Bilgilerini Düzenle
                                </Typography>
                            </Stack>

                            <TextField
                                label="Ad Soyad"
                                value={
                                    editedFullName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setEditedFullName(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                disabled={
                                    isSaving
                                }
                                slotProps={{
                                    htmlInput:
                                    {
                                        maxLength:
                                            150,
                                    },
                                }}
                                helperText={`${editedFullName.length}/150`}
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.2,
                                    },
                                }}
                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1.3}
                                sx={{
                                    mt: 2,

                                    justifyContent:
                                        "flex-end",
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <CloseRoundedIcon />
                                    }
                                    disabled={
                                        isSaving
                                    }
                                    onClick={
                                        handleCancel
                                    }
                                    sx={{
                                        minHeight:
                                            42,

                                        px: 2.2,

                                        borderRadius:
                                            2.1,

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            650,

                                        color:
                                            "text.secondary",

                                        borderColor:
                                            "divider",
                                    }}
                                >
                                    İptal
                                </Button>

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
                                        void handleSave()
                                    }
                                    sx={{
                                        minHeight:
                                            42,

                                        minWidth:
                                            125,

                                        px: 2.3,

                                        borderRadius:
                                            2.1,

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
                                    {isSaving
                                        ? "Kaydediliyor..."
                                        : "Kaydet"}
                                </Button>
                            </Stack>
                        </Paper>
                    )}

                    <Box
                        sx={{
                            display:
                                "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",

                                md: "repeat(2, minmax(0, 1fr))",
                            },

                            gap: 1.6,
                        }}
                    >
                        <InfoCard
                            icon={
                                <PersonRoundedIcon />
                            }
                            title="Ad Soyad"
                            value={
                                profile.fullName
                            }
                            iconColor="#315F8C"
                            iconBackground="#EDF3F8"
                        />

                        <InfoCard
                            icon={
                                <EmailRoundedIcon />
                            }
                            title="E-posta"
                            value={
                                profile.email
                            }
                            iconColor="#5B7891"
                            iconBackground="#F0F4F7"
                        />

                        <InfoCard
                            icon={
                                <BadgeRoundedIcon />
                            }
                            title="Rol"
                            value={
                                profile.roles
                                    .length >
                                    0
                                    ? profile.roles
                                        .map(
                                            getRoleLabel
                                        )
                                        .join(
                                            ", "
                                        )
                                    : "Rol bilgisi bulunamadı."
                            }
                            iconColor="#64748B"
                            iconBackground="#F2F4F6"
                        />

                        <InfoCard
                            icon={
                                <SecurityRoundedIcon />
                            }
                            title="Hesap Durumu"
                            value="Aktif"
                            iconColor="#527A60"
                            iconBackground="#EEF5F0"
                        />
                    </Box>
                </Paper>

                {/* RIGHT */}

                <Stack
                    spacing={2}
                    sx={{
                        height: {
                            xs: "auto",
                            lg: "100%",
                        },

                        "& > .MuiPaper-root": {
                            flexGrow: {
                                xs: 0,
                                lg: 1,
                            },
                        },
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.4,

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
                            spacing={1.3}
                            sx={{
                                alignItems:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width:
                                        40,

                                    height:
                                        40,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    borderRadius:
                                        2.1,

                                    color:
                                        "#527A60",

                                    backgroundColor:
                                        isDark
                                            ? "rgba(79,118,94,0.09)"
                                            : "#EEF5F0",
                                }}
                            >
                                <CheckCircleOutlineRoundedIcon
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
                                            700,
                                    }}
                                >
                                    Hesap Aktif
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Hesabınız kullanılabilir durumda.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.4,

                            border:
                                "1px solid",

                            borderColor:
                                isDark
                                    ? "rgba(148,163,184,0.12)"
                                    : "#DDE5EB",

                            borderRadius:
                                3,

                            background:
                                isDark
                                    ? "rgba(49,95,140,0.045)"
                                    : "#F6F9FB",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.3}
                            sx={{
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <InfoOutlinedIcon
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
                                    Profil Bilgileri
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.45,

                                        lineHeight:
                                            1.65,
                                    }}
                                >
                                    Profil adınız sistem içinde
                                    görüntülenen kullanıcı adıdır.
                                    E-posta ve rol bilgileri
                                    güvenlik nedeniyle bu ekrandan
                                    değiştirilemez.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.4,

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
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Kullanıcı türü
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,

                                fontSize:
                                    16,

                                fontWeight:
                                    750,
                            }}
                        >
                            {profile.roles
                                .map(
                                    getRoleLabel
                                )
                                .join(
                                    ", "
                                )}
                        </Typography>

                        <Divider
                            sx={{
                                my: 1.8,
                            }}
                        />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Sistemde kayıtlı e-posta
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.45,

                                fontWeight:
                                    650,

                                wordBreak:
                                    "break-word",
                            }}
                        >
                            {profile.email}
                        </Typography>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );
}

function InfoCard({
    icon,
    title,
    value,
    iconColor = "#315F8C",
    iconBackground = "#EDF3F8",
}: InfoCardProps) {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    return (
        <Box
            sx={{
                p: 2,

                minHeight: {
                    xs: "auto",
                    md: 112,
                },

                display:
                    "flex",

                gap: 1.5,

                alignItems:
                    "flex-start",

                border:
                    "1px solid",

                borderColor:
                    "divider",

                borderRadius:
                    2.6,

                backgroundColor:
                    isDark
                        ? "rgba(255,255,255,0.018)"
                        : "#FAFBFC",

                transition:
                    "border-color 0.18s ease, background-color 0.18s ease",

                "&:hover": {
                    borderColor:
                        isDark
                            ? "rgba(148,163,184,0.20)"
                            : "#D4DFE7",

                    backgroundColor:
                        isDark
                            ? "rgba(255,255,255,0.025)"
                            : "#F8FAFB",
                },
            }}
        >
            <Box
                sx={{
                    width: 42,
                    height: 42,

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    flexShrink:
                        0,

                    borderRadius:
                        2.1,

                    color:
                        iconColor,

                    backgroundColor:
                        isDark
                            ? "rgba(255,255,255,0.05)"
                            : iconBackground,

                    "& svg": {
                        fontSize:
                            20,
                    },
                }}
            >
                {icon}
            </Box>

            <Box
                sx={{
                    minWidth: 0,
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        fontWeight:
                            650,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.35,

                        fontWeight:
                            700,

                        color:
                            "text.primary",

                        wordBreak:
                            "break-word",

                        lineHeight:
                            1.5,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

export default ProfilePage;
