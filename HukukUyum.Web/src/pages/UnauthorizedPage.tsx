import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import LockRoundedIcon from "@mui/icons-material/LockRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import {
    useNavigate,
} from "react-router-dom";

import {
    hasAnyRole,
} from "../utils/auth";

function UnauthorizedPage() {
    const navigate =
        useNavigate();

    const isUser =
        hasAnyRole([
            "User",
        ]);

    const handleReturn = () => {
        if (isUser) {
            navigate(
                "/my-requests"
            );

            return;
        }

        navigate(
            "/dashboard"
        );
    };

    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 560,
                    p: {
                        xs: 3,
                        sm: 5,
                    },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                    backgroundColor:
                        "background.paper",
                }}
            >
                <Stack
                    spacing={2.5}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 76,
                            height: 76,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                                "action.hover",
                            color: "warning.main",
                        }}
                    >
                        <LockRoundedIcon
                            sx={{
                                fontSize: 38,
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                letterSpacing:
                                    "-0.03em",
                            }}
                        >
                            Yetkisiz Erişim
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 1.25,
                                lineHeight: 1.7,
                            }}
                        >
                            Bu sayfayı görüntülemek
                            için gerekli yetkiye
                            sahip değilsiniz.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={
                            <HomeRoundedIcon />
                        }
                        onClick={
                            handleReturn
                        }
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        {isUser
                            ? "Taleplerime Dön"
                            : "Dashboard'a Dön"}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default UnauthorizedPage;
