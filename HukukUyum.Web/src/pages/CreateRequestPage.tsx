import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
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

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";

import api from "../api/axios";

interface TaskCategoryItem {
    id: number;
    name: string;
    groupId: number;
    groupName: string;
}

function CreateRequestPage() {
    const navigate =
        useNavigate();

    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";

    const [
        title,
        setTitle,
    ] =
        useState("");

    const [
        description,
        setDescription,
    ] =
        useState("");

    const [
        priority,
        setPriority,
    ] =
        useState<number>(
            2
        );

    const [
        dueDate,
        setDueDate,
    ] =
        useState("");

    const [
        categories,
        setCategories,
    ] =
        useState<
            TaskCategoryItem[]
        >([]);

    const [
        categoryId,
        setCategoryId,
    ] =
        useState("");

    const [
        isLoading,
        setIsLoading,
    ] =
        useState(true);

    const [
        isSaving,
        setIsSaving,
    ] =
        useState(false);

    const [
        errorMessage,
        setErrorMessage,
    ] =
        useState("");

    useEffect(() => {
        const loadCategories =
            async () => {
                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    const response =
                        await api.get<
                            TaskCategoryItem[]
                        >(
                            "/TaskCategories"
                        );

                    setCategories(
                        response.data
                    );
                } catch (
                error: any
                ) {
                    console.error(
                        "Kategoriler alınamadı:",
                        error
                    );

                    if (
                        error.response
                            ?.status ===
                        401
                    ) {
                        setErrorMessage(
                            "Oturum süreniz dolmuş olabilir."
                        );
                    } else {
                        setErrorMessage(
                            "Talep kategorileri yüklenemedi."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadCategories();
    }, []);

    const selectedCategory =
        useMemo(() => {
            if (
                !categoryId
            ) {
                return null;
            }

            return (
                categories.find(
                    (
                        category
                    ) =>
                        String(
                            category.id
                        ) ===
                        categoryId
                ) ??
                null
            );
        }, [
            categories,
            categoryId,
        ]);

    const getBackendMessage =
        (
            error: any
        ) => {
            return (
                error.response
                    ?.data
                    ?.message ||
                error.response
                    ?.data
                    ?.title ||
                null
            );
        };

    const handleSubmit =
        async () => {
            if (
                !title.trim()
            ) {
                setErrorMessage(
                    "Talep başlığı zorunludur."
                );

                return;
            }

            if (
                !categoryId
            ) {
                setErrorMessage(
                    "Lütfen talebiniz için bir kategori seçiniz."
                );

                return;
            }

            try {
                setIsSaving(
                    true
                );

                setErrorMessage(
                    ""
                );

                const request =
                {
                    title:
                        title.trim(),

                    description:
                        description.trim() ||
                        null,

                    priority,

                    dueDate:
                        dueDate ||
                        null,

                    categoryId:
                        Number(
                            categoryId
                        ),
                };

                await api.post(
                    "/tasks/requests",
                    request
                );

                navigate(
                    "/my-requests",
                    {
                        state: {
                            successMessage:
                                "Talebiniz ilgili gruba başarıyla gönderildi.",
                        },
                    }
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Talep oluşturulamadı:",
                    error
                );

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                if (
                    error.response
                        ?.status ===
                    401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                    );
                } else if (
                    error.response
                        ?.status ===
                    403
                ) {
                    setErrorMessage(
                        "Talep oluşturma yetkiniz bulunmuyor."
                    );
                } else if (
                    backendMessage
                ) {
                    setErrorMessage(
                        backendMessage
                    );
                } else {
                    setErrorMessage(
                        "Talep oluşturulurken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsSaving(
                    false
                );
            }
        };

    if (
        isLoading
    ) {
        return (
            <Box
                sx={{
                    minHeight:
                        450,

                    display:
                        "flex",

                    flexDirection:
                        "column",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    gap: 2,
                }}
            >
                <CircularProgress
                    size={36}
                    sx={{
                        color:
                            "#163A63",
                    }}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Talep formu hazırlanıyor...
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width:
                    "100%",

                maxWidth:
                    "none",

                mx:
                    "auto",

                px: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: 3.5,
                    xl: 4,
                },

                pb: 3,
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    mb: 2.5,

                    display:
                        "flex",

                    alignItems:
                    {
                        xs: "flex-start",
                        md: "center",
                    },

                    justifyContent:
                        "space-between",

                    flexDirection:
                    {
                        xs: "column",
                        md: "row",
                    },

                    gap: 2,
                }}
            >
                <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{
                        alignItems:
                            "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,

                            flexShrink:
                                0,

                            borderRadius:
                                2.4,

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
                                    ? "rgba(49,95,140,0.12)"
                                    : "#EDF3F8",
                        }}
                    >
                        <DescriptionRoundedIcon
                            sx={{
                                fontSize:
                                    21,
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography
                            sx={{
                                fontSize:
                                {
                                    xs: 24,
                                    sm: 27,
                                    lg: 29,
                                },

                                fontWeight:
                                    800,

                                lineHeight:
                                    1.2,

                                letterSpacing:
                                    "-0.03em",
                            }}
                        >
                            Yeni Talep Oluştur
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.35,
                            }}
                        >
                            Talebinizi oluşturarak ilgili çalışma grubuna
                            iletebilirsiniz.
                        </Typography>
                    </Box>
                </Stack>

                <Button
                    startIcon={
                        <ArrowBackRoundedIcon />
                    }
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                    sx={{
                        textTransform:
                            "none",

                        fontWeight:
                            650,

                        color:
                            "text.secondary",

                        borderRadius:
                            2,

                        px: 1.4,

                        "&:hover":
                        {
                            backgroundColor:
                                "action.hover",

                            color:
                                "text.primary",
                        },
                    }}
                >
                    Dashboard'a Dön
                </Button>
            </Box>

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2.5,

                        borderRadius:
                            2.5,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* ANA GRID */}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        lg: "minmax(0, 1fr) 285px",

                        xl: "minmax(0, 1fr) 310px",
                    },

                    columnGap:
                    {
                        xs: 0,
                        lg: 2.5,
                        xl: 3,
                    },

                    rowGap:
                        2.5,

                    alignItems:
                        "start",
                }}
            >
                {/* FORM */}

                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2,
                            sm: 2.5,
                            md: 3,
                        },

                        minWidth:
                            0,
                        minHeight: {
                            xs: "auto",
                            lg: 650,
                        },
                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            mb: 2.5,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight:
                                    750,
                            }}
                        >
                            Talep Bilgileri
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.35,
                            }}
                        >
                            Talebinizin içeriğini ve öncelik bilgilerini
                            eksiksiz giriniz.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display:
                                "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",

                                md: "repeat(2, minmax(0, 1fr))",
                            },

                            gap: 2.25,
                        }}
                    >
                        <TextField
                            label="Talep Başlığı"
                            value={
                                title
                            }
                            onChange={(
                                event
                            ) =>
                                setTitle(
                                    event.target
                                        .value
                                )
                            }
                            required
                            fullWidth
                            placeholder="Örn. Login ekranında hata oluşuyor"
                            slotProps={{
                                htmlInput:
                                {
                                    maxLength:
                                        200,
                                },
                            }}
                            sx={{
                                gridColumn:
                                {
                                    md: "1 / -1",
                                },

                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.25,
                                },
                            }}
                        />

                        <TextField
                            label="Talep Açıklaması"
                            value={
                                description
                            }
                            onChange={(
                                event
                            ) =>
                                setDescription(
                                    event.target
                                        .value
                                )
                            }
                            multiline
                            minRows={6}
                            fullWidth
                            placeholder="Talebinizle ilgili detayları, karşılaştığınız durumu ve beklentinizi açıklayınız..."
                            slotProps={{
                                htmlInput:
                                {
                                    maxLength:
                                        2000,
                                },
                            }}
                            sx={{
                                gridColumn:
                                {
                                    md: "1 / -1",
                                },

                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.25,

                                    alignItems:
                                        "flex-start",
                                },
                            }}
                        />

                        <Box
                            sx={{
                                gridColumn:
                                {
                                    md: "1 / -1",
                                },

                                pt: 0.3,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight:
                                        750,
                                }}
                            >
                                Sınıflandırma ve Zamanlama
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display:
                                        "block",

                                    mt: 0.3,
                                }}
                            >
                                Talebin kategori, öncelik ve hedef tarih
                                bilgilerini belirleyin.
                            </Typography>
                        </Box>

                        <FormControl
                            fullWidth
                            required
                        >
                            <InputLabel>
                                Kategori
                            </InputLabel>

                            <Select
                                value={
                                    categoryId
                                }
                                label="Kategori"
                                onChange={(
                                    event
                                ) =>
                                    setCategoryId(
                                        event.target
                                            .value
                                    )
                                }
                                sx={{
                                    borderRadius:
                                        2.25,
                                }}
                            >
                                {categories.map(
                                    (
                                        category
                                    ) => (
                                        <MenuItem
                                            key={
                                                category.id
                                            }
                                            value={String(
                                                category.id
                                            )}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{
                                                    alignItems:
                                                        "center",

                                                    width:
                                                        "100%",
                                                }}
                                            >
                                                <CategoryRoundedIcon
                                                    sx={{
                                                        fontSize:
                                                            18,

                                                        color:
                                                            "text.secondary",
                                                    }}
                                                />

                                                <Box
                                                    sx={{
                                                        minWidth:
                                                            0,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight:
                                                                650,
                                                        }}
                                                    >
                                                        {
                                                            category.name
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            category.groupName
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <FormControl
                            fullWidth
                        >
                            <InputLabel>
                                Öncelik
                            </InputLabel>

                            <Select
                                value={
                                    priority
                                }
                                label="Öncelik"
                                onChange={(
                                    event
                                ) =>
                                    setPriority(
                                        Number(
                                            event.target
                                                .value
                                        )
                                    )
                                }
                                sx={{
                                    borderRadius:
                                        2.25,
                                }}
                            >
                                <MenuItem value={1}>
                                    Düşük
                                </MenuItem>

                                <MenuItem value={2}>
                                    Orta
                                </MenuItem>

                                <MenuItem value={3}>
                                    Yüksek
                                </MenuItem>

                                <MenuItem value={4}>
                                    Kritik
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Talep Edilen Bitiş Tarihi"
                            type="date"
                            value={
                                dueDate
                            }
                            onChange={(
                                event
                            ) =>
                                setDueDate(
                                    event.target
                                        .value
                                )
                            }
                            fullWidth
                            slotProps={{
                                inputLabel:
                                {
                                    shrink:
                                        true,
                                },
                            }}
                            sx={{
                                gridColumn:
                                {
                                    xs: "auto",
                                    md: "1 / 2",
                                },

                                "& .MuiOutlinedInput-root":
                                {
                                    borderRadius:
                                        2.25,
                                },
                            }}
                        />

                        <Box
                            sx={{
                                display:
                                {
                                    xs: "none",
                                    md: "block",
                                },
                            }}
                        />

                        <Paper
                            elevation={0}
                            sx={{
                                gridColumn:
                                {
                                    md: "1 / -1",
                                },

                                p: 1.8,

                                border:
                                    "1px solid",

                                borderColor:
                                    isDark
                                        ? "rgba(148,163,184,0.12)"
                                        : "#DDE6ED",

                                borderRadius:
                                    2.5,

                                backgroundColor:
                                    isDark
                                        ? "rgba(49,95,140,0.05)"
                                        : "#F6F9FB",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.4}
                                sx={{
                                    alignItems:
                                        "flex-start",
                                }}
                            >
                                <InfoOutlinedIcon
                                    sx={{
                                        mt: 0.1,

                                        fontSize:
                                            20,

                                        color:
                                            "#5A7893",
                                    }}
                                />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight:
                                                700,
                                        }}
                                    >
                                        Otomatik yönlendirme
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.35,

                                            lineHeight:
                                                1.6,
                                        }}
                                    >
                                        Seçtiğiniz kategoriye göre talebiniz
                                        ilgili çalışma grubuna otomatik olarak
                                        yönlendirilecektir. Belirli bir
                                        kullanıcıya doğrudan atama yapılamaz.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Box
                            sx={{
                                gridColumn:
                                {
                                    md: "1 / -1",
                                },

                                pt: 0.5,

                                display:
                                    "flex",

                                justifyContent:
                                    "flex-end",

                                flexDirection:
                                {
                                    xs: "column",
                                    sm: "row",
                                },

                                gap: 1.3,
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={
                                    <ArrowBackRoundedIcon />
                                }
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
                                }
                                disabled={
                                    isSaving
                                }
                                sx={{
                                    width:
                                    {
                                        xs: "100%",
                                        sm: "auto",
                                    },

                                    minHeight:
                                        43,

                                    px: 2.3,

                                    borderRadius:
                                        2.2,

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        650,

                                    color:
                                        "text.secondary",

                                    borderColor:
                                        "divider",
                                }}
                            >
                                Vazgeç
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={
                                    isSaving
                                        ? undefined
                                        : <SendRoundedIcon />
                                }
                                onClick={
                                    handleSubmit
                                }
                                disabled={
                                    isSaving
                                }
                                sx={{
                                    width:
                                    {
                                        xs: "100%",
                                        sm: "auto",
                                    },

                                    minHeight:
                                        43,

                                    minWidth:
                                        165,

                                    px: 2.5,

                                    borderRadius:
                                        2.2,

                                    textTransform:
                                        "none",

                                    fontWeight:
                                        700,

                                    backgroundColor:
                                        "#163A63",

                                    boxShadow:
                                        "0 6px 16px rgba(22,58,99,0.16)",

                                    "&:hover":
                                    {
                                        backgroundColor:
                                            "#102F51",
                                    },
                                }}
                            >
                                {isSaving
                                    ? "Gönderiliyor..."
                                    : "Talebi Gönder"}
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* SAĞ BİLGİ PANELİ */}

                <Box
                    sx={{
                        display: "grid",

                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(3, minmax(0, 1fr))",
                            lg: "1fr",
                        },

                        gridTemplateRows: {
                            lg: "repeat(3, minmax(0, 1fr))",
                        },

                        gap: 2,

                        minHeight: {
                            xs: "auto",
                            lg: 650,
                        },
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.2,

                            minWidth:
                                0,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                3,

                            backgroundColor:
                                "background.paper",
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,

                                borderRadius:
                                    2.3,

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
                                        ? "rgba(49,95,140,0.12)"
                                        : "#EDF3F8",

                                mb: 1.5,
                            }}
                        >
                            <RouteRoundedIcon
                                sx={{
                                    fontSize:
                                        21,
                                }}
                            />
                        </Box>

                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight:
                                    750,
                            }}
                        >
                            Talep Yönlendirmesi
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt: 0.65,

                                lineHeight:
                                    1.65,
                            }}
                        >
                            Kategori seçiminize göre talebiniz otomatik olarak
                            sorumlu çalışma grubuna iletilir.
                        </Typography>

                        {selectedCategory && (
                            <Box
                                sx={{
                                    mt: 1.6,

                                    p: 1.5,

                                    borderRadius:
                                        2.2,

                                    border:
                                        "1px solid",

                                    borderColor:
                                        "divider",

                                    backgroundColor:
                                        isDark
                                            ? "rgba(255,255,255,0.025)"
                                            : "#FAFBFC",
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Seçilen kategori
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 0.35,

                                        fontWeight:
                                            700,
                                    }}
                                >
                                    {selectedCategory.name}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display:
                                            "block",

                                        mt: 1,
                                    }}
                                >
                                    Yönlendirilecek grup
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 0.35,

                                        fontWeight:
                                            700,

                                        color:
                                            "#315F8C",
                                    }}
                                >
                                    {selectedCategory.groupName}
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.2,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                3,

                            backgroundColor:
                                isDark
                                    ? "rgba(185,133,58,0.04)"
                                    : "#FBF9F5",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.2}
                            sx={{
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <FlagRoundedIcon
                                sx={{
                                    mt: 0.1,

                                    fontSize:
                                        20,

                                    color:
                                        "#9A6C28",
                                }}
                            />

                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Öncelik Seçimi
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.45,

                                        lineHeight:
                                            1.6,
                                    }}
                                >
                                    Kritik ve yüksek öncelik yalnızca gerçekten
                                    acil talepler için kullanılmalıdır.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.2,

                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                3,

                            backgroundColor:
                                "background.paper",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.2}
                            sx={{
                                alignItems:
                                    "flex-start",
                            }}
                        >
                            <CalendarMonthRoundedIcon
                                sx={{
                                    mt: 0.1,

                                    fontSize:
                                        20,

                                    color:
                                        "#64748B",
                                }}
                            />

                            <Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Bitiş Tarihi
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.45,

                                        lineHeight:
                                            1.6,
                                    }}
                                >
                                    Bitiş tarihi zorunlu değildir. Gerektiğinde
                                    hedeflenen tamamlanma tarihini
                                    belirtebilirsiniz.
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

export default CreateRequestPage;
