import {
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
    Snackbar,
    useTheme,
} from "@mui/material";

import {
    useNavigate,
    useParams,
} from "react-router-dom";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import api from "../api/axios";
import ChatUpdates, { markChatRead } from "../components/common/ChatUpdates";
import { getFileErrorMessage } from "../utils/fileErrors";
import { hasAnyRole } from "../utils/auth";

import type { TaskFile } from "../types/TaskFile";

interface TaskDetail {
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
}

interface UserItem {
    id: string;
    fullName: string;
    email: string;
}

interface GroupItem {
    id: number;
    name: string;
}

interface GroupUserItem {
    userId: string;
    fullName: string;
    email: string;
    isManager: boolean;
}
interface ManagedLeaveItem {
    userId: string;
    status: number;
    startDate: string;
    endDate: string;
}

interface TaskAssignmentHistoryItem {
    id: number;
    actionByUserId: string | null;
    actionByUserFullName: string;
    description: string;
    createdAt: string;
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
                    .atob(normalizedPayload)
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

const getInitials = (
    fullName: string
) => {
    const parts =
        fullName
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[
        parts.length - 1
        ][0]
    ).toUpperCase();
};
type AssignmentType =
    | "User"
    | "Group"
    | "None";

function TaskDetailPage() {
    const { id } = useParams();

    const theme =
        useTheme();

    const isDark =
        theme.palette.mode ===
        "dark";
    const currentUserId =
        getCurrentUserIdFromToken();
    const navigate =
        useNavigate();

    const isAdmin =
        hasAnyRole([
            "Admin",
        ]);

    const isPermanentManager =
        hasAnyRole([
            "Manager",
        ]);

    const hasDelegatedManagerAccess =
        localStorage.getItem(
            "delegatedManagerAccess"
        ) === "true";

    const isManager =
        isPermanentManager ||
        (
            hasAnyRole([
                "Employee",
            ]) &&
            hasDelegatedManagerAccess
        );

    const isUser =
        hasAnyRole([
            "User",
        ]);

    const isEmployee =
        hasAnyRole([
            "Employee",
        ]) &&
        !hasDelegatedManagerAccess;

    const canManageTask =
        isAdmin ||
        isManager;

    // Admin tüm görev alanlarını, talep kullanıcısı ise
    // kendi talebinin temel alanlarını düzenleyebilir.
    const canEditTask =
        isAdmin ||
        isUser;

    const canDeleteTask =
        isAdmin;

    const canUploadFile =
        canManageTask;

    const canDeleteFile =
        isAdmin;

    const backPath =
        isUser
            ? "/my-requests"
            : "/tasks";

    const backLabel =
        isUser
            ? "Taleplerime Dön"
            : "Görev Listesine Dön";

    const [
        task,
        setTask,
    ] =
        useState<TaskDetail | null>(
            null
        );

    const [
        users,
        setUsers,
    ] =
        useState<UserItem[]>(
            []
        );

    const [
        groups,
        setGroups,
    ] =
        useState<GroupItem[]>(
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
        status,
        setStatus,
    ] =
        useState<number>(
            1
        );

    const [
        dueDate,
        setDueDate,
    ] =
        useState("");

    const [
        assignmentType,
        setAssignmentType,
    ] =
        useState<AssignmentType>(
            "None"
        );

    const [
        assignedUserId,
        setAssignedUserId,
    ] =
        useState("");

    const [
        assignedGroupId,
        setAssignedGroupId,
    ] =
        useState("");

    const [
        taskFiles,
        setTaskFiles,
    ] =
        useState<TaskFile[]>(
            []
        );

    const [
        subTasks,
        setSubTasks,
    ] =
        useState<TaskDetail[]>(
            []
        );

    const [
        isLoadingSubTasks,
        setIsLoadingSubTasks,
    ] =
        useState(false);

    const [
        isCreatingSubTask,
        setIsCreatingSubTask,
    ] =
        useState(false);

    const [
        showSubTaskForm,
        setShowSubTaskForm,
    ] =
        useState(false);

    const [
        subTaskTitle,
        setSubTaskTitle,
    ] =
        useState("");

    const [
        subTaskDescription,
        setSubTaskDescription,
    ] =
        useState("");

    const [
        subTaskPriority,
        setSubTaskPriority,
    ] =
        useState<number>(
            2
        );

    const [
        subTaskDueDate,
        setSubTaskDueDate,
    ] =
        useState("");

    const [
        subTaskAssignmentType,
        setSubTaskAssignmentType,
    ] =
        useState<AssignmentType>(
            "None"
        );

    const [
        subTaskAssignedUserId,
        setSubTaskAssignedUserId,
    ] =
        useState("");

    const [
        subTaskAssignedGroupId,
        setSubTaskAssignedGroupId,
    ] =
        useState("");

    const [
        selectedFile,
        setSelectedFile,
    ] =
        useState<File | null>(
            null
        );

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
        isDeleting,
        setIsDeleting,
    ] =
        useState(false);

    const [
        isLoadingFiles,
        setIsLoadingFiles,
    ] =
        useState(false);

    const [
        isUploadingFile,
        setIsUploadingFile,
    ] =
        useState(false);

    const [
        deletingFileId,
        setDeletingFileId,
    ] =
        useState<
            number | null
        >(null);

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
        groupMembers,
        setGroupMembers,
    ] = useState<GroupUserItem[]>([]);

    const [
        workloadTasks,
        setWorkloadTasks,
    ] = useState<TaskDetail[]>([]);

    const [
        assignmentHistory,
        setAssignmentHistory,
    ] = useState<
        TaskAssignmentHistoryItem[]
    >([]);

    const [
        onLeaveUserIds,
        setOnLeaveUserIds,
    ] = useState<string[]>([]);

    const [
        selectedGroupMemberId,
        setSelectedGroupMemberId,
    ] = useState("");

    const [
        isLoadingGroupMembers,
        setIsLoadingGroupMembers,
    ] = useState(false);

    const [
        isAssigningGroupMember,
        setIsAssigningGroupMember,
    ] = useState(false);

    const [
        isUpdatingStatus,
        setIsUpdatingStatus,
    ] =
        useState(false);
    const [
        taskMessages,
        setTaskMessages,
    ] = useState<TaskMessageItem[]>([]);

    const [
        newMessage,
        setNewMessage,
    ] = useState("");

    const [
        isLoadingMessages,
        setIsLoadingMessages,
    ] = useState(false);

    const [
        isSendingMessage,
        setIsSendingMessage,
    ] = useState(false);

    const [
        canAccessChat,
        setCanAccessChat,
    ] = useState(true);

    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);
    const formatDateForInput = (
        date: string | null
    ) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        const year =
            parsedDate
                .getFullYear();

        const month =
            String(
                parsedDate
                    .getMonth() +
                1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                parsedDate
                    .getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-` +
            `${month}-` +
            `${day}`
        );
    };

    const formatDate = (
        date: string | null
    ) => {
        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate
                    .getTime()
            )
        ) {
            return "-";
        }

        return (
            parsedDate
                .toLocaleDateString(
                    "tr-TR"
                )
        );
    };

    const formatFileSize = (
        fileSize: number
    ) => {
        if (
            fileSize <
            1024
        ) {
            return (
                `${fileSize} B`
            );
        }

        if (
            fileSize <
            1024 * 1024
        ) {
            return (
                `${(
                    fileSize /
                    1024
                ).toFixed(
                    1
                )} KB`
            );
        }

        return (
            `${(
                fileSize /
                (
                    1024 *
                    1024
                )
            ).toFixed(
                1
            )} MB`
        );
    };

    const formatUploadedDate = (
        date: string
    ) => {
        return (
            new Date(date)
                .toLocaleString(
                    "tr-TR"
                )
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

    const loadTaskFiles =
        async (
            taskId: string
        ) => {
            try {
                setIsLoadingFiles(
                    true
                );

                const response =
                    await api.get<
                        TaskFile[]
                    >(
                        `/tasks/${taskId}/files`
                    );

                setTaskFiles(
                    response.data
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Görev dosyaları alınamadı:",
                    error
                );

                setErrorMessage(
                    await getFileErrorMessage(error, "Göreve ait dosyalar alınamadı.")
                );
            } finally {
                setIsLoadingFiles(
                    false
                );
            }
        };

    const loadSubTasks =
        async (
            taskId: string
        ) => {
            try {
                setIsLoadingSubTasks(
                    true
                );

                const response =
                    await api.get<
                        TaskDetail[]
                    >(
                        `/tasks/${taskId}/subtasks`
                    );

                setSubTasks(
                    response.data
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Alt görevler alınamadı:",
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
                        "Alt görevleri görüntüleme yetkiniz bulunmuyor."
                    );
                } else {
                    setErrorMessage(
                        "Alt görevler yüklenemedi."
                    );
                }
            } finally {
                setIsLoadingSubTasks(
                    false
                );
            }
        };

    const loadGroupMembers =
        async (groupId: number) => {
            try {
                setIsLoadingGroupMembers(
                    true
                );

                const response =
                    await api.get<
                        GroupUserItem[]
                    >(
                        `/groups/${groupId}/users`
                    );

                setGroupMembers(
                    response.data
                );
            } catch (error: any) {
                console.error(
                    "Grup üyeleri alınamadı:",
                    error
                );

                setGroupMembers([]);

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                setErrorMessage(
                    backendMessage ||
                    "Grup üyeleri yüklenemedi."
                );
            } finally {
                setIsLoadingGroupMembers(
                    false
                );
            }
        };
    const loadTaskMessages =
        async (taskId: string) => {
            try {
                setIsLoadingMessages(true);

                const response =
                    await api.get<TaskMessageItem[]>(
                        `/tasks/${taskId}/messages`
                    );

                setTaskMessages(response.data);
                void markChatRead(taskId, response.data);
                setCanAccessChat(true);
            } catch (error: any) {
                console.error(
                    "Görev mesajları alınamadı:",
                    error
                );

                if (error.response?.status === 403) {
                    setCanAccessChat(false);
                    setTaskMessages([]);
                    return;
                }

                setErrorMessage(
                    "Görev sohbeti yüklenemedi."
                );
            } finally {
                setIsLoadingMessages(false);
            }
        };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [taskMessages]);

    useEffect(() => {
        const loadPageData =
            async () => {
                if (!id) {
                    setErrorMessage(
                        "Görev numarası bulunamadı."
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

                    const taskRequest =
                        api.get<TaskDetail>(
                            `/tasks/${id}`
                        );

                    const usersRequest =
                        isAdmin
                            ? api.get<
                                UserItem[]
                            >(
                                "/users"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as UserItem[],
                                }
                            );

                    const groupsRequest =
                        canManageTask
                            ? api.get<
                                GroupItem[]
                            >(
                                "/groups"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as GroupItem[],
                                }
                            );

                    const leavesRequest =
                        isManager
                            ? api.get<
                                ManagedLeaveItem[]
                            >(
                                "/LeaveRequests/managed-group"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as ManagedLeaveItem[],
                                }
                            );

                    const workloadRequest =
                        canManageTask
                            ? api.get<
                                TaskDetail[]
                            >(
                                "/Tasks"
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as TaskDetail[],
                                }
                            );

                    const historyRequest =
                        !isUser
                            ? api.get<
                                TaskAssignmentHistoryItem[]
                            >(
                                `/Tasks/${id}/assignment-history`
                            )
                            : Promise.resolve(
                                {
                                    data:
                                        [] as TaskAssignmentHistoryItem[],
                                }
                            );

                    const [
                        taskResponse,
                        usersResponse,
                        groupsResponse,
                        leavesResponse,
                        workloadResponse,
                        historyResponse,
                    ] =
                        await Promise.all(
                            [
                                taskRequest,
                                usersRequest,
                                groupsRequest,
                                leavesRequest,
                                workloadRequest,
                                historyRequest,
                            ]
                        );

                    const loadedTask =
                        taskResponse
                            .data;

                    setTask(
                        loadedTask
                    );

                    setUsers(
                        usersResponse
                            .data
                    );

                    setGroups(
                        groupsResponse
                            .data
                    );

                    setWorkloadTasks(
                        workloadResponse
                            .data
                    );

                    setAssignmentHistory(
                        historyResponse
                            .data
                    );

                    const today =
                        new Date();

                    today.setHours(
                        0,
                        0,
                        0,
                        0
                    );

                    setOnLeaveUserIds(
                        leavesResponse.data
                            .filter(
                                (leave) => {
                                    if (
                                        leave.status !==
                                        2
                                    ) {
                                        return false;
                                    }

                                    const start =
                                        new Date(
                                            leave.startDate
                                        );

                                    const end =
                                        new Date(
                                            leave.endDate
                                        );

                                    start.setHours(
                                        0,
                                        0,
                                        0,
                                        0
                                    );

                                    end.setHours(
                                        0,
                                        0,
                                        0,
                                        0
                                    );

                                    return (
                                        start <=
                                        today &&
                                        end >=
                                        today
                                    );
                                }
                            )
                            .map(
                                (leave) =>
                                    leave.userId
                            )
                    );

                    if (
                        isManager &&
                        loadedTask
                            .assignedGroupId
                    ) {
                        await loadGroupMembers(
                            loadedTask
                                .assignedGroupId
                        );
                    } else {
                        setGroupMembers(
                            []
                        );
                    }

                    setTitle(
                        loadedTask
                            .title ??
                        ""
                    );

                    setDescription(
                        loadedTask
                            .description ??
                        ""
                    );

                    setPriority(
                        loadedTask
                            .priority
                    );

                    setStatus(
                        loadedTask
                            .status
                    );

                    setDueDate(
                        formatDateForInput(
                            loadedTask
                                .dueDate
                        )
                    );

                    if (
                        loadedTask
                            .assignedUserId
                    ) {
                        setAssignmentType(
                            loadedTask
                                .assignedGroupId
                                ? "Group"
                                : "User"
                        );

                        setAssignedUserId(
                            loadedTask
                                .assignedUserId
                        );

                        setAssignedGroupId(
                            loadedTask
                                .assignedGroupId
                                ? String(
                                    loadedTask
                                        .assignedGroupId
                                )
                                : ""
                        );
                    } else if (
                        loadedTask
                            .assignedGroupId
                    ) {
                        setAssignmentType(
                            "Group"
                        );

                        setAssignedGroupId(
                            String(
                                loadedTask
                                    .assignedGroupId
                            )
                        );

                        setAssignedUserId(
                            ""
                        );
                    } else {
                        setAssignmentType(
                            "None"
                        );

                        setAssignedUserId(
                            ""
                        );

                        setAssignedGroupId(
                            ""
                        );
                    }

                    if (isUser) {
                        // Talep kullanıcısı için görev yönetimine
                        // ait ek servisler çağrılmaz.
                        setTaskFiles([]);
                        setSubTasks([]);
                        setTaskMessages([]);
                        setCanAccessChat(false);
                    } else {
                        await Promise.all([
                            loadTaskFiles(id),
                            loadSubTasks(id),
                            loadTaskMessages(id),
                        ]);
                    }
                } catch (
                error: any
                ) {
                    console.error(
                        "Görev bilgileri alınamadı:",
                        error
                    );

                    const responseStatus =
                        error.response
                            ?.status;

                    if (
                        responseStatus ===
                        401
                    ) {
                        setErrorMessage(
                            "Oturum süreniz dolmuş olabilir. Lütfen yeniden giriş yapınız."
                        );
                    } else if (
                        responseStatus ===
                        403
                    ) {
                        setErrorMessage(
                            "Bu görevi görüntüleme yetkiniz bulunmuyor."
                        );
                    } else if (
                        responseStatus ===
                        404
                    ) {
                        setErrorMessage(
                            "Görev bulunamadı."
                        );
                    } else {
                        setErrorMessage(
                            "Görev bilgileri yüklenemedi."
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };

        void loadPageData();
    }, [
        id,
        canManageTask,
    ]);

    const handleAssignmentTypeChange =
        (
            value:
                AssignmentType
        ) => {
            setAssignmentType(
                value
            );

            if (
                value ===
                "User"
            ) {
                setAssignedGroupId(
                    ""
                );
            } else if (
                value ===
                "Group"
            ) {
                setAssignedUserId(
                    ""
                );
            } else {
                setAssignedUserId(
                    ""
                );

                setAssignedGroupId(
                    ""
                );
            }
        };

    const handleSave =
        async () => {
            if (!canEditTask) {
                setErrorMessage(
                    "Bu kaydı düzenleme yetkiniz bulunmuyor."
                );

                return;
            }

            if (!id) {
                setErrorMessage(
                    "Görev numarası bulunamadı."
                );

                return;
            }

            if (!title.trim()) {
                setErrorMessage(
                    isUser
                        ? "Talep başlığı zorunludur."
                        : "Görev başlığı zorunludur."
                );

                return;
            }

            // Atama kontrolleri yalnızca Admin düzenlemesinde gerekir.
            if (
                isAdmin &&
                assignmentType ===
                "User" &&
                !assignedUserId
            ) {
                setErrorMessage(
                    "Atanacak kişiyi seçiniz."
                );

                return;
            }

            if (
                isAdmin &&
                assignmentType ===
                "Group" &&
                !assignedGroupId
            ) {
                setErrorMessage(
                    "Atanacak grubu seçiniz."
                );

                return;
            }

            try {
                setIsSaving(true);
                setErrorMessage("");
                setSuccessMessage("");

                if (isUser) {
                    const request = {
                        title: title.trim(),
                        description:
                            description.trim() ||
                            null,
                        priority,
                        dueDate:
                            dueDate ||
                            null,
                    };

                    await api.put(
                        `/tasks/${id}/request`,
                        request
                    );
                } else {
                    const request = {
                        title:
                            title.trim(),

                        description:
                            description
                                .trim() ||
                            null,

                        priority,

                        status,

                        dueDate:
                            dueDate ||
                            null,

                        assignedUserId:
                            assignmentType ===
                                "User"
                                ? assignedUserId
                                : null,

                        assignedGroupId:
                            assignmentType ===
                                "Group"
                                ? Number(
                                    assignedGroupId
                                )
                                : null,
                    };

                    await api.put(
                        `/tasks/${id}`,
                        request
                    );
                }

                const response =
                    await api.get<
                        TaskDetail
                    >(
                        `/tasks/${id}`
                    );

                setTask(
                    response.data
                );

                setTitle(
                    response.data.title ??
                    ""
                );

                setDescription(
                    response.data.description ??
                    ""
                );

                setPriority(
                    response.data.priority
                );

                setStatus(
                    response.data.status
                );

                setDueDate(
                    formatDateForInput(
                        response.data.dueDate
                    )
                );

                setSuccessMessage(
                    isUser
                        ? "Talebiniz başarıyla güncellendi."
                        : "Görev başarıyla güncellendi."
                );
            } catch (error: any) {
                console.error(
                    isUser
                        ? "Talep güncellenemedi:"
                        : "Görev güncellenemedi:",
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
                        isUser
                            ? "Yalnızca kendi talebinizi güncelleyebilirsiniz."
                            : "Görevi güncellemek için yetkiniz bulunmamaktadır."
                    );
                } else if (
                    backendMessage
                ) {
                    setErrorMessage(
                        backendMessage
                    );
                } else {
                    setErrorMessage(
                        isUser
                            ? "Talep güncellenirken bir hata meydana geldi."
                            : "Görev güncellenirken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsSaving(false);
            }
        };

    const handleDeleteTask =
        async () => {
            if (
                !canDeleteTask ||
                !id
            ) {
                return;
            }

            const approved =
                window.confirm(
                    "Bu görevi silmek istediğinizden emin misiniz?"
                );

            if (!approved) {
                return;
            }

            try {
                setIsDeleting(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.delete(
                    `/tasks/${id}`
                );

                navigate(
                    "/tasks"
                );
            } catch (
            error: any
            ) {
                console.error(
                    "Görev silinemedi:",
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
                        "Görevi silmek için Admin rolüne sahip olmanız gerekir."
                    );
                } else {
                    setErrorMessage(
                        "Görev silinirken bir hata meydana geldi."
                    );
                }
            } finally {
                setIsDeleting(
                    false
                );
            }
        };

    const handleUploadFile =
        async () => {
            if (
                !canUploadFile
            ) {
                setErrorMessage(
                    "Dosya yükleme yetkiniz bulunmuyor."
                );

                return;
            }

            if (!id) {
                setErrorMessage(
                    "Görev numarası bulunamadı."
                );

                return;
            }

            if (
                !selectedFile
            ) {
                setErrorMessage(
                    "Yüklenecek dosyayı seçiniz."
                );

                return;
            }

            const allowedExtensions =
                [
                    ".pdf",
                    ".xls",
                    ".xlsx",
                    ".doc",
                    ".docx",
                ];

            const dotIndex =
                selectedFile
                    .name
                    .lastIndexOf(
                        "."
                    );

            const extension =
                dotIndex >= 0
                    ? selectedFile
                        .name
                        .substring(
                            dotIndex
                        )
                        .toLowerCase()
                    : "";

            if (
                !allowedExtensions
                    .includes(
                        extension
                    )
            ) {
                setErrorMessage(
                    "Yalnızca PDF, Excel ve Word dosyaları yüklenebilir."
                );

                return;
            }

            if (
                selectedFile
                    .size >
                10 *
                1024 *
                1024
            ) {
                setErrorMessage(
                    "Dosya boyutu en fazla 10 MB olabilir."
                );

                return;
            }

            try {
                setIsUploadingFile(
                    true
                );

                setSuccessMessage(
                    ""
                );

                setErrorMessage(
                    ""
                );

                const formData =
                    new FormData();

                formData.append(
                    "file",
                    selectedFile
                );

                await api.post(
                    `/tasks/${id}/files`,
                    formData
                );

                setSelectedFile(
                    null
                );

                await loadTaskFiles(
                    id
                );

                setSuccessMessage(
                    "Dosya başarıyla yüklendi."
                );
            } catch (error: any) {
                console.error(
                    "Dosya yüklenemedi:",
                    error
                );

                setErrorMessage(
                    await getFileErrorMessage(error, "Dosya yüklenirken bir hata oluştu.")
                );
            } finally {
                setIsUploadingFile(false);
            }
        };

    const handleAssignGroupMember =
        async () => {
            if (
                !id ||
                !task ||
                !isManager
            ) {
                return;
            }

            if (
                !task.assignedGroupId
            ) {
                setErrorMessage(
                    "Bu görev bir gruba atanmamıştır."
                );

                return;
            }

            if (
                !selectedGroupMemberId
            ) {
                setErrorMessage(
                    "Görevin atanacağı grup üyesini seçiniz."
                );

                return;
            }

            try {
                setIsAssigningGroupMember(
                    true
                );

                setErrorMessage("");
                setSuccessMessage("");

                await api.patch(
                    `/tasks/${id}/assign-group-member`,
                    {
                        userId:
                            selectedGroupMemberId,
                    }
                );

                const response =
                    await api.get<
                        TaskDetail
                    >(
                        `/tasks/${id}`
                    );

                const updatedTask =
                    response.data;

                setTask(
                    updatedTask
                );

                setAssignedUserId(
                    updatedTask
                        .assignedUserId ??
                    ""
                );

                setAssignedGroupId(
                    updatedTask
                        .assignedGroupId
                        ? String(
                            updatedTask
                                .assignedGroupId
                        )
                        : ""
                );

                setSelectedGroupMemberId(
                    ""
                );

                setSuccessMessage(
                    task.assignedUserId
                        ? "Görev başka bir grup üyesine başarıyla devredildi."
                        : "Görev grup üyesine başarıyla atandı."
                );
            } catch (error: any) {
                console.error(
                    "Görev grup üyesine atanamadı:",
                    error
                );

                const backendMessage =
                    getBackendMessage(
                        error
                    );

                setErrorMessage(
                    backendMessage ||
                    "Görev grup üyesine atanırken bir hata oluştu."
                );
            } finally {
                setIsAssigningGroupMember(
                    false
                );
            }
        };

    const handleUpdateStatus =
        async () => {
            if (
                !id ||
                !task
            ) {
                return;
            }

            if (
                task.assignedUserId !==
                currentUserId
            ) {
                setErrorMessage(
                    "Durumunu değiştirmek için görevin doğrudan size atanmış olması gerekir."
                );

                return;
            }

            try {
                setIsUpdatingStatus(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.patch(
                    `/tasks/${id}/status`,
                    {
                        status,
                    }
                );

                const response =
                    await api.get<
                        TaskDetail
                    >(
                        `/tasks/${id}`
                    );

                setTask(
                    response.data
                );

                setStatus(
                    response
                        .data
                        .status
                );

                setSuccessMessage(
                    "Görev durumu başarıyla güncellendi."
                );
            } catch (
            error: any
            ) {
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
                        backendMessage ||
                        "Yalnızca kendi üzerinize atanmış görevlerin durumunu değiştirebilirsiniz."
                    );
                } else {
                    setErrorMessage(
                        backendMessage ||
                        "Görev durumu güncellenirken bir hata oluştu."
                    );
                }
            } finally {
                setIsUpdatingStatus(
                    false
                );
            }
        };
    const handleSendMessage =
        async () => {
            if (!id || !newMessage.trim()) {
                return;
            }

            try {
                setIsSendingMessage(true);

                const response =
                    await api.post<TaskMessageItem>(
                        `/tasks/${id}/messages`,
                        {
                            message:
                                newMessage.trim(),
                        }
                    );

                setTaskMessages((current) => [
                    ...current,
                    response.data,
                ]);

                setNewMessage("");
            } catch (error: any) {
                console.error(
                    "Mesaj gönderilemedi:",
                    error
                );

                if (error.response?.status === 403) {
                    setCanAccessChat(false);

                    setErrorMessage(
                        "Bu görev sohbetine erişim yetkiniz bulunmuyor."
                    );

                    return;
                }

                setErrorMessage(
                    getBackendMessage(error) ||
                    "Mesaj gönderilirken bir hata oluştu."
                );
            } finally {
                setIsSendingMessage(false);
            }
        };
    const handleSubTaskAssignmentTypeChange =
        (
            value:
                AssignmentType
        ) => {
            setSubTaskAssignmentType(
                value
            );

            if (
                value ===
                "User"
            ) {
                setSubTaskAssignedGroupId(
                    ""
                );
            } else if (
                value ===
                "Group"
            ) {
                setSubTaskAssignedUserId(
                    ""
                );
            } else {
                setSubTaskAssignedUserId(
                    ""
                );

                setSubTaskAssignedGroupId(
                    ""
                );
            }
        };

    const resetSubTaskForm =
        () => {
            setSubTaskTitle(
                ""
            );

            setSubTaskDescription(
                ""
            );

            setSubTaskPriority(
                2
            );

            setSubTaskDueDate(
                ""
            );

            setSubTaskAssignmentType(
                isManager
                    ? "User"
                    : "None"
            );

            setSubTaskAssignedUserId(
                ""
            );

            setSubTaskAssignedGroupId(
                ""
            );
        };

    const handleCreateSubTask =
        async () => {
            if (
                !id ||
                !canManageTask
            ) {
                return;
            }

            if (
                !subTaskTitle
                    .trim()
            ) {
                setErrorMessage(
                    "Alt görev başlığı zorunludur."
                );

                return;
            }

            const effectiveSubTaskAssignmentType =
                isManager
                    ? "User"
                    : subTaskAssignmentType;

            if (
                effectiveSubTaskAssignmentType ===
                "User" &&
                !subTaskAssignedUserId
            ) {
                setErrorMessage(
                    isManager
                        ? "Alt görevin atanacağı grup çalışanını seçiniz."
                        : "Alt görevin atanacağı kullanıcıyı seçiniz."
                );

                return;
            }

            if (
                !isManager &&
                effectiveSubTaskAssignmentType ===
                "Group" &&
                !subTaskAssignedGroupId
            ) {
                setErrorMessage(
                    "Alt görevin atanacağı grubu seçiniz."
                );

                return;
            }

            try {
                setIsCreatingSubTask(
                    true
                );

                setErrorMessage(
                    ""
                );

                setSuccessMessage(
                    ""
                );

                await api.post(
                    `/tasks/${id}/subtasks`,
                    {
                        title:
                            subTaskTitle
                                .trim(),

                        description:
                            subTaskDescription
                                .trim() ||
                            null,

                        priority:
                            subTaskPriority,

                        dueDate:
                            subTaskDueDate ||
                            null,

                        assignedUserId:
                            effectiveSubTaskAssignmentType ===
                                "User"
                                ? subTaskAssignedUserId
                                : null,

                        assignedGroupId:
                            isManager
                                ? task?.assignedGroupId ?? null
                                : effectiveSubTaskAssignmentType ===
                                    "Group"
                                    ? Number(
                                        subTaskAssignedGroupId
                                    )
                                    : null,
                    }
                );

                await loadSubTasks(
                    id
                );

                resetSubTaskForm();

                setShowSubTaskForm(
                    false
                );

                setSuccessMessage(
                    "Alt görev başarıyla oluşturuldu."
                );
            } catch (
            error: any
            ) {
                const backendMessage =
                    getBackendMessage(
                        error
                    );

                setErrorMessage(
                    backendMessage ||
                    "Alt görev oluşturulurken bir hata oluştu."
                );
            } finally {
                setIsCreatingSubTask(
                    false
                );
            }
        };

    const handleDownloadFile =
        async (
            file: TaskFile
        ) => {
            if (!id) {
                return;
            }

            try {
                setErrorMessage(
                    ""
                );

                const response =
                    await api.get(
                        `/tasks/${id}/files/${file.id}/download`,
                        {
                            responseType:
                                "blob",
                        }
                    );

                const blob =
                    new Blob([
                        response.data,
                    ]);

                const downloadUrl =
                    window.URL
                        .createObjectURL(
                            blob
                        );

                const link =
                    document
                        .createElement(
                            "a"
                        );

                link.href =
                    downloadUrl;

                link.download =
                    file.originalFileName;

                document.body
                    .appendChild(
                        link
                    );

                link.click();

                link.remove();

                window.URL
                    .revokeObjectURL(
                        downloadUrl
                    );
            } catch (
            error: any
            ) {
                setErrorMessage(
                    await getFileErrorMessage(error, "Dosya indirilirken bir hata oluştu.")
                );
            }
        };

    const handleDeleteFile =
        async (
            fileId:
                number
        ) => {
            if (
                !canDeleteFile ||
                !id
            ) {
                return;
            }

            const approved =
                window.confirm(
                    "Bu dosyayı silmek istediğinizden emin misiniz?"
                );

            if (!approved) {
                return;
            }

            try {
                setDeletingFileId(
                    fileId
                );

                setSuccessMessage(
                    ""
                );

                setErrorMessage(
                    ""
                );

                await api.delete(
                    `/tasks/${id}/files/${fileId}`
                );

                await loadTaskFiles(
                    id
                );

                setSuccessMessage(
                    "Dosya başarıyla silindi."
                );
            } catch (error) {
                setErrorMessage(
                    await getFileErrorMessage(error, "Dosya silinirken bir hata oluştu.")
                );
            } finally {
                setDeletingFileId(
                    null
                );
            }
        };

    const getActiveTaskCount =
        (userId: string) =>
            workloadTasks.filter(
                (workloadTask) =>
                    workloadTask.assignedUserId ===
                    userId &&
                    workloadTask.status !==
                    4 &&
                    workloadTask.status !==
                    5
            ).length;

    const getAssignmentName =
        () => {
            if (
                task
                    ?.assignedUserId
            ) {
                if (
                    isEmployee
                ) {
                    return (
                        "Bana Atandı"
                    );
                }

                const assignedUser =
                    users.find(
                        (
                            user
                        ) =>
                            user.id ===
                            task
                                .assignedUserId
                    );

                const groupMember =
                    groupMembers.find(
                        (member) =>
                            member.userId ===
                            task.assignedUserId
                    );

                return (
                    assignedUser
                        ? `${assignedUser.fullName} - ${assignedUser.email}`
                        : groupMember
                            ? `${groupMember.fullName} - ${groupMember.email}`
                            : isEmployee
                                ? "Bana Atandı"
                                : "Kullanıcıya Atandı"
                );
            }

            if (
                task
                    ?.assignedGroupId
            ) {
                const assignedGroup =
                    groups.find(
                        (
                            group
                        ) =>
                            group.id ===
                            task
                                .assignedGroupId
                    );

                return (
                    assignedGroup
                        ? `${assignedGroup.name} Grubu`
                        : "Grubuma Atandı"
                );
            }

            return "Atanmamış";
        };

    const renderSubTasksSection =
        () => {
            const completedCount =
                subTasks
                    .filter(
                        (
                            item
                        ) =>
                            item.status ===
                            4
                    )
                    .length;

            const canCreate =
                canManageTask &&
                !task
                    ?.parentTaskId;

            return (
                <Box>
                    <Divider
                        sx={{
                            my: 3,
                        }}
                    />

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        sx={{
                            mb: 2,

                            justifyContent:
                                "space-between",

                            alignItems: {
                                xs:
                                    "stretch",

                                sm:
                                    "center",
                            },
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Alt Görevler
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {
                                    completedCount
                                }{" "}
                                /{" "}
                                {
                                    subTasks
                                        .length
                                }{" "}
                                alt görev
                                tamamlandı
                            </Typography>
                        </Box>

                        {canCreate && (
                            <Button
                                variant={
                                    showSubTaskForm
                                        ? "outlined"
                                        : "contained"
                                }
                                startIcon={
                                    <AddTaskRoundedIcon />
                                }
                                onClick={() => {
                                    setShowSubTaskForm(
                                        !showSubTaskForm
                                    );

                                    setErrorMessage(
                                        ""
                                    );
                                }}
                            >
                                {showSubTaskForm
                                    ? "Formu Kapat"
                                    : "Alt Görev Ekle"}
                            </Button>
                        )}
                    </Stack>

                    {showSubTaskForm &&
                        canCreate && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mb: 3,
                                    border:
                                        "1px solid",
                                    borderColor:
                                        "divider",
                                    borderRadius: 3,
                                    backgroundColor:
                                        "background.paper",
                                    overflow:
                                        "hidden",
                                    boxShadow:
                                        isDark
                                            ? "0 12px 32px rgba(0,0,0,0.18)"
                                            : "0 10px 28px rgba(15,23,42,0.06)",
                                }}
                            >
                                <Box
                                    sx={{
                                        px: {
                                            xs: 2,
                                            sm: 2.5,
                                        },
                                        py: 2,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between",
                                        gap: 2,
                                        borderBottom:
                                            "1px solid",
                                        borderColor:
                                            "divider",
                                        backgroundColor:
                                            isDark
                                                ? "rgba(255,255,255,0.02)"
                                                : "#F8FAFC",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "row",
                                            alignItems:
                                                "center",
                                            gap: 1.25,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius:
                                                    2,
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                backgroundColor:
                                                    isDark
                                                        ? "rgba(49,95,140,0.18)"
                                                        : "#EAF1F8",
                                                color:
                                                    "primary.main",
                                                flexShrink:
                                                    0,
                                            }}
                                        >
                                            <AddTaskRoundedIcon />
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight:
                                                        800,
                                                    color:
                                                        "text.primary",
                                                }}
                                            >
                                                Yeni Alt Görev
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {isManager
                                                    ? "Alt görevi kendi grubunuzdaki bir çalışana atayın."
                                                    : "Alt görev bilgilerini ve atama detaylarını belirleyin."}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {isManager && (
                                        <Chip
                                            label="Kendi Grubunuz"
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight:
                                                    700,
                                                borderColor:
                                                    "divider",
                                                backgroundColor:
                                                    "background.paper",
                                            }}
                                        />
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        p: {
                                            xs: 2,
                                            sm: 2.5,
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                            {
                                                xs:
                                                    "1fr",
                                                md:
                                                    "repeat(2, minmax(0, 1fr))",
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        <TextField
                                            label="Alt Görev Başlığı"
                                            value={
                                                subTaskTitle
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSubTaskTitle(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            fullWidth
                                            placeholder="Alt görev başlığını girin"
                                            sx={{
                                                gridColumn:
                                                {
                                                    md:
                                                        "1 / -1",
                                                },
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2.5,
                                                },
                                            }}
                                        />

                                        <TextField
                                            label="Açıklama"
                                            value={
                                                subTaskDescription
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSubTaskDescription(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            multiline
                                            minRows={
                                                3
                                            }
                                            fullWidth
                                            placeholder="Alt görev için kısa bir açıklama yazın"
                                            sx={{
                                                gridColumn:
                                                {
                                                    md:
                                                        "1 / -1",
                                                },
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2.5,
                                                },
                                            }}
                                        />

                                        <FormControl
                                            fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2.5,
                                                },
                                            }}
                                        >
                                            <InputLabel>
                                                Öncelik
                                            </InputLabel>

                                            <Select
                                                value={
                                                    subTaskPriority
                                                }
                                                label="Öncelik"
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSubTaskPriority(
                                                        Number(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                                }
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
                                            label="Bitiş Tarihi"
                                            type="date"
                                            value={
                                                subTaskDueDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSubTaskDueDate(
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
                                            fullWidth
                                            sx={{
                                                "& .MuiOutlinedInput-root":
                                                {
                                                    borderRadius:
                                                        2.5,
                                                },
                                            }}
                                        />

                                        {!isManager && (
                                            <FormControl
                                                fullWidth
                                                sx={{
                                                    "& .MuiOutlinedInput-root":
                                                    {
                                                        borderRadius:
                                                            2.5,
                                                    },
                                                }}
                                            >
                                                <InputLabel>
                                                    Atama Türü
                                                </InputLabel>

                                                <Select
                                                    value={
                                                        subTaskAssignmentType
                                                    }
                                                    label="Atama Türü"
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleSubTaskAssignmentTypeChange(
                                                            event
                                                                .target
                                                                .value as AssignmentType
                                                        )
                                                    }
                                                >
                                                    <MenuItem value="None">
                                                        Atama Yok
                                                    </MenuItem>
                                                    <MenuItem value="User">
                                                        Kişiye Ata
                                                    </MenuItem>
                                                    <MenuItem value="Group">
                                                        Gruba Ata
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}

                                        {(isManager ||
                                            subTaskAssignmentType ===
                                            "User") && (
                                                <Box
                                                    sx={{
                                                        gridColumn:
                                                        {
                                                            md:
                                                                isManager
                                                                    ? "1 / -1"
                                                                    : "auto",
                                                        },
                                                    }}
                                                >
                                                    <FormControl
                                                        fullWidth
                                                        sx={{
                                                            "& .MuiOutlinedInput-root":
                                                            {
                                                                borderRadius:
                                                                    2.5,
                                                            },
                                                        }}
                                                    >
                                                        <InputLabel>
                                                            {isManager
                                                                ? "Atanan Çalışan"
                                                                : "Atanan Kişi"}
                                                        </InputLabel>

                                                        <Select
                                                            value={
                                                                subTaskAssignedUserId
                                                            }
                                                            label={
                                                                isManager
                                                                    ? "Atanan Çalışan"
                                                                    : "Atanan Kişi"
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setSubTaskAssignedUserId(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            MenuProps={{
                                                                slotProps:
                                                                {
                                                                    paper:
                                                                    {
                                                                        sx: {
                                                                            mt: 0.75,
                                                                            borderRadius:
                                                                                2.5,
                                                                            maxHeight:
                                                                                320,
                                                                        },
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            {isManager
                                                                ? groupMembers
                                                                    .filter(
                                                                        (
                                                                            member
                                                                        ) =>
                                                                            !member.isManager
                                                                    )
                                                                    .map(
                                                                        (
                                                                            member
                                                                        ) => (
                                                                            <MenuItem
                                                                                key={
                                                                                    member.userId
                                                                                }
                                                                                value={
                                                                                    member.userId
                                                                                }
                                                                                sx={{
                                                                                    py: 1.1,
                                                                                }}
                                                                            >
                                                                                <Box>
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            fontWeight:
                                                                                                700,
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            member.fullName
                                                                                        }
                                                                                    </Typography>
                                                                                    <Typography
                                                                                        variant="caption"
                                                                                        color="text.secondary"
                                                                                    >
                                                                                        {
                                                                                            member.email
                                                                                        }
                                                                                    </Typography>
                                                                                </Box>
                                                                            </MenuItem>
                                                                        )
                                                                    )
                                                                : users.map(
                                                                    (
                                                                        user
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={
                                                                                user.id
                                                                            }
                                                                            value={
                                                                                user.id
                                                                            }
                                                                            sx={{
                                                                                py: 1.1,
                                                                            }}
                                                                        >
                                                                            <Box>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{
                                                                                        fontWeight:
                                                                                            700,
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        user.fullName
                                                                                    }
                                                                                </Typography>
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    color="text.secondary"
                                                                                >
                                                                                    {
                                                                                        user.email
                                                                                    }
                                                                                </Typography>
                                                                            </Box>
                                                                        </MenuItem>
                                                                    )
                                                                )}
                                                        </Select>
                                                    </FormControl>

                                                    {isManager && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mt: 0.75,
                                                                ml: 0.5,
                                                            }}
                                                        >
                                                            Yalnızca yönetici veya aktif vekil yetkiniz bulunan gruptaki çalışanlar listelenir.
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}

                                        {!isManager &&
                                            subTaskAssignmentType ===
                                            "Group" && (
                                                <FormControl
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiOutlinedInput-root":
                                                        {
                                                            borderRadius:
                                                                2.5,
                                                        },
                                                    }}
                                                >
                                                    <InputLabel>
                                                        Atanan Grup
                                                    </InputLabel>

                                                    <Select
                                                        value={
                                                            subTaskAssignedGroupId
                                                        }
                                                        label="Atanan Grup"
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setSubTaskAssignedGroupId(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {groups.map(
                                                            (
                                                                group
                                                            ) => (
                                                                <MenuItem
                                                                    key={
                                                                        group.id
                                                                    }
                                                                    value={String(
                                                                        group.id
                                                                    )}
                                                                >
                                                                    {
                                                                        group.name
                                                                    }
                                                                </MenuItem>
                                                            )
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            )}

                                        <Divider
                                            sx={{
                                                gridColumn:
                                                    "1 / -1",
                                                my: 0.5,
                                            }}
                                        />

                                        <Stack
                                            direction={{
                                                xs:
                                                    "column-reverse",
                                                sm:
                                                    "row",
                                            }}
                                            spacing={1}
                                            sx={{
                                                gridColumn:
                                                    "1 / -1",
                                                justifyContent:
                                                    "flex-end",
                                            }}
                                        >
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    resetSubTaskForm();

                                                    setShowSubTaskForm(
                                                        false
                                                    );
                                                }}
                                                disabled={
                                                    isCreatingSubTask
                                                }
                                                sx={{
                                                    minWidth:
                                                        110,
                                                    borderRadius:
                                                        2,
                                                    textTransform:
                                                        "none",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                Vazgeç
                                            </Button>

                                            <Button
                                                variant="contained"
                                                startIcon={
                                                    <AddTaskRoundedIcon />
                                                }
                                                onClick={
                                                    handleCreateSubTask
                                                }
                                                disabled={
                                                    isCreatingSubTask
                                                }
                                                sx={{
                                                    minWidth:
                                                        170,
                                                    borderRadius:
                                                        2,
                                                    textTransform:
                                                        "none",
                                                    fontWeight:
                                                        800,
                                                    boxShadow:
                                                        "none",
                                                }}
                                            >
                                                {isCreatingSubTask
                                                    ? "Oluşturuluyor..."
                                                    : "Alt Görevi Oluştur"}
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Paper>
                        )}

                    {isLoadingSubTasks ? (
                        <Box
                            sx={{
                                display:
                                    "flex",

                                justifyContent:
                                    "center",

                                py: 4,
                            }}
                        >
                            <CircularProgress
                                size={
                                    28
                                }
                            />
                        </Box>
                    ) : subTasks.length ===
                        0 ? (
                        <Alert
                            severity="info"
                            sx={{
                                borderRadius:
                                    2,
                            }}
                        >
                            Bu göreve ait
                            alt görev
                            bulunmamaktadır.
                        </Alert>
                    ) : (
                        <List
                            disablePadding
                            sx={{
                                border:
                                    "1px solid",

                                borderColor:
                                    "divider",

                                borderRadius:
                                    2,

                                overflow:
                                    "hidden",
                            }}
                        >
                            {subTasks.map(
                                (
                                    subTask,
                                    index
                                ) => (
                                    <Box
                                        key={
                                            subTask.id
                                        }
                                    >
                                        {index >
                                            0 && (
                                                <Divider />
                                            )}

                                        <ListItem
                                            onClick={() =>
                                                navigate(
                                                    `/tasks/${subTask.id}`
                                                )
                                            }
                                            sx={{
                                                cursor:
                                                    "pointer",

                                                gap:
                                                    2,

                                                "&:hover":
                                                {
                                                    backgroundColor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    subTask.title
                                                }
                                                secondary={`Bitiş: ${formatDate(
                                                    subTask.dueDate
                                                )}`}
                                            />

                                            <Stack
                                                direction="row"
                                                spacing={
                                                    1
                                                }
                                            >
                                                <Chip
                                                    size="small"
                                                    label={getPriorityText(
                                                        subTask.priority
                                                    )}
                                                    color={getPriorityColor(
                                                        subTask.priority
                                                    )}
                                                />

                                                <Chip
                                                    size="small"
                                                    label={getStatusText(
                                                        subTask.status
                                                    )}
                                                    color={getStatusColor(
                                                        subTask.status
                                                    )}
                                                />
                                            </Stack>
                                        </ListItem>
                                    </Box>
                                )
                            )}
                        </List>
                    )}
                </Box>
            );
        };


    const canUpdateStatus =
        task?.assignedUserId ===
        currentUserId &&
        task?.status !==
        5;

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight:
                        400,

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!task) {
        return (
            <Box>
                <Alert
                    severity="error"
                    sx={{
                        borderRadius:
                            2,
                    }}
                >
                    {errorMessage ||
                        "Görev bulunamadı."}
                </Alert>

                <Button
                    startIcon={
                        <ArrowBackRoundedIcon />
                    }
                    sx={{
                        mt: 2,
                    }}
                    onClick={() =>
                        navigate(
                            backPath
                        )
                    }
                >
                    {backLabel}
                </Button>
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

                position:
                    "relative",

                mx:
                    "auto",

                pl: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: 3.5,
                    xl: 4,
                },

                pr: {
                    xs: 1.5,
                    sm: 2,
                    md: 3,
                    lg: "430px",
                    xl: "465px",
                },

                pb: 3,

                boxSizing:
                    "border-box",

                minHeight: {
                    xs: "auto",
                    lg: "calc(100vh - 110px)",
                },
            }}
        >
            <Snackbar
                open={Boolean(errorMessage)}
                autoHideDuration={5000}
                onClose={() =>
                    setErrorMessage("")
                }
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() =>
                        setErrorMessage("")
                    }
                    sx={{
                        width: "100%",
                        maxWidth: 520,
                        borderRadius: 2,
                    }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
            {/* HERO */}

            <Paper
                elevation={0}
                sx={{
                    position: "relative",

                    overflow: "hidden",

                    mb: 2.75,

                    p: {
                        xs: 2.4,
                        sm: 3,
                        lg: 3.25,
                    },

                    minHeight: {
                        xs: "auto",
                        lg: 180,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius:
                        3.5,

                    background:
                        isDark
                            ? "linear-gradient(105deg, #111827 0%, #101B2B 58%, #172033 100%)"
                            : "linear-gradient(105deg, #FFFFFF 0%, #F7FAFC 58%, #EEF3F7 100%)",
                }}
            >
                <Stack
                    direction={{
                        xs:
                            "column",

                        md:
                            "row",
                    }}
                    spacing={
                        3
                    }
                    sx={{
                        justifyContent:
                            "space-between",

                        alignItems: {
                            xs:
                                "stretch",

                            md:
                                "flex-start",
                        },
                    }}
                >
                    <Box
                        sx={{
                            display:
                                "flex",

                            gap: 2,

                            minWidth:
                                0,
                        }}
                    >
                        <Box
                            sx={{
                                width: 50,

                                height: 50,

                                flexShrink:
                                    0,

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                justifyContent:
                                    "center",

                                borderRadius:
                                    2.5,

                                backgroundColor:
                                    isDark
                                        ? "rgba(49,95,140,0.14)"
                                        : "#EEF4F8",

                                color:
                                    "#315F8C",
                            }}
                        >
                            <AssignmentRoundedIcon />
                        </Box>

                        <Box
                            sx={{
                                minWidth:
                                    0,
                            }}
                        >
                            <Typography
                                variant="overline"
                                color="text.secondary"
                                sx={{
                                    fontWeight:
                                        700,

                                    letterSpacing:
                                        "0.08em",
                                }}
                            >
                                GÖREV #
                                {
                                    task.id
                                }
                            </Typography>

                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    mt:
                                        0.25,

                                    fontWeight:
                                        800,

                                    wordBreak:
                                        "break-word",
                                }}
                            >
                                {
                                    task.title
                                }
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={
                                    1
                                }
                                sx={{
                                    mt: 1.5,

                                    flexWrap:
                                        "wrap",

                                    gap: 1,
                                }}
                            >
                                <Chip
                                    size="small"
                                    label={getStatusText(
                                        task.status
                                    )}
                                    color={getStatusColor(
                                        task.status
                                    )}
                                />

                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`${getPriorityText(
                                        task.priority
                                    )} Öncelik`}
                                    color={getPriorityColor(
                                        task.priority
                                    )}
                                />

                                {task.isOverdue && (
                                    <Chip
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        label="Gecikmiş"
                                    />
                                )}
                            </Stack>

                            {task.description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 2,

                                        maxWidth:
                                            750,

                                        lineHeight:
                                            1.7,

                                        whiteSpace:
                                            "pre-wrap",
                                    }}
                                >
                                    {
                                        task.description
                                    }
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={
                            <ArrowBackRoundedIcon />
                        }
                        onClick={() =>
                            navigate(
                                backPath
                            )
                        }
                        sx={{
                            flexShrink:
                                0,

                            whiteSpace:
                                "nowrap",

                            borderRadius:
                                2.2,

                            textTransform:
                                "none",

                            fontWeight:
                                700,

                            borderColor:
                                isDark
                                    ? "rgba(148,163,184,0.24)"
                                    : "#C9D5E0",

                            color:
                                isDark
                                    ? "primary.light"
                                    : "#315F8C",
                        }}
                    >
                        {backLabel}
                    </Button>
                </Stack>
            </Paper>

            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErrorMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2,

                        borderRadius:
                            2,
                    }}
                >
                    {errorMessage}
                </Alert>
            )}

            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage(
                            ""
                        )
                    }
                    sx={{
                        mb: 2,

                        borderRadius:
                            2,
                    }}
                >
                    {successMessage}
                </Alert>
            )}

            {task.isOverdue && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 2,

                        borderRadius:
                            2,
                    }}
                >
                    Bu görevin bitiş
                    tarihi geçmiştir.
                </Alert>
            )}

            {isEmployee ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: {
                            xs:
                                2,

                            sm:
                                3,
                        },

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            3,
                    }}
                >
                    <Stack
                        spacing={
                            3
                        }
                    >
                        <Stack
                            direction={{
                                xs:
                                    "column",

                                sm:
                                    "row",
                            }}
                            spacing={
                                2
                            }
                            sx={{
                                justifyContent:
                                    "space-between",

                                alignItems: {
                                    xs:
                                        "stretch",

                                    sm:
                                        "center",
                                },
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Görev
                                    Bilgileri
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Görevin
                                    güncel
                                    detaylarını
                                    inceleyebilirsiniz.
                                </Typography>
                            </Box>
                        </Stack>

                        <Box
                            sx={{
                                display:
                                    "grid",

                                gridTemplateColumns:
                                {
                                    xs:
                                        "1fr",

                                    sm:
                                        "repeat(2, minmax(0, 1fr))",
                                },

                                gap: 3,
                            }}
                        >
                            <InfoItem
                                label="Öncelik"
                            >
                                <Chip
                                    size="small"
                                    label={getPriorityText(
                                        task.priority
                                    )}
                                    color={getPriorityColor(
                                        task.priority
                                    )}
                                />
                            </InfoItem>

                            <InfoItem
                                label="Durum"
                            >
                                <Chip
                                    size="small"
                                    label={getStatusText(
                                        task.status
                                    )}
                                    color={getStatusColor(
                                        task.status
                                    )}
                                />
                            </InfoItem>

                            <InfoItem
                                label="Atama"
                                value={getAssignmentName()}
                            />

                            <InfoItem
                                label="Oluşturulma Tarihi"
                                value={formatDate(
                                    task.createdAt
                                )}
                            />

                            <InfoItem
                                label="Bitiş Tarihi"
                                value={formatDate(
                                    task.dueDate
                                )}
                            />

                            <InfoItem
                                label="Tamamlanma Tarihi"
                                value={formatDate(
                                    task.completedAt
                                )}
                            />
                        </Box>

                        {canUpdateStatus && (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,

                                    borderRadius:
                                        3,

                                    backgroundColor:
                                        "background.default",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Görev
                                    Durumunu
                                    Güncelle
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                    }}
                                >
                                    Görevin mevcut
                                    ilerleme
                                    durumunu
                                    değiştirebilirsiniz.
                                </Typography>

                                <Stack
                                    direction={{
                                        xs:
                                            "column",

                                        sm:
                                            "row",
                                    }}
                                    spacing={
                                        2
                                    }
                                >
                                    <FormControl
                                        fullWidth
                                        sx={{
                                            maxWidth:
                                            {
                                                sm:
                                                    320,
                                            },
                                        }}
                                    >
                                        <InputLabel>
                                            Durum
                                        </InputLabel>

                                        <Select
                                            value={
                                                status
                                            }
                                            label="Durum"
                                            onChange={(
                                                event
                                            ) =>
                                                setStatus(
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                        >
                                            <MenuItem value={1}>
                                                Yeni
                                            </MenuItem>

                                            <MenuItem value={2}>
                                                Devam Ediyor
                                            </MenuItem>

                                            <MenuItem value={3}>
                                                Beklemede
                                            </MenuItem>

                                            <MenuItem value={4}>
                                                Tamamlandı
                                            </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Button
                                        variant="contained"
                                        onClick={
                                            handleUpdateStatus
                                        }
                                        disabled={
                                            isUpdatingStatus ||
                                            status ===
                                            task.status
                                        }
                                    >
                                        {isUpdatingStatus
                                            ? "Güncelleniyor..."
                                            : "Durumu Güncelle"}
                                    </Button>
                                </Stack>
                            </Paper>
                        )}

                        {renderSubTasksSection()}

                        <TaskFilesSection
                            taskFiles={
                                taskFiles
                            }
                            isLoadingFiles={
                                isLoadingFiles
                            }
                            selectedFile={
                                selectedFile
                            }
                            setSelectedFile={
                                setSelectedFile
                            }
                            isUploadingFile={
                                isUploadingFile
                            }
                            deletingFileId={
                                deletingFileId
                            }
                            canUploadFile={
                                false
                            }
                            canDeleteFile={
                                false
                            }
                            formatFileSize={
                                formatFileSize
                            }
                            formatUploadedDate={
                                formatUploadedDate
                            }
                            handleUploadFile={
                                handleUploadFile
                            }
                            handleDownloadFile={
                                handleDownloadFile
                            }
                            handleDeleteFile={
                                handleDeleteFile
                            }
                        />
                    </Stack>
                </Paper>
            ) : (
                <Box>
                    {isManager && (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 3,
                                p: {
                                    xs: 2,
                                    sm: 3,
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
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight:
                                        700,
                                }}
                            >
                                Grup Görev Dağıtımı
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mt: 0.5,
                                    mb: 2.5,
                                }}
                            >
                                Grubunuza gönderilen görevi yönetici yetkiniz bulunan gruptaki bir kullanıcıya atayabilirsiniz.
                            </Typography>

                            {!task.assignedGroupId ? (
                                <Alert
                                    severity="info"
                                    sx={{
                                        borderRadius:
                                            2,
                                    }}
                                >
                                    Bu görev bir gruba atanmadığı için
                                    grup üyesine dağıtılamaz.
                                </Alert>
                            ) : (
                                <Box>
                                    {task.assignedUserId && (
                                        <Alert
                                            severity={
                                                onLeaveUserIds.includes(
                                                    task.assignedUserId
                                                )
                                                    ? "warning"
                                                    : "info"
                                            }
                                            sx={{
                                                mb: 2,
                                                borderRadius:
                                                    2,
                                            }}
                                        >
                                            {onLeaveUserIds.includes(
                                                task.assignedUserId
                                            )
                                                ? `Görev şu anda izinde olan ${getAssignmentName()} kullanıcısına atanmış. Görevi uygun başka bir çalışana devredebilirsiniz.`
                                                : `Görev şu anda ${getAssignmentName()} kullanıcısına atanmış. Gerekirse başka bir uygun çalışana devredebilirsiniz.`}
                                        </Alert>
                                    )}

                                    <Stack
                                        direction={{
                                            xs:
                                                "column",
                                            md:
                                                "row",
                                        }}
                                        spacing={2}
                                        sx={{
                                            alignItems: {
                                                xs:
                                                    "stretch",
                                                md:
                                                    "center",
                                            },
                                        }}
                                    >
                                        <FormControl
                                            fullWidth
                                            sx={{
                                                maxWidth:
                                                    520,
                                            }}
                                        >
                                            <InputLabel>
                                                Grup Üyesi
                                            </InputLabel>

                                            <Select
                                                value={
                                                    selectedGroupMemberId
                                                }
                                                label="Grup Üyesi"
                                                onChange={(event) =>
                                                    setSelectedGroupMemberId(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    isLoadingGroupMembers ||
                                                    isAssigningGroupMember
                                                }
                                            >
                                                {isLoadingGroupMembers ? (
                                                    <MenuItem
                                                        value=""
                                                        disabled
                                                    >
                                                        Grup üyeleri yükleniyor...
                                                    </MenuItem>
                                                ) : (
                                                    groupMembers
                                                        .filter(
                                                            (member) =>
                                                                !member.isManager
                                                        )
                                                        .map(
                                                            (member) => {
                                                                const isOnLeave =
                                                                    onLeaveUserIds.includes(
                                                                        member.userId
                                                                    );

                                                                const isCurrentAssignee =
                                                                    task.assignedUserId ===
                                                                    member.userId;

                                                                return (
                                                                    <MenuItem
                                                                        key={
                                                                            member.userId
                                                                        }
                                                                        value={
                                                                            member.userId
                                                                        }
                                                                        disabled={
                                                                            isOnLeave ||
                                                                            isCurrentAssignee
                                                                        }
                                                                    >
                                                                        {member.fullName}
                                                                        {" - "}
                                                                        {member.email}
                                                                        {isOnLeave
                                                                            ? " • İzinde"
                                                                            : isCurrentAssignee
                                                                                ? " • Mevcut atanan"
                                                                                : ` • ${getActiveTaskCount(
                                                                                    member.userId
                                                                                )} aktif görev`}
                                                                    </MenuItem>
                                                                );
                                                            }
                                                        )
                                                )}
                                            </Select>
                                        </FormControl>

                                        <Button
                                            variant="contained"
                                            onClick={
                                                handleAssignGroupMember
                                            }
                                            disabled={
                                                isAssigningGroupMember ||
                                                isLoadingGroupMembers ||
                                                !selectedGroupMemberId
                                            }
                                            sx={{
                                                minWidth:
                                                    170,
                                            }}
                                        >
                                            {isAssigningGroupMember
                                                ? "İşleniyor..."
                                                : task.assignedUserId
                                                    ? "Görevi Devret"
                                                    : "Görevi Ata"}
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </Paper>
                    )}

                    {!isUser && (
                        <Paper
                            elevation={0}
                            sx={{
                                mb: 3,
                                p: {
                                    xs: 2,
                                    sm: 2.4,
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
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    gap: 1.5,
                                    mb:
                                        assignmentHistory.length >
                                            0
                                            ? 1.5
                                            : 0,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight:
                                                800,
                                        }}
                                    >
                                        Görev Geçmişi
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.35,
                                        }}
                                    >
                                        Oluşturma, atama, durum ve güncelleme hareketlerini takip edin.
                                    </Typography>
                                </Box>

                                <Chip
                                    size="small"
                                    label={`${assignmentHistory.length} işlem`}
                                    variant="outlined"
                                    sx={{
                                        fontWeight:
                                            750,
                                    }}
                                />
                            </Box>

                            {assignmentHistory.length ===
                                0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1.5,
                                    }}
                                >
                                    Bu görev için henüz işlem kaydı bulunmuyor.
                                </Typography>
                            ) : (
                                <Stack
                                    spacing={1}
                                >
                                    {assignmentHistory.map(
                                        (
                                            historyItem
                                        ) => (
                                            <Box
                                                key={
                                                    historyItem.id
                                                }
                                                sx={{
                                                    display:
                                                        "grid",
                                                    gridTemplateColumns:
                                                    {
                                                        xs:
                                                            "1fr",
                                                        md:
                                                            "150px minmax(0, 1fr)",
                                                    },
                                                    gap: 1,
                                                    px: 1.35,
                                                    py: 1.1,
                                                    borderRadius:
                                                        2,
                                                    backgroundColor:
                                                        "action.hover",
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontWeight:
                                                            650,
                                                    }}
                                                >
                                                    {new Date(
                                                        historyItem.createdAt
                                                    ).toLocaleString(
                                                        "tr-TR",
                                                        {
                                                            day:
                                                                "2-digit",
                                                            month:
                                                                "short",
                                                            year:
                                                                "numeric",
                                                            hour:
                                                                "2-digit",
                                                            minute:
                                                                "2-digit",
                                                        }
                                                    )}
                                                </Typography>

                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight:
                                                                700,
                                                        }}
                                                    >
                                                        {historyItem.description}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        İşlemi yapan: {historyItem.actionByUserFullName}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )
                                    )}
                                </Stack>
                            )}
                        </Paper>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                lg: "minmax(0, 1fr) 360px",
                                xl: "minmax(0, 1fr) 390px",
                            },
                            gap: {
                                xs: 2,
                                md: 2.5,
                                lg: 3,
                            },
                            alignItems: "stretch",
                        }}
                    >
                        {/* SOL TARAF - GÖREV DÜZENLEME */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: {
                                    xs: 2,
                                    sm: 3,
                                },
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 3.2,
                                backgroundColor: "background.paper",

                                minHeight: {
                                    xs: "auto",
                                    lg: 650,
                                },
                            }}
                        >
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    {isUser
                                        ? "Talep Bilgilerini Düzenle"
                                        : "Görev Bilgilerini Düzenle"}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                >
                                    {isUser
                                        ? "Talebinizin başlık, açıklama, öncelik ve bitiş tarihi bilgilerini güncelleyebilirsiniz."
                                        : "Görevin bilgilerini, durumunu ve atama detaylarını güncelleyebilirsiniz."}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: "repeat(2, minmax(0, 1fr))",
                                    },
                                    gap: 2.5,
                                }}
                            >
                                {/* BAŞLIK */}
                                <TextField
                                    label="Başlık"
                                    value={title}
                                    disabled={!canEditTask}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    required
                                    fullWidth
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 200,
                                        },
                                    }}
                                    sx={{
                                        gridColumn: {
                                            md: "1 / -1",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                {/* AÇIKLAMA */}
                                <TextField
                                    label="Açıklama"
                                    value={description}
                                    disabled={!canEditTask}
                                    onChange={(event) =>
                                        setDescription(event.target.value)
                                    }
                                    multiline
                                    minRows={6}
                                    fullWidth
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 2000,
                                        },
                                    }}
                                    sx={{
                                        gridColumn: {
                                            md: "1 / -1",
                                        },
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                {/* ÖNCELİK */}
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Öncelik
                                    </InputLabel>

                                    <Select
                                        value={priority}
                                        label="Öncelik"
                                        disabled={!canEditTask}
                                        onChange={(event) =>
                                            setPriority(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        sx={{
                                            borderRadius: 2,
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

                                {/* DURUM */}
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Durum
                                    </InputLabel>

                                    <Select
                                        value={status}
                                        label="Durum"
                                        disabled={!isAdmin}
                                        onChange={(event) =>
                                            setStatus(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                        sx={{
                                            borderRadius: 2,
                                        }}
                                    >
                                        <MenuItem value={1}>
                                            Yeni
                                        </MenuItem>

                                        <MenuItem value={2}>
                                            Devam Ediyor
                                        </MenuItem>

                                        <MenuItem value={3}>
                                            Beklemede
                                        </MenuItem>

                                        <MenuItem value={4}>
                                            Tamamlandı
                                        </MenuItem>

                                        <MenuItem value={5}>
                                            İptal Edildi
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                {/* BİTİŞ TARİHİ */}
                                <TextField
                                    label="Bitiş Tarihi"
                                    type="date"
                                    value={dueDate}
                                    disabled={!canEditTask}
                                    onChange={(event) =>
                                        setDueDate(
                                            event.target.value
                                        )
                                    }
                                    fullWidth
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                {/* ATAMA TÜRÜ */}
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Atama Türü
                                    </InputLabel>

                                    <Select
                                        value={assignmentType}
                                        label="Atama Türü"
                                        disabled={!isAdmin}
                                        onChange={(event) =>
                                            handleAssignmentTypeChange(
                                                event.target
                                                    .value as AssignmentType
                                            )
                                        }
                                        sx={{
                                            borderRadius: 2,
                                        }}
                                    >
                                        <MenuItem value="None">
                                            Atama Yok
                                        </MenuItem>

                                        <MenuItem value="User">
                                            Kişiye Ata
                                        </MenuItem>

                                        <MenuItem value="Group">
                                            Gruba Ata
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                {/* KİŞİ SEÇİMİ */}
                                {assignmentType === "User" && (
                                    <FormControl
                                        fullWidth
                                        sx={{
                                            gridColumn: {
                                                md: "1 / -1",
                                            },
                                        }}
                                    >
                                        <InputLabel>
                                            Atanan Kişi
                                        </InputLabel>

                                        <Select
                                            value={assignedUserId}
                                            label="Atanan Kişi"
                                            disabled={!isAdmin}
                                            onChange={(event) =>
                                                setAssignedUserId(
                                                    event.target.value
                                                )
                                            }
                                            sx={{
                                                borderRadius: 2,
                                            }}
                                        >
                                            {users.map((user) => (
                                                <MenuItem
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.fullName} -{" "}
                                                    {user.email}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* GRUP SEÇİMİ */}
                                {assignmentType === "Group" && (
                                    <FormControl
                                        fullWidth
                                        sx={{
                                            gridColumn: {
                                                md: "1 / -1",
                                            },
                                        }}
                                    >
                                        <InputLabel>
                                            Atanan Grup
                                        </InputLabel>

                                        <Select
                                            value={assignedGroupId}
                                            label="Atanan Grup"
                                            disabled={!isAdmin}
                                            onChange={(event) =>
                                                setAssignedGroupId(
                                                    event.target.value
                                                )
                                            }
                                            sx={{
                                                borderRadius: 2,
                                            }}
                                        >
                                            {groups.map((group) => (
                                                <MenuItem
                                                    key={group.id}
                                                    value={String(
                                                        group.id
                                                    )}
                                                >
                                                    {group.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* BUTONLAR */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                    },
                                    gap: 2,
                                    justifyContent:
                                        canDeleteTask
                                            ? "space-between"
                                            : "flex-end",
                                }}
                            >
                                {canDeleteTask && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={
                                            <DeleteOutlineRoundedIcon />
                                        }
                                        onClick={
                                            handleDeleteTask
                                        }
                                        disabled={
                                            isDeleting ||
                                            isSaving
                                        }
                                        sx={{
                                            borderRadius: 2,
                                            textTransform:
                                                "none",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {isDeleting
                                            ? "Siliniyor..."
                                            : "Görevi Sil"}
                                    </Button>
                                )}

                                {canEditTask && (
                                    <Button
                                        variant="contained"
                                        startIcon={
                                            isSaving ? (
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <SaveRoundedIcon />
                                            )
                                        }
                                        onClick={handleSave}
                                        disabled={
                                            isSaving ||
                                            isDeleting
                                        }
                                        sx={{
                                            minWidth: 190,
                                            borderRadius: 2,
                                            boxShadow: "none",
                                            textTransform:
                                                "none",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {isSaving
                                            ? "Kaydediliyor..."
                                            : isUser
                                                ? "Talebi Güncelle"
                                                : "Değişiklikleri Kaydet"}
                                    </Button>
                                )}
                            </Box>
                        </Paper>

                        {/* SAĞ TARAF - GÖREV ÖZETİ */}
                        <Box>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: 3,
                                    backgroundColor: "background.paper",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Görev Özeti
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 0.5,
                                        mb: 2,
                                    }}
                                >
                                    Görevin güncel bilgileri
                                </Typography>

                                <DetailSummaryRow
                                    label="Durum"
                                >
                                    <Chip
                                        size="small"
                                        label={getStatusText(
                                            task.status
                                        )}
                                        color={getStatusColor(
                                            task.status
                                        )}
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                    />
                                </DetailSummaryRow>

                                <DetailSummaryRow
                                    label="Öncelik"
                                >
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={getPriorityText(
                                            task.priority
                                        )}
                                        color={getPriorityColor(
                                            task.priority
                                        )}
                                        sx={{
                                            fontWeight: 600,
                                        }}
                                    />
                                </DetailSummaryRow>

                                <DetailSummaryRow
                                    label="Atama"
                                    value={
                                        getAssignmentName()
                                    }
                                />

                                <DetailSummaryRow
                                    label="Oluşturulma"
                                    value={formatDate(
                                        task.createdAt
                                    )}
                                />

                                <DetailSummaryRow
                                    label="Bitiş Tarihi"
                                    value={formatDate(
                                        task.dueDate
                                    )}
                                    danger={
                                        task.isOverdue
                                    }
                                />

                                {task.completedAt && (
                                    <DetailSummaryRow
                                        label="Tamamlanma"
                                        value={formatDate(
                                            task.completedAt
                                        )}
                                    />
                                )}

                                {task.parentTaskId && (
                                    <DetailSummaryRow
                                        label="Ana Görev"
                                        value={`#${task.parentTaskId}`}
                                    />
                                )}
                            </Paper>

                            {/* GECİKMİŞ GÖREV UYARISI */}
                            {task.isOverdue && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        mt: 2,
                                        p: 2.5,
                                        border:
                                            "1px solid #FECACA",
                                        borderRadius: 3,
                                        backgroundColor:
                                            "#FEF2F2",
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#B91C1C",
                                        }}
                                    >
                                        Gecikmiş Görev
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 0.75,
                                            color: "#991B1B",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Bu görevin bitiş tarihi
                                        geçmiştir.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Box>

                    {/* ALT GÖREVLER */}
                    <Box sx={{ mt: 3 }}>
                        {renderSubTasksSection()}
                    </Box>

                    {/* DOSYALAR */}
                    <Box sx={{ mt: 3 }}>
                        <TaskFilesSection
                            taskFiles={taskFiles}
                            isLoadingFiles={
                                isLoadingFiles
                            }
                            selectedFile={
                                selectedFile
                            }
                            setSelectedFile={
                                setSelectedFile
                            }
                            isUploadingFile={
                                isUploadingFile
                            }
                            deletingFileId={
                                deletingFileId
                            }
                            canUploadFile={
                                canUploadFile
                            }
                            canDeleteFile={
                                canDeleteFile
                            }
                            formatFileSize={
                                formatFileSize
                            }
                            formatUploadedDate={
                                formatUploadedDate
                            }
                            handleUploadFile={
                                handleUploadFile
                            }
                            handleDownloadFile={
                                handleDownloadFile
                            }
                            handleDeleteFile={
                                handleDeleteFile
                            }
                        />
                    </Box>
                </Box>
            )}

            {/* GÖREV SOHBETİ */}
            {/* GÖREV SOHBETİ */}

            {canAccessChat && (
                <Paper
                    elevation={0}
                    sx={{
                        mt: {
                            xs: 3,
                            lg: 0,
                        },

                        position: {
                            xs: "relative",
                            lg: "fixed",
                        },

                        top: {
                            lg: 92,
                        },

                        right: {
                            lg: 22,
                            xl: 28,
                        },

                        bottom: {
                            lg: 18,
                        },

                        width: {
                            xs: "100%",
                            lg: 390,
                            xl: 420,
                        },

                        zIndex: {
                            lg: 5,
                        },

                        display: {
                            lg: "flex",
                        },

                        flexDirection: {
                            lg: "column",
                        },

                        border:
                            "1px solid",
                        borderColor:
                            "divider",
                        borderRadius:
                            3.2,
                        overflow:
                            "hidden",
                        backgroundColor:
                            "background.paper",

                        boxShadow: {
                            xs: "none",
                            lg: isDark
                                ? "0 18px 50px rgba(0,0,0,0.22)"
                                : "0 18px 48px rgba(15,23,42,0.08)",
                        },
                    }}
                >
                    {/* BAŞLIK */}

                    <Box
                        sx={{
                            p: {
                                xs: 2,
                                sm: 2.4,
                                lg: 2.2,
                            },
                            borderBottom:
                                "1px solid",
                            borderColor:
                                "divider",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                                alignItems:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                    borderRadius:
                                        2,
                                    backgroundColor:
                                        isDark
                                            ? "rgba(49,95,140,0.16)"
                                            : "#EEF4F8",
                                    color:
                                        "#315F8C",
                                }}
                            >
                                <ChatRoundedIcon />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight:
                                            800,
                                    }}
                                >
                                    Görev Sohbeti
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Bu kaydın sohbetine yetkili kişilerle ortak iletişim alanı.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {id && <ChatUpdates taskId={id} onRefresh={() => loadTaskMessages(id)} />}

                    {/* MESAJLAR */}

                    <Box
                        sx={{
                            minHeight: {
                                xs: 350,
                                lg: 0,
                            },

                            maxHeight: {
                                xs: 520,
                                lg: "none",
                            },

                            flex: {
                                lg: 1,
                            },

                            overflowY:
                                "auto",

                            overscrollBehavior:
                                "contain",

                            scrollBehavior:
                                "smooth",

                            p: {
                                xs: 2,
                                sm: 2.4,
                                lg: 2,
                            },

                            display:
                                "flex",

                            flexDirection:
                                "column",

                            backgroundColor:
                                isDark
                                    ? "#0D1524"
                                    : "#F8FAFC",
                        }}
                    >
                        {isLoadingMessages ? (
                            <Box
                                sx={{
                                    minHeight: {
                                        xs: 300,
                                        lg: 220,
                                    },
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "center",
                                }}
                            >
                                <CircularProgress
                                    size={28}
                                />
                            </Box>
                        ) : taskMessages.length ===
                            0 ? (
                            <Box
                                sx={{
                                    minHeight: {
                                        xs: 300,
                                        lg: 220,
                                    },
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
                                }}
                            >
                                <ChatRoundedIcon
                                    sx={{
                                        fontSize:
                                            48,
                                        color:
                                            "text.disabled",
                                        mb: 1,
                                    }}
                                />

                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight:
                                            700,
                                    }}
                                >
                                    Henüz mesaj yok
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    İlk mesajı siz
                                    gönderebilirsiniz.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack
                                spacing={2}
                                sx={{
                                    minHeight:
                                        "100%",

                                    "&::before": {
                                        content:
                                            '""',

                                        flex:
                                            1,
                                    },
                                }}
                            >
                                {taskMessages.map(
                                    (message) => {
                                        const isOwnMessage =
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
                                                        isOwnMessage
                                                            ? "flex-end"
                                                            : "flex-start",
                                                    width:
                                                        "100%",
                                                }}
                                            >
                                                <Stack
                                                    direction={
                                                        isOwnMessage
                                                            ? "row-reverse"
                                                            : "row"
                                                    }
                                                    spacing={
                                                        1.25
                                                    }
                                                    sx={{
                                                        alignItems:
                                                            "flex-end",
                                                        maxWidth: {
                                                            xs: "95%",
                                                            sm: "82%",
                                                            lg: "94%",
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width:
                                                                42,
                                                            height:
                                                                42,
                                                            flexShrink:
                                                                0,
                                                            borderRadius:
                                                                "50%",
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            fontWeight:
                                                                800,
                                                            fontSize:
                                                                14,
                                                            backgroundColor:
                                                                isOwnMessage
                                                                    ? (
                                                                        isDark
                                                                            ? "rgba(49,95,140,0.24)"
                                                                            : "#DCE8F2"
                                                                    )
                                                                    : "action.selected",

                                                            color:
                                                                isOwnMessage
                                                                    ? (
                                                                        isDark
                                                                            ? "#B9D0E2"
                                                                            : "#315F8C"
                                                                    )
                                                                    : "primary.main",
                                                        }}
                                                    >
                                                        {isOwnMessage
                                                            ? "Sİ"
                                                            : getInitials(
                                                                message.fullName
                                                            )}
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display:
                                                                    "block",
                                                                mb:
                                                                    0.5,
                                                                px:
                                                                    0.5,
                                                                textAlign:
                                                                    isOwnMessage
                                                                        ? "right"
                                                                        : "left",
                                                                fontWeight:
                                                                    800,
                                                            }}
                                                        >
                                                            {isOwnMessage
                                                                ? "Siz"
                                                                : message.fullName}
                                                        </Typography>

                                                        <Paper
                                                            elevation={
                                                                0
                                                            }
                                                            sx={{
                                                                px:
                                                                    2,
                                                                py:
                                                                    1.4,
                                                                border:
                                                                    "1px solid",
                                                                borderColor:
                                                                    isOwnMessage
                                                                        ? (
                                                                            isDark
                                                                                ? "rgba(148,184,215,0.24)"
                                                                                : "#BFD0DE"
                                                                        )
                                                                        : "divider",
                                                                borderRadius:
                                                                    isOwnMessage
                                                                        ? "16px 16px 4px 16px"
                                                                        : "16px 16px 16px 4px",
                                                                backgroundColor:
                                                                    isOwnMessage
                                                                        ? (
                                                                            theme
                                                                        ) =>
                                                                            theme
                                                                                .palette
                                                                                .mode ===
                                                                                "dark"
                                                                                ? "rgba(34,197,94,0.18)"
                                                                                : "#DCFCE7"
                                                                        : (
                                                                            theme
                                                                        ) =>
                                                                            theme
                                                                                .palette
                                                                                .mode ===
                                                                                "dark"
                                                                                ? "rgba(255,255,255,0.06)"
                                                                                : "#F1F5F9",
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    whiteSpace:
                                                                        "pre-wrap",
                                                                    wordBreak:
                                                                        "break-word",
                                                                }}
                                                            >
                                                                {
                                                                    message.message
                                                                }
                                                            </Typography>

                                                            <Stack
                                                                direction="row"
                                                                spacing={
                                                                    0.5
                                                                }
                                                                sx={{
                                                                    mt:
                                                                        0.75,
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "flex-end",
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                >
                                                                    {new Date(
                                                                        message.createdAt
                                                                    ).toLocaleString(
                                                                        "tr-TR",
                                                                        {
                                                                            day:
                                                                                "2-digit",
                                                                            month:
                                                                                "2-digit",
                                                                            hour:
                                                                                "2-digit",
                                                                            minute:
                                                                                "2-digit",
                                                                        }
                                                                    )}
                                                                </Typography>

                                                                {isOwnMessage && (
                                                                    <Typography
                                                                        component="span"
                                                                        sx={{
                                                                            color:
                                                                                "success.main",
                                                                            fontWeight:
                                                                                900,
                                                                            fontSize:
                                                                                13,
                                                                        }}
                                                                    >
                                                                        ✓✓
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </Paper>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        );
                                    }
                                )}

                                <Box
                                    ref={
                                        messagesEndRef
                                    }
                                />
                            </Stack>
                        )}
                    </Box>

                    {/* MESAJ YAZMA */}

                    <Box
                        sx={{
                            p: {
                                xs: 1.4,
                                sm: 1.6,
                                lg: 1.4,
                            },

                            borderTop:
                                "1px solid",

                            borderColor:
                                "divider",

                            backgroundColor:
                                "background.paper",

                            boxShadow:
                                isDark
                                    ? "0 -8px 24px rgba(0,0,0,0.08)"
                                    : "0 -8px 24px rgba(15,23,42,0.025)",
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                alignItems:
                                    "flex-end",
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                minRows={1}
                                maxRows={4}
                                placeholder="Mesajınızı yazın..."
                                value={
                                    newMessage
                                }
                                onChange={(
                                    event
                                ) =>
                                    setNewMessage(
                                        event.target
                                            .value
                                    )
                                }
                                sx={{
                                    "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius:
                                            2.3,

                                        backgroundColor:
                                            isDark
                                                ? "rgba(255,255,255,0.035)"
                                                : "#F8FAFC",
                                    },

                                    "& .MuiOutlinedInput-input":
                                    {
                                        fontSize:
                                            14,
                                    },
                                }}
                                onKeyDown={(
                                    event
                                ) => {
                                    if (
                                        event.key ===
                                        "Enter" &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();

                                        if (
                                            newMessage.trim() &&
                                            !isSendingMessage
                                        ) {
                                            void handleSendMessage();
                                        }
                                    }
                                }}
                            />

                            <Button
                                variant="contained"
                                endIcon={
                                    <SendRoundedIcon />
                                }
                                onClick={() =>
                                    void handleSendMessage()
                                }
                                disabled={
                                    isSendingMessage ||
                                    !newMessage.trim()
                                }
                                sx={{
                                    minWidth: {
                                        xs: 48,
                                        sm: 104,
                                    },

                                    minHeight:
                                        46,

                                    px: {
                                        xs: 1.4,
                                        sm: 2,
                                    },

                                    borderRadius:
                                        2.3,

                                    fontWeight:
                                        700,

                                    textTransform:
                                        "none",

                                    whiteSpace:
                                        "nowrap",

                                    backgroundColor:
                                        "#163A63",

                                    boxShadow:
                                        "none",

                                    "&:hover": {
                                        backgroundColor:
                                            "#102F51",
                                        boxShadow:
                                            "none",
                                    },
                                }}
                            >
                                {isSendingMessage
                                    ? "Gönderiliyor..."
                                    : "Gönder"}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

interface DetailSummaryRowProps {
    label: string;
    value?: string;
    children?: ReactNode;
    danger?: boolean;
}
function DetailSummaryRow({
    label,
    value,
    children,
    danger = false,
}: DetailSummaryRowProps) {
    return (
        <Box
            sx={{
                py: 1.4,

                display: "flex",

                alignItems:
                    "center",

                justifyContent:
                    "space-between",

                gap: 2,

                borderBottom:
                    "1px solid",

                borderColor:
                    "divider",

                "&:last-child": {
                    borderBottom: 0,
                },
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            {children ?? (
                <Typography
                    variant="body2"
                    sx={{
                        maxWidth: 165,

                        textAlign:
                            "right",

                        fontWeight: 700,

                        wordBreak:
                            "break-word",

                        color:
                            danger
                                ? "error.main"
                                : "text.primary",
                    }}
                >
                    {value ?? "-"}
                </Typography>
            )}
        </Box>
    );
}

interface InfoItemProps {
    label: string;
    value?: string;

    children?:
    ReactNode;
}

function InfoItem({
    label,
    value,
    children,
}: InfoItemProps) {
    return (
        <Box>
            <Typography
                variant="overline"
                color="text.secondary"
                sx={{
                    fontWeight:
                        700,
                }}
            >
                {label}
            </Typography>

            <Box
                sx={{
                    mt: 0.5,
                }}
            >
                {children ?? (
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight:
                                500,
                        }}
                    >
                        {value}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
interface TaskFilesSectionProps {
    taskFiles:
    TaskFile[];

    isLoadingFiles:
    boolean;

    selectedFile:
    File | null;

    setSelectedFile:
    (
        file:
            File | null
    ) => void;

    isUploadingFile:
    boolean;

    deletingFileId:
    number | null;

    canUploadFile:
    boolean;

    canDeleteFile:
    boolean;

    formatFileSize:
    (
        size:
            number
    ) => string;

    formatUploadedDate:
    (
        date:
            string
    ) => string;

    handleUploadFile:
    () => void;

    handleDownloadFile:
    (
        file:
            TaskFile
    ) => void;

    handleDeleteFile:
    (
        fileId:
            number
    ) => void;
}

function TaskFilesSection({
    taskFiles,
    isLoadingFiles,
    selectedFile,
    setSelectedFile,
    isUploadingFile,
    deletingFileId,
    canUploadFile,
    canDeleteFile,
    formatFileSize,
    formatUploadedDate,
    handleUploadFile,
    handleDownloadFile,
    handleDeleteFile,
}: TaskFilesSectionProps) {
    return (
        <Box>
            <Divider
                sx={{
                    my: 3,
                }}
            />

            <Stack
                direction="row"
                spacing={
                    1.25
                }
                sx={{
                    alignItems:
                        "center",

                    mb: 0.5,
                }}
            >
                <Box
                    sx={{
                        width:
                            40,

                        height:
                            40,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",

                        borderRadius:
                            2,

                        backgroundColor:
                            "#EEF4F8",

                        color:
                            "#315F8C",
                    }}
                >
                    <InsertDriveFileRoundedIcon />
                </Box>

                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight:
                                700,
                        }}
                    >
                        Görev Dosyaları
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {canUploadFile
                            ? "PDF, Word veya Excel dosyası yükleyebilirsiniz."
                            : "Göreve eklenen dosyaları görüntüleyebilirsiniz."}
                    </Typography>
                </Box>
            </Stack>

            {canUploadFile && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,

                        my: 2.5,

                        borderRadius:
                            2.4,

                        backgroundColor:
                            "action.hover",
                    }}
                >
                    <Stack
                        direction={{
                            xs:
                                "column",

                            sm:
                                "row",
                        }}
                        spacing={
                            2
                        }
                        sx={{
                            alignItems: {
                                xs:
                                    "stretch",

                                sm:
                                    "center",
                            },
                        }}
                    >
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={
                                <UploadFileRoundedIcon />
                            }
                            disabled={
                                isUploadingFile
                            }
                        >
                            Dosya Seç

                            <input
                                type="file"
                                hidden
                                accept=".pdf,.xls,.xlsx,.doc,.docx"
                                onChange={(
                                    event
                                ) => {
                                    const file =
                                        event
                                            .target
                                            .files?.[
                                        0
                                        ] ??
                                        null;

                                    setSelectedFile(
                                        file
                                    );

                                    event
                                        .target
                                        .value =
                                        "";
                                }}
                            />
                        </Button>

                        <Typography
                            variant="body2"
                            color={
                                selectedFile
                                    ? "text.primary"
                                    : "text.secondary"
                            }
                            sx={{
                                flexGrow:
                                    1,

                                wordBreak:
                                    "break-word",
                            }}
                        >
                            {selectedFile
                                ? `${selectedFile.name} (${formatFileSize(
                                    selectedFile.size
                                )})`
                                : "Henüz dosya seçilmedi."}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={
                                handleUploadFile
                            }
                            disabled={
                                isUploadingFile ||
                                !selectedFile
                            }
                        >
                            {isUploadingFile
                                ? "Yükleniyor..."
                                : "Dosyayı Yükle"}
                        </Button>
                    </Stack>
                </Paper>
            )}

            {isLoadingFiles ? (
                <Box
                    sx={{
                        display:
                            "flex",

                        justifyContent:
                            "center",

                        py: 4,
                    }}
                >
                    <CircularProgress
                        size={
                            28
                        }
                    />
                </Box>
            ) : taskFiles.length ===
                0 ? (
                <Alert
                    severity="info"
                    sx={{
                        mt: 2,

                        borderRadius:
                            2,
                    }}
                >
                    Bu göreve ait dosya
                    bulunmamaktadır.
                </Alert>
            ) : (
                <List
                    disablePadding
                    sx={{
                        mt: 2,

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius:
                            2,

                        overflow:
                            "hidden",
                    }}
                >
                    {taskFiles.map(
                        (
                            file,
                            index
                        ) => (
                            <Box
                                key={
                                    file.id
                                }
                            >
                                {index >
                                    0 && (
                                        <Divider />
                                    )}

                                <ListItem
                                    sx={{
                                        display:
                                            "flex",

                                        flexDirection:
                                        {
                                            xs:
                                                "column",

                                            sm:
                                                "row",
                                        },

                                        alignItems:
                                        {
                                            xs:
                                                "stretch",

                                            sm:
                                                "center",
                                        },

                                        gap:
                                            2,

                                        py:
                                            1.5,
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            file.originalFileName
                                        }
                                        secondary={`${formatFileSize(
                                            file.fileSize
                                        )} • ${formatUploadedDate(
                                            file.uploadedAt
                                        )}`}
                                    />

                                    <Stack
                                        direction={{
                                            xs:
                                                "column",

                                            sm:
                                                "row",
                                        }}
                                        spacing={
                                            1
                                        }
                                    >
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={
                                                <DownloadRoundedIcon />
                                            }
                                            onClick={() =>
                                                handleDownloadFile(
                                                    file
                                                )
                                            }
                                        >
                                            İndir
                                        </Button>

                                        {canDeleteFile && (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                startIcon={
                                                    <DeleteOutlineRoundedIcon />
                                                }
                                                disabled={
                                                    deletingFileId ===
                                                    file.id
                                                }
                                                onClick={() =>
                                                    handleDeleteFile(
                                                        file.id
                                                    )
                                                }
                                            >
                                                {deletingFileId ===
                                                    file.id
                                                    ? "Siliniyor..."
                                                    : "Sil"}
                                            </Button>
                                        )}
                                    </Stack>
                                </ListItem>
                            </Box>
                        )
                    )}
                </List>
            )}
        </Box>
    );
}

export default TaskDetailPage;
