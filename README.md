# 🎓 KAVADMIN — Kavio Edu Management Suite

<p align="center">
  <img src="public/logobaru.png" alt="Kavio Edu Logo" width="220" />
</p>

<p align="center">
  <strong>Comprehensive Enterprise Administration, Invoicing, and Academic Workflow System for Kavio Edu</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5.4.11-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.15-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Electron-43.3.0-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Design-Fluent_System-0078D4?logo=windows&logoColor=white" alt="Fluent Design" />
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Linux%20%7C%20Windows-blue" alt="Cross Platform" />
</p>

---

## 📌 Tentang Proyek (About The Project)

**KAVADMIN** adalah platform manajemen akademik, administrasi kursus, dan sistem invoicing terpadu yang dirancang khusus untuk operasional **Kavio Edu** (*Private English Class & Academic Mentoring*). Dibangun dengan prinsip performa tinggi, tampilan visual bergaya **Microsoft Fluent Design System**, serta kapabilitas *cross-platform* (Web App & Desktop App via Electron).

Aplikasi ini menyederhanakan seluruh alur kerja operasional: mulai dari pendataan profil siswa, penjadwalan sesi mingguan, pembuatan invoice resmi digital & cetak, kustomisasi kwitansi pembayaran dengan konversi terbilang otomatis, otomasi pesan konfirmasi WhatsApp, hingga modul editor kurikulum materi pembelajaran berbasis Word/Tiptap.

---

## 🚀 Fitur Unggulan (Core Features)

### 1. 🧾 Generator Invoice & Kwitansi Resmi (Invoice & Receipt Engine)
- **Auto-Generate Nomor Invoice:** Format standar bisnis `INV/KEEN/ddmmyy/random` dengan tanggal terbit *real-time* dan kalkulasi otomatis jatuh tempo (+7 hari).
- **Multi-Tier Paket Belajar:** Integrasi langsung dengan paket kursus (`SEED`, `GROW`, `BOOST`, `MASTER`, dan `CUSTOM`).
- **Input Durasi Interaktif:** Field input numerik dengan isolasi event scroll mouse (*scroll wheel to adjust*), mencegah scroll halaman utama bergerak saat hover di atas field.
- **Dual-Mode Diskon Dinamis (% / Rp):** Tombol swap/switch di dalam field input untuk beralih instan antara diskon persentase dan nominal rupiah dengan konversi nilai otomatis.
- **Tipe Pembayaran & DP Fleksibel (`DP (n%)`):** Mendukung pelunasan penuh (100%), DP dinamis yang menghitung rasio persentase aktual dari data terbayar (`DP (n%)`), dan kustomisasi nominal bebas.
- **Visualisasi Status Pembayaran Terintegrasi:** Menampilkan badge status presisi (`LUNAS (100%)`, `TERBAYAR (n%)`, `BELUM BAYAR`).
- **Asset Keaslian Dokumen:** Dilengkapi overlay stempel resmi Kavio Edu, stempel lunas, dan tanda tangan digital Founder.
- **Multi-Format Export:** Download instan dalam format PDF berkualitas tinggi (via `jsPDF`), gambar PNG HD (via `html2canvas`), serta mode cetak langsung (*print-friendly*).
- **Public Share Link:** Pembuatan tautan berbagi publik terenkripsi/terstruktur untuk dibuka langsung oleh wali murid di browser tanpa perlu login.
- **Kwitansi Pembayaran (Receipt Modal):** Konversi nominal angka ke teks bahasa Indonesia (*terbilang*) secara otomatis dengan nomor kwitansi terstruktur `KW/KEEN/ddmmyy/random`.

### 2. 🎨 Studio Desain Tema Invoice (Invoice Themer Studio)
- Kustomisasi tampilan visual dokumen invoice secara *live*:
  - **Palet Warna Header & Aksen:** Pilihan tema korporat (Fluent Blue, Emerald Slate, Indigo Royal, Crimson Dark, Amber Gold, Midnight).
  - **Tipografi:** Sans-serif, Serif elegan, atau Monospace modern.
  - **Konfigurasi Header & Logo:** Posisi logo (Kiri, Tengah, Kanan) dan skala font judul.
  - **Watermark Kustom:** Kontrol teks dan opasitas watermark dokumen.

### 3. 👥 Manajemen Database Siswa (Student Directory & CRM)
- Penyimpanan data siswa: Nama lengkap, kontak WhatsApp siswa & wali, paket belajar, durasi, nilai per bulan, nominal terbayar (*paid*), sisa tagihan (*outstanding*), dan catatan khusus.
- **Combobox Pencarian Cepat:** Autocomplete nama siswa yang bersih (*clean text* & kode paket berwarna) untuk pemuatan data otomatis ke form invoice.
- **Student Profile Drawer:** Panel *slide-over* ringkasan detail siswa, jam belajar terakumulasi, log invoice, status administrasi, dan riwayat pembayaran.

