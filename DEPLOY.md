# 🚀 Panduan Deploy ke Vercel

## Prasyarat
- Akun GitHub (sudah punya)
- Akun Vercel (gratis) → [vercel.com](https://vercel.com)
- Project sudah di-push ke GitHub

---

## Langkah 1 — Push ke GitHub

```bash
git add .
git commit -m "feat: Phase 5 - landing page produk"
git push
```

---

## Langkah 2 — Connect ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Klik **"Add New Project"**
3. Import repo `affiliate-rotator` dari daftar
4. Klik **"Deploy"** (biarkan semua setting default untuk Next.js)

---

## Langkah 3 — Set Environment Variables

Di Vercel dashboard → **Project Settings** → **Environment Variables**, tambahkan:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` |
| `NEXT_PUBLIC_BASE_URL` | `https://nama-project.vercel.app` |
| `IP_HASH_SALT` | `random-string-rahasia` |

> ⚠️ Untuk `NEXT_PUBLIC_BASE_URL`: isi dengan URL Vercel Anda setelah deploy pertama selesai.
> Setelah diisi, klik **Redeploy** agar QR code generate URL yang benar.

---

## Langkah 4 — Update NEXT_PUBLIC_BASE_URL

Setelah deploy pertama, Vercel memberi URL seperti:
`https://affiliate-rotator-username.vercel.app`

1. Copy URL tersebut
2. Di Vercel → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_BASE_URL` dengan URL tadi
4. Klik **Redeploy**

---

## Custom Domain (Opsional)

Kalau punya domain sendiri (misal dari Niagahoster, Namecheap, dll):

1. Vercel → **Project Settings** → **Domains**
2. Tambahkan domain Anda
3. Ikuti instruksi DNS yang diberikan Vercel
4. Update `NEXT_PUBLIC_BASE_URL` dengan domain baru

---

## URL yang Tersedia Setelah Deploy

| Halaman | URL |
|---------|-----|
| Dashboard | `https://domain.com/dashboard` |
| Landing Page Produk | `https://domain.com/p/[slug-produk]` |
| OBS Overlay | `https://domain.com/obs/[slug-rotator]` |

---

## Auto Deploy

Setiap kali Anda push ke GitHub → Vercel otomatis deploy ulang. Tidak perlu manual.

---

## Keamanan yang Sudah Aktif

- ✅ HTTPS otomatis (Vercel)
- ✅ Security headers (X-Frame-Options, XSS Protection, dll)
- ✅ OBS overlay diizinkan embed (iframe) — halaman lain tidak
- ✅ Supabase RLS (Row Level Security)
- ✅ Environment variables tidak ikut ke GitHub
