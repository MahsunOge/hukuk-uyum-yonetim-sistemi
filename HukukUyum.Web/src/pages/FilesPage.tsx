import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import api from "../api/axios";
import { getFileErrorMessage } from "../utils/fileErrors";

import EmptyState from "../components/common/EmptyState";
import PageLoading from "../components/common/PageLoading";

import {
    getCurrentUserRoles,
} from "../utils/auth";

interface FileItem {
    id: number;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt: string;
    taskItemId: number;
    taskTitle: string;
}

type FileTypeFilter =
    | "all"
    | "pdf"
    | "word"
    | "excel";

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

function SummaryCard({
    title,
    value,
    icon,
}: SummaryCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                backgroundColor:
                    "background.paper",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems:
                        "flex-start",
                    justifyContent:
                        "space-between",
                    gap: 2,
                }}
            >
                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            mt: 0.75,
                            fontWeight: 800,
                        fontSize: 30,
                            color:
                                "text.primary",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                            "center",
                        color: "#315F8C",
                        backgroundColor:
                            (theme) =>
                                theme.palette.mode === "dark"
                                    ? "rgba(49,95,140,0.10)"
                                    : "#EEF4F8",
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

function FilesPage() {
    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const navigate =
        useNavigate();

    const [
        files,
        setFiles,
    ] = useState<FileItem[]>([]);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        searchText,
        setSearchText,
    ] = useState("");

    const [
        fileType,
        setFileType,
    ] = useState<FileTypeFilter>(
        "all"
    );

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState<FileItem | null>(
        null
    );

    const [
        isDeleting,
        setIsDeleting,
    ] = useState(false);

    const roles =
        getCurrentUserRoles();

    const isAdmin =
        roles.includes("Admin");

    const loadFiles = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response =
                await api.get<FileItem[]>(
                    "/files"
                );

            setFiles(response.data);
        } catch (error) {
            console.error(
                "Dosyalar yüklenemedi:",
                error
            );

            setErrorMessage(
                await getFileErrorMessage(error, "Dosyalar yüklenirken bir hata oluştu.")
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadFiles();
    }, []);

    const getFileType = (
        file: FileItem
    ):
        | Exclude<
            FileTypeFilter,
            "all"
        >
        | "other" => {
        const fileName =
            file.originalFileName
                .toLowerCase();

        if (
            fileName.endsWith(
                ".pdf"
            )
        ) {
            return "pdf";
        }

        if (
            fileName.endsWith(
                ".doc"
            ) ||
            fileName.endsWith(
                ".docx"
            )
        ) {
            return "word";
        }

        if (
            fileName.endsWith(
                ".xls"
            ) ||
            fileName.endsWith(
                ".xlsx"
            )
        ) {
            return "excel";
        }

        return "other";
    };

    const pdfCount =
        useMemo(
            () =>
                files.filter(
                    (file) =>
                        getFileType(
                            file
                        ) === "pdf"
                ).length,
            [files]
        );

    const wordCount =
        useMemo(
            () =>
                files.filter(
                    (file) =>
                        getFileType(
                            file
                        ) === "word"
                ).length,
            [files]
        );

    const excelCount =
        useMemo(
            () =>
                files.filter(
                    (file) =>
                        getFileType(
                            file
                        ) === "excel"
                ).length,
            [files]
        );

    const filteredFiles =
        useMemo(() => {
            const normalizedSearch =
                searchText
                    .trim()
                    .toLocaleLowerCase(
                        "tr-TR"
                    );

            return files.filter(
                (file) => {
                    const matchesSearch =
                        normalizedSearch
                            .length === 0 ||
                        file.originalFileName
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            ) ||
                        file.taskTitle
                            .toLocaleLowerCase(
                                "tr-TR"
                            )
                            .includes(
                                normalizedSearch
                            );

                    const matchesType =
                        fileType ===
                        "all" ||
                        getFileType(
                            file
                        ) ===
                        fileType;

                    return (
                        matchesSearch &&
                        matchesType
                    );
                }
            );
        }, [
            files,
            searchText,
            fileType,
        ]);

    const hasActiveFilters =
        searchText.trim() !== "" ||
        fileType !== "all";

    const clearFilters = () => {
        setSearchText("");
        setFileType("all");
    };

    const formatFileSize = (
        bytes: number
    ) => {
        if (bytes === 0) {
            return "0 KB";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        const kilobytes =
            bytes / 1024;

        if (kilobytes < 1024) {
            return `${kilobytes.toFixed(
                1
            )} KB`;
        }

        const megabytes =
            kilobytes / 1024;

        return `${megabytes.toFixed(
            1
        )} MB`;
    };

    const formatDate = (
        value: string
    ) => {
        return new Date(
            value
        ).toLocaleDateString(
            "tr-TR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const handleDownload =
        async (
            file: FileItem
        ) => {
            try {
                setErrorMessage("");

                const response =
                    await api.get(
                        `/files/${file.id}/download`,
                        {
                            responseType:
                                "blob",
                        }
                    );

                const blobUrl =
                    window.URL
                        .createObjectURL(
                            new Blob([
                                response.data,
                            ])
                        );

                const anchor =
                    document.createElement(
                        "a"
                    );

                anchor.href =
                    blobUrl;

                anchor.download =
                    file.originalFileName;

                document.body
                    .appendChild(
                        anchor
                    );

                anchor.click();

                anchor.remove();

                window.URL
                    .revokeObjectURL(
                        blobUrl
                    );
            } catch (error) {
                console.error(
                    "Dosya indirilemedi:",
                    error
                );

                setErrorMessage(
                    await getFileErrorMessage(error, "Dosya indirilemedi.")
                );
            }
        };

    const handleDelete =
        async () => {
            if (!deleteTarget) {
                return;
            }

            try {
                setIsDeleting(true);
                setErrorMessage("");
                setSuccessMessage("");

                await api.delete(
                    `/files/${deleteTarget.id}`
                );

                setFiles(
                    (
                        currentFiles
                    ) =>
                        currentFiles.filter(
                            (file) =>
                                file.id !==
                                deleteTarget.id
                        )
                );

                setSuccessMessage(
                    "Dosya başarıyla silindi."
                );

                setDeleteTarget(
                    null
                );
            } catch (error) {
                console.error(
                    "Dosya silinemedi:",
                    error
                );

                setErrorMessage(
                    await getFileErrorMessage(error, "Dosya silinirken bir hata oluştu.")
                );
            } finally {
                setIsDeleting(false);
            }
        };

    const getTypeLabel = (
        file: FileItem
    ) => {
        const type =
            getFileType(file);

        switch (type) {
            case "pdf":
                return "PDF";

            case "word":
                return "Word";

            case "excel":
                return "Excel";

            default:
                return "Dosya";
        }
    };

    const getTypeIcon = (
        file: FileItem
    ) => {
        const type =
            getFileType(file);

        switch (type) {
            case "pdf":
                return (
                    <PictureAsPdfRoundedIcon />
                );

            case "word":
                return (
                    <ArticleRoundedIcon />
                );

            case "excel":
                return (
                    <TableChartRoundedIcon />
                );

            default:
                return (
                    <DescriptionRoundedIcon />
                );
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    width: "100%",
                }}
            >
                <PageLoading
                    cardCount={4}
                />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "none",
                mx: "auto",

                px: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: 3.5,
                    xl: 4,
                },

                pb: 3,

                minHeight: {
                    xs: "auto",
                    lg: "calc(100vh - 110px)",
                },

                color:
                    "text.primary",
            }}
        >
            {/* BAŞLIK */}

            <Paper
                elevation={0}
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    mb: 2.75,
                    p: {
                        xs: 2.4,
                        sm: 3,
                        lg: 2.25,
                    },
                    minHeight: {
                        xs: "auto",
                        lg: 112,
                    },
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3.5,
                    background: isDark
                        ? "linear-gradient(105deg, #111827 0%, #101B2B 58%, #172033 100%)"
                        : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 58%, #EEF3F7 100%)",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        right: -120,
                        top: -175,
                        backgroundColor: isDark
                            ? "rgba(49,95,140,0.07)"
                            : "rgba(49,95,140,0.04)",
                    }}
                />

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Dosya Yönetimi
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                mt: 0.9,
                                maxWidth: 720,
                                lineHeight: 1.7,
                            }}
                        >
                            Görevlere eklenen dokümanları tek bir alandan görüntüleyin ve yönetin.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            flexShrink: 0,
                            display: {
                                xs: "none",
                                sm: "flex",
                            },
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2.6,
                            color: "#315F8C",
                            backgroundColor: isDark
                                ? "rgba(49,95,140,0.14)"
                                : "#EAF1F7",
                        }}
                    >
                        <FolderOpenRoundedIcon />
                    </Box>
                </Stack>
            </Paper>

            {/* MESAJLAR */}

            {errorMessage && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                >
                    {errorMessage}
                </Alert>
            )}

            {successMessage && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2,
                        borderRadius: 2,
                    }}
                    onClose={() =>
                        setSuccessMessage(
                            ""
                        )
                    }
                >
                    {successMessage}
                </Alert>
            )}

            {/* ÖZET KARTLARI */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        sm:
                            "repeat(2, minmax(0, 1fr))",

                        lg: "repeat(4, minmax(0, 1fr))",
                    },

                    gap: 1.75,
                    mb: 2.5,
                }}
            >
                <SummaryCard
                    title="Toplam Dosya"
                    value={
                        files.length
                    }
                    icon={
                        <FolderOpenRoundedIcon />
                    }
                />

                <SummaryCard
                    title="PDF"
                    value={pdfCount}
                    icon={
                        <PictureAsPdfRoundedIcon />
                    }
                />

                <SummaryCard
                    title="Word"
                    value={
                        wordCount
                    }
                    icon={
                        <ArticleRoundedIcon />
                    }
                />

                <SummaryCard
                    title="Excel"
                    value={
                        excelCount
                    }
                    icon={
                        <TableChartRoundedIcon />
                    }
                />
            </Box>

            {/* DOSYA LİSTESİ */}

            <Paper
                elevation={0}
                sx={{
                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 3.2,

                    overflow:
                        "hidden",

                    backgroundColor:
                        "background.paper",
                }}
            >
                {/* ARAMA VE FİLTRE */}

                <Box
                    sx={{
                        p: {
                            xs: 1.8,
                            sm: 2.1,
                        },

                        display: "flex",

                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },

                        gap: 1.5,

                        justifyContent:
                            "space-between",

                        borderBottom:
                            "1px solid",

                        borderColor:
                            "divider",

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <TextField
                        value={
                            searchText
                        }
                        onChange={(
                            event
                        ) =>
                            setSearchText(
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder="Dosya veya görev ara..."
                        size="small"
                        sx={{
                            width: {
                                xs: "100%",
                                md: "min(520px, 100%)",
                            },

                            "& .MuiOutlinedInput-root":
                            {
                                borderRadius:
                                    2,
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment:
                                    (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon />
                                        </InputAdornment>
                                    ),
                            },
                        }}
                    />

                    <FormControl
                        size="small"
                        sx={{
                            minWidth: {
                                xs: "100%",
                                md: 170,
                            },
                        }}
                    >
                        <Select
                            value={
                                fileType
                            }
                            onChange={(
                                event
                            ) =>
                                setFileType(
                                    event
                                        .target
                                        .value as FileTypeFilter
                                )
                            }
                            sx={{
                                borderRadius:
                                    2,
                            }}
                        >
                            <MenuItem value="all">
                                Tüm Dosyalar
                            </MenuItem>

                            <MenuItem value="pdf">
                                PDF
                            </MenuItem>

                            <MenuItem value="word">
                                Word
                            </MenuItem>

                            <MenuItem value="excel">
                                Excel
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* BOŞ DURUM / DOSYALAR */}

                {filteredFiles.length ===
                    0 ? (
                    <Box
                        sx={{
                            p: 2.5,
                        }}
                    >
                        <EmptyState
                            title={
                                hasActiveFilters
                                    ? "Eşleşen dosya bulunamadı"
                                    : "Henüz dosya bulunmuyor"
                            }
                            description={
                                hasActiveFilters
                                    ? "Arama veya dosya türü kriterlerinize uygun bir dosya bulunamadı."
                                    : "Görevlere eklenen dosyalar burada görüntülenecektir."
                            }
                            icon={
                                <FolderOpenRoundedIcon
                                    sx={{
                                        fontSize: 32,
                                    }}
                                />
                            }
                            actionLabel={
                                hasActiveFilters
                                    ? "Filtreleri Temizle"
                                    : undefined
                            }
                            onAction={
                                hasActiveFilters
                                    ? clearFilters
                                    : undefined
                            }
                        />
                    </Box>
                ) : (
                    /* DOSYALAR */

                    <Box>
                        {filteredFiles.map(
                            (file) => (
                                <Box
                                    key={
                                        file.id
                                    }
                                    sx={{
                                        px: {
                                            xs: 2,
                                            md: 2.5,
                                        },

                                        py: {
                                            xs: 1.65,
                                            md: 1.8,
                                        },

                                        display:
                                            "grid",

                                        gridTemplateColumns:
                                        {
                                            xs:
                                                "1fr",

                                            md:
                                                "minmax(240px, 1.4fr) minmax(180px, 1fr) 100px 110px auto",
                                        },

                                        gap: {
                                            xs: 1.5,
                                            md: 2,
                                        },

                                        alignItems:
                                            "center",

                                        borderBottom:
                                            "1px solid",

                                        borderColor:
                                            "divider",

                                        backgroundColor:
                                            "background.paper",

                                        transition:
                                            "background-color 0.2s ease",

                                        "&:last-child":
                                        {
                                            borderBottom:
                                                "none",
                                        },

                                        "&:hover":
                                        {
                                            backgroundColor:
                                                "action.hover",
                                        },
                                    }}
                                >
                                    {/* DOSYA */}

                                    <Stack
                                        direction="row"
                                        spacing={
                                            1.5
                                        }
                                        sx={{
                                            alignItems:
                                                "center",

                                            minWidth:
                                                0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 44,
                                                height: 44,

                                                flexShrink:
                                                    0,

                                                borderRadius:
                                                    2,

                                                display:
                                                    "flex",

                                                alignItems:
                                                    "center",

                                                justifyContent:
                                                    "center",

                                                color:
                                                    "#315F8C",

                                                backgroundColor:
                                                    isDark
                                                        ? "rgba(49,95,140,0.10)"
                                                        : "#EEF4F8",
                                            }}
                                        >
                                            {getTypeIcon(
                                                file
                                            )}
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth:
                                                    0,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        700,

                                                    color:
                                                        "text.primary",

                                                    overflow:
                                                        "hidden",

                                                    textOverflow:
                                                        "ellipsis",

                                                    whiteSpace:
                                                        "nowrap",
                                                }}
                                            >
                                                {
                                                    file.originalFileName
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatDate(
                                                    file.uploadedAt
                                                )}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* GÖREV */}

                                    <Box
                                        onClick={() =>
                                            navigate(
                                                `/tasks/${file.taskItemId}`
                                            )
                                        }
                                        sx={{
                                            cursor:
                                                "pointer",

                                            minWidth:
                                                0,

                                            color:
                                                "text.primary",

                                            "&:hover":
                                            {
                                                color:
                                                    "primary.main",
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight:
                                                    600,

                                                color:
                                                    "inherit",

                                                overflow:
                                                    "hidden",

                                                textOverflow:
                                                    "ellipsis",

                                                whiteSpace:
                                                    "nowrap",
                                            }}
                                        >
                                            {
                                                file.taskTitle
                                            }
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Görev #
                                            {
                                                file.taskItemId
                                            }
                                        </Typography>
                                    </Box>

                                    {/* TÜR */}

                                    <Box>
                                        <Chip
                                            size="small"
                                            label={getTypeLabel(
                                                file
                                            )}
                                            variant="outlined"
                                        />
                                    </Box>

                                    {/* BOYUT */}

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {formatFileSize(
                                            file.fileSize
                                        )}
                                    </Typography>

                                    {/* İŞLEMLER */}

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{
                                            justifyContent:
                                            {
                                                xs:
                                                    "flex-start",

                                                md:
                                                    "flex-end",
                                            },
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={
                                                <DownloadRoundedIcon />
                                            }
                                            onClick={() =>
                                                void handleDownload(
                                                    file
                                                )
                                            }
                                            sx={{
                                                borderRadius:
                                                    2,

                                                textTransform:
                                                    "none",
                                            }}
                                        >
                                            İndir
                                        </Button>

                                        <Button
                                            size="small"
                                            variant="text"
                                            startIcon={
                                                <OpenInNewRoundedIcon />
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/tasks/${file.taskItemId}`
                                                )
                                            }
                                            sx={{
                                                borderRadius:
                                                    2,

                                                textTransform:
                                                    "none",
                                            }}
                                        >
                                            Görev
                                        </Button>

                                        {isAdmin && (
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="text"
                                                onClick={() =>
                                                    setDeleteTarget(
                                                        file
                                                    )
                                                }
                                                sx={{
                                                    minWidth:
                                                        40,

                                                    borderRadius:
                                                        2,
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon />
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>
                            )
                        )}
                    </Box>
                )}
            </Paper>

            {/* SİLME DIALOG */}

            <Dialog
                open={
                    deleteTarget !==
                    null
                }
                onClose={() => {
                    if (
                        !isDeleting
                    ) {
                        setDeleteTarget(
                            null
                        );
                    }
                }}
                fullWidth
                maxWidth="xs"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius:
                                3.2,

                            backgroundColor:
                                "background.paper",

                            border:
                                "1px solid",

                            borderColor:
                                "divider",
                        },
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 800,

                        color:
                            "text.primary",
                    }}
                >
                    Dosyayı Sil
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        <strong>
                            {
                                deleteTarget?.originalFileName
                            }
                        </strong>{" "}
                        dosyasını silmek
                        istediğinize emin
                        misiniz? Bu işlem geri
                        alınamaz.
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >
                    <Button
                        onClick={() =>
                            setDeleteTarget(
                                null
                            )
                        }
                        disabled={
                            isDeleting
                        }
                        sx={{
                            textTransform:
                                "none",
                        }}
                    >
                        Vazgeç
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        disabled={
                            isDeleting
                        }
                        onClick={() =>
                            void handleDelete()
                        }
                        sx={{
                            boxShadow:
                                "none",

                            textTransform:
                                "none",
                        }}
                    >
                        {isDeleting
                            ? "Siliniyor..."
                            : "Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FilesPage;
