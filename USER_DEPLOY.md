# 🚀 Panduan Deploy untuk Pengguna Baru

> Panduan ini untuk Anda yang ingin menggunakan **Affiliate Rotator** dengan website online sendiri (gratis).

---

## Yang Anda butuhkan

- Akun **GitHub** (gratis) — [daftar di sini](https://github.com/signup)
- Akun **Supabase** (gratis) — [daftar di sini](https://supabase.com)
- Akun **Vercel** (gratis) — [daftar di sini](https://vercel.com)

---

## CARA 1 — Deploy Otomatis (Paling Mudah, 5 Menit)

### Langkah 1: Klik tombol Deploy

Klik tombol ini:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/noobiiefun/affiliate-rotator&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_BASE_URL,IP_HASH_SALT&envDescription=Credentials%20Supabase&project-name=affiliate-rotator&repository-name=affiliate-rotator)

### Langkah 2: Login GitHub

Vercel akan minta login GitHub. Login dan izinkan akses.

### Langkah 3: Isi nama project

Di kolom **"Repository Name"** → isi nama bebas, misal `affiliate-rotator-saya`

Klik **"Create"**

### Langkah 4: Isi 5 variabel konfigurasi

Vercel akan menampilkan form isian. Isi satu per satu:

| Nama Variabel | Cara Dapat Nilainya |
|---------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → General → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API Keys → anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → service_role (klik Reveal) |
| `NEXT_PUBLIC_BASE_URL` | Isi dulu: `https://affiliate-rotator-saya.vercel.app` (ganti dengan nama project Anda) |
| `IP_HASH_SALT` | Tulis sembarang kata, misal: `rahasia-saya-123` |

> 💡 **Belum tahu URL Vercel Anda?** Isi dulu dengan `https://temp.vercel.app`, nanti diupdate setelah deploy selesai.

Klik **"Deploy"** → tunggu ±2 menit

### Langkah 5: Update BASE_URL

Setelah deploy selesai, Vercel memberi URL seperti:
`https://affiliate-rotator-saya.vercel.app`

1. Di Vercel → masuk ke project → **Settings** → **Environment Variables**
2. Klik **Edit** di `NEXT_PUBLIC_BASE_URL`
3. Ganti dengan URL asli Vercel Anda
4. Klik **Deployments** → **Redeploy**

---

## CARA 2 — Fork Manual (Jika Cara 1 Tidak Berhasil)

### Langkah 1: Fork repository

1. Buka [github.com/noobiiefun/affiliate-rotator](https://github.com/noobiiefun/affiliate-rotator)
2. Klik tombol **"Fork"** di pojok kanan atas
3. Klik **"Create fork"**

Sekarang Anda punya salinan di akun GitHub Anda sendiri.

### Langkah 2: Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → login
2. Klik **"Add New Project"**
3. Pilih repo **affiliate-rotator** dari daftar (repo hasil fork tadi)
4. Klik **"Import"**

### Langkah 3: Isi Environment Variables

Sebelum klik Deploy, scroll ke bawah ke bagian **"Environment Variables"**:

```
NEXT_PUBLIC_SUPABASE_URL     = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY    = eyJhbGci...
NEXT_PUBLIC_BASE_URL         = https://nama-project-anda.vercel.app
IP_HASH_SALT                 = kata-rahasia-bebas
```

Klik **"Deploy"**

---

## Setup Database Supabase

> Ini wajib dilakukan agar aplikasi bisa menyimpan data produk.

1. Login ke [supabase.com](https://supabase.com) → masuk ke project Anda
2. Klik **"SQL Editor"** di sidebar kiri
3. Klik **"New query"**
4. Buka file `supabase/schema.sql` dari repository (klik file tersebut di GitHub, lalu klik **Raw**, lalu **Ctrl+A** → **Ctrl+C**)
5. Paste di Supabase SQL Editor → klik **Run**
6. Muncul `Success` → ✅

### Buat Akun Admin

1. Di Supabase → **Authentication** → **Users** → **Add user**
2. Isi email & password yang ingin dipakai untuk login dashboard
3. Klik **Create user** ✅

### Matikan Pendaftaran Umum

1. **Authentication** → **Settings**
2. Cari **"Enable email signup"** → matikan
3. **Save** ✅

---

## Setelah Deploy Berhasil

Buka URL Vercel Anda:
```
https://nama-project-anda.vercel.app/login
```

Login → masuk dashboard → mulai tambah produk! 🎉

---

## Cara Pasang di OBS

1. Dashboard → **Rotator** → **Buat Rotator**
2. Isi nama & slug (misal: `live-hari-ini`)
3. Klik **Buat Rotator** → tambah produk
4. Di OBS → **Sources** → **+** → **Browser**
5. URL:
   ```
   https://nama-project-anda.vercel.app/obs/live-hari-ini
   ```
6. Width: `300` | Height: `220` → OK ✅

---

## Pertanyaan Umum

**Q: Apakah benar-benar gratis?**
Ya! Supabase + Vercel gratis untuk skala personal.

**Q: Apakah data saya aman?**
Ya. Data tersimpan di Supabase milik akun Anda sendiri. Developer aplikasi ini tidak bisa mengakses data Anda.

**Q: Bagaimana kalau ada update?**
Di GitHub → repo Anda → klik **Sync fork** → Vercel otomatis deploy ulang.

**Q: Apakah perlu download installer (.exe)?**
Installer opsional — hanya untuk yang ingin kontrol server dari desktop. Untuk penggunaan normal, cukup akses dashboard dari browser.
