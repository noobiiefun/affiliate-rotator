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
| **Phase 3** | ✅ Done | Dashboard: Rotator Manager (buat, kelola produk, drag & drop urutan) |
| **Phase 4** | 🔄 Next | OBS Overlay: rotator + QR Code |
| **Phase 5** | ⏳ | Landing Page Produk (tampilan marketplace) |
| **Phase 6** | ⏳ | Sistem Login Admin + Analytics Dashboard |

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
4. Buka file `supabase/schema.sql` di komputer → **Ctrl+A** → **Ctrl+C** → paste ke SQL Editor → klik **Run**
5. Ambil credentials dari **Settings → API Keys**:
   - **Project URL** → Settings → General → scroll ke bawah
   - **Anon key** → tab "Legacy anon, service_role API keys" → row `anon`
   - **Service role key** → row `service_role` → klik Reveal dulu

### 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_BASE_URL=http://localhost:9780
IP_HASH_SALT=random-string-bebas
```

> ⚠️ File `.env.local` sudah ada di `.gitignore` — tidak akan ikut ke GitHub.

### 4. Jalankan Development Server

```bash
npm run dev
```

Port otomatis dibaca dari `NEXT_PUBLIC_BASE_URL` di `.env.local` oleh `dev.js`.

---

## 🔢 Mengubah Port

Cukup ubah port di `NEXT_PUBLIC_BASE_URL` dalam `.env.local`:

```env
# Contoh pakai port 9780
NEXT_PUBLIC_BASE_URL=http://localhost:9780
```

Lalu jalankan `npm run dev` — port otomatis ikut.

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
├── supabase/
│   └── schema.sql            # Database schema (jalankan di Supabase SQL Editor)
└── dev.js                    # Script baca port dari .env.local
```

---

## 🗄️ Catatan Database (RLS)

Schema sudah menyertakan policy RLS untuk semua role:

| Role | Akses |
|------|-------|
| **Public** | Baca produk & rotator aktif, insert click events |
| **Anon** | Full access — untuk dashboard development (Phase 6 akan diganti login) |
| **Authenticated** | Full access — untuk admin yang sudah login |

---

## 🎬 Cara Pakai di OBS (Phase 4)

1. Buka OBS → Add Source → **Browser**
2. URL: `https://your-domain.com/obs/[rotator-id]`
3. Width: `400`, Height: `500`
4. Centang **"Refresh browser when scene becomes active"**

---

## 🌐 Deploy ke Vercel

Connect GitHub repo di [vercel.com](https://vercel.com) → tambahkan semua environment variables di **Settings → Environment Variables** → deploy otomatis setiap push.
