<div align="center">

# 📺 Affiliate Rotator

**Website affiliate dengan QR code rotator untuk OBS livestreaming**

Penonton scan QR → landing page produk → klik beli → komisi masuk 💰

[![Version](https://img.shields.io/badge/versi-1.0.1-blue)](https://github.com/noobiiefun/affiliate-rotator/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-gratis-green?logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-gratis-black?logo=vercel)](https://vercel.com)

</div>

---

## 🎯 Cara Kerja

```
[Live Streaming] → [OBS menampilkan QR + info produk] → [Penonton scan QR]
      → [Landing page produk muncul di HP] → [Klik "Beli"] → [Masuk marketplace]
```

---

## ✨ Fitur

| Fitur | Keterangan |
|-------|-----------|
| 🎬 **OBS Overlay** | Kartu produk + QR code berputar otomatis |
| 🛍️ **Landing Page** | Halaman produk rapi, mobile-friendly |
| 📸 **Multiple Gambar** | Upload banyak foto produk + galeri |
| 🎥 **Embed Video** | Tempel video YouTube di halaman produk |
| 🎨 **Tema Custom** | Warna, ukuran, posisi overlay bebas diatur |
| 📁 **Grup Rotator** | Kelompokkan rotator per event/kategori |
| 🔗 **Universal Link** | Support semua marketplace Indonesia |
| 📊 **Analytics** | Grafik klik harian, top produk, sumber klik |
| 🔐 **Login Admin** | Dashboard hanya bisa diakses Anda |
| 📱 **Responsive** | Tampil sempurna di HP maupun PC |

---

## 🗺️ Status Pengembangan

| Fase | Status | Isi |
|------|--------|-----|
| Phase 1 | ✅ | Setup project & database |
| Phase 2 | ✅ | Dashboard & manajemen produk |
| Phase 3 | ✅ | Rotator manager (drag & drop urutan) |
| Phase 4 | ✅ | OBS overlay + tema custom + grup rotator |
| Phase 5 | ✅ | Landing page (galeri foto, video embed) |
| Phase 6 | ✅ | Login admin + analytics dashboard |

---

# 🚀 PANDUAN INSTALASI

> **Untuk pemula:** Ikuti langkah demi langkah. Jangan dilewat satupun.
> Estimasi waktu: ±30 menit

---

## BAGIAN 1 — Daftar Akun Gratis

Anda butuh **3 akun**, semuanya gratis selamanya untuk skala personal.

### 🐙 1A. GitHub
> Tempat menyimpan kode program Anda di internet

1. Buka **[github.com](https://github.com)** → klik **Sign up**
2. Isi email, buat password, pilih username
3. Verifikasi email → selesai ✅

---

### 🟩 1B. Supabase
> Database gratis untuk menyimpan data produk, klik, dll

1. Buka **[supabase.com](https://supabase.com)** → klik **Start your project**
2. Pilih **Continue with GitHub** → izinkan akses
3. Klik **New Project**, isi:
   - **Name:** `affiliate-rotator`
   - **Database Password:** buat password kuat → **simpan di notepad!**
   - **Region:** `Southeast Asia (Singapore)`
4. Klik **Create new project** → tunggu ±2 menit ✅

---

### ▲ 1C. Vercel
> Hosting gratis agar website bisa diakses siapa saja via internet

1. Buka **[vercel.com](https://vercel.com)** → klik **Sign Up**
2. Pilih **Continue with GitHub** → izinkan akses ✅

---

## BAGIAN 2 — Install Software di Komputer

### 💚 Node.js (wajib)
1. Buka **[nodejs.org](https://nodejs.org)**
2. Download tombol hijau kiri berlabel **"LTS"**
3. Install → Next → Next → Finish

### 🔧 Git (wajib)
1. Buka **[git-scm.com](https://git-scm.com/downloads)**
2. Download → install → semua pilihan **biarkan default**

> Setelah install, buka **Command Prompt** dan cek:
> ```
> node --version   → harus muncul angka, misal v20.11.0
> git --version    → harus muncul angka, misal git version 2.43.0
> ```

---

## BAGIAN 3 — Download & Setup Project

Buka **Command Prompt** (Windows: `Win + R` → ketik `cmd` → Enter):

```bash
# 1. Masuk ke folder yang Anda inginkan
cd C:\Users\NamaAnda\Documents

# 2. Clone / download project
git clone https://github.com/noobiiefun/affiliate-rotator.git

# 3. Masuk ke folder project
cd affiliate-rotator

# 4. Install semua library (tunggu 2-5 menit)
npm install
```

---

## BAGIAN 4 — Ambil Credentials Supabase

### 4A. Project URL

1. Buka **[supabase.com](https://supabase.com)** → masuk ke project Anda
2. Sidebar kiri → klik ikon **⚙️ Settings**
3. Klik **General** → scroll ke bawah
4. Temukan **"Project URL"** → klik **Copy**

> Bentuknya: `https://abcdefghij.supabase.co`

---

### 4B. API Keys

1. Masih di Settings → klik **API Keys**
2. Klik tab **"Legacy anon, service_role API keys"**
3. Salin 2 nilai berikut:

| Yang dicari | Caranya |
|-------------|---------|
| **Anon Key** | Klik tombol copy di baris `anon` |
| **Service Role Key** | Klik **Reveal** di baris `service_role` → lalu copy |

> ⚠️ **Service Role Key** bersifat rahasia — jangan dibagikan ke siapapun!

---

## BAGIAN 5 — Buat File Konfigurasi

Di folder project (`C:\...\affiliate-rotator`), buat file bernama **`.env.local`**

**Cara buat di Windows:**
1. Buka folder project di File Explorer
2. Klik kanan area kosong → **New** → **Text Document**
3. Ganti nama menjadi `.env.local` (hapus `.txt`, termasuk titiknya)
4. Buka dengan **Notepad++** → isi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
IP_HASH_SALT=tulis-kata-rahasia-bebas-disini
```

Ganti setiap nilai dengan yang Anda salin dari Bagian 4. Simpan file.

> 💡 `IP_HASH_SALT` boleh diisi kata apa saja, misal: `rahasia-saya-2024`

---

## BAGIAN 6 — Setup Database

### 6A. Buat Tabel

1. Di Supabase → klik **SQL Editor** di sidebar kiri
2. Klik **New query**
3. Buka file `supabase/schema.sql` di folder project dengan Notepad++
4. **Ctrl+A** → **Ctrl+C** (copy semua)
5. Kembali ke Supabase SQL Editor → klik area editor → **Ctrl+V** (paste)
6. Klik tombol **Run** (kanan bawah)
7. Muncul `Success` → berhasil ✅

### 6B. Buat Akun Admin

1. Di Supabase → klik **Authentication** di sidebar kiri
2. Klik **Users** → **Add user** → **Create new user**
3. Isi email & password yang ingin Anda pakai untuk login
4. Klik **Create user** ✅

### 6C. Keamanan: Matikan Pendaftaran Umum

1. Masih di **Authentication** → klik **Settings**
2. Cari **"Enable email signup"** → **matikan** (toggle off)
3. Klik **Save** ✅

> Ini mencegah orang lain mendaftar sendiri ke dashboard Anda.

---

## BAGIAN 7 — Jalankan Aplikasi

Di Command Prompt (pastikan sudah di folder project):

```bash
npm run dev
```

Terminal akan menampilkan:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Affiliate Rotator — Dev Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💻 PC/Laptop  : http://localhost:3000
  📱 HP/Tablet  : http://192.168.1.xx:3000
  🎬 QR code akan pakai: http://192.168.1.xx:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Buka browser → **http://localhost:3000** → muncul halaman login → **berhasil!** 🎉

Login dengan email & password yang dibuat di Bagian 6B.

> 📱 **HP di jaringan WiFi yang sama** bisa langsung akses lewat IP yang muncul di terminal — QR code juga otomatis pakai IP ini!

---

## BAGIAN 8 — Deploy ke Internet (Vercel)

> Agar QR code bisa discan siapa saja (tidak hanya di WiFi yang sama), website harus online.

### 8A. Upload ke GitHub

```bash
git add .
git commit -m "setup awal"
git push
```

> Jika diminta login, masukkan username & password GitHub.

### 8B. Deploy di Vercel

1. Buka **[vercel.com](https://vercel.com)** → sudah login
2. Klik **Add New Project**
3. Pilih repo **affiliate-rotator** → klik **Import**
4. Biarkan semua default → klik **Deploy**
5. Tunggu ±2 menit → Vercel memberi URL seperti:
   `https://affiliate-rotator-xxx.vercel.app`

### 8C. Isi Environment Variables di Vercel

1. Di Vercel → masuk project → **Settings** → **Environment Variables**
2. Tambahkan satu per satu (klik **Add** setiap baris):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase |
| `NEXT_PUBLIC_BASE_URL` | `https://affiliate-rotator-xxx.vercel.app` |
| `IP_HASH_SALT` | Kata rahasia Anda (sama dengan di .env.local) |

3. Setelah semua diisi → **Deployments** → klik **Redeploy** ✅

### 8D. Coba Akses

Buka URL Vercel di browser HP atau PC — website sudah bisa diakses dari mana saja!

---

## BAGIAN 9 — Cara Pakai Sehari-hari

### 9A. Tambah Produk

1. Login dashboard → **Produk** → **Tambah Produk**
2. Isi nama, pilih marketplace, paste link affiliate
3. Upload beberapa URL gambar produk (klik **+ Tambah Gambar** untuk foto ke-2, dst)
4. Paste URL video YouTube jika ada (opsional)
5. Klik **Tambah Produk** ✅

> 💡 **Cara dapat URL gambar:** Buka produk di Shopee/Tokopedia → klik kanan foto → "Salin alamat gambar"

### 9B. Buat Rotator

1. **Rotator** → **Buat Rotator**
2. Isi nama & slug URL (misal: `live-hari-ini` → URL jadi `/obs/live-hari-ini`)
3. Atur interval (berapa detik tiap produk tampil)
4. Tab **Tema**: atur warna, ukuran, posisi sesuai selera
5. Klik **Buat Rotator** → tambahkan produk → atur urutan dengan drag & drop ✅

### 9C. Pasang di OBS

1. OBS → **Sources** → klik **+** → pilih **Browser**
2. Isi URL:
   ```
   https://domain-anda.vercel.app/obs/slug-rotator-anda
   ```
3. Width: `300` | Height: `220`
4. Centang **"Refresh browser when scene becomes active"**
5. Klik **OK** ✅

QR code berputar otomatis sesuai interval yang Anda set! 🎬

---

## BAGIAN 10 — Mengubah Port (Opsional)

Port diatur dari `NEXT_PUBLIC_BASE_URL` di `.env.local`:

```env
# Pakai port 9780
NEXT_PUBLIC_BASE_URL=http://localhost:9780
```

Cukup ubah angkanya → jalankan `npm run dev` → port otomatis ikut.

---

## ❓ Pertanyaan Umum

<details>
<summary><b>Apakah benar-benar gratis?</b></summary>

Ya! Supabase gratis hingga 500MB & 50.000 baris. Vercel gratis untuk project personal.
Cukup untuk ratusan produk dan ribuan klik per bulan.
</details>

<details>
<summary><b>Apakah perlu beli domain?</b></summary>

Tidak perlu. Vercel memberi domain gratis seperti `nama.vercel.app`.
Tapi kalau ingin domain sendiri (misal `toko-saya.com`), bisa beli mulai Rp15.000/tahun di Niagahoster atau Namecheap, lalu sambungkan ke Vercel di Settings → Domains.
</details>

<details>
<summary><b>Bagaimana cara update setelah ada perubahan?</b></summary>

Setiap push ke GitHub, Vercel otomatis update sendiri:
```bash
git add .
git commit -m "update"
git push
```
</details>

<details>
<summary><b>Bisa untuk jualan produk sendiri (bukan affiliate)?</b></summary>

Bisa! Isi **URL Affiliate** dengan link toko Anda di marketplace, atau link WhatsApp, atau apapun.
</details>

<details>
<summary><b>QR code mengarah ke mana?</b></summary>

QR → halaman landing page di website Anda (`/p/nama-produk`) → penonton klik tombol "Beli" → diarahkan ke marketplace.
</details>

<details>
<summary><b>HP tidak bisa scan QR saat development lokal?</b></summary>

Pastikan HP dan PC tersambung WiFi yang sama. URL di terminal saat `npm run dev` sudah otomatis pakai IP lokal — gunakan URL tersebut.
</details>

<details>
<summary><b>Error "relation already exists" saat jalankan schema.sql?</b></summary>

Tabel sudah ada. Jalankan `supabase/migration_v2.sql` atau `migration_v3.sql` saja (bukan schema.sql) untuk update database yang sudah ada datanya.
</details>

---

## 🛠️ Struktur Project

```
affiliate-rotator/
├── app/
│   ├── (auth)/
│   │   └── login/              ← Halaman login admin
│   ├── (dashboard)/            ← Area dashboard (butuh login)
│   │   ├── dashboard/          ← Halaman utama & statistik
│   │   ├── products/           ← Tambah/edit/hapus produk
│   │   ├── rotator/            ← Kelola rotator & grup
│   │   └── analytics/          ← Grafik klik & top produk
│   └── (public)/               ← Halaman publik (tanpa login)
│       ├── p/[slug]/           ← Landing page produk
│       └── obs/[rotatorId]/    ← Overlay untuk OBS
├── components/
│   └── dashboard/
│       ├── ProductForm.tsx     ← Form produk (gambar banyak, video)
│       └── RotatorForm.tsx     ← Form rotator + tema editor
├── lib/
│   ├── supabase.ts             ← Client database (publik)
│   ├── supabase-server.ts      ← Client database (server)
│   ├── supabase-auth.ts        ← Client auth (browser)
│   ├── supabase-middleware.ts  ← Client auth (middleware)
│   └── utils.ts                ← Fungsi helper
├── types/index.ts              ← Definisi tipe data TypeScript
├── supabase/
│   ├── schema.sql              ← Struktur database (fresh install)
│   ├── migration_v2.sql        ← Update: slug & tema rotator
│   ├── migration_v3.sql        ← Update: multiple gambar & video
│   └── setup_admin.sql         ← Panduan buat akun admin
├── middleware.ts               ← Proteksi halaman dashboard
├── dev.js                      ← Dev server (auto-detect IP lokal)
├── vercel.json                 ← Config keamanan Vercel
└── DEPLOY.md                   ← Panduan deploy singkat
```

---

## 🔐 Keamanan

- ✅ HTTPS otomatis via Vercel
- ✅ Dashboard dilindungi login (Supabase Auth)
- ✅ Row Level Security di database
- ✅ Security headers (XSS, clickjacking, dll)
- ✅ OBS overlay boleh di-iframe, halaman lain tidak
- ✅ File `.env.local` tidak ikut ke GitHub (ada di `.gitignore`)

---

## 📞 Butuh Bantuan?

Buka **Issues** di halaman GitHub repository ini dan sertakan:
1. Screenshot error yang muncul
2. Langkah yang sedang dilakukan
3. OS yang dipakai (Windows 10/11, Mac, Linux)

---

<div align="center">
  <p>Dibuat dengan ❤️ menggunakan Next.js + Supabase + Vercel</p>
  <p><b>Semua gratis. Langsung pakai. Selamat streaming! 🎬</b></p>
</div>
