import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

import type {
    ReactNode,
} from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

function EmptyState({
    title,
    description,
    icon,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                py: {
                    xs: 5,
                    sm: 7,
                },
                px: 3,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 3,
                backgroundColor:
                    "background.paper",
            }}
        >
            <Stack
                spacing={2}
                sx={{
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                            "action.hover",
                        color:
                            "text.secondary",
                    }}
                >
                    {icon ?? (
                        <InboxRoundedIcon
                            sx={{
                                fontSize: 32,
                            }}
                        />
                    )}
                </Box>

                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        {title}
                    </Typography>

                    {description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.75,
                                maxWidth: 440,
                                lineHeight: 1.7,
                            }}
                        >
                            {description}
                        </Typography>
                    )}
                </Box>

                {actionLabel &&
                    onAction && (
                        <Button
                            variant="outlined"
                            onClick={
                                onAction
                            }
                            sx={{
                                textTransform:
                                    "none",
                                borderRadius: 2,
                            }}
                        >
                            {actionLabel}
                        </Button>
                    )}
            </Stack>
        </Paper>
    );
}

export default EmptyState;
