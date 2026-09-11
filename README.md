# Hukuk Uyum Yönetim Sistemi

Görev, talep, grup, izin ve geçici yönetici vekâleti süreçlerini tek bir web uygulamasında birleştiren full-stack yönetim sistemi.

Uygulama, bir talebin ilgili çalışma grubuna iletilmesinden bir çalışana atanmasına, görüşmelerin sürdürülmesine ve sonuçların raporlanmasına kadar olan süreci takip etmeyi amaçlar. Backend ASP.NET Core Web API, frontend React ve TypeScript ile geliştirilmiştir.

> Proje, üretim ortamına hazır veya güvenlik denetiminden geçmiş bir ürün olarak sunulmamaktadır. Gerçek kullanıcı verileri, yüklenen belgeler ve yerel bağlantı bilgileri depoya dahil değildir.

## Özellikler

- **Görev ve talep yönetimi:** görev oluşturma, grup/kişi ataması, alt görevler, öncelik ve durum takibi, bitiş tarihi, arama ve filtreleme.
- **Grup yönetimi:** grup üyelikleri, yönetici ataması, üye kartları ve kişi bazında aktif görev görünümü.
- **Talep görüşmeleri:** talep sahibi, ilgili yönetici ve görevli çalışanın yetkileri kapsamında görüşmeleri takip etmesi.
- **İzin yönetimi:** izin talebi, onay/ret/iptal işlemleri, izinli çalışanların açık görevlerinin takibi ve görev devri.
- **Geçici yönetici vekâleti:** belirli tarih aralığında grup yönetim yetkilerinin kalıcı kullanıcı rolü değiştirilmeden devredilmesi.
- **Raporlama:** görev durumları, öncelikler, tamamlanma ve atama dağılımları; admin için grup bazında raporlar; Excel dışa aktarma ve tarayıcı üzerinden PDF/yazdırma.
- **Dosya yönetimi:** görevlere dosya ekleme, yetki kontrollü indirme ve silme işlemleri.
- **Kullanıcı işlemleri:** başvuru değerlendirme, profil, parola sıfırlama ve rol bazlı erişim.
- **Bildirim ve kayıtlar:** uygulama içi bildirimler, sistem hareketleri ve yeniden deneme mekanizmalı e-posta kuyruğu.
- **Arayüz:** role göre menüler, açık/koyu/sistem teması ve farklı ekran boyutlarına uyarlanan sayfalar.

## Kullanıcı rolleri

| Rol | Kullanım amacı |
| --- | --- |
| Admin | Sistem genelindeki kullanıcıları, grupları, görevleri, izinleri ve raporları yönetir. |
| Manager | Yetkili olduğu grupların görevlerini, üyelerini ve izin süreçlerini yönetir. |
| Employee | Kendisine atanan görevleri takip eder ve ilgili işlemleri yürütür. |
| User | Talep oluşturur, kendi taleplerini ve ilgili görüşmeleri takip eder. |
| Vekil Yönetici | Ayrı bir Identity rolü değildir; geçerli vekâlet süresince ilgili grubun desteklenen yönetim işlemlerine erişen çalışandır. |

Erişim yalnızca menülerin gizlenmesiyle değil, API tarafındaki rol ve kayıt/grup yetkisi kontrolleriyle de sınırlandırılır. Vekâlet her yönetici endpoint'ine sınırsız erişim anlamına gelmez.

## Teknolojiler

| Katman | Teknolojiler |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8, Material UI, React Router, Axios |
| Backend | C#, .NET 8, ASP.NET Core Web API |
| Veri erişimi | Entity Framework Core 8, SQL Server |
| Kimlik doğrulama | ASP.NET Core Identity, JWT Bearer |
| E-posta | MailKit, veritabanı tabanlı EmailOutbox ve arka plan servisi |
| API dokümantasyonu | Swagger / OpenAPI (Development ortamında) |

Kesin bağımlılık sürümleri frontend `package-lock.json` ve backend `.csproj` dosyasında bulunur.

## Proje yapısı

```text
HukukUyum.Web/
  src/
    api/                   # API istemcisi
    components/            # Ortak arayüz bileşenleri
    layouts/               # Rol bazlı sayfa düzenleri
    pages/                 # Uygulama sayfaları
  .env.example
HukukUyumGorevYonetim/
  HukukUyumGorevYonetim.sln
  HukukUyum.API/
    Controllers/           # HTTP endpoint'leri
    Services/              # İş kuralları
    Interfaces/            # Servis sözleşmeleri
    DTOs/                  # İstek ve yanıt modelleri
    Entities/              # Veri modelleri
    Data/                  # EF Core veritabanı bağlamı
    Migrations/            # Veritabanı şema değişiklikleri
    Seeders/               # Başlangıç ve geliştirme verileri
    BackgroundServices/    # E-posta kuyruğunun işlenmesi
    appsettings.example.json
```

## Yerel kurulum

Aşağıdaki komutlar Windows / PowerShell içindir. Terminali indirdiğiniz deponun kök klasöründe açın.

### Gereksinimler

- .NET 8 SDK
- Node.js 22.12 veya üzeri uyumlu sürüm ve npm
- SQL Server veya Windows üzerinde SQL Server Express LocalDB
- EF Core CLI 8.x (`dotnet-ef`)

### 1. Backend ayarları

```powershell
cd HukukUyumGorevYonetim/HukukUyum.API
dotnet restore
Copy-Item appsettings.example.json appsettings.json
```

**Kopyalama adımı yalnızca ilk kurulum içindir; mevcut yerel ayarlarınız varsa üzerine yazmayın.** Örnek bağlantı Windows LocalDB kullanır. Başka bir SQL Server kullanıyorsanız `ConnectionStrings:DefaultConnection` değerini kendi ortamınıza göre yapılandırın.

