# 🔄 Affiliate Rotator

Website affiliate dengan sistem rotator QR code untuk OBS livestreaming.

**Cara kerjanya:**
1. Anda live streaming di TikTok/YouTube/dll
2. Di layar muncul kartu produk + QR code yang berputar otomatis
3. Penonton scan QR → masuk ke halaman produk
4. Penonton klik tombol beli → diarahkan ke Shopee/Tokopedia/dll
5. Anda dapat komisi affiliate! 🎉

---

## ✅ Fitur Lengkap

- 🎬 **OBS Overlay** — kartu produk + QR code berputar otomatis di layar streaming
- 🛍️ **Landing Page Produk** — halaman produk yang rapi, bisa dibuka dari HP maupun PC
- 📊 **Dashboard Admin** — kelola produk, rotator, dan lihat statistik klik
- 🎨 **Tema Custom** — warna, ukuran, posisi overlay bisa diatur sendiri
- 📁 **Grup Rotator** — kelompokkan rotator per event/kategori
- 🔗 **Universal Link** — support Tokopedia, Shopee, Lazada, TikTok Shop, Blibli
- 📈 **Analytics** — grafik klik harian, produk terpopuler, sumber klik
- 🔐 **Login Admin** — dashboard hanya bisa diakses Anda
- 📱 **Mobile Friendly** — landing page responsif di semua ukuran layar

---

## 🗺️ Status Pengembangan

| Fase | Status | Isi |
|------|--------|-----|
| Phase 1 | ✅ Selesai | Setup project & database |
| Phase 2 | ✅ Selesai | Dashboard & manajemen produk |
| Phase 3 | ✅ Selesai | Rotator manager (drag & drop) |
| Phase 4 | ✅ Selesai | OBS overlay + tema custom + grup |
| Phase 5 | ✅ Selesai | Landing page produk (SEO, mobile) |
| Phase 6 | ✅ Selesai | Login admin + analytics dashboard |

---

# 🚀 PANDUAN INSTALASI LENGKAP

> Panduan ini dibuat untuk pemula. Ikuti langkah demi langkah, jangan dilewat.

---

## BAGIAN 1 — Persiapan Akun (Gratis Semua!)

Anda perlu daftar di 3 layanan berikut. Semuanya **gratis**.

### 1A. Buat Akun GitHub
> GitHub adalah tempat menyimpan kode program Anda di internet.

