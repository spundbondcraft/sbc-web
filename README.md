# SBC.id — SpundbondCraft Web App

> Full-stack web dengan dua ekosistem: Internal Admin + Public Portal

## 🏗️ Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | NextAuth v5 (credentials) |
| PDF | @react-pdf/renderer |
| Storage | Cloudinary |
| Animation | GSAP + ScrollTrigger + Three.js + Lenis |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## 📁 Struktur Proyek

```
sbc-web/
├── app/
│   ├── (public)/               # Ekosistem EKSTERNAL
│   │   ├── page.tsx            # Landing page
│   │   ├── track/              # Track order (input kode)
│   │   └── order/[code]/       # Client portal (per order)
│   ├── admin/                  # Ekosistem INTERNAL
│   │   ├── page.tsx            # Dashboard
│   │   ├── orders/             # List + detail + new order
│   │   ├── cogs/               # Config harga + kalkulator
│   │   ├── documents/          # Invoice + Kwitansi
│   │   ├── portfolio/          # Manajemen foto
│   │   ├── finance/            # Rekap keuangan + export
│   │   └── settings/           # Eco counter + app info
│   └── api/                    # API Routes
├── components/
│   ├── landing/                # Hero, Navbar, Particles, dll
│   ├── portal/                 # ClientPortal
│   └── admin/                  # Sidebar, NotificationBell
├── lib/
│   ├── db/                     # Schema + koneksi Drizzle
│   ├── pdf/                    # Invoice + Kwitansi templates
│   └── utils/                  # COGS calc, terbilang, dll
└── middleware.ts               # Auth protection
```

---

## 🚀 Setup & Deploy

### 1. Clone & install

```bash
git clone <repo>
cd sbc-web
npm install
```

### 2. Environment variables

Copy `.env.local.example` → `.env.local` dan isi:

```env
DATABASE_URL=postgresql://...        # Dari Neon Console
NEXTAUTH_SECRET=...                  # Random string 32 char
NEXTAUTH_URL=https://yourapp.vercel.app
ADMIN_PASSWORD=Thenewof
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_WA_NUMBER=
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

### 3. Database migration

```bash
npm run db:push
```

### 4. Development

```bash
npm run dev
```

### 5. Deploy ke Vercel

```bash
# Via Vercel CLI
vercel

# Atau push ke GitHub → auto deploy
```

> ⚠️ Set semua env vars di Vercel Dashboard → Settings → Environment Variables

---

## 🔐 Admin Access

URL: `/admin/login`
Password: sesuai `ADMIN_PASSWORD` di `.env`

---

## 📋 Alur Order

```
1. Client chat WA → Admin buat order baru (Fase PRA)
2. Kode PRA dikirim ke client (mis: SBC-001-PRA)
3. Admin isi COGS → dapat rekomendasi harga jual
4. Diskusi & konfirmasi → Upgrade ke Fixed (SBC-001)
5. Kode Fixed dikirim → client track via /order/SBC-001
6. Admin update status produksi secara berkala
7. Client bayar → Admin catat angsuran
8. Generate Invoice & Kwitansi PDF → upload otomatis ke Cloudinary
9. Client bisa download dokumen dari portal mereka
```

---

## 🎨 Referensi Visual

Terinspirasi dari [landonorris.com](https://landonorris.com):
- Custom cursor dengan magnetic effect
- GSAP ScrollTrigger untuk section transitions
- Three.js particle field di hero
- Lenis smooth scroll
- Cinematic entrance animations
- Responsive full — mobile cursor dimatikan

---

## 🌿 Eco Circular

Counter kain & tas dikelola dari `/admin/settings` dan ditampilkan live di landing page dengan count-up animation.

---

## 📄 Dokumen PDF

- **Invoice**: Template profesional dengan logo SBC, rincian order, info payment
- **Kwitansi**: Perforated design dengan stamp LUNAS jika sudah lunas
- Keduanya di-upload ke Cloudinary dan link disimpan di database
- Client bisa download langsung dari portal mereka

---

## 💡 Tips

- COGS config hanya bisa diubah dengan password konfirmasi
- Kode PRA otomatis non-aktif setelah upgrade ke Fixed
- Notifikasi portal visit muncul tiap 30 detik di admin
- Finance export XLSX menggunakan SheetJS client-side
- Particle count otomatis menyesuaikan kapabilitas device
