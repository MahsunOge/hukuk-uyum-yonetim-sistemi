import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, InputAdornment,
    MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import api from "../api/axios";

interface Member {
    userId: string;
    fullName: string;
    email: string | null;
    groupId: number;
    groupName: string;
    isManager: boolean;
    isOnLeave: boolean;
    activeTaskCount: number;
    newTaskCount: number;
    inProgressTaskCount: number;
    onHoldTaskCount: number;
    completedTaskCount: number;
    overdueTaskCount: number;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [group, setGroup] = useState("");
    const [availability, setAvailability] = useState("");
    const loadMembers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get<Member[]>("/Groups/managed-members");
            setMembers(response.data);
        } catch (cause: unknown) {
            const status = (cause as { response?: { status?: number } }).response?.status;
            setMembers([]);
            setError(status === 403
                ? "Üyeleri görüntüleme yetkiniz bulunmuyor veya vekalet süreniz sona erdi."
                : "Üyeler yüklenemedi. API bağlantısını kontrol edip yeniden deneyin.");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { void loadMembers(); }, [loadMembers]);

    const groups = [...new Map(members.map(m => [m.groupId, m.groupName])).entries()];
    const query = search.trim().toLocaleLowerCase("tr-TR");
    const filtered = members.filter(m =>
        (!group || String(m.groupId) === group) &&
        (!availability || (availability === "leave" ? m.isOnLeave : !m.isOnLeave)) &&
        (!query || [m.fullName, m.email ?? "", m.groupName].join(" ").toLocaleLowerCase("tr-TR").includes(query)));
    const summary = [
        { label: "Toplam Üye", value: new Set(members.map(m => m.userId)).size, color: "#377df0" },
        { label: "Aktif Görev", value: members.reduce((sum, m) => sum + m.activeTaskCount, 0), color: "#193e68" },
        { label: "Şu An İzinli", value: new Set(members.filter(m => m.isOnLeave).map(m => m.userId)).size, color: "#c18424" },
        { label: "Gecikmiş Görev", value: members.reduce((sum, m) => sum + m.overdueTaskCount, 0), color: "#d04848" },
    ];

    return (
        <Stack spacing={2.5}>
            <Paper elevation={0} sx={{
                p: { xs: 2.5, md: 3 }, minHeight: 112, borderRadius: 4,
                border: "1px solid", borderColor: "divider", overflow: "hidden", position: "relative",
                background: theme => `linear-gradient(120deg, ${theme.palette.background.paper}, ${theme.palette.action.hover})`,
                "&::after": { content: '""', position: "absolute", width: 200, height: 200,
                    borderRadius: "50%", bgcolor: "action.hover", right: -30, top: -90, pointerEvents: "none" },
            }}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, position: "relative", zIndex: 1 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 850, fontSize: { xs: 26, md: 32 } }}>Üyeler</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                            Ekibinizin görev dağılımını ve güncel izin durumunu takip edin.
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: "action.hover", color: "primary.main", width: 48, height: 48 }}>
                        <GroupsRoundedIcon />
                    </Avatar>
                </Stack>
            </Paper>

            {error && <Alert severity="error" action={<Button color="inherit" onClick={() => void loadMembers()}>Tekrar dene</Button>}>{error}</Alert>}
            {loading ? <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress aria-label="Üyeler yükleniyor" /></Box> : !error && (
                <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
                        {summary.map(item => (
                            <Paper key={item.label} elevation={0} sx={{ p: 2.5, pb: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", position: "relative", overflow: "hidden" }}>
                                <Typography variant="body2" sx={{ fontWeight: 650 }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: 34, fontWeight: 800, color: item.color, mt: 0.75 }}>{item.value}</Typography>
                                <Box component="svg" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"
                                    sx={{ position: "absolute", bottom: 8, left: 20, width: "calc(100% - 40px)", height: 20, pointerEvents: "none" }}>
                                    <path d="M2 17 C85 17 110 4 150 5 S235 17 298 10 L298 24 L2 24 Z"
                                        fill={item.color} opacity="0.06" />
                                    <path d="M2 17 C85 17 110 4 150 5 S235 17 298 10"
                                        fill="none" stroke={item.color} strokeWidth="1.5"
                                        strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.4" />
                                </Box>
                            </Paper>
                        ))}
                    </Box>

                    <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
                        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto" } }}>
                            <TextField size="small" label="Üye ara" placeholder="Ad veya e-posta"
                                value={search} onChange={e => setSearch(e.target.value)}
                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} />
                            <TextField size="small" select label="Grup" value={group} onChange={e => setGroup(e.target.value)}>
                                <MenuItem value="">Tüm Gruplar</MenuItem>
                                {groups.map(([id, name]) => <MenuItem key={id} value={String(id)}>{name}</MenuItem>)}
                            </TextField>
                            <TextField size="small" select label="İzin Durumu" value={availability} onChange={e => setAvailability(e.target.value)}>
                                <MenuItem value="">Tümü</MenuItem>
                                <MenuItem value="working">İzinde Değil</MenuItem>
                                <MenuItem value="leave">İzinli</MenuItem>
                            </TextField>
                            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={() => void loadMembers()}>Yenile</Button>
                        </Box>
                    </Paper>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 650 }}>{filtered.length} üye kartı gösteriliyor</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Her kart ilgili gruptaki görevleri gösterir. Aktif görevler: yeni, devam eden ve beklemede. Birden fazla gruptaki üyeler ayrı kartlarda gösterilir.
                        </Typography>
                    </Box>
                    {!filtered.length ? (
                        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                            <GroupsRoundedIcon sx={{ color: "text.disabled", fontSize: 40 }} />
                            <Typography sx={{ mt: 1 }}>Gösterilecek üye bulunamadı.</Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
                            {filtered.map(member => (
                                <Paper key={`${member.groupId}-${member.userId}`} component={RouterLink}
                                    to={`/tasks?${new URLSearchParams({
                                        assignedUserId: member.userId,
                                        groupId: String(member.groupId),
                                        memberName: member.fullName,
                                    })}`}
                                    aria-label={`${member.fullName} adlı üyenin ${member.groupName} grubundaki görevlerini görüntüle`}
                                    elevation={0} sx={{
                                    p: 2, borderRadius: 4, border: "1px solid", borderColor: "divider",
                                    display: "block", textDecoration: "none", color: "text.primary", cursor: "pointer",
                                    transition: "border-color 150ms, box-shadow 150ms",
                                    "&:hover": { borderColor: "primary.main", boxShadow: 2 },
                                    "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main", outlineOffset: 3 },
                                    position: "relative", overflow: "hidden",
                                    "&::before": { content: '""', position: "absolute", width: 100, height: 100,
                                        borderRadius: "50%", right: -35, top: -40, bgcolor: "action.hover", pointerEvents: "none" },
                                }}>
                                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                                        <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38, fontSize: 16 }}>
                                            {member.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("tr-TR")}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontWeight: 750, overflowWrap: "anywhere" }}>{member.fullName}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{member.email || "E-posta belirtilmemiş"}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", mt: 1.25, minHeight: 24 }}>
                                        <Chip size="small" variant="outlined" label={member.groupName} sx={{ maxWidth: "100%" }} />
                                        {member.isManager && <Chip size="small" label="Grup Yöneticisi" color="primary" variant="outlined" />}
                                        <Chip size="small" label={member.isOnLeave ? "İzinli" : "İzinde Değil"} color={member.isOnLeave ? "warning" : "success"} variant="outlined" />
                                    </Stack>
                                    <Box sx={{ mt: 1.25, px: 1.5, py: 0.75, borderRadius: 3, bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <Typography variant="body2" sx={{ fontWeight: 650 }}>Aktif Görev</Typography>
                                        <Typography sx={{ fontSize: 26, fontWeight: 850, color: "primary.main" }}>{member.activeTaskCount}</Typography>
                                    </Box>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1, my: 1.25 }}>
                                        {[
                                            ["Yeni", member.newTaskCount],
                                            ["Devam Eden", member.inProgressTaskCount],
                                            ["Beklemede", member.onHoldTaskCount],
                                        ].map(([label, count]) => (
                                            <Box key={label} sx={{ textAlign: "center" }}>
                                                <Typography sx={{ fontWeight: 750, fontSize: 18 }}>{count}</Typography>
                                                <Typography variant="caption" color="text.secondary">{label}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Stack direction="row" sx={{ justifyContent: "space-between", gap: 1, flexWrap: "wrap", borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">{member.completedTaskCount} tamamlanan</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: member.overdueTaskCount ? "error.main" : "text.secondary" }}>
                                            {member.overdueTaskCount} gecikmiş
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "primary.main", fontWeight: 700 }}>
                                        Görevleri görüntüle →
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </>
            )}
        </Stack>
    );
}
