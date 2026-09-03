# 📴 Panduan Pasang "Mode Offline" — Affiliate Rotator

Paket ini menambahkan **Mode Offline** ke project kamu tanpa mengubah/menghapus
mode online yang sudah ada. Semua fitur (gambar produk, kecepatan rotasi, tema,
grup, drag-reorder) tetap sama persis di kedua mode.

## Update terbaru: Siklus Otomatis Mati/Nyala + Label Badge Custom

Dua fitur baru ini jalan sama persis di mode **online maupun offline** (dihitung
murni dari waktu, tidak ada perbedaan implementasi antar mode):

1. **Siklus Otomatis Mati/Nyala** (di tab "Pengaturan Dasar" saat edit rotator):
   toggle "Siklus Otomatis Mati" + dua input menit — "Tampil selama (menit)"
   dan "Mati selama (menit)". Kalau aktif, overlay OBS otomatis kosong total
   selama periode "mati", lalu muncul lagi sendiri sesuai jadwal, berulang
   terus selama live berjalan. Tidak perlu direstart manual.
2. **Label Badge Custom** (di tab "Tema & Tampilan"): teks "PROMO SEKARANG"
   yang tampil di atas nama produk sekarang bisa diganti bebas, misal
   "HARGA SPESIAL", "KHUSUS HARI INI", dll — per rotator.

**Kalau kamu pakai mode online (Supabase):** jalankan
`supabase/migration_v4.sql` di Supabase → SQL Editor (sekali saja) supaya
kolom `cycle_enabled`, `cycle_on_min`, `cycle_off_min` tersedia di tabel
`rotators`. Mode offline tidak perlu langkah ini — otomatis jalan setelah
patch di-pasang.

## Apa yang berubah, singkatnya

| Sebelum | Sesudah (Mode Offline) |
|---|---|
| Wajib isi Supabase URL + API key saat pertama buka | Langsung jalan, tanpa setup apapun |
| Wajib login sebelum ke dashboard | Tidak ada login sama sekali |
| QR di overlay OBS → `/p/slug` (landing page kita) → redirect ke affiliate | QR langsung berisi link affiliate — HP penonton langsung ke marketplace |
| Setiap klik QR tercatat ke tabel `click_events` | Tidak ada tracking klik sama sekali |
| Data produk/rotator di Supabase (cloud) | Data disimpan di file lokal di komputer kamu |
| Halaman Analytics aktif | Halaman Analytics disembunyikan (butuh Supabase) |
| Fitur Spotlight (flash-sale highlight sementara) aktif | Spotlight dinonaktifkan — fitur ini butuh Supabase realtime, di luar scope offline. Rotasi normal, tema, & kecepatan tetap jalan seperti biasa. |

## Cara pasang

1. **Backup dulu** project kamu (atau kerjakan di branch baru), untuk jaga-jaga.
2. Extract isi zip ini **langsung ke root project**, timpa file yang sama
   namanya. Struktur foldernya sudah persis sama dengan project kamu, jadi
   tinggal:
   ```bash
   unzip offline-mode-patch.zip -d /path/ke/project/affiliate-rotator
   ```
3. Jalankan `npm install` (untuk jaga-jaga kalau ada dependency yang perlu
   di-refresh — sebenarnya tidak ada dependency baru yang ditambahkan).
4. **Penting soal testing lokal (`npm run dev`):** Next.js hanya membaca file
   `.env.production.local` saat **build** (`next build`), bukan saat `next dev`.
   Jadi untuk coba Mode Offline dengan dev server, jangan pakai
   `.env.production.local` — pakai:
   ```bash
   npm run dev:offline   # otomatis set flag di .env.local lalu jalankan dev server
   ```
   Untuk balik ke mode online saat dev: `npm run dev:online`. Kalau server
   dev sedang berjalan, tetap perlu di-restart penuh (bukan hot-reload) —
   env variable baru cuma kebaca saat server start ulang.
5. Coba dulu di mode **online** biasa (`npm run dev:online`, isi Supabase
   seperti biasa) — pastikan semuanya masih jalan normal seperti sebelumnya.
   Ini penting untuk memastikan patch tidak merusak apapun.
6. Coba mode **offline**: `npm run dev:offline`, lalu buka
   `http://localhost:3000/dashboard` — harusnya langsung masuk tanpa login,
   dan menu Analytics tidak muncul.
7. Kalau sudah oke, build jadi `.exe` (build pakai flag yang berbeda,
   `.env.production.local`, sudah otomatis lewat script):
   ```bash
   npm run dist:offline:win
   ```
   Detail lengkap ada di `BUILD.md`.
