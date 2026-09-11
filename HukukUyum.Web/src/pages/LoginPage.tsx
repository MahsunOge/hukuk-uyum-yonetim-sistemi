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
    useNavigate,
} from "react-router-dom";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

import api from "../api/axios";

interface LoginPageProps {
    onLoginSuccess: (
        mustChangePassword: boolean
    ) => void;
}

function LoginPage({
    onLoginSuccess,
}: LoginPageProps) {
    const navigate =
        useNavigate();

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        showPassword,
        setShowPassword,
    ] = useState(false);

    const [
        errorMessage,
        setErrorMessage,
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
        setIsLoading(true);

        try {
            const response =
                await api.post(
                    "/Auth/login",
                    {
                        email:
                            email.trim(),

                        password,
                    }
                );

            const token =
                response.data.token;

            const mustChangePassword =
                response.data
                    .mustChangePassword ===
                true;

            localStorage.setItem(
                "token",
                token
            );

            window.dispatchEvent(
                new CustomEvent(
                    "auth-state-changed"
                )
            );

            localStorage.setItem(
                "mustChangePassword",
                String(
                    mustChangePassword
                )
            );

            onLoginSuccess(
                mustChangePassword
            );

            navigate(
                mustChangePassword
                    ? "/change-password"
                    : "/dashboard",
                {
                    replace: true,
                }
            );
        } catch (error) {
            console.error(
                "Giriş hatası:",
                error
            );

            setErrorMessage(
                "Backend bağlantısı kurulamadı veya giriş bilgileri hatalı."
            );
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

                background: (theme) =>
                    theme.palette.mode ===
                    "dark"
                        ? "linear-gradient(135deg, #0B1120 0%, #111827 100%)"
                        : "linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 980,

                    overflow:
                        "hidden",

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 4,

                    backgroundColor:
                        "background.paper",

                    boxShadow: (
                        theme
                    ) =>
                        theme.palette
                            .mode ===
                        "dark"
                            ? "0 20px 60px rgba(0, 0, 0, 0.35)"
                            : "0 20px 60px rgba(15, 23, 42, 0.08)",
                }}
            >
                <Box
                    sx={{
                        display:
                            "grid",

                        gridTemplateColumns:
                        {
                            xs:
                                "1fr",

                            md:
                                "360px minmax(0, 1fr)",
                        },

                        minHeight: {
                            md: 620,
                        },
                    }}
                >
                    {/* SOL TANITIM ALANI */}

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
                                    240,

                                height:
                                    240,

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
                                    "absolute",

                                width:
                                    180,

                                height:
                                    180,

                                borderRadius:
                                    "50%",

                                bottom:
                                    -80,

                                left:
                                    -90,

                                backgroundColor:
                                    "rgba(255,255,255,0.05)",
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
                                spacing={
                                    1.25
                                }
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

                                        display:
                                            "flex",

                                        alignItems:
                                            "center",

                                        justifyContent:
                                            "center",

                                        borderRadius:
                                            2,

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
                                        Yönetim
                                        Sistemi
                                    </Typography>
                                </Box>
                            </Stack>

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
                                Güvenli ve
                                Düzenli İş
                                Takibi
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
                                Görevlerinizi,
                                gruplarınızı ve
                                süreçlerinizi tek
                                bir sistem
                                üzerinden yönetin.
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                position:
                                    "relative",

                                zIndex: 1,

                                mt: 5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    opacity:
                                        0.8,

                                    lineHeight:
                                        1.8,
                                }}
                            >
                                Sisteme yalnızca
                                yetkilendirilmiş
                                kullanıcılar
                                erişebilir.
                            </Typography>
                        </Box>
                    </Box>

                    {/* SAĞ GİRİŞ FORMU */}

                    <Box
                        sx={{
                            p: {
                                xs: 3,
                                sm: 4,
                                md: 5,
                            },

                            display:
                                "flex",

                            flexDirection:
                                "column",

                            justifyContent:
                                "center",

                            backgroundColor:
                                "background.paper",

                            color:
                                "text.primary",
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth:
                                    470,

                                width:
                                    "100%",

                                mx:
                                    "auto",
                            }}
                        >
                            <Box
                                sx={{
                                    mb: 3.5,
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
                                    Giriş Yap
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,

                                        lineHeight:
                                            1.7,
                                    }}
                                >
                                    Hesabınıza
                                    erişmek için
                                    e-posta ve
                                    şifrenizi
                                    girin.
                                </Typography>
                            </Box>

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
                                        value={
                                            email
                                        }
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
                                            input:
                                            {
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

                                    <TextField
                                        label="Şifre"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            password
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPassword(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        fullWidth
                                        autoComplete="current-password"
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
                                                                    setShowPassword(
                                                                        (
                                                                            current
                                                                        ) =>
                                                                            !current
                                                                    )
                                                                }
                                                                aria-label="Şifre görünürlüğünü değiştir"
                                                            >
                                                                {showPassword ? (
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

                                    <Box
                                        sx={{
                                            display:
                                                "flex",

                                            justifyContent:
                                                "flex-end",

                                            mt:
                                                -0.5,
                                        }}
                                    >
                                        <Button
                                            component={
                                                Link
                                            }
                                            to="/forgot-password"
                                            variant="text"
                                            size="small"
                                            sx={{
                                                p: 0,

                                                minWidth:
                                                    "auto",

                                                textTransform:
                                                    "none",

                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Şifremi
                                            Unuttum
                                        </Button>
                                    </Box>

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
                                                ? <LoginRoundedIcon />
                                                : undefined
                                        }
                                        sx={{
                                            minHeight:
                                                50,

                                            mt:
                                                0.5,

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
                                            "Giriş Yap"
                                        )}
                                    </Button>

                                    <Box
                                        sx={{
                                            pt: 1.5,

                                            textAlign:
                                                "center",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Henüz
                                            hesabınız
                                            yok mu?
                                        </Typography>
                                    </Box>

                                    <Button
                                        component={
                                            Link
                                        }
                                        to="/apply"
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        startIcon={
                                            <PersonAddAlt1RoundedIcon />
                                        }
                                        sx={{
                                            minHeight:
                                                48,

                                            borderRadius:
                                                2,

                                            textTransform:
                                                "none",

                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        Kullanıcı
                                        Başvurusu
                                        Yap
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

export default LoginPage;
