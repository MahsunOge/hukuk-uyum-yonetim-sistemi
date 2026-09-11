using HukukUyum.API.Data;
using HukukUyum.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Seeders;

public static class GroupSeeder
{
    public static async Task SeedGroupsAsync(
        ApplicationDbContext context)
    {
        string[] groupNames =
        {
            "Hukuk",
            "KVKK ve Veri Koruma",
            "Uyum ve Etik",
            "Bilgi Teknolojileri",
            "Bilgi Güvenliği",
            "İnsan Kaynakları",
            "Finans ve Muhasebe",
            "Satın Alma ve Tedarik",
            "Operasyon ve Süreç Yönetimi",
            "İç Denetim ve Risk"
        };

        foreach (var groupName in groupNames)
        {
            var groupExists =
                await context.Groups
                    .AnyAsync(group =>
                        group.Name == groupName);

            if (groupExists)
            {
                continue;
            }

            context.Groups.Add(
                new Group
                {
                    Name = groupName,
                    CreatedAt =
                        DateTime.UtcNow
                });
        }

        await context.SaveChangesAsync();
    }
}