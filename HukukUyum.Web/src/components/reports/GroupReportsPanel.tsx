import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
    Alert, Avatar, Box, Button, CardActionArea, Chip, CircularProgress, InputAdornment,
    LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import api from "../../api/axios";
import ReportExportActions from "./ReportExportActions";
import { ReportContent, type ReportSummary } from "./ReportContent";

interface GroupReport {
    groupId: number;
    groupName: string;
    managerName: string | null;
    memberCount: number;
    summary: ReportSummary;
    members: {
        userId: string; fullName: string; isCurrentMember: boolean;
        activeTasks: number; completedTasks: number; overdueTasks: number;
    }[];
}

function taskUrl(groupId: number, filter = "", userId = "", name = "") {
    const params = new URLSearchParams({ groupId: String(groupId) });
    if (filter === "completed") params.set("status", "4");
    else if (filter) params.set("filter", filter);
    if (userId) {
        params.set("assignedUserId", userId);
        params.set("memberName", name);
    }
    return "/tasks?" + params;
}

export default function GroupReportsPanel() {
    const [params, setParams] = useSearchParams();
    const [groups, setGroups] = useState<GroupReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("name");
    useEffect(() => {
        let disposed = false;
        setLoading(true);
        setError("");
        api.get<GroupReport[]>("/Reports/groups")
            .then(response => { if (!disposed) setGroups(response.data); })
            .catch(() => { if (!disposed) setError("Grup raporları yüklenemedi. API'nin güncel olduğundan emin olun."); })
            .finally(() => { if (!disposed) setLoading(false); });
        return () => { disposed = true; };
    }, [retry]);
    const selectedId = params.get("groupId");
    const selected = groups.find(group => String(group.groupId) === selectedId);
    const selectGroup = (id?: number) => {
        setParams(id ? { tab: "groups", groupId: String(id) } : { tab: "groups" });
    };
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const visible = groups.filter(group =>
        (group.groupName + " " + (group.managerName ?? "")).toLocaleLowerCase("tr-TR").includes(query))
        .sort((a, b) =>
            (sort === "active" ? b.summary.activeTasks - a.summary.activeTasks :
                sort === "overdue" ? b.summary.overdueTasks - a.summary.overdueTasks : 0) ||
            a.groupName.localeCompare(b.groupName, "tr"));

    if (loading) return <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress aria-label="Grup raporları yükleniyor" /></Box>;
    if (error) return <Alert severity="error" action={<Button color="inherit" onClick={() => setRetry(value => value + 1)}>Tekrar dene</Button>}>{error}</Alert>;
    if (selectedId && !selected) return <Alert severity="warning" action={<Button onClick={() => selectGroup()}>Gruplara dön</Button>}>Grup bulunamadı.</Alert>;
    if (selected) {
        const summary = selected.summary;
        return (
            <Stack spacing={2.5}>
                <Box>
                    <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => selectGroup()} sx={{ mb: 1 }}>Grup Raporlarına Dön</Button>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>{selected.groupName}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Yönetici: {selected.managerName || "Belirlenmemiş"} · {selected.memberCount} üye
                    </Typography>
                </Box>
                <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                    {[
                        { label: "Tüm Görevler", count: summary.totalTasks, filter: "" },
                        { label: "Aktif", count: summary.activeTasks, filter: "active" },
                        { label: "Tamamlanan", count: summary.completedTasks, filter: "completed" },
                        { label: "Gecikmiş", count: summary.overdueTasks, filter: "overdue" },
                        { label: "Atama Bekleyen", count: summary.awaitingAssignmentTasks, filter: "unassigned" },
                    ].map(item => (
                        <Button key={item.label} component={RouterLink} to={taskUrl(selected.groupId, item.filter)} variant="outlined" sx={{ borderRadius: 2 }}>
                            {item.label}: {item.count}
                        </Button>
                    ))}
                </Stack>
                <ReportExportActions report={summary} title={selected.groupName + " Grup Raporu"} groupId={selected.groupId} members={selected.members} />
                <ReportContent report={summary} isManager />
                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                    <Typography variant="h6" sx={{ fontWeight: 750 }}>Çalışan Bazlı Görev Dağılımı</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        Sayılara tıklayarak ilgili görevleri açabilirsiniz. Yalnızca bu gruba bağlı görevler sayılır.
                    </Typography>
                    <TableContainer>
                        <Table size="small" aria-label="Grup çalışanlarının görev dağılımı">
                            <TableHead sx={{ bgcolor: "action.hover" }}>
                                <TableRow>
                                    <TableCell>Çalışan</TableCell>
                                    <TableCell align="center">Aktif</TableCell>
                                    <TableCell align="center">Tamamlanan</TableCell>
                                    <TableCell align="center">Gecikmiş</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selected.members.map(member => (
                                    <TableRow key={member.userId}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 650 }}>{member.fullName}</Typography>
                                            {!member.isCurrentMember && <Typography variant="caption" color="text.secondary">Güncel grup üyesi değil</Typography>}
                                        </TableCell>
                                        {[
                                            { filter: "active", value: member.activeTasks, label: "aktif" },
                                            { filter: "completed", value: member.completedTasks, label: "tamamlanan" },
                                            { filter: "overdue", value: member.overdueTasks, label: "gecikmiş" },
                                        ].map(item => (
                                            <TableCell key={item.filter} align="center">
                                                <Button component={RouterLink} size="small"
                                                    aria-label={member.fullName + ": " + item.value + " " + item.label + " görev"}
                                                    to={taskUrl(selected.groupId, item.filter, member.userId, member.fullName)}>
                                                    {item.value}
                                                </Button>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {!selected.members.length && <TableRow><TableCell colSpan={4}>Bu grupta gösterilecek çalışan bulunmuyor.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                        Kişiye atanmamış görevler çalışan satırlarında yer almaz. Gecikmiş görevler aktif görevlerin içindedir.
                    </Typography>
                </Paper>
            </Stack>
        );
    }
    return (
        <Stack spacing={2.5}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 260px" }, gap: 2 }}>
                    <TextField size="small" label="Grup veya yönetici ara" value={search} onChange={event => setSearch(event.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} />
                    <TextField select size="small" label="Sıralama" value={sort} onChange={event => setSort(event.target.value)}>
                        <MenuItem value="name">Grup Adı</MenuItem>
                        <MenuItem value="active">En Fazla Aktif Görev</MenuItem>
                        <MenuItem value="overdue">En Fazla Gecikme</MenuItem>
                    </TextField>
                </Box>
            </Paper>
            <Typography variant="body2" color="text.secondary">{visible.length} grup gösteriliyor. Ayrıntıları görmek için bir kart seçin.</Typography>
            {!visible.length && <Alert severity="info">Gösterilecek grup bulunamadı.</Alert>}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                {visible.map(group => {
                    const report = group.summary;
                    const rate = report.totalTasks ? Math.round(report.completedTasks / report.totalTasks * 100) : 0;
                    return (
                        <Paper key={group.groupId} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                            <CardActionArea onClick={() => selectGroup(group.groupId)} aria-label={group.groupName + " grup raporunu aç"}
                                sx={{ p: 2.5, height: "100%", position: "relative", "&::before": {
                                    content: '""', position: "absolute", right: -30, top: -40,
                                    width: 140, height: 140, borderRadius: "50%", bgcolor: "action.hover",
                                } }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                                    <Avatar sx={{ bgcolor: "action.hover", color: "primary.main" }}><GroupsRoundedIcon /></Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 800, overflowWrap: "anywhere" }}>{group.groupName}</Typography>
                                        <Typography variant="caption" color="text.secondary">Yönetici: {group.managerName || "Belirlenmemiş"}</Typography>
                                    </Box>
                                </Stack>
                                <Chip size="small" variant="outlined" label={group.memberCount + " üye"} sx={{ mb: 2 }} />
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, mb: 2 }}>
                                    {[["Aktif", report.activeTasks], ["Tamamlanan", report.completedTasks], ["Gecikmiş", report.overdueTasks]].map(([label, count]) => (
                                        <Box key={label} sx={{ textAlign: "center", p: 1, borderRadius: 2, bgcolor: "action.hover" }}>
                                            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{count}</Typography>
                                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                                <Typography variant="body2" sx={{ mb: 1, color: report.awaitingAssignmentTasks ? "warning.main" : "text.secondary" }}>
                                    {report.awaitingAssignmentTasks} görev atama bekliyor
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Tamamlanma: %{rate} · {report.totalTasks} toplam görev</Typography>
                                <LinearProgress variant="determinate" value={rate} aria-label="Tamamlanma oranı" sx={{ mt: 1, height: 7, borderRadius: 4 }} />
                                <Typography variant="caption" sx={{ display: "block", mt: 2, color: "primary.main", fontWeight: 700 }}>Grup Raporunu Gör →</Typography>
                            </CardActionArea>
                        </Paper>
                    );
                })}
            </Box>
            <Typography variant="caption" color="text.secondary">
                Tamamlanma oranı = tamamlanan / silinmemiş toplam görev. Grubu olmayan görevler yalnızca genel raporda yer alır.
            </Typography>
        </Stack>
    );
}
