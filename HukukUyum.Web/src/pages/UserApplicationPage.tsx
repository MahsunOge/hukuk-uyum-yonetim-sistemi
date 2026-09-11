import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useState,
    type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import api from "../api/axios";

function UserApplicationPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const [
        fullName,
        setFullName,
    ] = useState("");

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        phoneNumber,
        setPhoneNumber,
    ] = useState("");

    const [
        department,
        setDepartment,
    ] = useState("");

    const [
        personnelNumber,
        setPersonnelNumber,
    ] = useState("");

    const [
        description,
        setDescription,
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
        setIsLoading(true);

        try {
            await api.post(
                "/UserApplications",
                {
                    fullName:
                        fullName.trim(),

                    email:
                        email.trim(),

                    phoneNumber:
                        phoneNumber.trim() ||
                        null,

                    department:
                        department.trim() ||
                        null,

                    personnelNumber:
                        personnelNumber.trim() ||
                        null,

                    description:
                        description.trim() ||
                        null,
                }
            );

            setSuccessMessage(
                "Başvurunuz başarıyla oluşturuldu. Yönetici onayından sonra geçici şifreniz e-posta adresinize gönderilecektir."
            );
            setFullName("");
            setEmail("");
            setPhoneNumber("");
            setDepartment("");
            setPersonnelNumber("");
            setDescription("");
        } catch (
        error: any
        ) {
            console.error(
                "Kullanıcı başvuru hatası:",
                error
            );

            const backendMessage =
                error.response
                    ?.data
                    ?.message;

            if (
                backendMessage
            ) {
                setErrorMessage(
                    backendMessage
                );
            } else {
                setErrorMessage(
                    "Başvuru oluşturulamadı. Bu e-posta adresiyle daha önce başvuru yapılmış olabilir."
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
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark
                    ? "linear-gradient(135deg, #0A101C 0%, #0F172A 52%, #111C2E 100%)"
                    : "linear-gradient(135deg, #F6F8FB 0%, #EEF3F7 52%, #E8EEF4 100%)",
                px: {
                    xs: 1.5,
                    sm: 2.5,
                    md: 3,
                },
                py: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1120,
                    mx: "auto",
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: {
                            xs: 3,
                            sm: 4,
                        },
                        backgroundColor: "background.paper",
                        boxShadow: isDark
                            ? "0 24px 70px rgba(0,0,0,0.34)"
                            : "0 24px 70px rgba(15,23,42,0.09)",
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                lg: "390px minmax(0, 1fr)",
                            },
                            minHeight: {
                                lg: 720,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                p: {
                                    xs: 3,
                                    sm: 4,
                                    lg: 4.5,
                                },
                                background: isDark
                                    ? "linear-gradient(155deg, #12233A 0%, #163A63 55%, #102B4A 100%)"
                                    : "linear-gradient(155deg, #163A63 0%, #214C78 55%, #315F8C 100%)",
                                color: "#FFFFFF",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 260,
                                    height: 260,
                                    borderRadius: "50%",
                                    right: -120,
                                    top: -110,
                                    backgroundColor:
                                        "rgba(255,255,255,0.055)",
                                }}
                            />

                            <Box
                                sx={{
                                    position: "absolute",
                                    width: 210,
                                    height: 210,
                                    borderRadius: "50%",
                                    left: -110,
                                    bottom: -110,
                                    backgroundColor:
                                        "rgba(255,255,255,0.04)",
                                }}
                            />

                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    sx={{
                                        alignItems: "center",
                                        mb: {
                                            xs: 4,
                                            lg: 6,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 46,
                                            height: 46,
                                            borderRadius: 2.2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor:
                                                "rgba(255,255,255,0.12)",
                                            border:
                                                "1px solid rgba(255,255,255,0.10)",
                                        }}
                                    >
                                        <GavelRoundedIcon />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 800,
                                            }}
                                        >
                                            Hukuk Uyum
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                opacity: 0.72,
                                            }}
                                        >
                                            Yönetim Sistemi
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: 28,
                                            sm: 32,
                                            lg: 34,
                                        },
                                        fontWeight: 800,
                                        lineHeight: 1.18,
                                        letterSpacing:
                                            "-0.035em",
                                        maxWidth: 300,
                                    }}
                                >
                                    Sisteme Katılmak İçin Başvurun
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 2,
                                        opacity: 0.82,
                                        lineHeight: 1.85,
                                        maxWidth: 310,
                                    }}
                                >
                                    Bilgilerinizi eksiksiz şekilde doldurun.
                                    Başvurunuz yönetici tarafından incelendikten
                                    sonra hesabınız oluşturulacaktır.
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    mt: {
                                        xs: 4,
                                        lg: 6,
                                    },
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        opacity: 0.65,
                                        display: "block",
                                        mb: 1.5,
                                        fontWeight: 700,
                                        letterSpacing: "0.04em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    Başvuru Süreci
                                </Typography>

                                <Stack spacing={1.35}>
                                    {[
                                        "Bilgilerinizi gönderin",
                                        "Yönetici başvurunuzu incelesin",
                                        "Geçici şifreniz e-posta ile gelsin",
                                    ].map((item, index) => (
                                        <Stack
                                            key={item}
                                            direction="row"
                                            spacing={1.1}
                                            sx={{
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 26,
                                                    height: 26,
                                                    flexShrink: 0,
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor:
                                                        "rgba(255,255,255,0.11)",
                                                    border:
                                                        "1px solid rgba(255,255,255,0.10)",
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {index + 1}
                                                </Typography>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    opacity: 0.9,
                                                }}
                                            >
                                                {item}
                                            </Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                p: {
                                    xs: 2.5,
                                    sm: 4,
                                    md: 4.5,
                                    lg: 5,
                                },
                                backgroundColor:
                                    "background.paper",
                                color: "text.primary",
                            }}
                        >
                            <Box
                                sx={{
                                    mb: 3,
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    component="h1"
                                    sx={{
                                        fontWeight: 800,
                                        letterSpacing:
                                            "-0.03em",
                                    }}
                                >
                                    Kullanıcı Başvurusu
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        lineHeight: 1.7,
                                        maxWidth: 620,
                                    }}
                                >
                                    Sisteme erişim sağlamak için başvuru bilgilerinizi doldurun.
                                </Typography>
                            </Box>

                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 2.25,
                                        borderRadius: 2.3,
                                    }}
                                >
                                    {errorMessage}
                                </Alert>
                            )}

                            {successMessage && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 2.25,
                                        borderRadius: 2.3,
                                    }}
                                >
                                    {successMessage}
                                </Alert>
                            )}

                            <Box
                                component="form"
                                onSubmit={handleSubmit}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, minmax(0, 1fr))",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    <TextField
                                        label="Ad Soyad"
                                        value={fullName}
                                        onChange={(event) =>
                                            setFullName(event.target.value)
                                        }
                                        required
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonRoundedIcon
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
                                            gridColumn: {
                                                sm: "1 / -1",
                                            },
                                            "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="E-posta"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        required
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
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
                                            gridColumn: {
                                                sm: "1 / -1",
                                            },
                                            "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Telefon Numarası"
                                        value={phoneNumber}
                                        onChange={(event) =>
                                            setPhoneNumber(event.target.value)
                                        }
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PhoneRoundedIcon
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
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Departman"
                                        value={department}
                                        onChange={(event) =>
                                            setDepartment(event.target.value)
                                        }
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <BusinessRoundedIcon
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
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Personel Numarası"
                                        value={personnelNumber}
                                        onChange={(event) =>
                                            setPersonnelNumber(event.target.value)
                                        }
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <BadgeRoundedIcon
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
                                            gridColumn: {
                                                sm: "1 / -1",
                                            },
                                            "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />

                                    <TextField
                                        label="Açıklama"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(event.target.value)
                                        }
                                        multiline
                                        minRows={5}
                                        fullWidth
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment
                                                        position="start"
                                                        sx={{
                                                            alignSelf:
                                                                "flex-start",
                                                            mt: 1.5,
                                                        }}
                                                    >
                                                        <DescriptionRoundedIcon
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
                                            gridColumn: {
                                                sm: "1 / -1",
                                            },
                                            "& .MuiOutlinedInput-root":
                                            {
                                                borderRadius: 2.2,
                                            },
                                        }}
                                    />
                                </Box>

                                <Divider
                                    sx={{
                                        my: 3,
                                    }}
                                />

                                <Stack spacing={1.15}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={isLoading}
                                        fullWidth
                                        startIcon={
                                            !isLoading
                                                ? <SendRoundedIcon />
                                                : undefined
                                        }
                                        sx={{
                                            minHeight: 50,
                                            borderRadius: 2.2,
                                            fontWeight: 750,
                                            textTransform: "none",
                                            backgroundColor:
                                                "#163A63",
                                            boxShadow: "none",
                                            "&:hover": {
                                                backgroundColor:
                                                    "#102F51",
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        {isLoading ? (
                                            <CircularProgress
                                                size={24}
                                                color="inherit"
                                            />
                                        ) : (
                                            "Başvuru Yap"
                                        )}
                                    </Button>

                                    <Button
                                        component={Link}
                                        to="/login"
                                        variant="text"
                                        fullWidth
                                        startIcon={
                                            <ArrowBackRoundedIcon />
                                        }
                                        sx={{
                                            minHeight: 44,
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 650,
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
                </Paper>
            </Box>
        </Box>
    );

}
export default UserApplicationPage;
