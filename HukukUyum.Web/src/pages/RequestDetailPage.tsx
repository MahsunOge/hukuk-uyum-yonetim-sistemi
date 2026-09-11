import {
    Alert,
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import api from "../api/axios";
import ChatUpdates, { markChatRead } from "../components/common/ChatUpdates";

import PageLoading from "../components/common/PageLoading";

interface RequestDetail {
    id: number;

    title: string;

    description: string | null;

    priority: number;

    status: number;

    createdAt: string;

    startDate: string | null;

    dueDate: string | null;

    completedAt: string | null;

    isOverdue: boolean;

    assignedUserId: string | null;

    assignedGroupId: number | null;

    parentTaskId: number | null;

    categoryId: number | null;

    categoryName: string | null;
}

interface CategoryItem {
    id: number;

    name: string;

    isActive?: boolean;

    groupId?: number;
}

interface TaskMessageItem {
    id: number;
    userId: string;
    fullName: string;
    message: string;
    createdAt: string;
}

const getCurrentUserIdFromToken = () => {
    const token =
        localStorage.getItem("token");

    if (!token) {
        return "";
    }

    try {
        const payloadPart =
            token.split(".")[1];

        const normalizedPayload =
            payloadPart
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const decodedPayload =
            decodeURIComponent(
                window
                    .atob(
                        normalizedPayload
                    )
                    .split("")
                    .map(
                        (character) =>
                            "%" +
                            character
                                .charCodeAt(0)
                                .toString(16)
                                .padStart(
                                    2,
                                    "0"
                                )
                    )
                    .join("")
            );

        const payload =
            JSON.parse(
                decodedPayload
            );

        return (
            payload[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ] ||
            payload.nameid ||
            payload.sub ||
            ""
        );
    } catch {
        return "";
    }
};

function RequestDetailPage() {
    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [
        request,
        setRequest,
    ] =
        useState<RequestDetail | null>(
            null
        );

    const [
        categories,
        setCategories,
    ] =
        useState<CategoryItem[]>(
            []
        );

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

    const [
        successMessage,
        setSuccessMessage,
    ] =
        useState("");

    const [
        messages,
        setMessages,
    ] =
        useState<TaskMessageItem[]>(
            []
        );

    const [
        newMessage,
        setNewMessage,
    ] =
        useState("");

    const [
        isMessagesLoading,
        setIsMessagesLoading,
    ] =
        useState(false);

    const [
        isSendingMessage,
        setIsSendingMessage,
    ] =
        useState(false);

    const [
        messageError,
        setMessageError,
    ] =
        useState("");

    const messagesEndRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const currentUserId =
        getCurrentUserIdFromToken();

    const formatDateForInput = (
        value: string | null
    ) => {
        if (!value) {
            return "";
        }

        const parsedDate =
            new Date(value);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        const year =
            parsedDate.getFullYear();

        const month =
            String(
                parsedDate.getMonth() +
                1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                parsedDate.getDate()
            ).padStart(
                2,
                "0"
            );

        return `${year}-${month}-${day}`;
    };

    const formatDate = (
        value: string | null
    ) => {
        if (!value) {
            return "-";
        }

        const parsedDate =
            new Date(value);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "-";
        }

        return parsedDate
            .toLocaleDateString(
                "tr-TR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }
            );
    };

    const getBackendMessage = (
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

    const getPriorityText = (
        value: number
    ) => {
        switch (value) {
            case 1:
                return "Düşük";

            case 2:
                return "Orta";

            case 3:
                return "Yüksek";

            case 4:
                return "Kritik";

            default:
                return "Bilinmiyor";
        }
    };

    const getPriorityColor = (
        value: number
    ):
        | "default"
        | "success"
        | "warning"
        | "error" => {
        switch (value) {
            case 1:
                return "success";

            case 2:
                return "default";

            case 3:
                return "warning";

            case 4:
                return "error";

            default:
                return "default";
        }
    };

    const getStatusText = (
        value: number
    ) => {
        switch (value) {
            case 1:
                return "Yeni";

            case 2:
                return "Devam Ediyor";

            case 3:
                return "Beklemede";

            case 4:
                return "Tamamlandı";

            case 5:
                return "İptal Edildi";

            default:
                return "Bilinmiyor";
        }
    };

    const getStatusColor = (
        value: number
    ):
        | "default"
        | "primary"
        | "warning"
        | "success"
        | "error" => {
        switch (value) {
            case 1:
                return "primary";

            case 2:
                return "warning";

            case 3:
                return "default";

            case 4:
                return "success";

            case 5:
                return "error";

            default:
                return "default";
        }
    };

    const formatMessageDate = (
        value: string
    ) => {
        const parsedDate =
            new Date(value);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate
            .toLocaleString(
                "tr-TR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
    };

    const loadMessages =
        async (
            requestId: string
        ) => {
            try {
                setIsMessagesLoading(
                    true
                );

                setMessageError(
                    ""
                );

                const response =
                    await api.get<
                        TaskMessageItem[]
                    >(
                        `/tasks/${requestId}/messages`
                    );

                setMessages(
                    response.data
                );
                void markChatRead(requestId, response.data);
            } catch (
            error: any
            ) {
                console.error(
                    "Talep mesajları yüklenemedi:",
                    error
                );

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                setMessageError(
                    backendMessage ||
                    "Sohbet mesajları yüklenemedi."
                );
            } finally {
                setIsMessagesLoading(
                    false
                );
            }
        };

    const handleSendMessage =
        async () => {
            if (!id) {
                return;
            }

            const trimmedMessage =
                newMessage.trim();

            if (
                !trimmedMessage
            ) {
                return;
            }

            try {
                setIsSendingMessage(
                    true
                );

                setMessageError(
                    ""
                );

                const response =
                    await api.post<
                        TaskMessageItem
                    >(
                        `/tasks/${id}/messages`,
                        {
                            message:
                                trimmedMessage,
                        }
                    );

                setMessages(
                    currentMessages => [
                        ...currentMessages,
                        response.data,
                    ]
                );

                setNewMessage(
                    ""
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Mesaj gönderilemedi:",
                    error
                );

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                setMessageError(
                    backendMessage ||
                    "Mesaj gönderilemedi."
                );
            } finally {
                setIsSendingMessage(
                    false
                );
            }
        };

    const applyRequestToForm = (
        requestData: RequestDetail
    ) => {
        setRequest(
            requestData
        );

        setTitle(
            requestData.title
        );

        setDescription(
            requestData.description ??
            ""
        );

        setPriority(
            requestData.priority
        );

        setDueDate(
            formatDateForInput(
                requestData.dueDate
            )
        );

        setCategoryId(
            requestData.categoryId
                ? String(
                    requestData.categoryId
                )
                : ""
        );
    };

    const loadRequest =
        async (
            requestId: string
        ) => {
            const response =
                await api.get<
                    RequestDetail
                >(
                    `/tasks/requests/${requestId}`
                );

            applyRequestToForm(
                response.data
            );
        };

    useEffect(() => {
        const loadPageData =
            async () => {
                if (!id) {
                    setErrorMessage(
                        "Talep numarası bulunamadı."
                    );

                    setIsLoading(
                        false
                    );

                    return;
                }

                try {
                    setIsLoading(
                        true
                    );

                    setErrorMessage(
                        ""
                    );

                    // 1. Önce sadece talep detayı yüklenir.
                    const requestResponse =
                        await api.get<RequestDetail>(
                            `/tasks/requests/${id}`
                        );

                    applyRequestToForm(
                        requestResponse.data
                    );

                    void loadMessages(id);

                    // 2. Kategoriler ayrı yüklenir.
                    try {
                        const categoryResponse =
                            await api.get<
                                CategoryItem[]
                            >(
                                "/TaskCategories"
                            );

                        setCategories(
                            categoryResponse.data.filter(
                                (
                                    category
                                ) =>
                                    category.isActive !==
                                    false
                            )
                        );
                    } catch (
                    categoryError
                    ) {
                        console.error(
                            "Kategoriler yüklenemedi:",
                            categoryError
                        );

                        setCategories(
                            []
                        );
                    }
                } catch (
                error: any
                ) {
                    console.error(
                        "Talep detayı yüklenemedi:",
                        error
                    );

                    const backendMessage =
                        getBackendMessage(
                            error
                        );

                    const status =
                        error.response
                            ?.status;

                    if (
                        status === 401
                    ) {
                        setErrorMessage(
                            "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                        );
                    } else if (
                        status === 403
                    ) {
                        setErrorMessage(
                            backendMessage ||
                            "Bu talebi görüntüleme yetkiniz bulunmuyor."
                        );
                    } else if (
                        status === 404
                    ) {
                        setErrorMessage(
                            backendMessage ||
                            "Talep bulunamadı."
                        );
                    } else {
                        setErrorMessage(
                            backendMessage ||
                            "Talep bilgileri yüklenemedi."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadPageData();
    }, [id]);


    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior:
                    "smooth",
            });
    }, [messages]);

    const handleSave =
        async () => {
            if (!id) {
                setErrorMessage(
                    "Talep numarası bulunamadı."
                );

                return;
            }

            if (
                !title.trim()
            ) {
                setErrorMessage(
                    "Talep başlığı zorunludur."
                );

                return;
            }

            if (
                title.trim()
                    .length > 200
            ) {
                setErrorMessage(
                    "Talep başlığı en fazla 200 karakter olabilir."
                );

                return;
            }

            if (
                description.trim()
                    .length > 2000
            ) {
                setErrorMessage(
                    "Açıklama en fazla 2000 karakter olabilir."
                );

                return;
            }

            if (!categoryId) {
                setErrorMessage(
                    "Kategori seçimi zorunludur."
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

                setSuccessMessage(
                    ""
                );

                await api.put(
                    `/tasks/${id}/request`,
                    {
                        title:
                            title.trim(),

                        description:
                            description
                                .trim() ||
                            null,

                        priority,

                        dueDate:
                            dueDate
                                ? `${dueDate}T00:00:00`
                                : null,

                        categoryId:
                            Number(
                                categoryId
                            ),
                    }
                );

                await loadRequest(
                    id
                );

                setSuccessMessage(
                    "Talebiniz başarıyla güncellendi."
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Talep güncellenemedi:",
                    error
                );

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                const status =
                    error.response
                        ?.status;

                if (
                    status === 401
                ) {
                    setErrorMessage(
                        "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                    );
                } else if (
                    status === 403
                ) {
                    setErrorMessage(
                        backendMessage ||
                        "Bu talebi güncelleme yetkiniz bulunmuyor."
                    );
                } else if (
                    status === 404
                ) {
                    setErrorMessage(
                        backendMessage ||
                        "Güncellenecek talep bulunamadı."
                    );
                } else if (
                    status === 400
                ) {
                    setErrorMessage(
                        backendMessage ||
                        "Talep bilgileri geçerli değildir."
                    );
                } else {
                    setErrorMessage(
                        backendMessage ||
                        "Talep güncellenirken bir hata oluştu."
                    );
                }
            } finally {
                setIsSaving(
                    false
                );
            }
        };

    if (isLoading) {
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
                }}
            >
                <PageLoading
                    cardCount={4}
                />
            </Box>
        );
    }

    if (
        !request
    ) {
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
                }}
            >
                <Button
                    startIcon={
                        <ArrowBackRoundedIcon />
                    }
                    onClick={() =>
                        navigate(
                            "/my-requests"
                        )
                    }
                    sx={{
                        mb: 2,
                        textTransform:
                            "none",
                    }}
                >
                    Taleplerime Dön
                </Button>

                <Alert
                    severity="error"
                    sx={{
                        borderRadius: 2,
                    }}
                >
                    {errorMessage ||
                        "Talep bulunamadı."}
                </Alert>
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
            }}
        >
            {/* GERİ DÖN */}

            <Button
                startIcon={
                    <ArrowBackRoundedIcon />
                }
                onClick={() =>
                    navigate(
                        "/my-requests"
                    )
                }
                sx={{
                    mb: 2,
                    textTransform:
                        "none",
                    fontWeight: 600,
                }}
            >
                Taleplerime Dön
            </Button>

            {/* BAŞLIK */}

            <Box
                sx={{
                    mb: 3,

                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    alignItems: {
                        xs: "flex-start",
                        md: "center",
                    },

                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },

                    gap: 2,
                }}
            >
                <Box>
                    <Stack
                        direction="row"
                        sx={{
                            alignItems:
                                "center",

                            gap: 1,

                            flexWrap:
                                "wrap",
                        }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight:
                                    800,
                            }}
                        >
                            Talep Detayı
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontWeight:
                                    700,
                            }}
                        >
                            #{request.id}
                        </Typography>
                    </Stack>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            mt: 0.75,
                        }}
                    >
                        Talebinizin
                        bilgilerini
                        görüntüleyebilir ve
                        izin verilen alanları
                        güncelleyebilirsiniz.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    sx={{
                        gap: 1,
                        flexWrap:
                            "wrap",
                    }}
                >
                    <Chip
                        label={getPriorityText(
                            request.priority
                        )}
                        color={getPriorityColor(
                            request.priority
                        )}
                        variant="outlined"
                    />

                    <Chip
                        label={getStatusText(
                            request.status
                        )}
                        color={getStatusColor(
                            request.status
                        )}
                    />

                    {request.isOverdue && (
                        <Chip
                            label="Gecikmiş"
                            color="error"
                        />
                    )}
                </Stack>
            </Box>

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* ÜST ÖZET KARTLARI */}

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",

                        sm:
                            "repeat(2, minmax(0, 1fr))",

                        lg:
                            "repeat(5, minmax(0, 1fr))",
                    },

                    gap: 2,
                    mb: 3,
                }}
            >
                <InfoCard
                    title="Durum"
                    value={getStatusText(
                        request.status
                    )}
                    icon={
                        <InfoOutlinedIcon />
                    }
                />

                <InfoCard
                    title="Talep No"
                    value={`#${request.id}`}
                    icon={
                        <AssignmentRoundedIcon />
                    }
                />

                <InfoCard
                    title="Kategori"
                    value={
                        request.categoryName ||
                        "Belirtilmedi"
                    }
                    icon={
                        <CategoryRoundedIcon />
                    }
                />

                <InfoCard
                    title="Oluşturulma"
                    value={formatDate(
                        request.createdAt
                    )}
                    icon={
                        <EventRoundedIcon />
                    }
                />

                <InfoCard
                    title="Öncelik"
                    value={getPriorityText(
                        request.priority
                    )}
                    icon={
                        <FlagRoundedIcon />
                    }
                />
            </Box>

            <Box
                sx={{
                    display:
                        "grid",

                    gridTemplateColumns:
                    {
                        xs: "1fr",
                        lg:
                            "minmax(0, 1fr) 330px",
                        xl:
                            "minmax(0, 1fr) 360px",
                    },

                    gap: {
                        xs: 2.2,
                        md: 2.5,
                        xl: 3,
                    },

                    alignItems:
                        "stretch",
                }}
            >
                {/* DÜZENLEME FORMU */}

                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                        },

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius: 3,

                        backgroundColor:
                            "background.paper",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                        }}
                    >
                        Talep Bilgileri
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Talebin temel
                        bilgilerini buradan
                        güncelleyebilirsiniz.
                    </Typography>

                    <Divider
                        sx={{
                            my: 3,
                        }}
                    />

                    <Box
                        sx={{
                            display:
                                "grid",

                            gridTemplateColumns:
                            {
                                xs: "1fr",
                                md:
                                    "repeat(2, minmax(0, 1fr))",
                            },

                            gap: 2.5,
                            flexGrow: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Talep Başlığı"
                            value={
                                title
                            }
                            onChange={(
                                event
                            ) =>
                                setTitle(
                                    event
                                        .target
                                        .value
                                )
                            }
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
                                    md:
                                        "1 / -1",
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={6}
                            label="Açıklama"
                            value={
                                description
                            }
                            onChange={(
                                event
                            ) =>
                                setDescription(
                                    event
                                        .target
                                        .value
                                )
                            }
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
                                    md:
                                        "1 / -1",
                                },
                            }}
                        />

                        <FormControl
                            fullWidth
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
                                        event
                                            .target
                                            .value
                                    )
                                }
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
                                            {
                                                category.name
                                            }
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
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                            >
                                <MenuItem
                                    value={
                                        1
                                    }
                                >
                                    Düşük
                                </MenuItem>

                                <MenuItem
                                    value={
                                        2
                                    }
                                >
                                    Orta
                                </MenuItem>

                                <MenuItem
                                    value={
                                        3
                                    }
                                >
                                    Yüksek
                                </MenuItem>

                                <MenuItem
                                    value={
                                        4
                                    }
                                >
                                    Kritik
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="date"
                            label="Bitiş Tarihi"
                            value={
                                dueDate
                            }
                            onChange={(
                                event
                            ) =>
                                setDueDate(
                                    event
                                        .target
                                        .value
                                )
                            }
                            slotProps={{
                                inputLabel:
                                {
                                    shrink:
                                        true,
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Durum"
                            value={getStatusText(
                                request.status
                            )}
                            disabled
                        />
                    </Box>

                    <Divider
                        sx={{
                            my: 3,
                        }}
                    />

                    <Box
                        sx={{
                            display:
                                "flex",

                            justifyContent:
                                "flex-end",

                            gap: 2,

                            flexDirection:
                            {
                                xs:
                                    "column",
                                sm: "row",
                            },
                        }}
                    >
                        <Button
                            variant="outlined"
                            disabled={
                                isSaving
                            }
                            onClick={() =>
                                navigate(
                                    "/my-requests"
                                )
                            }
                            sx={{
                                textTransform:
                                    "none",

                                fontWeight:
                                    600,
                            }}
                        >
                            Vazgeç
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                <SaveRoundedIcon />
                            }
                            disabled={
                                isSaving
                            }
                            onClick={() =>
                                void handleSave()
                            }
                            sx={{
                                textTransform:
                                    "none",

                                fontWeight:
                                    700,

                                boxShadow:
                                    "none",
                            }}
                        >
                            {isSaving
                                ? "Kaydediliyor..."
                                : "Değişiklikleri Kaydet"}
                        </Button>
                    </Box>
                </Paper>

                {/* SAĞ PANEL */}

                <Stack
                    spacing={2.5}
                    sx={{
                        minWidth: 0,
                    }}
                >
                    {request.assignedUserId && (
                        <Alert
                            severity="info"
                            variant="outlined"
                            sx={{
                                borderRadius: 3,
                                py: 1,
                            }}
                        >
                            Talebiniz ilgili grup yöneticisi tarafından bir personele aktarılmıştır.
                            Siz, grup yöneticisi ve atanan çalışan aynı sohbet üzerinden iletişime devam edebilirsiniz.
                        </Alert>
                    )}
                        <Paper
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius: 3,
                                backgroundColor:
                                    "background.paper",
                                overflow:
                                    "hidden",
                            }}
                        >
                            <Box
                                sx={{
                                    px: 2.5,
                                    py: 2,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: 1.25,
                                    borderBottom:
                                        "1px solid",
                                    borderColor:
                                        "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius:
                                            2,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        backgroundColor:
                                            "action.hover",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <ChatRoundedIcon />
                                </Box>

                                <Box
                                    sx={{
                                        minWidth: 0,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Talep Sohbeti
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Talep sahibi, grup yöneticisi ve atanan çalışan için ortak sohbet.
                                    </Typography>
                                </Box>
                            </Box>

                            {id && <ChatUpdates taskId={id} onRefresh={() => loadMessages(id)} />}
                            {messageError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        m: 2,
                                        borderRadius:
                                            2,
                                    }}
                                >
                                    {messageError}
                                </Alert>
                            )}

                            <Box
                                sx={{
                                    height: {
                                        xs: 360,
                                        lg: 420,
                                    },
                                    overflowY:
                                        "auto",
                                    px: 2,
                                    py: 2,
                                    backgroundColor:
                                        "action.hover",
                                }}
                            >
                                {isMessagesLoading ? (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            textAlign:
                                                "center",
                                            py: 4,
                                        }}
                                    >
                                        Mesajlar yükleniyor...
                                    </Typography>
                                ) : messages.length ===
                                    0 ? (
                                    <Box
                                        sx={{
                                            minHeight:
                                                "100%",
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            textAlign:
                                                "center",
                                            px: 2,
                                        }}
                                    >
                                        <ChatRoundedIcon
                                            sx={{
                                                fontSize:
                                                    40,
                                                color:
                                                    "text.disabled",
                                                mb: 1,
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight:
                                                    700,
                                            }}
                                        >
                                            Henüz mesaj yok
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                mt: 0.5,
                                            }}
                                        >
                                            İlk mesajı göndererek görüşmeyi başlatabilirsiniz.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack
                                        spacing={1.25}
                                    >
                                        {messages.map(
                                            message => {
                                                const isOwn =
                                                    message.userId ===
                                                    currentUserId;

                                                return (
                                                    <Box
                                                        key={
                                                            message.id
                                                        }
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                isOwn
                                                                    ? "flex-end"
                                                                    : "flex-start",
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                maxWidth:
                                                                    "84%",
                                                                px: 1.6,
                                                                py: 1.15,
                                                                borderRadius:
                                                                    isOwn
                                                                        ? "16px 16px 4px 16px"
                                                                        : "16px 16px 16px 4px",
                                                                backgroundColor:
                                                                    isOwn
                                                                        ? "primary.main"
                                                                        : "background.paper",
                                                                color:
                                                                    isOwn
                                                                        ? "primary.contrastText"
                                                                        : "text.primary",
                                                                border:
                                                                    isOwn
                                                                        ? "none"
                                                                        : "1px solid",
                                                                borderColor:
                                                                    "divider",
                                                                boxShadow:
                                                                    isOwn
                                                                        ? "none"
                                                                        : "0 1px 2px rgba(15,23,42,0.04)",
                                                            }}
                                                        >
                                                            {!isOwn && (
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        display:
                                                                            "block",
                                                                        mb: 0.35,
                                                                        fontWeight:
                                                                            800,
                                                                        color:
                                                                            "primary.main",
                                                                    }}
                                                                >
                                                                    {
                                                                        message.fullName
                                                                    }
                                                                </Typography>
                                                            )}

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    whiteSpace:
                                                                        "pre-wrap",
                                                                    wordBreak:
                                                                        "break-word",
                                                                    lineHeight:
                                                                        1.55,
                                                                }}
                                                            >
                                                                {
                                                                    message.message
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    display:
                                                                        "block",
                                                                    mt: 0.5,
                                                                    textAlign:
                                                                        "right",
                                                                    opacity:
                                                                        0.72,
                                                                }}
                                                            >
                                                                {formatMessageDate(
                                                                    message.createdAt
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            }
                                        )}

                                        <div
                                            ref={
                                                messagesEndRef
                                            }
                                        />
                                    </Stack>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    p: 2,
                                    borderTop:
                                        "1px solid",
                                    borderColor:
                                        "divider",
                                    display:
                                        "flex",
                                    gap: 1,
                                    alignItems:
                                        "flex-end",
                                }}
                            >
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    placeholder="Mesajınızı yazın..."
                                    value={
                                        newMessage
                                    }
                                    onChange={event =>
                                        setNewMessage(
                                            event.target
                                                .value
                                        )
                                    }
                                    onKeyDown={event => {
                                        if (
                                            event.key ===
                                            "Enter" &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();

                                            if (
                                                !isSendingMessage &&
                                                newMessage.trim()
                                            ) {
                                                void handleSendMessage();
                                            }
                                        }
                                    }}
                                    disabled={
                                        isSendingMessage
                                    }
                                />

                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        void handleSendMessage()
                                    }
                                    disabled={
                                        isSendingMessage ||
                                        !newMessage.trim()
                                    }
                                    sx={{
                                        minWidth: 46,
                                        width: 46,
                                        height: 46,
                                        px: 0,
                                        flexShrink: 0,
                                        boxShadow:
                                            "none",
                                    }}
                                >
                                    <SendRoundedIcon />
                                </Button>
                            </Box>
                        </Paper>

                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                            borderRadius: 3,
                            backgroundColor:
                                "background.paper",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                            }}
                        >
                            Talep Özeti
                        </Typography>

                        <Divider
                            sx={{
                                my: 2.5,
                            }}
                        />

                        <SummaryRow
                            label="Talep No"
                            value={`#${request.id}`}
                        />

                        <SummaryRow
                            label="Durum"
                            value={getStatusText(
                                request.status
                            )}
                        />

                        <SummaryRow
                            label="Kategori"
                            value={
                                request.categoryName ||
                                "Belirtilmedi"
                            }
                        />

                        <SummaryRow
                            label="Öncelik"
                            value={getPriorityText(
                                request.priority
                            )}
                        />

                        <SummaryRow
                            label="Oluşturulma Tarihi"
                            value={formatDate(
                                request.createdAt
                            )}
                        />

                        <SummaryRow
                            label="Bitiş Tarihi"
                            value={formatDate(
                                request.dueDate
                            )}
                            error={
                                request.isOverdue
                            }
                        />

                        {request.completedAt && (
                            <SummaryRow
                                label="Tamamlanma Tarihi"
                                value={formatDate(
                                    request.completedAt
                                )}
                            />
                        )}

                        <Divider
                            sx={{
                                my: 2.5,
                            }}
                        />

                        <Alert
                            severity="info"
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            Talebin durumu ve görev atama bilgileri ilgili birim tarafından yönetilir.
                        </Alert>
                    </Paper>
                </Stack>
            </Box>
        </Box>
    );
}

