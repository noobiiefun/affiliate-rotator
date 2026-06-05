# 🏗️ Panduan Build Installer

Panduan lengkap membuat file `.exe` (Windows), `.dmg` (Mac), dan `.AppImage` (Linux).

---

## Prasyarat

### Install electron-builder
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

## Build untuk Windows (.exe installer)

Jalankan di komputer **Windows**:

```bash
npm run dist:win
```

Output: `release/AffiliateRotator-Setup-1.0.0.exe`

---

## Build untuk Mac (.dmg)

Jalankan di komputer **Mac**:

```bash
npm run dist:mac
```

Output: `release/AffiliateRotator-1.0.0.dmg`

---

## Build untuk Linux (.AppImage)

Jalankan di komputer **Linux**:

```bash
npm run dist:linux
```

Output: `release/AffiliateRotator-1.0.0.AppImage`

---

## Build semua sekaligus

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
   - `AffiliateRotator-Setup-1.0.0.exe` (Windows)
   - `AffiliateRotator-1.0.0.dmg` (Mac)
   - `AffiliateRotator-1.0.0.AppImage` (Linux)
5. Klik **Publish release**

---

## Template Release Notes

```markdown
## 🎉 Affiliate Rotator v1.0.0

QR Rotator untuk OBS Livestreaming Affiliate — versi pertama!

### ✨ Fitur
- Double klik langsung jalan, tidak perlu install Node.js manual
- System tray: klik kanan untuk Start, Stop, buka Dashboard
- Splash screen saat loading
- Form pengaturan Supabase yang mudah
- Otomatis deteksi IP lokal untuk akses dari HP

### 📥 Download
| Platform | File |
|----------|------|
| Windows 10/11 (64-bit) | `AffiliateRotator-Setup-1.0.0.exe` |
| macOS (Intel + Apple Silicon) | `AffiliateRotator-1.0.0.dmg` |
| Linux (64-bit) | `AffiliateRotator-1.0.0.AppImage` |

### ⚙️ Setup Setelah Install
1. Buka aplikasi → isi Supabase URL & API keys
2. Klik "Simpan & Mulai"
3. Browser otomatis terbuka ke dashboard

Butuh panduan lengkap? Baca [README](../README.md)
```

---

## Catatan Penting

- **Windows:** Build `.exe` hanya bisa dilakukan di Windows
- **Mac:** Build `.dmg` hanya bisa dilakukan di Mac (butuh code signing untuk distribusi luas)
- **Linux:** Bisa build di Linux atau pakai GitHub Actions
- Ukuran installer ±50-80MB karena include Node.js runtime

## Otomatis Build dengan GitHub Actions

Bisa dikonfigurasi agar GitHub otomatis build installer setiap ada release baru.
Lihat dokumentasi [electron-builder GitHub Actions](https://www.electron.build/configuration/publish).
