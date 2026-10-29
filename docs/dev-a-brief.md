# Brief Developer A — Homepage Discover

## Target

Bangun homepage yang membantu mahasiswa memahami value GCC dan menemukan titik awal Learn → Apply → Grow. Fokus Sprint 1: Discover yang bisa diklik dan terhubung ke preview. Tidak mencakup registrasi, backend, atau detail program penuh.

Foundation B mencakup navbar desktop/mobile, routing, preview, token brand, aset, dan Button. Backend dari `feature/homepage-content-backend` sudah digabungkan ke `feature/navigation`. Sinkronkan dengan B untuk commit/PR foundation terbaru sebelum mengerjakan integrasi; perubahan lokal belum otomatis tersedia di checkout A.

## Kontrak backend yang sudah tersedia

Baca [backend/README.md](../backend/README.md) dan `backend/homepage.example.json`. Data API menyediakan dokumen `home` dengan `schemaVersion: 1`, `contentStatus`, `notice`, `hero`, `about`, dan `journey`. Respons berupa array satu record dengan field `content`. Hero memiliki CTA Explore GCC ke `#journey`; journey berisi tiga item berurutan Learn/Apply/Grow dengan route yang sama seperti tabel di bawah.

Backend belum tersambung ke frontend. Koordinasikan fetch/data layer dengan B; komponen A sebaiknya menerima data lewat props sesuai field kontrak. Tampilkan notice secara jelas saat `contentStatus === "example"`, render string sebagai teks React, dan siapkan loading, error/retry, serta kondisi konten belum tersedia. Jangan menggunakan secret key di browser. Contoh konfigurasi publik ada di `backend/frontend.env.example`.

## Scope A

Buat:

```text
src/components/home/HeroSection.tsx
src/components/home/AboutSection.tsx
src/components/home/JourneySection.tsx
src/pages/HomePage.tsx
```

- Hero: identitas GCC, value utama untuk mahasiswa, CTA Explore GCC.
- About: manfaat mahasiswa, consulting exposure, hubungan learning dengan praktik. Review akurasi copy dengan PO.
- Journey: ringkasan Learn/Apply/Grow dan link preview masing-masing.
- HomePage: merangkai section dalam satu `<main>`, satu `h1`, dan hierarki heading yang logis. Gunakan default export.

Navbar sudah dipasang di App; jangan ditambahkan lagi di HomePage. Footer masih kosong dan belum menjadi dependency homepage. Card reusable dibuat jika ada pola berulang; hindari file komponen kosong.

## Kontrak navigasi untuk integrasi

| Elemen | Tujuan |
| --- | --- |
| Logo / Discover | `/` |
| Explore GCC | `#journey` di homepage |
| Learn | `/learn` |
| Apply | `/apply` |
| Grow | `/grow` |

Gunakan `id="journey"` pada JourneySection, dengan `scroll-mt-28` atau offset yang cukup agar heading tidak tertutup navbar sticky. Target ini belum ada di placeholder sekarang; merupakan kontrak handoff untuk implementasi A.

Route internal memakai `Link` dari `react-router`. Anchor homepage memakai `<a href="#journey">`. Label harus konsisten dengan `src/data/navigation.ts`. Jangan memakai `href="#"`, tombol tanpa aksi, atau link registrasi yang belum tersedia. Learn/Apply/Grow tetap preview Coming Soon.

## Desain dan aset

Acuan: [design.md](./design.md), implementasi token di `src/styles/global.css`.

- Warna: `bg-brand-red`, `text-brand-blue`, `bg-brand-cream`, `bg-brand-green`.
- Netral: `text-ink`, `text-muted`, `border-line`.
- Font: `font-brand`, `font-editorial`; font resmi belum aktif, fallback masih digunakan.
- Layout: `page-container`, `page-section`; container maksimal 1280px.
- Tipografi: `page-title`, `section-title`, `editorial-subheading`, `body-copy`, `text-link`.
- Spacing berbasis 4px; card memakai radius 16px (`rounded-2xl`). Teks pada bidang hijau/cream menggunakan warna gelap. Periksa kontras aktual.

Aset aplikasi berada di `src/assets/brand/`: `logo-transparent.png`, `logo-white-bg.png`, `logo-lights-out.png`, `growthx.png`, dan `growth-camp.png`. Import melalui Vite; jangan memakai URL `/docs/...`.

Pertahankan rasio gambar. File asli mempunyai margin kosong besar; cek ukuran visual di browser. Logo program hanya untuk konteks yang sesuai dan tidak membuktikan pendaftaran/jadwal sedang dibuka. Jangan mengarang mentor, mitra, statistik, hasil, atau jadwal. Copy perlu review PO; konten contoh diberi label.

Apple Garamond di `docs/fonts/` adalah unduhan referensi; izin web belum dikonfirmasi. BUDGET belum teridentifikasi pasti. Jangan mengaktifkan font lain dengan nama BUDGET.

## Button dan CTA

Path saat ini: folder `UI` huruf besar, file `button.tsx` huruf kecil. Contoh dari komponen dalam `src/components/home/`:

```tsx
import { Link } from "react-router";
import { buttonStyles } from "../UI/button-styles";

<a href="#journey" className={buttonStyles({ size: "lg" })}>
  Explore GCC
</a>

<Link to="/learn" className={buttonStyles({ variant: "secondary" })}>
  Explore Learn
</Link>
```

Untuk aksi UI dengan handler nyata, gunakan `Button` dari `../UI/button`. Button mendukung:

| Prop | Pilihan / perilaku |
| --- | --- |
| `variant` | `primary` (default), `secondary`, `ghost` |
| `size` | `sm` 44px, `md` 48px (default), `lg` 52px; tinggi minimum |
| `fullWidth` | Lebar penuh container |
| `disabled` | Nonaktifkan aksi |
| `loading` | Nonaktifkan aksi, pertahankan label, pasang `aria-busy`; belum ada spinner otomatis |
| `type` | Default `button`; submit perlu `type="submit"` |

Props native dan `className` didukung. Link CTA memakai `buttonStyles`, bukan link di dalam button atau sebaliknya. Gunakan primary untuk CTA utama dan secondary/ghost untuk aksi pendamping.

## Batas perubahan

A memiliki folder home dan HomePage. Koordinasikan perubahan App.tsx, navbar, global CSS, dependency, dan config melalui B agar tidak saling menimpa.

B mengintegrasikan default export HomePage ke route `/`, menggantikan HomePlaceholder. Wildcard route saat ini masih menampilkan placeholder; sepakati fallback saat integrasi. Jangan menambahkan BrowserRouter kedua karena sudah tersedia di `src/main.tsx`.

## Handoff balik ke B

- [ ] Hero/About/Journey siap dan copy divalidasi PO.
- [ ] Explore GCC mencapai journey; heading tidak tertutup navbar.
- [ ] Semua link journey mengarah ke route yang benar.
- [ ] Cek 360px dan 1280px: wrapping terbaca, gambar proporsional, tanpa overflow horizontal.
- [ ] Keyboard focus terlihat, heading berurutan, alt text sesuai konteks.
- [ ] `npm run build` dan `npm run lint` berhasil di branch A.
- [ ] Sertakan ringkasan perubahan, link commit/PR, screenshot aktual mobile/desktop, hasil uji, dan keterbatasan.

Jalankan kembali build/lint serta uji interaksi bersama B setelah integrasi. Review PR sebelum merge ke main; status Done mengikuti acceptance dan evidence aktual.
