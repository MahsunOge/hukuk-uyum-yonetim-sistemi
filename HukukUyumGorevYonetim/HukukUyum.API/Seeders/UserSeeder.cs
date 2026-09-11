using HukukUyum.API.Data;
using HukukUyum.API.Entities;
using HukukUyum.API.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HukukUyum.API.Seeders;

public static class UserSeeder
{
    public static async Task SeedUsersAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context)
    {
        var users = new[]
        {
            // HUKUK
            new
            {
                Name = "Selin",
                Email = "selin@test.com",
                Password = "Selin123!",
                Role = "Manager",
                Group = "Hukuk",
                IsManager = true
            },
            new
            {
                Name = "Mert",
                Email = "mert@test.com",
                Password = "Mert123!",
                Role = "Employee",
                Group = "Hukuk",
                IsManager = false
            },
            new
            {
                Name = "Elif",
                Email = "elif@test.com",
                Password = "Elif123!",
                Role = "Employee",
                Group = "Hukuk",
                IsManager = false
            },
            new
            {
                Name = "Burak",
                Email = "burak@test.com",
                Password = "Burak123!",
                Role = "Employee",
                Group = "Hukuk",
                IsManager = false
            },

            // KVKK VE VERİ KORUMA
            new
            {
                Name = "Derya",
                Email = "derya@test.com",
                Password = "Derya123!",
                Role = "Manager",
                Group = "KVKK ve Veri Koruma",
                IsManager = true
            },
            new
            {
                Name = "Onur",
                Email = "onur@test.com",
                Password = "Onur123!",
                Role = "Employee",
                Group = "KVKK ve Veri Koruma",
                IsManager = false
            },
            new
            {
                Name = "İrem",
                Email = "irem@test.com",
                Password = "Irem123!",
                Role = "Employee",
                Group = "KVKK ve Veri Koruma",
                IsManager = false
            },
            new
            {
                Name = "Cem",
                Email = "cem@test.com",
                Password = "Cem123!",
                Role = "Employee",
                Group = "KVKK ve Veri Koruma",
                IsManager = false
            },

            // UYUM VE ETİK
            new
            {
                Name = "Ece",
                Email = "ece@test.com",
                Password = "Ece123!",
                Role = "Manager",
                Group = "Uyum ve Etik",
                IsManager = true
            },
            new
            {
                Name = "Can",
                Email = "can@test.com",
                Password = "Can123!",
                Role = "Employee",
                Group = "Uyum ve Etik",
                IsManager = false
            },
            new
            {
                Name = "Melis",
                Email = "melis@test.com",
                Password = "Melis123!",
                Role = "Employee",
                Group = "Uyum ve Etik",
                IsManager = false
            },
            new
            {
                Name = "Tolga",
                Email = "tolga@test.com",
                Password = "Tolga123!",
                Role = "Employee",
                Group = "Uyum ve Etik",
                IsManager = false
            },

            // BİLGİ TEKNOLOJİLERİ
            new
            {
                Name = "Emre",
                Email = "emre@test.com",
                Password = "Emre123!",
                Role = "Manager",
                Group = "Bilgi Teknolojileri",
                IsManager = true
            },
            new
            {
                Name = "Kerem",
                Email = "kerem@test.com",
                Password = "Kerem123!",
                Role = "Employee",
                Group = "Bilgi Teknolojileri",
                IsManager = false
            },
            new
            {
                Name = "Zeynep",
                Email = "zeynep@test.com",
                Password = "Zeynep123!",
                Role = "Employee",
                Group = "Bilgi Teknolojileri",
                IsManager = false
            },
            new
            {
                Name = "Okan",
                Email = "okan@test.com",
                Password = "Okan123!",
                Role = "Employee",
                Group = "Bilgi Teknolojileri",
                IsManager = false
            },

            // BİLGİ GÜVENLİĞİ
            new
            {
                Name = "Hakan",
                Email = "hakan@test.com",
                Password = "Hakan123!",
                Role = "Manager",
                Group = "Bilgi Güvenliği",
                IsManager = true
            },
            new
            {
                Name = "Serkan",
                Email = "serkan@test.com",
                Password = "Serkan123!",
                Role = "Employee",
                Group = "Bilgi Güvenliği",
                IsManager = false
            },
            new
            {
                Name = "Buse",
                Email = "buse@test.com",
                Password = "Buse123!",
                Role = "Employee",
                Group = "Bilgi Güvenliği",
                IsManager = false
            },
            new
            {
                Name = "Kaan",
                Email = "kaan@test.com",
                Password = "Kaan123!",
                Role = "Employee",
                Group = "Bilgi Güvenliği",
                IsManager = false
            },

            // İNSAN KAYNAKLARI
            new
            {
                Name = "Aslı",
                Email = "asli@test.com",
                Password = "Asli123!",
                Role = "Manager",
                Group = "İnsan Kaynakları",
                IsManager = true
            },
            new
            {
                Name = "Deniz",
                Email = "deniz@test.com",
                Password = "Deniz123!",
                Role = "Employee",
                Group = "İnsan Kaynakları",
                IsManager = false
            },
            new
            {
                Name = "Gökçe",
                Email = "gokce@test.com",
                Password = "Gokce123!",
                Role = "Employee",
                Group = "İnsan Kaynakları",
                IsManager = false
            },
            new
            {
                Name = "Barış",
                Email = "baris@test.com",
                Password = "Baris123!",
                Role = "Employee",
                Group = "İnsan Kaynakları",
                IsManager = false
            },

            // FİNANS VE MUHASEBE
            new
            {
                Name = "Ayşe",
                Email = "ayse@test.com",
                Password = "Ayse123!",
                Role = "Manager",
                Group = "Finans ve Muhasebe",
                IsManager = true
            },
            new
            {
                Name = "Furkan",
                Email = "furkan@test.com",
                Password = "Furkan123!",
                Role = "Employee",
                Group = "Finans ve Muhasebe",
                IsManager = false
            },
            new
            {
                Name = "Ceren",
                Email = "ceren@test.com",
                Password = "Ceren123!",
                Role = "Employee",
                Group = "Finans ve Muhasebe",
                IsManager = false
            },
            new
            {
                Name = "Uğur",
                Email = "ugur@test.com",
                Password = "Ugur123!",
                Role = "Employee",
                Group = "Finans ve Muhasebe",
                IsManager = false
            },

            // SATIN ALMA VE TEDARİK
            new
            {
                Name = "Murat",
                Email = "murat@test.com",
                Password = "Murat123!",
                Role = "Manager",
                Group = "Satın Alma ve Tedarik",
                IsManager = true
            },
            new
            {
                Name = "Gamze",
                Email = "gamze@test.com",
                Password = "Gamze123!",
                Role = "Employee",
                Group = "Satın Alma ve Tedarik",
                IsManager = false
            },
            new
            {
                Name = "Volkan",
                Email = "volkan@test.com",
                Password = "Volkan123!",
                Role = "Employee",
                Group = "Satın Alma ve Tedarik",
                IsManager = false
            },
            new
            {
                Name = "Sibel",
                Email = "sibel@test.com",
                Password = "Sibel123!",
                Role = "Employee",
                Group = "Satın Alma ve Tedarik",
                IsManager = false
            },

            // OPERASYON VE SÜREÇ YÖNETİMİ
            new
            {
                Name = "Ahmet",
                Email = "ahmet@test.com",
                Password = "Ahmet123!",
                Role = "Manager",
                Group = "Operasyon ve Süreç Yönetimi",
                IsManager = true
            },
            new
            {
                Name = "Seda",
                Email = "seda@test.com",
                Password = "Seda123!",
                Role = "Employee",
                Group = "Operasyon ve Süreç Yönetimi",
                IsManager = false
            },
            new
            {
                Name = "Erhan",
                Email = "erhan@test.com",
                Password = "Erhan123!",
                Role = "Employee",
                Group = "Operasyon ve Süreç Yönetimi",
                IsManager = false
            },
            new
            {
                Name = "Pınar",
                Email = "pinar@test.com",
                Password = "Pinar123!",
                Role = "Employee",
                Group = "Operasyon ve Süreç Yönetimi",
                IsManager = false
            },

            // İÇ DENETİM VE RİSK
            new
            {
                Name = "Yasemin",
                Email = "yasemin@test.com",
                Password = "Yasemin123!",
                Role = "Manager",
                Group = "İç Denetim ve Risk",
                IsManager = true
            },
            new
            {
                Name = "Sinan",
                Email = "sinan@test.com",
                Password = "Sinan123!",
                Role = "Employee",
                Group = "İç Denetim ve Risk",
                IsManager = false
            },
            new
            {
                Name = "Tuğçe",
                Email = "tugce@test.com",
                Password = "Tugce123!",
                Role = "Employee",
                Group = "İç Denetim ve Risk",
                IsManager = false
            },
            new
            {
                Name = "Eren",
                Email = "eren@test.com",
                Password = "Eren123!",
                Role = "Employee",
                Group = "İç Denetim ve Risk",
                IsManager = false
            }
        };

        foreach (var item in users)
        {
            var group =
                await context.Groups
                    .FirstOrDefaultAsync(
                        group =>
                            group.Name ==
                            item.Group);

            if (group is null)
            {
                throw new InvalidOperationException(
                    $"Grup bulunamadı: {item.Group}");
            }

            var user =
                await userManager
                    .FindByEmailAsync(
                        item.Email);

            if (user is null)
            {
                user = new ApplicationUser
                {
                    UserName =
                        item.Email,

                    Email =
                        item.Email,

                    FullName =
                        item.Name,

                    EmailConfirmed =
                        true
                };

                var createResult =
                    await userManager
                        .CreateAsync(
                            user,
                            item.Password);

                if (!createResult.Succeeded)
                {
                    var errors =
                        string.Join(
                            ", ",
                            createResult.Errors
                                .Select(error =>
                                    error.Description));

                    throw new InvalidOperationException(
                        $"{item.Email} kullanıcısı oluşturulamadı: {errors}");
                }
            }

            // Kullanıcının rolünü ekle.
            if (!await userManager.IsInRoleAsync(
                    user,
                    item.Role))
            {
                var roleResult =
                    await userManager
                        .AddToRoleAsync(
                            user,
                            item.Role);

                if (!roleResult.Succeeded)
                {
                    var errors =
                        string.Join(
                            ", ",
                            roleResult.Errors
                                .Select(error =>
                                    error.Description));

                    throw new InvalidOperationException(
                        $"{item.Email} rolü atanamadı: {errors}");
                }
            }

            // Kullanıcıyı grubuna ekle.
            var membershipExists =
                await context.UserGroups
                    .AnyAsync(userGroup =>
                        userGroup.UserId ==
                            user.Id &&
                        userGroup.GroupId ==
                            group.Id);

            if (!membershipExists)
            {
                context.UserGroups.Add(
                    new UserGroup
                    {
                        UserId =
                            user.Id,

                        GroupId =
                            group.Id
                    });

                await context
                    .SaveChangesAsync();
            }

            // Yönetici ise grubun yöneticisi yap.
            if (item.IsManager &&
                group.ManagerUserId != user.Id)
            {
                group.ManagerUserId =
                    user.Id;

                await context
                    .SaveChangesAsync();
            }
        }
    }
}