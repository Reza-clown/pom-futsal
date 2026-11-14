# POM Futsal

Website POM Futsal, dibangun dengan React, Vite, dan Supabase.

## Menjalankan secara lokal

1. Pasang dependensi:

   ```sh
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi URL proyek Supabase dan publishable/anon key dari **Project Settings → API**.
3. Jalankan server pengembangan:

   ```sh
   npm run dev
   ```

## Deploy ke Vercel

1. Impor repository ini ke Vercel dan pilih framework **Vite**.
2. Gunakan pengaturan build berikut:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install` (atau biarkan Vercel mendeteksi package manager)
3. Di **Project Settings → Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   Isi dengan kredensial proyek Supabase yang sesuai dan aktifkan untuk environment Vercel yang akan digunakan. Setelah mengubah variabel, buat deployment baru.
4. `vercel.json` mengarahkan permintaan halaman ke aplikasi SPA, sehingga URL seperti `/admin/login` dapat dimuat langsung.

Variabel dengan awalan `VITE_` tersedia di browser. Gunakan hanya URL Supabase dan publishable/anon key; **jangan** menaruh `service_role` key atau rahasia server di variabel tersebut.

## Pemeriksaan Supabase sebelum rilis

Repository ini tidak menyertakan migrasi atau skema SQL. Sebelum deploy, pastikan proyek Supabase target sudah disiapkan dan kebijakannya sesuai:

- Tabel `profiles`, `teams`, dan `matches` beserta kolom serta relasi yang dipakai aplikasi tersedia.
- Akun admin memiliki profil dengan role `admin`; akses tulis dibatasi ke admin melalui Row Level Security (RLS).
- Pembacaan data publik dibatasi pada data yang memang boleh ditampilkan.
- Supabase Realtime diaktifkan untuk tabel `matches` bila fitur skor langsung diperlukan.
- URL situs produksi dicantumkan di pengaturan Supabase Auth yang sesuai.

## Pemeriksaan lokal

```sh
npm run lint
npm run build
```
