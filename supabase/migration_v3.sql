-- ============================================================
-- MIGRATION v3 — Multiple Gambar & Video
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Tambah kolom images (array URL gambar) dan video_url ke products
alter table products
  add column if not exists images    jsonb default '[]'::jsonb,
  add column if not exists video_url text;

-- Isi kolom images dari image_url yang sudah ada (agar tidak hilang)
update products
set images = jsonb_build_array(image_url)
where image_url is not null
  and (images is null or images = '[]'::jsonb);

select 'Migration v3 selesai! ✅' as status;
