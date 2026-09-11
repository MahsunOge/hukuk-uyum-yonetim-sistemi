import { Alert, Box, CircularProgress, Typography, Tabs, Tab, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { getCurrentUserRoles } from "../utils/auth";
import ReportExportActions from "../components/reports/ReportExportActions";
import GroupReportsPanel from "../components/reports/GroupReportsPanel";
import { ReportContent, type ReportSummary } from "../components/reports/ReportContent";

export default function ReportsPage() {
    const isAdmin = getCurrentUserRoles().includes("Admin");
    const [params, setParams] = useSearchParams();
    const groupTab = isAdmin && params.get("tab") === "groups";
    const [report, setReport] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let disposed = false;
        setLoading(true);
        setError("");
        api.get<ReportSummary>("/Reports/summary")
            .then(response => { if (!disposed) setReport(response.data); })
            .catch(() => { if (!disposed) setError("Rapor bilgileri yüklenemedi."); })
            .finally(() => { if (!disposed) setLoading(false); });
        return () => { disposed = true; };
    }, [retry]);
    return (
        <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2, md: 3, lg: 3.5, xl: 4 }, pb: 3 }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
                {isAdmin ? "Sistem Raporları" : "Grup Raporları"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2.5 }}>
                {isAdmin ? "Genel durumu ve grupların görev dağılımını inceleyin." : "Yönettiğiniz grupların görev dağılımını inceleyin."}
            </Typography>
            {isAdmin && (
                <Tabs value={groupTab ? "groups" : "general"}
                    onChange={(_, value) => setParams(value === "groups" ? { tab: "groups" } : {})}
                    aria-label="Rapor türü" sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Tab value="general" label="Genel Rapor" />
                    <Tab value="groups" label="Grup Raporları" />
                </Tabs>
            )}
            {groupTab ? <GroupReportsPanel /> : loading ? (
                <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress aria-label="Rapor yükleniyor" /></Box>
            ) : error || !report ? (
                <Alert severity="error" action={<Button color="inherit" onClick={() => setRetry(value => value + 1)}>Tekrar dene</Button>}>
                    {error || "Rapor bulunamadı."}
                </Alert>
            ) : <><ReportExportActions report={report} title={isAdmin ? "Genel Görev Raporu" : "Yönettiğim Grupların Görev Raporu"} />
                <ReportContent report={report} isManager={!isAdmin} /></>}
        </Box>
    );
}
