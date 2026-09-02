# 🏗️ Panduan Build Installer

Panduan lengkap membuat file `.exe` (Windows), `.dmg` (Mac), dan `.AppImage` (Linux).

Ada **dua varian** yang bisa dibuild dari project yang sama:

| Varian | Butuh Supabase? | Login? | Tracking klik? | QR mengarah ke |
|---|---|---|---|---|
| **Online** (`dist:win`, dst) | Ya | Ya | Ya (analytics) | `/p/slug` (landing page kita) |
| **Offline** (`dist:offline:win`, dst) | Tidak | Tidak | Tidak | Langsung ke link affiliate |

Fitur gambar produk, kecepatan rotasi, tema/warna, grup rotator, dan drag-reorder
**sama persis** di kedua varian. Bedanya cuma sumber data (Supabase vs file lokal)
dan tujuan QR.

---

## Prasyarat

### Install dependencies
```bash
npm install
```

### Siapkan ikon (WAJIB sebelum build)

Baca `electron/assets/README.md` untuk cara buat ikon.

File yang dibutuhkan:
- `electron/assets/icon.png`  — 512x512px
- `electron/assets/icon.ico`  — 256x256px (untuk Windows)
- `electron/assets/icon.icns` — 512x512px (untuk Mac)
- `electron/assets/tray.png`  — 32x32px

---

## Build Varian ONLINE (seperti sebelumnya, tidak berubah)

### Windows (.exe installer)
```bash
npm run dist:win
```
Output: `release/AffiliateRotator-Setup-1.0.0.exe`

### Mac (.dmg)
```bash
npm run dist:mac
```

### Linux (.AppImage)
```bash
npm run dist:linux
```

Saat pertama dibuka, aplikasi akan minta URL + API key Supabase seperti biasa.

---

## Build Varian OFFLINE (baru)

Perintahnya mirip, tinggal tambah `offline:` di tengah nama script.
Script ini otomatis: (1) menyalakan flag mode offline, (2) build, (3) bikin
installer, (4) mematikan lagi flag-nya — supaya build online berikutnya tidak
ikut kebawa.

### Windows (.exe installer)
```bash
npm run dist:offline:win
```
Output: `release/AffiliateRotator-Setup-1.0.0.exe` (timpa file yang sama —
disarankan build di folder terpisah atau ganti nama hasilnya secara manual
kalau mau simpan dua-duanya, lihat catatan di bawah).

### Mac (.dmg)
```bash
npm run dist:offline:mac
```

### Linux (.AppImage)
```bash
npm run dist:offline:linux
```

### Portable Windows (tanpa installer)
```bash
npm run dist:offline:portable
```

**Saat pertama dibuka:** aplikasi langsung jalan (tidak ada layar setup Supabase,
tidak ada login). Klik kanan ikon di system tray → **Buka Dashboard** untuk
mulai menambah produk & rotator. Semua data tersimpan otomatis di:
- Windows: `%APPDATA%/affiliate-rotator/offline-data.json`
- Mac: `~/Library/Application Support/affiliate-rotator/offline-data.json`
- Linux: `~/.config/affiliate-rotator/offline-data.json`

Gambar logo/watermark yang diupload lewat form tema rotator disimpan di folder
`offline-uploads` sejajar file di atas.

### Kenapa ada langkah "nyala-matiin flag" dan bukan toggle di dalam app?

Next.js membakar nilai env `NEXT_PUBLIC_*` ke dalam kode saat `next build` —
bukan saat aplikasi dijalankan. Jadi mode offline/online harus ditentukan
**sebelum** build, bukan lewat tombol di dalam app yang sudah jadi `.exe`.
Kalau mau ganti varian, build ulang dengan script yang sesuai.

### Menyimpan dua varian sekaligus

electron-builder menulis ke folder `release/` dengan nama yang sama untuk
kedua varian (nama app & versi sama). Supaya tidak saling timpa:
1. Build varian online dulu (`npm run dist:win`), lalu pindahkan/rename hasil
   di `release/` ke folder lain (mis. `release-online/`).
2. Baru build varian offline (`npm run dist:offline:win`).

Atau, kalau mau installer & nama file otomatis beda, ubah sementara
`productName` dan `artifactName` di `package.json` → `build` sebelum build
offline (mis. jadi `"Affiliate Rotator Offline"`).

---

## Build semua sekaligus (varian online)

```bash
npm run dist
```

---

## Cara Upload ke GitHub Releases

1. Push semua kode ke GitHub
2. Buka repo → klik **Releases** → **Create a new release**
3. Isi:
   - **Tag:** `v1.0.0`
   - **Title:** `Affiliate Rotator v1.0.0`
   - **Description:** (lihat template di bawah)
4. Upload file dari folder `release/`:
   - `AffiliateRotator-Setup-1.0.0.exe` (Windows, online)
   - `AffiliateRotator-1.0.0.dmg` (Mac, online)
   - `AffiliateRotator-1.0.0.AppImage` (Linux, online)
   - Hasil build offline (kalau ada, beri nama beda supaya jelas — lihat catatan di atas)
5. Klik **Publish release**

---

## Template Release Notes

```markdown
## 🎉 Affiliate Rotator v1.0.0

QR Rotator untuk OBS Livestreaming Affiliate — tersedia 2 varian!

### ✨ Fitur
- Double klik langsung jalan, tidak perlu install Node.js manual
- System tray: klik kanan untuk Start, Stop, buka Dashboard
- Splash screen saat loading
- Otomatis deteksi IP lokal untuk akses dari HP
- **Varian Online**: Supabase, login, analytics klik
- **Varian Offline**: tanpa internet, tanpa login, QR langsung ke link affiliate

### 📥 Download
| Platform | Online | Offline |
|----------|--------|---------|
| Windows 10/11 (64-bit) | `AffiliateRotator-Setup-1.0.0.exe` | `AffiliateRotator-Offline-Setup-1.0.0.exe` |
| macOS | `AffiliateRotator-1.0.0.dmg` | `AffiliateRotator-Offline-1.0.0.dmg` |
| Linux (64-bit) | `AffiliateRotator-1.0.0.AppImage` | `AffiliateRotator-Offline-1.0.0.AppImage` |

Butuh panduan lengkap? Baca [README](../README.md)
```

---

## Catatan Penting

- **Windows:** Build `.exe` hanya bisa dilakukan di Windows
- **Mac:** Build `.dmg` hanya bisa dilakukan di Mac (butuh code signing untuk distribusi luas)
- **Linux:** Bisa build di Linux atau pakai GitHub Actions
- Ukuran installer ±50-80MB karena include Node.js runtime
- Peringatan `"file ... .env.production.local does not exist"` saat build
  **varian online** aman diabaikan — file itu memang cuma dipakai varian offline.
- Varian offline **tidak** punya fitur Spotlight (highlight flash-sale sementara)
  dan Analytics — keduanya butuh Supabase realtime. Semua fitur lain
  (gambar produk, kecepatan rotasi, tema/warna, grup, drag-reorder) tetap jalan.

## Otomatis Build dengan GitHub Actions

Bisa dikonfigurasi agar GitHub otomatis build installer setiap ada release baru.
Lihat dokumentasi [electron-builder GitHub Actions](https://www.electron.build/configuration/publish).