JWT anahtarını kaynak koda yazmak yerine, Development ortamında User Secrets ile tanımlayın. Projede UserSecretsId zaten tanımlıdır. Aşağıdaki komutlar rastgele bir anahtar üretip yerel sır deposuna kaydeder:

```powershell
$jwtBytes = New-Object byte[] 48
$jwtRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtRng.GetBytes($jwtBytes)
$jwtRng.Dispose()
dotnet user-secrets set "Jwt:Key" ([Convert]::ToBase64String($jwtBytes))
Remove-Variable jwtBytes
```

Uygulama boş veya UTF-8 uzunluğu 32 bayttan kısa JWT anahtarıyla başlamaz. User Secrets geliştirme içindir; canlı ortamda ortam değişkenleri veya bir sır yönetim sistemi kullanılmalıdır. Örneğin `Jwt__Key` ve `ConnectionStrings__DefaultConnection` ortam değişkenleri karşılık gelen ayarları geçersiz kılar.

### 2. Veritabanını hazırlama ve API'yi başlatma

EF Core aracı kurulu değilse bir kez yükleyin:

```powershell
dotnet tool install --global dotnet-ef --version 8.0.26
```

Ardından aynı API klasöründe:

```powershell
dotnet ef database update
dotnet dev-certs https --trust
dotnet run --launch-profile https
```

Migration işlemini yeni bir geliştirme veritabanında çalıştırın. Uygulama açılışında migration'lar otomatik uygulanmaz.

- API: `https://localhost:7235`
- Swagger: `https://localhost:7235/swagger`
- Basit erişim kontrolü: `https://localhost:7235/api/health` (veritabanı hazır olma kontrolü değildir)

### 3. Frontend'i başlatma

İkinci bir terminali depo kökünde açın:

```powershell
cd HukukUyum.Web
npm ci
Copy-Item .env.example .env
npm run dev
```

Frontend adresi: `http://localhost:5173`. API adresi `.env` içindeki `VITE_API_URL` ile belirlenir:

```dotenv
VITE_API_URL=https://localhost:7235/api
```

Frontend portunu/adresini değiştirirseniz API'deki `Frontend:BaseUrl` ve `Frontend:AllowedOrigins` ayarlarını da güncelleyin. `VITE_` değişkenleri tarayıcıya gönderildiği için bu değişkenlere sır veya parola koymayın.

### Demo verileri ve ilk admin hesabı

- Rol, grup ve talep kategorisi seed işlemleri uygulama açılışında çalışır.
- Demo çalışan/yönetici ve talep kullanıcısı seed işlemleri yalnızca `Development` ortamında çalışır. Demo hesap tanımları `UserSeeder.cs` ve `RequestUserSeeder.cs` dosyalarındadır.
- Bu seed işlemleri mevcut demo üyeliklerini ve grup yönetici atamalarını da güncelleyebilir. Gerçek verilerin bulunduğu veritabanında Development seed işlemlerini çalıştırmayın.
- **Temiz veritabanında Admin hesabı otomatik oluşturulmaz.** Admin ekranlarını kullanmak için ASP.NET Core Identity üzerinden güvenli bir başlangıç hesabı ve Admin rol ataması hazırlanmalıdır; bu depoda otomatik admin bootstrap akışı henüz yoktur. Kayıt/başvuru ekranından admin oluşturulduğu varsayılmamalıdır.
- Demo parolalar yalnızca yerel denemeler içindir. Uygulamayı bu hesaplarla internete açmayın.

### E-posta yapılandırması

Parola sıfırlama ve e-posta bildirimleri için `EmailSettings` altındaki `Host`, `Port`, `SenderEmail`, `SenderName`, `Username`, `Password` ve `UseSsl` alanları yapılandırılmalıdır. Parolayı User Secrets veya `EmailSettings__Password` ortam değişkeninde saklayın.

SMTP ayarları boş bırakılırsa e-posta gönderimleri başarısız olur. Arka plan servisi kuyruktaki kayıtları yeniden dener; üç başarısız denemeden sonra kayıt başarısız olarak işaretlenir. Yerel denemelerde gerçek alıcılar yerine test e-posta ortamı kullanın.

## Derleme ve kontroller

Frontend klasöründe:

```powershell
npm run build
npm run lint
```

Depo kökünde:

```powershell
dotnet build HukukUyumGorevYonetim/HukukUyumGorevYonetim.sln
```

Derleme ve lint kontrolleri iş akışı testlerinin yerine geçmez. Depoda ayrı bir otomatik test projesi henüz bulunmamaktadır. Özellikle rol/grup erişimi, vekâlet süresi, izin iptali, dosya erişimi ve rapor kapsamı için otomatik entegrasyon testleri geliştirme alanlarıdır.

## Güvenlik ve paylaşım notları

- Yerel `appsettings*.json` dosyaları (örnek hariç), `.env`, yüklenen dosyalar, veritabanı kopyaları, IDE çıktıları ve kişisel belgeler Git dışında tutulur.
- Örnek ayarlar gerçek kişisel e-posta, parola veya JWT anahtarı içermez.
- `.gitignore` önceden yayımlanmış sırları geri almaz; yanlışlıkla paylaşılan anahtarların iptal edilmesi/değiştirilmesi gerekir.
- Canlıya geçmeden önce yetkilendirme testleri, HTTPS/CORS yapılandırması, sır yönetimi, yedekleme ve veri koruma gereksinimleri ayrıca değerlendirilmelidir.
- Kuruma ait kod veya belgeleri herkese açık paylaşmadan önce gerekli izin alınmalıdır. Depoya bir açık kaynak lisansı henüz eklenmemiştir.

**Geliştiren:** Mahsun Öge
