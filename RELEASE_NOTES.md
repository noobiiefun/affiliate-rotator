# 📺 Affiliate Rotator v1.0.1

QR Rotator untuk OBS Livestreaming Affiliate — tampilkan produk + QR code yang berputar otomatis di layar streaming Anda.

---

## 🆕 Perubahan di v1.0.1

- ✅ Fix error `ENOENT .env.local` saat install di PC baru
- ✅ Tombol **Test Koneksi** di pengaturan untuk cek Supabase sebelum mulai
- ✅ Info path tersimpan ditampilkan di jendela pengaturan
- ✅ Installer kompatibel 64-bit dan 32-bit
- ✅ Versi Portable tersedia (tidak perlu install)
- ✅ File database SQL ikut di dalam installer

---

## 📥 Pilih File yang Sesuai

| File | Untuk Siapa | Ukuran |
|------|-------------|--------|
| `AffiliateRotator-Setup-1.0.1-x64.exe` | Windows 10/11 64-bit *(mayoritas PC)* | ~80MB |
| `AffiliateRotator-Setup-1.0.1-ia32.exe` | Windows 32-bit / PC lama | ~75MB |
| `AffiliateRotator-Portable-1.0.1.exe` | Tidak mau install, langsung pakai | ~80MB |

> **Tidak tahu versi Windows Anda?**
> Tekan `Win + R` → ketik `msinfo32` → lihat "System Type"
> - `x64-based` → pakai versi x64
> - `x86-based` → pakai versi ia32

---

## ⚠️ Peringatan Windows SmartScreen

Saat pertama install, Windows mungkin menampilkan:
> *"Windows protected your PC"*

Ini **normal** karena installer belum punya sertifikat berbayar. Kode sepenuhnya open source dan bisa dicek di repository ini.

**Cara lanjutkan:** Klik **"More info"** → Klik **"Run anyway"**

---

## 🚀 Panduan Setup Lengkap

> ⚡ **Penting:** Aplikasi ini membutuhkan website online (Vercel) agar QR code bisa discan penonton saat live streaming. Localhost **tidak bisa** diakses orang lain.

### LANGKAH 1 — Siapkan Akun (Gratis)

Daftar di 3 layanan berikut sebelum install:

