# 🔄 Affiliate Rotator

Website affiliate dengan sistem rotator produk untuk OBS livestreaming. Pengunjung scan QR code saat livestream → masuk ke landing page produk → klik → redirect ke marketplace.

## ✨ Fitur

- **QR Rotator untuk OBS** → overlay yang berputar otomatis antar produk
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
| **Phase 2** | ✅ Done | App directory, dashboard layout, manajemen produk (CRUD) |
| **Phase 3** | 🔄 Next | Dashboard: Rotator Manager |
| **Phase 4** | ⏳ | OBS Overlay: rotator + QR Code |
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
git clone https://github.com/noobiiefun/affiliate-rotator.git
cd affiliate-rotator
npm install
```

### 2. Setup Supabase

1. Buat akun di [supabase.com](https://supabase.com)
2. Buat project baru — pilih region **Southeast Asia (Singapore)**
3. Buka **SQL Editor** → **New query**
4. Copy-paste isi file `supabase/schema.sql` → klik **Run**
5. Ambil credentials dari **Settings → API Keys**:
   - **Project URL** → dari Settings → General → scroll ke bawah
   - **Publishable key** → `anon` key (tab "Legacy anon, service_role API keys")
   - **Secret key** → `service_role` key (klik Reveal dulu)

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
IP_HASH_SALT=random-string-bebas
```

> ⚠️ File `.env.local` sudah ada di `.gitignore` — tidak akan ikut ke GitHub.

### 4. Jalankan Development Server

```bash
# Port default 3000
npm run dev

# Port kustom (misal 9780)
npm run dev:9780

# Atau set via environment variable (Linux/Mac)
PORT=9780 npm run dev

# Windows Command Prompt
set PORT=9780 && npm run dev

# Windows PowerShell
$env:PORT=9780; npm run dev
```

---

## 🔢 Mengubah Port

Port **tidak** diatur dari `.env.local`. Ada dua cara:

**Cara 1 — Pakai script bawaan** (paling mudah):
```bash
npm run dev:9780
```

**Cara 2 — Langsung di terminal**:
```bash
# Windows CMD
npx next dev -p 9780

# Windows PowerShell
npx next dev -p 9780
```

Lalu update `NEXT_PUBLIC_BASE_URL` di `.env.local` sesuai port yang dipakai:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:9780
```

---

## 📁 Struktur Project

```
affiliate-rotator/
├── app/
│   ├── (dashboard)/          # Halaman dashboard admin
│   │   ├── layout.tsx        # Sidebar navigasi
│   │   ├── dashboard/        # Overview & quick actions
│   │   ├── products/         # Manajemen produk (CRUD)
│   │   └── rotator/          # Manajemen rotator (Phase 3)
│   ├── (public)/             # Halaman publik
│   │   ├── p/[slug]/         # Landing page produk (Phase 5)
│   │   └── obs/[rotatorId]/  # OBS overlay (Phase 4)
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── components/
│   └── dashboard/
│       └── ProductForm.tsx   # Form tambah/edit produk
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Helper functions
├── types/
│   └── index.ts              # TypeScript types
└── supabase/
    └── schema.sql            # Database schema
```

---

## 🎬 Cara Pakai di OBS (Phase 4)

1. Buka OBS → Add Source → **Browser**
2. URL: `https://your-domain.com/obs/[rotator-id]`
3. Width: `400`, Height: `500`
4. Centang **"Refresh browser when scene becomes active"**

---

## 🌐 Deploy ke Vercel

```bash
# Connect GitHub repo di vercel.com
# Tambahkan environment variables di Settings → Environment Variables
```

Atau via CLI:
```bash
npm i -g vercel
vercel
```
