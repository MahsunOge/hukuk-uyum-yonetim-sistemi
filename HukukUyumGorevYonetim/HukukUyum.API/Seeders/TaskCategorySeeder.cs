using HukukUyum.API.Data;
using HukukUyum.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Seeders;

public static class TaskCategorySeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context)
    {
        var data =
            new Dictionary<string, string[]>
            {
                ["Hukuk"] =
                [
                    "Sözleşme İncelemesi",
                    "Hukuki Görüş Talebi",
                    "Dava ve Uyuşmazlık",
                    "Mevzuat İncelemesi"
                ],

                ["KVKK ve Veri Koruma"] =
                [
                    "Kişisel Veri İhlali",
                    "Aydınlatma Metni",
                    "Açık Rıza",
                    "Veri Sahibi Başvurusu"
                ],

                ["Uyum ve Etik"] =
                [
                    "Uyum İhlali",
                    "Etik Bildirim",
                    "Çıkar Çatışması",
                    "Politika Uyumsuzluğu"
                ],

                ["Bilgi Teknolojileri"] =
                [
                    "Yazılım Hatası",
                    "Sistem Erişim Sorunu",
                    "Teknik Destek",
                    "Uygulama İyileştirme"
                ],

                ["Bilgi Güvenliği"] =
                [
                    "Güvenlik Olayı",
                    "Yetkisiz Erişim",
                    "Şüpheli Aktivite",
                    "Hesap Güvenliği"
                ],

                ["İnsan Kaynakları"] =
                [
                    "Personel Talebi",
                    "İzin ve Çalışma Süreci",
                    "İşe Alım",
                    "Çalışan İlişkileri"
                ],

                ["Finans ve Muhasebe"] =
                [
                    "Fatura İşlemleri",
                    "Ödeme Sorunu",
                    "Masraf Talebi",
                    "Finansal Kontrol"
                ],

                ["Satın Alma ve Tedarik"] =
                [
                    "Satın Alma Talebi",
                    "Tedarikçi Sorunu",
                    "Teklif Değerlendirme",
                    "Sözleşmeli Tedarik"
                ],

                ["Operasyon ve Süreç Yönetimi"] =
                [
                    "Süreç Hatası",
                    "Operasyonel Aksaklık",
                    "Süreç İyileştirme",
                    "İş Akışı Talebi"
                ],

                ["İç Denetim ve Risk"] =
                [
                    "Denetim Bulgusu",
                    "Risk Bildirimi",
                    "Kontrol Eksikliği",
                    "Düzeltici Faaliyet"
                ]
            };

        foreach (var item in data)
        {
            var group =
                await context.Groups
                    .FirstOrDefaultAsync(
                        group =>
                            group.Name ==
                            item.Key);

            if (group is null)
            {
                group = new Group
                {
                    Name = item.Key,
                    CreatedAt =
                        DateTime.UtcNow
                };

                context.Groups.Add(group);

                await context
                    .SaveChangesAsync();
            }

            foreach (var categoryName
                     in item.Value)
            {
                var categoryExists =
                    await context
                        .TaskCategories
                        .AnyAsync(
                            category =>
                                category.Name ==
                                    categoryName &&
                                category.GroupId ==
                                    group.Id);

                if (categoryExists)
                {
                    continue;
                }

                context.TaskCategories.Add(
                    new TaskCategory
                    {
                        Name =
                            categoryName,

                        GroupId =
                            group.Id,

                        IsActive =
                            true
                    });
            }

            await context.SaveChangesAsync();
        }
    }
}