interface InfoCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
}

function InfoCard({
    title,
    value,
    icon,
}: InfoCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.25,

                minHeight: {
                    xs: 112,
                    lg: 132,
                },

                border:
                    "1px solid",

                borderColor:
                    "divider",

                borderRadius: 3,

                backgroundColor:
                    "background.paper",
            }}
        >
            <Box
                sx={{
                    display:
                        "flex",

                    justifyContent:
                        "space-between",

                    gap: 2,

                    alignItems:
                        "flex-start",
                }}
            >
                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mt: 0.7,

                            fontWeight: 800,

                            wordBreak:
                                "break-word",
                        }}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        width: 40,

                        height: 40,

                        borderRadius: 2,

                        flexShrink: 0,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        backgroundColor:
                            "action.hover",

                        color:
                            "primary.main",
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </Paper>
    );
}

interface SummaryRowProps {
    label: string;
    value: string;
    error?: boolean;
}

function SummaryRow({
    label,
    value,
    error = false,
}: SummaryRowProps) {
    return (
        <Box
            sx={{
                display:
                    "flex",

                justifyContent:
                    "space-between",

                alignItems:
                    "flex-start",

                gap: 2,

                py: 1.1,
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    textAlign:
                        "right",

                    fontWeight: 700,

                    color: error
                        ? "error.main"
                        : "text.primary",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
export default RequestDetailPage;