### 4. 💬 WhatsApp Communication Studio
- Generator template pesan WhatsApp siap kirim dengan data terisi otomatis (*one-click copy*):
  - Konfirmasi pertemuan perdana / konsultasi awal.
  - Notifikasi rincian invoice & tagihan resmi + tautan dokumen publik.
  - Kwitansi bukti pembayaran / pelunasan kursus.
  - Pengingat jatuh tempo (*friendly reminder*).

### 5. 📅 Manajemen Jadwal & Slot Kalender (Schedule & Calendar)
- **Weekly Matrix Grid:** Visualisasi ketersediaan slot waktu belajar mingguan (Senin - Minggu, Pagi/Siang/Sore/Malam).
- **Upcoming Sessions Modal:** Pelacakan sesi belajar yang akan datang untuk setiap siswa dengan deteksi konflik jadwal.

### 6. 📝 Manajemen Modul & Editor Dokumen (Word & Rich Text Engine)
- Editor dokumen kaya fitur berbasis **Tiptap** dan **ProseMirror** yang menyerupai antarmuka *Microsoft Word*.
- Mendukung format *heading*, tabel, penyisipan gambar, *highlighting*, *blockquote*, *code block*, dan *alignment*.
- **DOCX Importer:** Impor dokumen Microsoft Word (`.docx`) langsung ke editor menggunakan parser `Mammoth`.
- Export dan print modul pembelajaran dalam format halaman A4 standar.

### 7. 🗺️ Student Roadmap & Milestone Tracker
- Pelacakan progres belajar siswa dari tingkat dasar hingga mahir per kuartal/tahapan sesi.

---

## 🧮 Logika Bisnis & Perhitungan Biaya (Business Logic & Pricing)

### Skema Paket Kursus Resmi

| Paket | Tarif / Bulan | Sesi / Bulan | Durasi Sesi | Deskripsi Program |
| :--- | :---: | :---: | :---: | :--- |
| **SEED** | Rp 150.000 | 3 Sesi | 60 Menit | Kelas pengenalan dasar & pemahaman awal |
| **GROW** | Rp 200.000 | 4 Sesi | 60 Menit | Kelas intensif reguler mingguan |
| **BOOST** | Rp 400.000 | 8 Sesi | 60 Menit | Pembinaan akselerasi & persiapan ujian |
| **MASTER** | Rp 500.000 | 8 Sesi | 90 Menit | Mentoring lanjutan & *academic writing* |
| **CUSTOM** | Fleksibel | Fleksibel | Fleksibel | Kelas kustom sesuai kebutuhan siswa |

### Alur Kalkulasi Finansial:
1. **Subtotal Investasi:**
   $$\text{Subtotal} = \text{Tarif/Bulan} \times \text{Durasi (Bulan)}$$
2. **Total Sesi:**
   $$\text{Total Sesi} = \text{Sesi/Bulan} \times \text{Durasi (Bulan)}$$
3. **Diskon:**
   - *Mode Persentase:* $\text{Nominal Diskon} = \text{round}\left(\frac{\text{Subtotal} \times \text{Diskon}\%}{100}\right)$
   - *Mode Nominal Tetap:* $\text{Nominal Diskon} = \min(\text{Subtotal}, \text{Nominal Input})$
4. **Total Investasi Bersih:**
   $$\text{Total Investasi} = \max(0, \text{Subtotal} - \text{Nominal Diskon})$$
5. **Outstanding (Sisa Tagihan):**
   $$\text{Outstanding} = \max(0, \text{Total Investasi} - \text{Jumlah Terbayar})$$
6. **Rasio Terbayar & Label Status:**
   $$\text{Rasio Terbayar (\%)} = \text{round}\left(\frac{\text{Jumlah Terbayar}}{\text{Total Investasi}} \times 100\right)$$
   - Jika $\text{Terbayar} \ge \text{Total Investasi} \rightarrow$ **`LUNAS (100%)`**
   - Jika $\text{Terbayar} > 0 \rightarrow$ **`TERBAYAR (n%)`**
   - Jika $\text{Terbayar} = 0 \rightarrow$ **`BELUM BAYAR`**

---

## 🛠️ Arsitektur & Spesifikasi Teknologi (Tech Stack)

| Lapisan | Teknologi / Library | Fungsi & Implementasi |
| :--- | :--- | :--- |
| **Core Framework** | React 18.3.1 + Vite 5.4 | UI component rendering & HMR fast bundling |
| **Styling & Theme** | Tailwind CSS 3.4 + Fluent Design | Desain antarmuka bersih bergaya Windows Fluent |
| **Desktop Wrapper** | Electron 43 + Electron Builder | Aplikasi desktop native untuk Linux & Windows |
| **Database & Sync** | Firebase Firestore (v12) | Sinkronisasi basis data siswa online & realtime |
| **Rich Text Editor** | Tiptap Suite + ProseMirror | Pengolah kata modul materi pembelajaran |
| **Document Parser** | Mammoth.js | Ekstraksi dan konversi berkas `.docx` ke HTML/DOM |
| **Export & Grafis** | jsPDF + html2canvas | Pembuatan PDF dan render canvas dokumen invoice |
| **Smooth UI & Anim**| Framer Motion + Lenis Scroll | Transisi modal, drawer, dan animasi fluid |
| **Iconography** | Lucide React | Ikonografi modern dan konsisten |