1. Buka [github.com](https://github.com) → klik **Sign up**
2. Isi email, password, username → selesaikan verifikasi
3. Akun GitHub Anda sudah siap ✅

---

### 1B. Buat Akun Supabase
> Supabase adalah database gratis untuk menyimpan data produk Anda.

1. Buka [supabase.com](https://supabase.com) → klik **Start your project**
2. Pilih **Continue with GitHub** (login pakai akun GitHub tadi)
3. Setelah masuk, klik **New Project**
4. Isi formulir:
   - **Organization**: biarkan default
   - **Project name**: `affiliate-rotator`
   - **Database Password**: buat password yang kuat, **simpan di notepad!**
   - **Region**: pilih `Southeast Asia (Singapore)`
5. Klik **Create new project** → tunggu sekitar 2 menit sampai selesai ✅

---

### 1C. Buat Akun Vercel
> Vercel adalah hosting gratis untuk menjalankan website Anda di internet.

1. Buka [vercel.com](https://vercel.com) → klik **Sign Up**
2. Pilih **Continue with GitHub**
3. Ikuti langkah yang muncul → akun Vercel siap ✅

---

## BAGIAN 2 — Setup Project di Komputer

### 2A. Install Software yang Dibutuhkan

**Install Node.js:**
1. Buka [nodejs.org](https://nodejs.org)
2. Download versi **LTS** (tombol hijau kiri)
3. Install seperti biasa → Next → Next → Finish

**Install Git:**
1. Buka [git-scm.com](https://git-scm.com)
2. Download → install → semua pilihan biarkan default

---

### 2B. Download Project Ini

Buka **Command Prompt** (Windows: tekan `Win+R` → ketik `cmd` → Enter):

```bash
# Masuk ke folder yang Anda inginkan, contoh:
cd C:\Users\NamaAnda\Documents

# Clone / download project
git clone https://github.com/noobiiefun/affiliate-rotator.git

# Masuk ke folder project
cd affiliate-rotator

# Install semua library yang dibutuhkan (tunggu beberapa menit)
npm install
```

---

### 2C. Setup File Konfigurasi

Di dalam folder project, buat file baru bernama `.env.local`.

Caranya:
1. Buka folder `C:\Users\NamaAnda\Documents\affiliate-rotator`
2. Klik kanan → New → Text Document
3. Ganti nama file menjadi `.env.local` (termasuk titiknya, hapus `.txt`-nya)
4. Buka dengan Notepad++, isi dengan:

```
NEXT_PUBLIC_SUPABASE_URL=ISI_NANTI
NEXT_PUBLIC_SUPABASE_ANON_KEY=ISI_NANTI
SUPABASE_SERVICE_ROLE_KEY=ISI_NANTI
NEXT_PUBLIC_BASE_URL=http://localhost:3000
IP_HASH_SALT=tulis-sembarang-kata-rahasia-disini
```

Untuk mengisi `ISI_NANTI`, lihat **Bagian 3** di bawah.

---

## BAGIAN 3 — Ambil Credentials Supabase

### 3A. Ambil Project URL

1. Buka [supabase.com](https://supabase.com) → masuk ke project Anda
2. Di sidebar kiri, klik ikon **Settings** (gerigi ⚙️)
3. Klik **General**
4. Scroll ke bawah → cari **"Project URL"**
5. Copy URL tersebut (bentuknya: `https://abcdefgh.supabase.co`)
6. Paste ke `.env.local` menggantikan `ISI_NANTI` di baris `NEXT_PUBLIC_SUPABASE_URL`

### 3B. Ambil API Keys

1. Masih di Settings → klik **API Keys**
2. Klik tab **"Legacy anon, service_role API keys"**
3. Copy nilai **anon** → paste ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Reveal** di baris **service_role** → copy → paste ke `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ Jangan share `SUPABASE_SERVICE_ROLE_KEY` ke siapapun!

---

## BAGIAN 4 — Setup Database

### 4A. Buat Tabel Database

1. Di Supabase, klik **SQL Editor** di sidebar kiri
2. Klik **New query**
3. Buka file `supabase/schema.sql` di folder project dengan Notepad++
4. **Ctrl+A** (select all) → **Ctrl+C** (copy)
5. Kembali ke Supabase → klik di area editor → **Ctrl+V** (paste)
6. Klik tombol **Run** (hijau, pojok kanan bawah)
7. Jika muncul `Success` → database berhasil dibuat ✅

### 4B. Buat Akun Admin

1. Di Supabase, klik **Authentication** di sidebar kiri
2. Klik **Users** → klik **Add user** → **Create new user**
3. Isi email dan password yang ingin Anda gunakan untuk login dashboard
4. Klik **Create user** ✅

### 4C. Matikan Pendaftaran Umum (Penting!)

1. Masih di **Authentication** → klik **Settings**
2. Cari **"Enable email signup"** → matikan (toggle off)
3. Klik **Save** → sekarang hanya Anda yang bisa login ✅

---

## BAGIAN 5 — Jalankan di Komputer (Development)

Di Command Prompt:

```bash
npm run dev
```

Buka browser → ketik `http://localhost:3000` → tekan Enter.

Jika muncul halaman login → **berhasil!** 🎉

Login dengan email & password yang Anda buat di Supabase tadi.

---

## BAGIAN 6 — Upload ke Internet (Deploy ke Vercel)

> Setelah ini website Anda bisa diakses dari mana saja!

### 6A. Upload Kode ke GitHub

Di Command Prompt (di folder project):

```bash
# Inisialisasi git (jika belum)
git init

# Hubungkan ke GitHub (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/affiliate-rotator.git

# Upload semua file
git add .
git commit -m "Upload pertama"
git push -u origin main
```

> Jika diminta login GitHub, masukkan username dan password GitHub Anda.

---

### 6B. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → sudah login
2. Klik **"Add New Project"** (tombol di pojok kanan atas)
3. Pilih repo **affiliate-rotator** dari daftar → klik **Import**
4. Biarkan semua pengaturan default → klik **Deploy**
5. Tunggu beberapa menit → Vercel akan memberi Anda URL seperti:
   `https://affiliate-rotator-username.vercel.app`

---

### 6C. Isi Environment Variables di Vercel

> Ini seperti mengisi `.env.local` tapi untuk versi online.

1. Di Vercel, masuk ke project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan satu per satu:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL dari Supabase (langkah 3A) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dari Supabase (langkah 3B) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key dari Supabase (langkah 3B) |
| `NEXT_PUBLIC_BASE_URL` | URL Vercel Anda, misal `https://affiliate-rotator-xxx.vercel.app` |
| `IP_HASH_SALT` | Kata rahasia bebas, sama seperti di `.env.local` |

4. Setelah semua diisi → klik **Deployments** → klik **Redeploy** ✅

---

### 6D. Coba Akses Website

Buka URL Vercel Anda di browser, misal:
`https://affiliate-rotator-username.vercel.app/login`

Login → masuk dashboard → website sudah online! 🎉

---

## BAGIAN 7 — Cara Pakai di OBS

### 7A. Tambah Produk

1. Login ke dashboard → klik **Produk** → **Tambah Produk**
2. Isi nama produk, link affiliate, harga, gambar
3. Klik **Tambah Produk** ✅

### 7B. Buat Rotator

1. Klik **Rotator** → **Buat Rotator**
2. Isi nama, slug URL (contoh: `live-hari-ini`), pilih interval (berapa detik ganti produk)
3. Sesuaikan tema warna jika mau → klik **Buat Rotator**
4. Tambahkan produk ke rotator → urutkan dengan drag & drop

### 7C. Pasang di OBS

1. Buka OBS → di **Sources**, klik tombol **+**
2. Pilih **Browser**
3. Di kolom URL, isi:
   ```
   https://affiliate-rotator-username.vercel.app/obs/nama-rotator-anda
   ```
4. Width: **300** | Height: **200**
5. Centang **"Refresh browser when scene becomes active"**
6. Klik **OK** ✅

Sekarang QR code produk akan muncul dan berputar otomatis saat Anda live! 🎬

---

## ❓ Pertanyaan Umum

**Q: Apakah benar-benar gratis?**
> Ya! Supabase gratis hingga 500MB data & 50.000 baris. Vercel gratis untuk project personal. Cukup untuk ratusan produk dan ribuan klik.

**Q: Apakah perlu beli domain?**
> Tidak perlu. Vercel memberi domain gratis seperti `nama-project.vercel.app`. Tapi jika ingin domain sendiri (misal `toko-saya.com`), bisa dibeli di Niagahoster/Namecheap mulai Rp 15.000/tahun.

**Q: Bagaimana cara update website setelah ada perubahan?**
> Setiap kali Anda push ke GitHub, Vercel otomatis update sendiri!
> ```bash
> git add .
> git commit -m "update produk"
> git push
> ```

**Q: Bisakah dipakai untuk jualan produk sendiri (bukan affiliate)?**
> Bisa! Cukup isi **URL Affiliate** dengan link marketplace pribadi Anda.

**Q: QR code mengarah ke mana?**
> QR code mengarah ke halaman landing page di website Anda (misal `/p/nama-produk`), lalu dari sana penonton klik tombol **Beli** yang mengarah ke marketplace.

**Q: Apakah aman?**
> Ya. Dashboard dilindungi login. Website menggunakan HTTPS otomatis dari Vercel. Data tersimpan aman di Supabase.

---

## 🛠️ Struktur File Project

```
affiliate-rotator/
├── app/
│   ├── (auth)/login/         ← Halaman login
│   ├── (dashboard)/          ← Semua halaman dashboard (butuh login)
│   │   ├── dashboard/        ← Halaman utama & statistik ringkas
│   │   ├── products/         ← Tambah, edit, hapus produk
│   │   ├── rotator/          ← Kelola rotator & grup
│   │   └── analytics/        ← Grafik klik & top produk
│   └── (public)/             ← Halaman yang bisa diakses siapa saja
│       ├── p/[slug]/         ← Landing page produk
│       └── obs/[rotatorId]/  ← Overlay untuk OBS
├── components/               ← Komponen UI yang dipakai ulang
├── lib/                      ← Koneksi database & helper
├── types/                    ← Definisi tipe data
├── supabase/
│   ├── schema.sql            ← Struktur database (jalankan sekali)
│   ├── migration_v2.sql      ← Update database (jika sudah ada data lama)
│   └── setup_admin.sql       ← Panduan buat admin
├── middleware.ts              ← Proteksi halaman dashboard
├── vercel.json               ← Konfigurasi Vercel
├── DEPLOY.md                 ← Panduan deploy singkat
└── dev.js                    ← Script jalankan server (baca port dari .env.local)
```

---

## 📞 Butuh Bantuan?

Jika ada error atau pertanyaan, buka **Issues** di GitHub repository ini.

Sertakan:
1. Pesan error yang muncul (screenshot)
2. Langkah yang sedang Anda lakukan
3. OS yang Anda pakai (Windows/Mac/Linux)
