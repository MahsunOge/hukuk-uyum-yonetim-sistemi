import {
    Box,
    Paper,
    Typography,
} from "@mui/material";

interface PlaceholderPageProps {
    title: string;
    description: string;
}

function PlaceholderPage({
    title,
    description,
}: PlaceholderPageProps) {
    return (
        <Box>
            <Typography
                variant="h4"
                component="h1"
                sx={{ marginBottom: 3 }}
            >
                {title}
            </Typography>

            <Paper
                sx={{
                    padding: 4,
                }}
            >
                <Typography
                    variant="body1"
                    color="text.secondary"
                >
                    {description}
                </Typography>
            </Paper>
        </Box>
    );
}

export default PlaceholderPage;






