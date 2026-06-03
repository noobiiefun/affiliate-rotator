-- ============================================================
-- SETUP AKUN ADMIN
-- Jalankan di Supabase SQL Editor SETELAH schema.sql
-- ============================================================

-- Cara 1: Buat user lewat Supabase Dashboard (DIREKOMENDASIKAN)
-- Authentication → Users → Add user
-- Isi email dan password yang kuat
-- ✅ Tidak perlu jalankan SQL apapun

-- ============================================================
-- Cara 2: Buat user lewat SQL (jika perlu)
-- Ganti email dan password sesuai keinginan
-- ============================================================

-- Catatan: Supabase mengelola password secara terenkripsi
-- Gunakan Supabase Dashboard untuk buat user, lebih aman

-- Setelah buat user, coba login di:
-- http://localhost:9780/login (development)
-- https://domain-anda.vercel.app/login (production)

-- ============================================================
-- KEAMANAN TAMBAHAN (Opsional)
-- Batasi signup hanya dari dashboard (tidak ada form register publik)
-- ============================================================

-- Di Supabase: Authentication → Settings
-- Matikan "Enable email confirmations" jika tidak pakai email konfirmasi
-- Matikan "Enable email signup" untuk cegah orang lain daftar sendiri
