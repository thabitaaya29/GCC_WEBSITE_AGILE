# Struktur homepage

`src/pages/HomePage.tsx` merangkai HeroSection, AboutSection, dan ProgramsSection.
Semua section menerima props berdasarkan tipe `HomepageContent` dari kontrak
backend, yang kini tersedia di `shared/homepage.ts`. Backend juga memakai tipe
bersama tersebut, sehingga frontend tidak perlu mengimpor modul update/Node.

Route Discover saat ini memakai `src/data/homepage-draft.ts`, data lokal berlabel
draft yang sengaja dipisahkan dari API. Belum ada fetch Supabase. Jangan memakai
draft ini untuk menyamarkan request API yang gagal saat integrasi berikutnya.

ProgramsSection sementara menampilkan journey Learn/Apply/Grow sesuai kontrak v1,
bukan detail Growthcamp/GrowthX/GrowthConnect yang belum ada pada kontrak.
ProgramCard membagikan style CTA yang sudah tersedia. Anchor `#journey` dipakai
oleh CTA hero, dengan offset navbar sticky.

Lanjutan setelah draft dan data siap: CommunityGallery (foto asli), detail
program (kontrak konten tambahan), StartingPoint (tujuan CTA), dan TrackRecord
(angka yang diverifikasi). Navbar tetap dikelola App. Visual saat ini merupakan
kerangka responsive, belum reproduksi presisi PDF atau hasil QA browser.