| Layanan | Fungsi | Link |
|---------|--------|------|
| **GitHub** | Simpan kode | [github.com](https://github.com) |
| **Supabase** | Database gratis | [supabase.com](https://supabase.com) |
| **Vercel** | Hosting gratis | [vercel.com](https://vercel.com) |

---

### LANGKAH 2 — Setup Database Supabase

1. Login ke **[supabase.com](https://supabase.com)**
2. Buat project baru → region **Southeast Asia (Singapore)**
3. Buka **SQL Editor** → **New query**
4. Copy-paste isi file `schema.sql` dari repository ini → klik **Run**
5. Buka **Authentication → Users → Add user** → buat email & password admin

> File `schema.sql` ada di: `supabase/schema.sql` di repository ini

---

### LANGKAH 3 — Deploy Website ke Vercel

> **Mengapa wajib?** QR code di OBS harus mengarah ke URL yang bisa diakses internet, bukan localhost.

1. **Fork** repository ini ke akun GitHub Anda
   - Klik tombol **Fork** di pojok kanan atas halaman repository
2. Buka **[vercel.com](https://vercel.com)** → login dengan GitHub
3. Klik **"Add New Project"** → pilih repo hasil fork → **Import**
4. Klik **Deploy** (biarkan default)
5. Setelah deploy, buka **Settings → Environment Variables** → tambahkan:

| Key | Value | Cara dapat |
|-----|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → General |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase → API Keys → anon |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase → API Keys → service_role |
| `NEXT_PUBLIC_BASE_URL` | `https://nama-anda.vercel.app` | URL dari Vercel setelah deploy |
| `IP_HASH_SALT` | kata rahasia bebas | Tulis sembarang |

6. Klik **Redeploy** setelah isi semua env vars
7. Buka `https://nama-anda.vercel.app/login` → login dengan akun admin Supabase ✅

---

### LANGKAH 4 — Install Aplikasi Desktop

1. Download file `.exe` sesuai Windows Anda (lihat tabel di atas)
2. Double klik → ikuti wizard instalasi
3. Buka aplikasi → jendela **Pengaturan** muncul
4. Isi credentials Supabase:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: dari Supabase API Keys
   - **Service Role Key**: dari Supabase API Keys (klik Reveal dulu)
5. Klik **🔌 Test Koneksi** untuk verifikasi
6. Klik **💾 Simpan & Mulai**
7. Browser otomatis terbuka ke dashboard ✅

---

### LANGKAH 5 — Tambah Produk & Buat Rotator

1. Dashboard → **Produk** → **Tambah Produk**
   - Isi nama, pilih marketplace, paste link affiliate
   - Upload URL gambar produk (bisa lebih dari 1)
   - Opsional: URL video YouTube
2. Dashboard → **Rotator** → **Buat Rotator**
   - Isi nama & **slug URL** (misal: `live-hari-ini`)
   - Atur interval (berapa detik tiap produk tampil)
   - Kustomisasi tema warna sesuai selera
   - Tambahkan produk ke rotator → atur urutan

---

### LANGKAH 6 — Pasang di OBS

1. Buka **OBS** → Sources → klik **+** → pilih **Browser**
2. Isi URL:
   ```
   https://nama-anda.vercel.app/obs/slug-rotator-anda
   ```
3. Width: `300` | Height: `220`
4. Centang **"Refresh browser when scene becomes active"**
5. Klik **OK** ✅

QR code berputar otomatis! Penonton scan → landing page produk → klik Beli → marketplace.

---

## 🖥️ Fitur Aplikasi Desktop

| Fitur | Keterangan |
|-------|-----------|
| **System Tray** | Ikon di taskbar — klik kanan untuk Start/Stop/Dashboard |
| **Splash Screen** | Animasi loading saat server dinyalakan |
| **Auto-detect IP** | IP lokal terdeteksi otomatis untuk akses dari HP (via WiFi) |
| **Test Koneksi** | Cek Supabase credentials sebelum simpan |
| **Persistent Config** | Konfigurasi tersimpan, tidak perlu isi ulang setiap buka |

---

## ❓ Troubleshooting

**Server tidak mau start:**
- Pastikan credentials Supabase sudah benar (gunakan Test Koneksi)
- Coba ganti port di pengaturan (misal dari 3000 ke 3001)

**QR code tidak bisa discan dari HP penonton:**
- Pastikan sudah deploy ke Vercel — localhost tidak bisa diakses internet
- Cek `NEXT_PUBLIC_BASE_URL` di Vercel sudah diisi URL Vercel Anda

**Antivirus memblokir installer:**
- Tambahkan exception/whitelist untuk file installer
- Kode open source dan bisa diaudit di repository ini

**Muncul "Windows protected your PC":**
- Klik **More info** → **Run anyway**

---

## 📖 Dokumentasi Lengkap

Lihat [README.md](https://github.com/noobiiefun/affiliate-rotator/blob/main/README.md) untuk panduan lengkap termasuk cara setup dari source code.

---

## 📋 Versi Project vs Installer

| | Versi Project (Source Code) | Versi Installer |
|-|----------------------------|-----------------|
| **Untuk siapa** | Developer / pengguna teknis | Semua orang |
| **Cara pakai** | Clone GitHub + `npm install` | Double klik .exe |
| **Butuh Node.js** | Ya | Tidak (sudah dibundle) |
| **Update** | `git pull` | Download installer baru |
| **Kustomisasi** | Bisa ubah kode | Tidak bisa |
| **Cocok untuk** | Yang mau modifikasi | Yang mau langsung pakai |

> 💡 **Rekomendasi:** Gunakan **installer** jika hanya ingin pakai. Gunakan **source code** jika ingin kustomisasi tampilan atau fitur.
