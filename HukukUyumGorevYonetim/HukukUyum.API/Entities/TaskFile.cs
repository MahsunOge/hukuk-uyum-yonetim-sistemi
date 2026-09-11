namespace HukukUyum.API.Entities;

public class TaskFile
{
    public int Id { get; set; }

    // Kullanıcının yüklediği orijinal dosya adı
    public string OriginalFileName { get; set; } =
        string.Empty;

    // Sunucuda saklanan benzersiz dosya adı
    public string StoredFileName { get; set; } =
        string.Empty;

    // Dosyanın sunucu üzerindeki göreli yolu
    public string FilePath { get; set; } =
        string.Empty;

    // Örnek: application/pdf
    public string ContentType { get; set; } =
        string.Empty;

    // Dosya boyutu (byte)
    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; } =
        DateTime.UtcNow;

    // Dosyanın bağlı olduğu görev
    public int TaskItemId { get; set; }

    public TaskItem TaskItem { get; set; } =
        null!;
}