---

## 📁 Struktur Direktori Proyek (Project Structure)

```text
kavadmin/
├── electron.cjs                 # Main process konfigurasi Electron
├── preload.cjs                  # Preload bridge IPC Electron
├── index.html                   # HTML Entry Point
├── package.json                 # Metadata projek, dependencies, dan scripts
├── tailwind.config.js           # Konfigurasi Tailwind & palet Fluent Design
├── vite.config.js               # Konfigurasi build Vite
├── public/                      # Asset statis publik (logo, ikon)
└── src/
    ├── main.jsx                 # React root mount
    ├── App.jsx                  # Root router, tab navigation & state sync
    ├── firebase.js              # Inisialisasi Firebase Firestore SDK
    ├── index.css                # Global CSS, scrollbar Fluent, print styles
    ├── assets.js                # Ekspor sentral aset grafis (logo, stempel, ttd)
    ├── backupData.js            # Mock dataset cadangan siswa & modul
    ├── components/
    │   ├── Dashboard.jsx        # Halaman utama manajemen siswa & statistik
    │   ├── InvoiceGenerator.jsx # Mesin pembuat invoice resmi & kalkulator
    │   ├── InvoiceThemerStudio.jsx # Studio live themer invoice
    │   ├── ReceiptModal.jsx     # Modal kwitansi pembayaran resmi
    │   ├── WhatsAppStudio.jsx   # Studio generator template pesan WA
    │   ├── StudentProfileDrawer.jsx # Drawer detail informasi profil siswa
    │   ├── StudentRoadmap.jsx   # Tracker roadmap & milestone akademik
    │   ├── SlotCalendarModal.jsx# Kalender jadwal & slot ketersediaan
    │   ├── UpcomingSessionsModal.jsx # Modal sesi belajar mendatang
    │   ├── Navigation.jsx       # Header & menu navigasi utama
    │   ├── CursorTooltip.jsx    # Custom context tooltip
    │   └── modules/
    │       ├── ModulesManager.jsx    # Katalog modul kurikulum
    │       ├── FullPageWordEditor.jsx# Pengolah kata layar penuh
    │       ├── TiptapEditor.jsx      # Core Tiptap rich-text component
    │       ├── Toolbar.jsx           # Toolbar formatting dokumen
    │       └── editor.css            # Styling canvas halaman A4 word
    └── utils/
        ├── dateFormatter.js     # Format tanggal lokal Indonesia
        ├── invoiceShare.js      # Generator payload URL publik invoice
        ├── docxImporter.js      # Parser file docx ke format editor
        ├── scheduleManager.js   # Kalkulasi konflik dan slot sesi
        └── terbilang.js         # Konversi angka ke kata terbilang Indonesia
```

---

## 💻 Panduan Instalasi & Menjalankan Aplikasi (Getting Started)

### Prasyarat:
- **Node.js**: Versi `>= 18.0.0`
- **npm** atau **yarn** / **bun**

### 1. Kloning Repositori:
```bash
git clone git@github.com:imanecdoche/kavadmin.git
cd kavadmin
```

### 2. Instalasi Dependensi:
```bash
npm install
```

### 3. Menjalankan Server Development (Web):
```bash
npm run dev
```
Buka browser di `http://localhost:5173/` atau akses via jaringan lokal yang ditampilkan di terminal.

### 4. Menjalankan Mode Desktop (Electron Dev):
```bash
npm run electron:dev
```

### 5. Kompilasi Build Produksi:
```bash
# Build Web Statis (Folder dist/)
npm run build

# Build Executable Desktop Linux (AppImage & dir)
npm run electron:linux

# Build Installer Windows (NSIS .exe via package builder)
npm run electron:build
```

---

## 🏛️ Informasi Resmi & Kontak (Official Credentials)

- **Lembaga:** Kavio Edu (Private English Class & Academic Mentoring)
- **Founder:** Fatih Farhat Asshidiq
- **Lokasi:** Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten - 42266
- **Rekening Resmi Pembayaran:**
  - Bank BCA: `6872486204` (a.n. FATIH FARHAT ASSHIDIQ)
  - Blu by BCA Digital: `007187161271` (a.n. FATIH FARHAT ASSHIDIQ)
  - E-Wallet (GoPay / DANA / ShopeePay): `082111500190`

---

## 📄 Lisensi (License)

Hak Cipta © 2026 **Kavio Edu & Fatih Farhat Asshidiq**. Seluruh hak cipta dilindungi undang-undang.
