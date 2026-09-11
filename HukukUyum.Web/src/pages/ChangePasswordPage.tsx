import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import {
    useState,
    type FormEvent,
} from "react";

import api from "../api/axios";

interface ChangePasswordPageProps {
    onPasswordChanged: () => void;
}

function ChangePasswordPage({
    onPasswordChanged,
}: ChangePasswordPageProps) {
    const [
        currentPassword,
        setCurrentPassword,
    ] = useState("");

    const [
        newPassword,
        setNewPassword,
    ] = useState("");

    const [
        confirmNewPassword,
        setConfirmNewPassword,
    ] = useState("");

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

        if (
            newPassword !==
            confirmNewPassword
        ) {
            setErrorMessage(
                "Yeni şifreler eşleşmiyor."
            );

            return;
        }

        setIsLoading(true);

        try {
            await api.post(
                "/Auth/change-password",
                {
                    currentPassword,
                    newPassword,
                    confirmNewPassword,
                }
            );

            onPasswordChanged();
        } catch (error) {
            console.error(
                "Şifre değiştirme hatası:",
                error
            );

            setErrorMessage(
                "Şifre değiştirilemedi. Mevcut şifrenizi ve yeni şifre kurallarını kontrol edin."
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
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                padding: 2,
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: "100%",
                    maxWidth: 450,
                    padding: 4,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        textAlign: "center",
                        marginBottom: 2,
                    }}
                >
                    Şifre Değiştirme
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        textAlign: "center",
                        marginBottom: 3,
                    }}
                >
                    Sisteme devam etmek için
                    geçici şifrenizi değiştirmeniz
                    gerekmektedir.
                </Typography>

                {errorMessage && (
                    <Alert
                        severity="error"
                        sx={{
                            marginBottom: 2,
                        }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Mevcut Şifre"
                        type="password"
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(
                                event.target.value
                            )
                        }
                        required
                        fullWidth
                    />

                    <TextField
                        label="Yeni Şifre"
                        type="password"
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(
                                event.target.value
                            )
                        }
                        required
                        fullWidth
                    />

                    <TextField
                        label="Yeni Şifre Tekrarı"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(event) =>
                            setConfirmNewPassword(
                                event.target.value
                            )
                        }
                        required
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading}
                        fullWidth
                    >
                        {isLoading ? (
                            <CircularProgress
                                size={24}
                                color="inherit"
                            />
                        ) : (
                            "Şifreyi Değiştir"
                        )}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default ChangePasswordPage;
