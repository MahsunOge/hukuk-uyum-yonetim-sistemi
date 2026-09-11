import {
    useState,
    type FormEvent,
} from "react";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { Link } from "react-router-dom";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

import api from "../api/axios";

function ForgotPasswordPage() {
    const [
        email,
        setEmail,
    ] = useState("");

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

        if (!email.trim()) {
            setErrorMessage(
                "E-posta adresi zorunludur."
            );

            return;
        }

        try {
            setIsLoading(true);

            await api.post(
                "/Auth/forgot-password",
                {
                    email:
                        email.trim(),
                }
            );

            setSuccessMessage(
                "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin."
            );

            setEmail("");
        } catch (error: any) {
            console.error(
                "Şifre sıfırlama isteği oluşturulamadı:",
                error
            );

            const backendMessage =
                error.response
                    ?.data
                    ?.message;

            if (backendMessage) {
                setErrorMessage(
                    backendMessage
                );
            } else {
                setErrorMessage(
                    "Şifre sıfırlama isteği oluşturulamadı. Lütfen daha sonra tekrar deneyin."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                            md: 560,
                        },
                    }}
                >
                    {/* SOL TARAF */}

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
                                Şifrenizi Yenileyin
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
                                Hesabınıza kayıtlı
                                e-posta adresini
                                girin. Şifrenizi
                                yenilemeniz için size
                                bir bağlantı
                                göndereceğiz.
                            </Typography>
                        </Box>
                    </Box>

                    {/* FORM */}

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
                                Şifremi Unuttum
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
                                Sistemde kayıtlı
                                e-posta adresinizi
                                girin.
                            </Typography>

                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2.5,

                                        borderRadius:
                                            2,
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
                                    sx={{
                                        mb: 2.5,

                                        borderRadius:
                                            2,
                                    }}
                                >
                                    {
                                        successMessage
                                    }
                                </Alert>
                            )}

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
                                        label="E-posta"
                                        type="email"
                                        value={email}
                                        onChange={(
                                            event
                                        ) =>
                                            setEmail(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        fullWidth
                                        autoComplete="email"
                                        slotProps={{
                                            input: {
                                                startAdornment:
                                                    (
                                                        <InputAdornment position="start">
                                                            <EmailRoundedIcon
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
                                            isLoading
                                        }
                                        fullWidth
                                        startIcon={
                                            !isLoading
                                                ? <SendRoundedIcon />
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
                                            "Sıfırlama Bağlantısı Gönder"
                                        )}
                                    </Button>

                                    <Button
                                        component={
                                            Link
                                        }
                                        to="/login"
                                        variant="text"
                                        startIcon={
                                            <ArrowBackRoundedIcon />
                                        }
                                        fullWidth
                                        sx={{
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
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default ForgotPasswordPage;
