# Hukuk Uyum — Frontend

React, TypeScript, Vite ve Material UI ile geliştirilen web arayüzü.

Özellikler, backend kurulumu, kullanıcı rolleri ve güvenlik notları için [ana README](../README.md) dosyasına bakın.

## Geliştirme

Node.js 22.12 veya üzeri uyumlu sürüm gereklidir. Bu klasörde:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Kopyalama adımı ilk kurulum içindir; mevcut `.env` dosyanız varsa üzerine yazmayın. Varsayılan API adresi `https://localhost:7235/api`, frontend adresi `http://localhost:5173` olarak ayarlanmıştır.

## Komutlar

| Komut | İşlev |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır. |
| `npm run build` | TypeScript kontrolü yapar ve `dist/` çıktısını üretir. |
| `npm run lint` | Oxlint ile kaynak kodu denetler. |
| `npm run preview` | Derlenen frontend'i yerel olarak önizler; API'yi başlatmaz. |

`VITE_` ortam değişkenleri istemciye açık olduğundan parola veya gizli anahtar içermemelidir.
