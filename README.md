# GCC Website

Website Growth Consulting (GCC), menggunakan React, Vite, TypeScript, Tailwind CSS v4, React Router, dan Lucide React.

Sprint 1 berfokus pada Discover: menjelaskan value GCC dan membantu mahasiswa menemukan journey Learn → Apply → Grow. Learn/Apply/Grow masih preview berlabel Coming Soon. Login, backend, database, registrasi, assessment, dan detail program penuh berada di luar scope.

## Status

- Foundation, navbar desktop/mobile, routing, preview pages, reusable Button, token desain, dan aset brand sudah terimplementasi.
- Route `/` masih placeholder; homepage Developer A belum terintegrasi.
- Font masih fallback. Apple Garamond sudah diunduh untuk referensi; izin web dan identitas BUDGET belum dikonfirmasi.
- QA visual/interaksi browser serta cross-review terintegrasi masih diperlukan. Implementasi kode bukan bukti seluruh acceptance criteria terpenuhi.

## Setup lokal

Gunakan Node.js yang kompatibel dengan Vite 8: 20.19+ atau 22.12+. Pemeriksaan lokal sebelumnya menggunakan Node.js 24. npm diperlukan. Tidak ada environment variable atau backend yang perlu disiapkan saat ini.

```bash
npm ci
npm run dev
```

Buka alamat yang ditampilkan terminal Vite.

| Command | Kegunaan |
| --- | --- |
| `npm ci` | Install dependency sesuai lockfile |
| `npm run dev` | Development server dan HMR |
| `npm run build` | Pemeriksaan TypeScript dan build ke `dist/` |
| `npm run lint` | Pemeriksaan Oxlint |
| `npm run preview` | Preview hasil build; jalankan build terlebih dahulu |

Belum tersedia script `npm test` atau suite pengujian browser otomatis. Build/lint harus dilengkapi cek interaksi manual.

## Struktur project

```text
docs/
  design.md                  # Panduan brand dan desain
  dev-a-brief.md              # Handoff homepage
  fonts/README.md             # Sumber dan status font
  *.png                      # Referensi asli GCC
src/
  assets/brand/              # Salinan aset untuk aplikasi
  components/
    layout/
      navbar.tsx             # Navbar bersama
      PreviewPage.tsx        # Layout preview
      Footer.tsx             # Masih kosong
    UI/
      button.tsx             # Komponen Button
      button-styles.ts       # Style bersama untuk button/link
  data/navigation.ts         # Label dan URL navigasi
  pages/                     # LearnPage, ApplyPage, GrowPage
  styles/global.css          # Tailwind, token, dan style aktif
  App.tsx                    # Routing dan placeholder Discover
  main.tsx                   # Entry point dan BrowserRouter
```

Gunakan casing path yang persis sama: `components/UI/button.tsx` dan `components/layout/navbar.tsx`. Perbedaan kapitalisasi bisa gagal pada Linux. `src/index.css` dan `src/App.css` adalah sisa starter yang tidak diimpor entry point saat ini.

## Routing dan komponen bersama

| Label | Route | Status |
| --- | --- | --- |
| Discover | `/` | Placeholder, menunggu homepage |
| Learn | `/learn` | Preview |
| Apply | `/apply` | Preview |
| Grow | `/grow` | Preview |

Unknown route saat ini menampilkan placeholder Discover; belum ada halaman 404 khusus. Untuk hosting dengan BrowserRouter, arahkan request route aplikasi ke `index.html` agar refresh `/learn`, `/apply`, dan `/grow` bekerja.

Acuan desain: [docs/design.md](docs/design.md). Token implementasi berada di `src/styles/global.css`:

- Warna: `brand-green`, `brand-cream`, `brand-red`, `brand-blue`; netral `ink`, `muted`, `line`.
- Layout: `page-container`, `page-section`.
- Tipografi: `page-title`, `section-title`, `editorial-subheading`, `body-copy`, `text-link`.
- Button: varian `primary`, `secondary`, `ghost`; ukuran `sm`, `md`, `lg`; mendukung `fullWidth`, `disabled`, `loading`, dan props native. Default `type="button"`.
- Navigasi memakai `Link` atau `<a>` dengan helper `buttonStyles`; jangan menumpuk link dan button.

Aset aplikasi diimpor dari `src/assets/brand/`. File `docs/` tidak otomatis menjadi URL produksi. Lihat [catatan font](docs/fonts/README.md) dan contoh pemakaian komponen pada [brief Dev A](docs/dev-a-brief.md).

## Pembagian kerja dan Git

Repo: [GCC_WEBSITE_AGILE](https://github.com/thabitaaya29/GCC_WEBSITE_AGILE).

- Developer A — `feature/homepage`: `src/components/home/`, `src/pages/HomePage.tsx`, Hero/About/Journey, dan copy yang divalidasi PO.
- Developer B — `feature/navigation`: foundation, layout, navbar, routing, preview pages, Button, styling global, config, dan integrasi.
- Bersama: kontrak props/CTA, QA, cross-review, evidence, dan merge ke `main` melalui PR.

Koordinasikan perubahan `App.tsx`, dependency, dan config melalui B. A perlu mengambil foundation terbaru yang sudah dibagikan melalui Git; perubahan lokal yang belum di-commit tidak tersedia di checkout A. Jangan menimpa perubahan developer lain.

Sebelum merge:

```bash
npm ci
npm run build
npm run lint
```

Lakukan cross-review dan QA pada hasil integrasi. Deployment Vercel/Netlify opsional dan belum dicatat sebagai selesai.

## QA dan evidence Sprint 1

- [ ] Discover menjelaskan identitas GCC, fokus consulting, manfaat mahasiswa, dan hubungan learning–practice; copy divalidasi PO.
- [ ] Explore GCC menuju journey; link Learn/Apply/Grow menuju preview yang tepat.
- [ ] Logo ke home, active state, menu mobile, dan link kembali dari preview berfungsi.
- [ ] Layout diperiksa pada 360px dan 1280px, termasuk logo, wrapping, dan overflow horizontal.
- [ ] Keyboard focus terlihat; menu mobile bisa dibuka/ditutup; disabled/loading Button mencegah aktivasi berulang.
- [ ] Direct URL dan refresh route bekerja pada environment demo/hosting jika tersedia.
- [ ] Konten contoh diberi label; tidak ada klaim mentor, mitra, statistik, hasil, atau jadwal yang dikarang.
- [ ] Build/lint terintegrasi berhasil, PR direview dan di-merge.
- [ ] Simpan link repo/PR/demo, screenshot aktual, tanggal, reviewer, hasil uji, dan issue tersisa.

Status Done mengikuti acceptance dan evidence aktual. Journey end-to-end masih terbuka selama halaman lain berupa preview.
