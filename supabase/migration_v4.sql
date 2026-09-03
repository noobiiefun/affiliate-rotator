-- migration_v4.sql
-- Fitur: Siklus Otomatis Mati/Nyala rotator + Label Badge custom.
-- Jalankan ini di Supabase → SQL Editor (sekali saja, aman dijalankan berkali-kali).
-- Hanya diperlukan untuk MODE ONLINE — mode offline tidak butuh migration ini
-- (data lokalnya otomatis dapat kolom baru begitu aplikasi di-update).

ALTER TABLE rotators
  ADD COLUMN IF NOT EXISTS cycle_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cycle_on_min  integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS cycle_off_min integer NOT NULL DEFAULT 10;

-- badge_label disimpan di dalam kolom theme_config (jsonb) yang sudah ada,
-- jadi tidak perlu kolom baru. Baris ini cuma mengisi default untuk rotator
-- LAMA yang dibuat sebelum fitur ini ada (rotator baru otomatis dapat default
-- dari aplikasi):
UPDATE rotators
SET theme_config = theme_config || '{"badge_label": "PROMO SEKARANG"}'::jsonb
WHERE theme_config IS NOT NULL AND NOT (theme_config ? 'badge_label');
