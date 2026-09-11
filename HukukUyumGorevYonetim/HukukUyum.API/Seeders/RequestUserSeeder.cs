using HukukUyum.API.Identity;
using Microsoft.AspNetCore.Identity;

namespace HukukUyum.API.Seeders;

public static class RequestUserSeeder
{
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager)
    {
        var users = new[]
        {
            new
            {
                FullName = "Naz",
                Email = "naz@test.com",
                Password = "Naz123!"
            },
            new
            {
                FullName = "Berk",
                Email = "berk@test.com",
                Password = "Berk123!"
            },
            new
            {
                FullName = "Leyla",
                Email = "leyla@test.com",
                Password = "Leyla123!"
            },
            new
            {
                FullName = "Orhan",
                Email = "orhan@test.com",
                Password = "Orhan123!"
            },
            new
            {
                FullName = "Dilan",
                Email = "dilan@test.com",
                Password = "Dilan123!"
            }
        };

        foreach (var item in users)
        {
            var user =
                await userManager
                    .FindByEmailAsync(
                        item.Email);

            if (user is null)
            {
                user =
                    new ApplicationUser
                    {
                        UserName =
                            item.Email,

                        Email =
                            item.Email,

                        FullName =
                            item.FullName,

                        EmailConfirmed =
                            true,

                        MustChangePassword =
                            false
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
                        $"{item.Email} oluşturulamadı: {errors}");
                }
            }

            var hasRole =
                await userManager
                    .IsInRoleAsync(
                        user,
                        "User");

            if (!hasRole)
            {
                var roleResult =
                    await userManager
                        .AddToRoleAsync(
                            user,
                            "User");

                if (!roleResult.Succeeded)
                {
                    var errors =
                        string.Join(
                            ", ",
                            roleResult.Errors
                                .Select(error =>
                                    error.Description));

                    throw new InvalidOperationException(
                        $"{item.Email} User rolüne eklenemedi: {errors}");
                }
            }

            // DİKKAT:
            // Bu kullanıcılara UserGroup eklemiyoruz.
            // Böylece herhangi bir grubun üyesi değiller.
        }
    }
}