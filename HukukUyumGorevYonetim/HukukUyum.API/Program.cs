using HukukUyum.API.Data;
using HukukUyum.API.Identity;
using HukukUyum.API.Interfaces;
using HukukUyum.API.Seeders;
using HukukUyum.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using HukukUyum.API.Options;
using HukukUyum.API.Services.Emails;
using HukukUyum.API.BackgroundServices;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<
    IAuditLogService,
    AuditLogService>();
builder.Services.AddScoped<
    IManagerDelegationService,
    ManagerDelegationService>();
builder.Services.AddScoped<
    ILeaveService,
    LeaveService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddHostedService<EmailBackgroundService>();
builder.Services.AddScoped<
    IUserApplicationService,
    UserApplicationService>();
builder.Services.AddScoped<
    IReportService,
    ReportService>();

builder.Services.AddScoped<
    ITaskMessageService,
    TaskMessageService>();

var allowedOrigins =
    builder.Configuration
        .GetSection("Frontend:AllowedOrigins")
        .Get<string[]>() ?? [];

if (allowedOrigins.Length == 0)
{
    var frontendBaseUrl =
        builder.Configuration["Frontend:BaseUrl"];

    if (!string.IsNullOrWhiteSpace(
            frontendBaseUrl))
    {
        allowedOrigins = [frontendBaseUrl];
    }
}

if (allowedOrigins.Length == 0)
{
    throw new InvalidOperationException(
        "En az bir Frontend:AllowedOrigins adresi yapılandırılmalıdır.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var jwtKey =
    builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey) ||
    Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key en az 32 bayt uzunluğunda yapılandırılmalıdır.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey))
    };
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Token giriniz."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager =
        scope.ServiceProvider
            .GetRequiredService<
                RoleManager<IdentityRole>>();

    var userManager =
        scope.ServiceProvider
            .GetRequiredService<
                UserManager<ApplicationUser>>();

    var dbContext =
        scope.ServiceProvider
            .GetRequiredService<
                ApplicationDbContext>();

    await RoleSeeder.SeedRolesAsync(
        roleManager);

    await GroupSeeder.SeedGroupsAsync(
        dbContext);

    await TaskCategorySeeder.SeedAsync(
        dbContext);

    if (app.Environment.IsDevelopment())
    {
        await UserSeeder.SeedUsersAsync(
            userManager,
            dbContext);

        await RequestUserSeeder.SeedAsync(
            userManager);
    }
}

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
