import { isAxiosError } from "axios";

export async function getFileErrorMessage(
    error: unknown,
    fallback: string,
): Promise<string> {
    if (!isAxiosError(error)) {
        return fallback;
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return "Dosya işlemi zaman aşımına uğradı. Lütfen yeniden deneyiniz.";
    }

    if (!error.response) {
        return error.request || error.code === "ERR_NETWORK"
            ? "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip yeniden deneyiniz."
            : fallback;
    }

    const { status } = error.response;

    switch (status) {
        case 401:
            return "Oturumunuz sona ermiş olabilir. Lütfen yeniden giriş yapınız.";
        case 403:
            return "Bu dosya işlemi için erişim yetkiniz bulunmuyor.";
        case 404:
            return "Dosya veya ilişkili görev bulunamadı. Listeyi yenileyip tekrar deneyiniz.";
        case 413:
            return "Dosya boyutu izin verilen sınırı aşıyor. Daha küçük bir dosya seçiniz.";
    }

    if (status >= 500) {
        return "Sunucuda bir hata oluştu. Lütfen daha sonra yeniden deneyiniz.";
    }

    if (status === 400) {
        // Blob downloads also return validation errors as Blob responses.
        let data: unknown = error.response.data;

        if (data instanceof Blob) {
            try {
                data = JSON.parse(await data.text());
            } catch {
                return fallback;
            }
        }

        if (data && typeof data === "object" && "message" in data &&
            typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }
    }

    return fallback;
}