6. Kalau sudah oke, build jadi `.exe`:
   ```bash
   npm run dist:offline:win
   ```
   Detail lengkap ada di `BUILD.md` (sudah diupdate, termasuk penjelasan
   kenapa mode ini ditentukan saat build, bukan lewat toggle di dalam app).

## Daftar file yang baru ditambahkan

```
lib/offline-db.ts                                  ← "database" lokal (file JSON)
lib/data.ts                                         ← lapisan data terpadu (online/offline)
app/api/local/products/route.ts
app/api/local/products/[id]/route.ts
app/api/local/groups/route.ts
app/api/local/groups/[id]/route.ts
app/api/local/rotators/route.ts
app/api/local/rotators/[id]/route.ts
app/api/local/rotator-items/route.ts
app/api/local/rotator-items/[id]/route.ts
app/api/local/rotator-items/reorder/route.ts
app/api/local/rotator-lookup/[idOrSlug]/route.ts    ← dipakai overlay OBS
app/api/local/upload/route.ts                       ← upload logo lokal
app/api/local/uploads/[...file]/route.ts            ← serve file yang diupload
app/api/local/stats/route.ts
scripts/set-mode.js                                 ← helper nyala/matiin flag sebelum build (.env.production.local)
scripts/set-dev-mode.js                              ← helper sama untuk `npm run dev` (.env.local)
.env.production.local.example
```

## Daftar file yang DIUBAH (bukan file baru)

```
lib/supabase.ts                    ← fallback dummy, tidak crash saat env kosong
lib/supabase-auth.ts               ← idem
lib/supabase-server.ts             ← idem
lib/supabase-middleware.ts         ← idem
middleware.ts                      ← skip auth check kalau OFFLINE
package.json                       ← +4 script dist:offline:*
BUILD.md                           ← dokumentasi varian offline

app/(dashboard)/layout.tsx                       ← sembunyikan Analytics+logout saat offline
app/(dashboard)/dashboard/page.tsx               ← stats dari lib/offline-db saat offline
app/(dashboard)/products/page.tsx                ← pakai lib/data.ts
app/(dashboard)/products/[id]/edit/page.tsx      ← pakai lib/offline-db saat offline
app/(dashboard)/rotator/page.tsx                 ← pakai lib/data.ts
app/(dashboard)/rotator/[id]/page.tsx            ← pakai lib/data.ts
app/(dashboard)/rotator/[id]/edit/page.tsx       ← pakai lib/offline-db saat offline
app/(dashboard)/rotator/[id]/spotlight/page.tsx  ← guard "tidak tersedia offline"
app/(dashboard)/rotator/groups/new/page.tsx      ← pakai lib/data.ts
app/(dashboard)/analytics/page.tsx               ← guard "tidak tersedia offline"
app/(public)/obs/[rotatorId]/page.tsx            ← QR → affiliate_url, no tracking

components/dashboard/ProductForm.tsx             ← pakai lib/data.ts
components/dashboard/RotatorForm.tsx             ← pakai lib/data.ts (termasuk upload logo)

electron/main.js                   ← deteksi build offline, skip Supabase/login
electron/preload.js                ← +getMode, +resetOfflineData
electron/setup.html                ← form berbeda untuk mode offline
```

Tidak ada file yang **dihapus** — mode online lama tetap 100% utuh dan bisa
dipakai kapan saja, tinggal build tanpa flag offline.

## Keterbatasan yang perlu kamu tahu

1. **Fitur Spotlight (highlight flash-sale sementara) tidak tersedia di mode
   offline.** Ini fitur yang paling kompleks (butuh event scheduling
   real-time) dan saya sengaja skip supaya sisanya bisa selesai dengan aman
   dan teruji baik. Kalau nanti butuh, ini bisa ditambahkan menyusul dengan
   pola yang sama seperti rotator_items (file JSON + API route) — tinggal bilang.
2. **Gambar produk tetap berupa URL eksternal** (dari Shopee/Tokopedia dsb,
   seperti sebelumnya) — bukan file upload. Jadi untuk gambar itu tetap
   butuh internet supaya muncul, tapi itu terpisah dari "app-mu butuh
   internet atau tidak" — appnya sendiri (Next.js server + data) 100% jalan
   tanpa internet. Yang butuh internet cuma load gambar dari CDN marketplace,
   dan tentu saja HP penonton saat scan (karena tujuan akhirnya memang
   marketplace).
3. Saya belum bisa menjalankan `next build` yang sesungguhnya di sini (tidak
   ada akses `npm install` di sandbox saya), jadi saya sudah cek manual
   semua import & pemanggilan fungsi berkali-kali, tapi tetap **coba dulu
   `npm run dev` / `npm run build` di komputer kamu sebelum build jadi
   `.exe`**, siapa tahu ada typo kecil yang lolos.
