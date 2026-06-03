# 🔄 Affiliate Rotator

Website affiliate dengan sistem rotator produk untuk OBS livestreaming. Pengunjung scan QR code saat livestream → masuk ke landing page produk → klik → redirect ke marketplace.

## ✨ Fitur

- **QR Rotator untuk OBS** → tampilan overlay yang berputar otomatis antar produk
- **Landing Page Produk** → tampilan seperti marketplace (tanpa keranjang)
- **Dashboard Admin** → kelola produk & rotator
- **Universal Link** → support semua marketplace (Tokopedia, Shopee, Lazada, TikTok, Blibli)
- **Analytics** → tracking klik dan konversi
- **Responsive** → mobile-friendly

---

## 🗺️ Roadmap

| Phase | Status | Deskripsi |
|-------|--------|-----------|
| **Phase 1** | ✅ Done | Project setup, struktur folder, database schema |
| **Phase 2** | 🔄 Next | Dashboard: Manajemen Produk (CRUD) |
| **Phase 3** | ⏳ | Dashboard: Rotator Manager |
| **Phase 4** | ⏳ | OBS Overlay: Halaman rotator + QR Code |
| **Phase 5** | ⏳ | Landing Page Produk (tampilan marketplace) |
| **Phase 6** | ⏳ | Analytics Dashboard |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Hosting**: [Vercel](https://vercel.com/) (gratis)

---

## 🚀 Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/affiliate-rotator.git
cd affiliate-rotator
npm install
```

### 2. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru
3. Buka **SQL Editor** di Supabase dashboard
4. Copy-paste isi file `supabase/schema.sql` dan jalankan
5. Copy API keys dari **Settings → API**

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan credentials Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
IP_HASH_SALT=random-string-rahasia
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Project

```
affiliate-rotator/
├── app/
│   ├── (dashboard)/          # Halaman dashboard admin
│   │   ├── dashboard/        # Overview & analytics
│   │   ├── products/         # Manajemen produk
│   │   └── rotator/          # Manajemen rotator
│   ├── (public)/             # Halaman publik
│   │   ├── p/[slug]/         # Landing page produk
│   │   └── obs/[rotatorId]/  # OBS overlay (rotator + QR)
│   └── api/                  # API routes
│       ├── products/
│       ├── rotator/
│       └── click/            # Tracking klik
├── components/
│   ├── dashboard/            # Komponen dashboard
│   ├── obs/                  # Komponen OBS overlay
│   └── product/              # Komponen landing page
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Helper functions
├── types/
│   └── index.ts              # TypeScript types
└── supabase/
    └── schema.sql            # Database schema
```

---

## 🎬 Cara Pakai di OBS

1. Buka OBS → Add Source → **Browser**
2. URL: `https://your-domain.com/obs/[rotator-id]`
3. Width: `400`, Height: `500` (sesuaikan)
4. Centang **"Refresh browser when scene becomes active"**

QR code akan berputar otomatis sesuai interval yang diset di dashboard.

---

## 🌐 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel dashboard
# Settings → Environment Variables
```

Atau connect GitHub repo langsung di [vercel.com](https://vercel.com) untuk auto-deploy.

---

## 📝 Lisensi

MIT License - bebas digunakan untuk kebutuhan pribadi maupun komersial.
