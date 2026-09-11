import {
    Box,
    Skeleton,
    Stack,
} from "@mui/material";

interface PageLoadingProps {
    cardCount?: number;
}

function PageLoading({
    cardCount = 4,
}: PageLoadingProps) {
    return (
        <Box
            sx={{
                width: "100%",
            }}
        >
            <Stack
                spacing={1}
                sx={{
                    mb: 3,
                }}
            >
                <Skeleton
                    variant="text"
                    width={220}
                    height={42}
                />

                <Skeleton
                    variant="text"
                    width="min(100%, 420px)"
                    height={24}
                />
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                }}
            >
                {Array.from({
                    length: cardCount,
                }).map((_, index) => (
                    <Skeleton
                        key={index}
                        variant="rounded"
                        height={150}
                        sx={{
                            borderRadius: 3,
                        }}
                    />
                ))}
            </Box>

            <Skeleton
                variant="rounded"
                height={280}
                sx={{
                    mt: 3,
                    borderRadius: 3,
                }}
            />
        </Box>
    );
}

export default PageLoading;
