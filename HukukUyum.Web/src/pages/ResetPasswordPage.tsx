import {
    useState,
    type FormEvent,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

import api from "../api/axios";

function ResetPasswordPage() {
    const [searchParams] =
        useSearchParams();

    const email =
        searchParams.get("email") ?? "";

    const token =
        searchParams.get("token") ?? "";

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmNewPassword,
        setConfirmNewPassword,
    ] = useState("");

    const [
        showNewPassword,
        setShowNewPassword,
    ] = useState(false);

    const [
        showConfirmPassword,
        setShowConfirmPassword,
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
        isLoading,
        setIsLoading,
    ] = useState(false);

    const handleSubmit = async (
        event: FormEvent
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!email || !token) {
            setErrorMessage(
                "Şifre sıfırlama bağlantısı geçersiz."
            );

            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage(
                "Yeni şifre en az 6 karakter olmalıdır."
            );

            return;
        }

        if (
            newPassword !==
            confirmNewPassword
        ) {
            setErrorMessage(
                "Yeni şifreler eşleşmiyor."
            );

            return;
        }

        try {
            setIsLoading(true);

            await api.post(
                "/Auth/reset-password",
                {
                    email,
                    token,
                    newPassword,
                    confirmNewPassword,
                }
            );

            setSuccessMessage(
                "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz."
            );

            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error: any) {
            console.error(
                "Şifre sıfırlama hatası:",
                error
            );

            const backendMessage =
                error.response
                    ?.data
                    ?.message;

            setErrorMessage(
                backendMessage ||
                "Şifre sıfırlama işlemi başarısız oldu. Bağlantının süresi dolmuş veya geçersiz olabilir."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const invalidLink =
        !email || !token;

    return (
        <Box
            sx={{
                minHeight: "100vh",

                display: "flex",

                alignItems: "center",

                justifyContent:
                    "center",

                px: {
                    xs: 2,
                    sm: 3,
                },

                py: 4,

                background:
                    "linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 900,

                    overflow:
                        "hidden",

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 4,

                    backgroundColor:
                        "#FFFFFF",

                    boxShadow:
                        "0 20px 60px rgba(15, 23, 42, 0.08)",
                }}
            >
                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            md:
                                "330px minmax(0, 1fr)",
                        },

                        minHeight: {
                            md: 580,
                        },
                    }}
                >
                    <Box
                        sx={{
                            p: {
                                xs: 3,
                                md: 4,
                            },

                            position:
                                "relative",

                            overflow:
                                "hidden",

                            display:
                                "flex",

                            flexDirection:
                                "column",

                            justifyContent:
                                "space-between",

                            color:
                                "#FFFFFF",

                            background:
                                "linear-gradient(160deg, #163A63 0%, #1D4ED8 100%)",
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

                                top:
                                    -90,

                                right:
                                    -100,

                                backgroundColor:
                                    "rgba(255,255,255,0.07)",
                            }}
                        />

                        <Box
                            sx={{
                                position:
                                    "relative",

                                zIndex: 1,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.25}
                                sx={{
                                    alignItems:
                                        "center",

                                    mb: 5,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,

                                        borderRadius:
                                            2,

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        backgroundColor:
                                            "rgba(255,255,255,0.14)",
                                    }}
                                >
                                    <GavelRoundedIcon />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Hukuk Uyum
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            opacity:
                                                0.8,
                                        }}
                                    >
                                        Yönetim Sistemi
                                    </Typography>
                                </Box>
                            </Stack>

                            <Box
                                sx={{
                                    width: 58,
                                    height: 58,

                                    mb: 2.5,

                                    borderRadius:
                                        3,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    backgroundColor:
                                        "rgba(255,255,255,0.12)",
                                }}
                            >
                                <LockResetRoundedIcon
                                    sx={{
                                        fontSize:
                                            30,
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight:
                                        800,

                                    lineHeight:
                                        1.2,

                                    mb: 2,
                                }}
                            >
                                Yeni Şifrenizi Belirleyin
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    opacity:
                                        0.85,

                                    lineHeight:
                                        1.8,
                                }}
                            >
                                Hesabınız için yeni ve
                                güvenli bir şifre
                                oluşturun.
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            p: {
                                xs: 3,
                                sm: 4,
                                md: 5,
                            },

                            display:
                                "flex",

                            alignItems:
                                "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: 440,
                                mx: "auto",
                            }}
                        >
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
                                Şifreyi Sıfırla
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                    mb: 3,

                                    lineHeight:
                                        1.7,
                                }}
                            >
                                Yeni şifrenizi iki kez
                                girerek işlemi
                                tamamlayın.
                            </Typography>

                            {invalidLink && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2.5,

                                        borderRadius:
                                            2,
                                    }}
                                >
                                    Şifre sıfırlama
                                    bağlantısı geçersiz
                                    veya eksik.
                                </Alert>
                            )}

                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2.5,

                                        borderRadius:
                                            2,
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}

                            {successMessage && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 2.5,

                                        borderRadius:
                                            2,
                                    }}
                                >
                                    {successMessage}
                                </Alert>
                            )}

                            {!successMessage && (
                                <Box
                                    component="form"
                                    onSubmit={
                                        handleSubmit
                                    }
                                >
                                    <Stack
                                        spacing={2}
                                    >
                                        <TextField
                                            label="Yeni Şifre"
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                newPassword
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setNewPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            fullWidth
                                            disabled={
                                                invalidLink
                                            }
                                            autoComplete="new-password"
                                            slotProps={{
                                                input:
                                                {
                                                    startAdornment:
                                                        (
                                                            <InputAdornment position="start">
                                                                <LockRoundedIcon
                                                                    sx={{
                                                                        color:
                                                                            "text.secondary",
                                                                    }}
                                                                />
                                                            </InputAdornment>
                                                        ),

                                                    endAdornment:
                                                        (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() =>
                                                                        setShowNewPassword(
                                                                            (
                                                                                current
                                                                            ) =>
                                                                                !current
                                                                        )
                                                                    }
                                                                >
                                                                    {showNewPassword ? (
                                                                        <VisibilityOffRoundedIcon />
                                                                    ) : (
                                                                        <VisibilityRoundedIcon />
                                                                    )}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2,
                                                },
                                            }}
                                        />

                                        <TextField
                                            label="Yeni Şifre Tekrar"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                confirmNewPassword
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setConfirmNewPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            fullWidth
                                            disabled={
                                                invalidLink
                                            }
                                            autoComplete="new-password"
                                            slotProps={{
                                                input:
                                                {
                                                    startAdornment:
                                                        (
                                                            <InputAdornment position="start">
                                                                <LockRoundedIcon
                                                                    sx={{
                                                                        color:
                                                                            "text.secondary",
                                                                    }}
                                                                />
                                                            </InputAdornment>
                                                        ),

                                                    endAdornment:
                                                        (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    edge="end"
                                                                    onClick={() =>
                                                                        setShowConfirmPassword(
                                                                            (
                                                                                current
                                                                            ) =>
                                                                                !current
                                                                        )
                                                                    }
                                                                >
                                                                    {showConfirmPassword ? (
                                                                        <VisibilityOffRoundedIcon />
                                                                    ) : (
                                                                        <VisibilityRoundedIcon />
                                                                    )}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                },
                                            }}
                                            sx={{
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2,
                                                },
                                            }}
                                        />

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={
                                                isLoading ||
                                                invalidLink
                                            }
                                            fullWidth
                                            startIcon={
                                                !isLoading
                                                    ? <LockResetRoundedIcon />
                                                    : undefined
                                            }
                                            sx={{
                                                minHeight:
                                                    50,

                                                borderRadius:
                                                    2,

                                                boxShadow:
                                                    "none",

                                                textTransform:
                                                    "none",

                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            {isLoading ? (
                                                <CircularProgress
                                                    size={
                                                        24
                                                    }
                                                    color="inherit"
                                                />
                                            ) : (
                                                "Şifreyi Güncelle"
                                            )}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}

                            <Button
                                component={Link}
                                to="/login"
                                variant="text"
                                startIcon={
                                    <ArrowBackRoundedIcon />
                                }
                                fullWidth
                                sx={{
                                    mt: 2,

                                    minHeight:
                                        44,

                                    borderRadius:
                                        2,

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        600,

                                    color:
                                        "text.secondary",
                                }}
                            >
                                Giriş ekranına dön
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default ResetPasswordPage;
