# FerroCMMS — Demo Software CMMS

Demo interaktif software CMMS (Computerized Maintenance Management System) untuk materi training **"Maintenance of Machine Tools"** — WM Training.

Tema visual: **Industrial Steel & Ember**, tersedia mode gelap dan terang.

## Fitur

- **Dashboard** — ringkasan status aset, health score, dan work order terbaru
- **Work Order Management** — buat, filter, dan ubah status work order (korektif/preventif/prediktif)
- **Asset / Equipment Registry** — data induk mesin, bisa diedit langsung (nama, lokasi, status, kritikalitas, health score, jadwal maintenance)
- **Preventive Maintenance Schedule** — jadwal PM, bisa diedit langsung per baris
- **KPI & Reporting** — PM compliance rate, MTTR, MTBF, distribusi kritikalitas aset

Semua data bersifat in-memory (state React) — cocok untuk demo langsung di kelas, tidak memerlukan backend/database.

## Menjalankan secara lokal

Butuh [Node.js](https://nodejs.org/) versi 18 ke atas.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

## Build untuk production

```bash
npm run build
```

Hasil build ada di folder `dist/`.

## Deploy online

### Opsi 1: Vercel (paling mudah)
1. Push project ini ke repository GitHub (lihat langkah di bawah).
2. Buka [vercel.com](https://vercel.com), login dengan akun GitHub.
3. Klik **Add New → Project**, pilih repository ini.
4. Vercel otomatis mendeteksi Vite — klik **Deploy**.

### Opsi 2: Netlify
1. Push ke GitHub.
2. Buka [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
3. Pilih repo, build command `npm run build`, publish directory `dist`.

### Opsi 3: GitHub Pages
1. Tambahkan `base: "/nama-repo/"` di `vite.config.js`.
2. Jalankan `npm run build`.
3. Deploy isi folder `dist/` ke branch `gh-pages` (bisa pakai package `gh-pages` atau GitHub Actions).

## Struktur project

```
ferrocmms/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx     # entry point
    └── App.jsx      # seluruh komponen CMMS
```

---
Materi training oleh **WM - Training** — Pemateri: Wildan Maradona, S.T.
