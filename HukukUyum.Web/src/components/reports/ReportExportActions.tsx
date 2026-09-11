import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import api from "../../api/axios";
import type { ReportSummary } from "./ReportContent";

interface Props {
    report: ReportSummary;
    title: string;
    groupId?: number;
    members?: { fullName: string; activeTasks: number; completedTasks: number; overdueTasks: number }[];
}

const escapeHtml = (text: unknown) => String(text).replace(/[&<>"']/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

export default function ReportExportActions({ report, title, groupId, members }: Props) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const download = async () => {
        setBusy(true);
        setError("");
        try {
            const response = await api.get("/Reports/export/excel", { params: { groupId }, responseType: "blob" });
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `gorev-raporu${groupId ? "-" + groupId : ""}.xlsx`;
            anchor.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch { setError("Excel raporu indirilemedi. Bağlantıyı ve yetkinizi kontrol edin."); }
        finally { setBusy(false); }
    };
    const print = () => {
        setError("");
        const popup = window.open("", "_blank", "width=1000,height=760");
        if (!popup) { setError("PDF çıktısı için açılır pencereye izin verin."); return; }
        popup.opener = null;
        const rows = [
            ["Toplam", report.totalTasks], ["Yeni", report.newTasks], ["Devam eden", report.inProgressTasks],
            ["Beklemede", report.onHoldTasks], ["Aktif", report.activeTasks], ["Tamamlanan", report.completedTasks],
            ["İptal", report.cancelledTasks], ["Gecikmiş", report.overdueTasks],
            ["Atama bekleyen", report.awaitingAssignmentTasks], ["Düşük öncelik", report.lowPriorityTasks],
            ["Orta öncelik", report.mediumPriorityTasks], ["Yüksek öncelik", report.highPriorityTasks],
            ["Kritik öncelik", report.criticalPriorityTasks],
        ];
        const rowHtml = (cells: unknown[]) => "<tr>" + cells.map(cell => "<td>" + escapeHtml(cell) + "</td>").join("") + "</tr>";
        popup.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
            <style>@page{size:A4;margin:18mm}body{font:14px Arial,sans-serif;color:#172033;margin:28px}
            h1{font-size:24px;color:#193e68}h2{font-size:18px}table{width:100%;border-collapse:collapse;margin:16px 0}
            td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}th{background:#f1f5f9}
            tr{break-inside:avoid}thead{display:table-header-group}.note{color:#526079;font-size:12px}</style></head><body>
            <h1>${escapeHtml(title)}</h1><p>Rapor zamanı: ${escapeHtml(new Date().toLocaleString("tr-TR"))}</p>
            <p class="note">Kapsam: ${escapeHtml(title)}. Tarih filtresi uygulanmadı. Silinen görevler hariçtir.
            Gecikmiş görevler aktif görevlerin alt kümesidir. Tamamlanma oranı: tamamlanan / toplam.</p>
            <table><thead><tr><th>Gösterge</th><th>Adet</th></tr></thead><tbody>${rows.map(rowHtml).join("")}</tbody></table>
            ${members ? "<h2>Çalışan Dağılımı</h2><table><thead><tr><th>Çalışan</th><th>Aktif</th><th>Tamamlanan</th><th>Gecikmiş</th></tr></thead><tbody>" +
                members.map(member => rowHtml([member.fullName, member.activeTasks, member.completedTasks, member.overdueTasks])).join("") + "</tbody></table>" : ""}
            </body></html>`);
        popup.document.close();
        popup.focus();
        window.setTimeout(() => { if (!popup.closed) popup.print(); }, 200);
    };
    return <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} disabled={busy} onClick={() => void download()}>
                {busy ? "Hazırlanıyor…" : "Excel İndir"}
            </Button>
            <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={print}>PDF / Yazdır</Button>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
    </Stack>;
}
