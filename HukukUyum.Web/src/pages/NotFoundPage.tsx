import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import {
    useNavigate,
} from "react-router-dom";

function NotFoundPage() {
    const navigate =
        useNavigate();

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
                            color: "text.secondary",
                        }}
                    >
                        <SearchOffRoundedIcon
                            sx={{
                                fontSize: 38,
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                letterSpacing:
                                    "-0.04em",
                            }}
                        >
                            404
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                mt: 1,
                                fontWeight: 700,
                            }}
                        >
                            Sayfa Bulunamadı
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 1.25,
                                lineHeight: 1.7,
                            }}
                        >
                            Aradığınız sayfa kaldırılmış,
                            taşınmış veya hiç
                            oluşturulmamış olabilir.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={
                            <HomeRoundedIcon />
                        }
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                        }}
                    >
                        Dashboard'a Dön
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default NotFoundPage;
