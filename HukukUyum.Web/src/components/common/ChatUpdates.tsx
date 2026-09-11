import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import api from "../../api/axios";

export async function markChatRead(taskId: string | number, messages: { id: number }[]) {
    const lastId = messages.reduce((max, message) => Math.max(max, message.id), 0);
    if (!lastId) return;
    try {
        await api.patch(`/tasks/${taskId}/messages/read/${lastId}`);
        window.dispatchEvent(new Event("chat-read"));
    } catch { /* Mesajları göstermek, okundu işareti başarısız olsa da devam eder. */ }
}

export default function ChatUpdates({ taskId, onRefresh }: { taskId: string | number; onRefresh: () => Promise<void> }) {
    const [count, setCount] = useState(0);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let disposed = false;
        let running = false;
        const refresh = async () => {
            if (document.hidden || running) return;
            running = true;
            try {
                const response = await api.get<{ count: number }>(`/tasks/${taskId}/messages/unread-count`);
                if (!disposed) setCount(response.data.count);
            } catch { if (!disposed) setCount(0); }
            finally { running = false; }
        };
        void refresh();
        const tick = () => { void refresh(); };
        const timer = window.setInterval(tick, 15000);
        window.addEventListener("focus", tick);
        window.addEventListener("chat-read", tick);
        return () => {
            disposed = true;
            window.clearInterval(timer);
            window.removeEventListener("focus", tick);
            window.removeEventListener("chat-read", tick);
        };
    }, [taskId]);
    return <Button size="small" startIcon={<RefreshRoundedIcon />} disabled={busy}
        variant={count ? "contained" : "text"} sx={{ mt: 1, mb: 1, borderRadius: 2 }}
        onClick={async () => { setBusy(true); try { await onRefresh(); } finally { setBusy(false); } }}>
        {busy ? "Yükleniyor…" : count ? `${count} yeni mesaj · Göster` : "Sohbeti yenile"}
    </Button>;
}
