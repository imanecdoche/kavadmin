# Workspace Rules & Instructions Log

## 📌 Absolute Rules (Acuan Utama & Mutlak)
1. Setiap ada instruksi tambahan, langsung catat ke `.agents/RULES.md` dan jadikan file instruksi itu sebagai acuan utama dan mutlak selalu benar.

## 📝 Instruksi Tambahan & Konfigurasi
- **Network / Remote Access via Tailscale & Localhost**:
  - Dev server untuk Kavio OS Admin dijalankan menggunakan Vite dengan host binding dan port `3000` (`vite --port 3000 --host`).
  - Tailscale IP host: `100.73.151.12` (Node: `kaviopc`).
  - URL Akses:
    - Localhost: `http://localhost:3000`
    - LAN: `http://192.168.1.2:3000`
    - Remote Tailscale: `http://100.73.151.12:3000`
- **Dashboard Metric Cards (Mobile Layout)**:
  - Khusus tampilan mobile (`< sm` / mobile viewport), kartu metrik (metric cards) di dashboard harus direkonstruksi:
  - Scaling ukuran kartu diperkecil secara proporsional (~50% / compact).
  - Tampilan grid di mobile diatur menjadi 2 kolom (grid 2 column / `grid-cols-2`).
- **Document Previews (Certificate, Roadmap, Report Card) - Mobile Downscaling**:
  - Khusus pada tampilan mobile viewport: rendered preview dokumen Sertifikat, Roadmap, dan Report Card harus di-downscale secara proporsional.
  - Layout konten dokumen harus dikunci (fixed layout / tidak boleh pecah / tidak boleh merusak susunan internal dokumen).
  - Skala (CSS transform: scale / container scaling) diperkecil secara proporsional agar lebar dokumen pas dan muat sempurna di dalam viewport layar ponsel tanpa horizontal overflow yang merusak atau layout breaking.
- **Dashboard "Sesi Mendatang (3 Hari)" Layout**:
  - Kontainer "Sesi Mendatang (3 Hari)" dibuat tanpa pembungkus card container (tanpa box wrapper `bg-white rounded-fluent border p-5`), melainkan langsung menggunakan divider / border pemisah.
  - Ukuran komponen/elemen didownscale menjadi lebih ringkas dan proporsional.
- **Dashboard Table & Grid (Mobile Downscaling)**:
  - Khusus tampilan mobile (`< sm` / mobile viewport), ukuran tabel data siswa & matriks jadwal di dashboard di-downscale hingga ~50% lebih kecil (compact font, padding, badge, dan action buttons).
  - Tampilan desktop/tablet tetap normal.
- **Flutter Android KAVADMIN App Development**:
  - Bangun aplikasi Android "KAVADMIN" (Sistem Manajemen & Administrasi Kavio Edu) menggunakan Flutter & Dart.
  - Mencakup: Auth Passcode Gate dengan Single Active Session (Firestore `system_auth/global_session`), Student CRM, Modular Learning Roadmap Studio, Digital Report Card Studio, Certificate Generator, Invoicing, dan Mesin Pembuat Dokumen PDF Vektor Native (A4, F4/Folio, US Legal, US Letter).
  - Mengikuti struktur clean architecture (core, data, services, presentation) dengan Flutter Riverpod, Google Fonts, PDF Printing Engine, dan Real-time Firestore Sync.
- **Flutter KAVADMIN Tahap 2 Auth & Session Rules**:
  - Passcode: `'200805'`.
  - UX: Input field mendukung `textInputAction: TextInputAction.done` / tombol Enter keyboard fisik untuk login otomatis.
  - Persistensi: Token disimpan di `SharedPreferences` key `kavadmin_session_token`.
  - Single Active Session: Firestore doc `system_auth/global_session` dengan field `activeSessionId`, `lastLoginAt`, `platform`. Listener stream `snapshots()` memicu force logout seketika jika `activeSessionId` berbeda.
  - Navigasi & Theme: `MainNavigationScreen` dengan bottom navigation bar dan theme Material 3.
- **Flutter KAVADMIN Tahap 3 Student CRM, Paper Dimensions & PDF Engine**:
  - Student Model & CRM: Firestore `students` collection (`id`, `name`, `parentName`, `phone`, `programTier`, `batchName`, `cefrLevel`, `sessionSlot`, `startDate`, `isActive`).
  - Paper Dimensions: Enum `PaperSizePreset` (A4, F4/Folio: 215x330mm, US Legal: 216x356mm, US Letter: 216x279mm) dengan helper `PdfPageFormat` dan `displayName`.
  - Universal Vector PDF Engine: `PdfEngineService` dengan `buildUniversalMasterHeader`, `buildDocumentTitleBanner`, `printOrSaveDocument`, dan `shareDocument`.
  - Student CRM UI: `StudentListScreen` terintegrasi dengan `studentsStreamProvider`, modal bottom sheet tambah/edit siswa, dan dihubungkan ke tab 1 `MainNavigationScreen`.
- **Flutter KAVADMIN Tahap 4 Modular Roadmap Studio & PDF Generator**:
  - Roadmap Session Model: `RoadmapSessionModel` (`sessionNumber`, `level`, `title`, `description`, `date`, `time`, `durationMinutes`, `status`, `isCompleted`, `mastery`).
  - Session Time Evaluator: Evaluasi status dinamis (`SELESAI`, `SEDANG BERJALAN`, `BELUM MULAI`) berdasarkan `session.date` + `student.sessionSlot` + 90 menit.
  - CEFR Presets: `CefrPresets.generateSessions(...)` dengan offset mulai sesi (`startFromSession`), jumlah sesi, dan silabus CEFR A1 s.d. C2.
  - Multi-Page Vector PDF: `RoadmapPdfService.generateRoadmapPdf` dengan `pw.MultiPage`, header universal, student profile strip, batch progress, dan smart page break anti-potong kartu.
  - Studio UI: `RoadmapStudioScreen` dengan parameter controls, slider mastery, selector kertas cetak, dan ekspor/share PDF langsung.
- **Flutter KAVADMIN Tahap 5 Report Card Studio & Certificate Studio**:
  - Report Card Model: `ReportCardModel` & `CompetencyScore` (Speaking Fluency, Grammar Application, Listening Comprehension, Vocabulary Richness) dengan grade `A (85-100)`, `B (70-84)`, `C (55-69)`, `D (<55)`.
  - Certificate Model: `CertificateModel` dengan Security Hash Verifikasi, Lokasi (`Pandeglang`), Tanggal Terbit, dan Nama Direktur Akademik (`Fatih Farhat Asshidiq`, *Founder & Academic Director*).
  - Vector PDF Services: `ReportCardPdfService` dan `CertificatePdfService` (A4 Portrait, clean editorial lines, no heavy borders).
  - Studio UI: `ReportCardStudioScreen` dan `CertificateStudioScreen` terhubung ke Firestore data siswa.
  - Navigasi Lengkap: `MainNavigationScreen` mengaktifkan seluruh 4 tab (Siswa, Roadmap, Rapor, Sertifikat).
- **Flutter KAVADMIN Android Build & ADB Deployment**:
  - Deteksi perangkat dengan `adb devices` dan `flutter devices`.
  - Eksekusi `flutter clean && flutter pub get` lalu `flutter build apk --debug`.
  - Install langsung ke perangkat dengan `adb install -r build/app/outputs/flutter-apk/app-debug.apk` dan luncurkan via `adb shell monkey`.
- **Inisialisasi shadcn/ui & UI Makeover KAVADMIN Web**:
  - Inisialisasi library UI shadcn/ui pada project web KAVADMIN (React + Vite + Tailwind CSS).
  - Mulai perombakan UI total secara bertahap dimulai dari halaman Dashboard (modern clean editorial UI, Radix primitives, Lucide icons, 8pt grid system, Tailwind).
- **Standarisasi Komponen `src/components/ui/`**:
  - Seluruh file komponen di dalam `src/components/ui/` harus mengikuti kode standar resmi dan arsitektur `shadcn/ui` (CVA, Radix UI primitives, cn utility `@/lib/utils`, class-variance-authority, lucide-react, CSS variables).
- **Rombak Top Navbar / Header (Minimalist B&W + Inter + Equal Width Pills + Logo Only)**:
  - Sisi Kiri (Branding): HANYA menampilkan Logo SVG resmi KAVIO EDU saja tanpa teks apa pun ("KAVIO EDU", "Admin Workspace", dll dihapus). Logo memiliki interaksi klik untuk navigasi ke Dashboard dan ukuran proporsional disesuaikan menjadi ~30% lebih ramping/kecil (`h-7 sm:h-8 w-auto max-h-8 object-contain`).
  - Tipografi: Font family `Inter` (`font-['Inter',sans-serif]`).
  - Skema Warna: HANYA warna HITAM dan PUTIH. Merah (`text-red-600 hover:text-red-700 hover:bg-red-50`) HANYA untuk tombol Logout ("Keluar"). Hilangkan aksen biru/sky.
  - Tab Aktif: Kapsul lonjong hitam pekat (`bg-black text-white shadow-xs rounded-full`). Tab tidak aktif: teks hitam murni (`text-black bg-transparent hover:bg-neutral-100 rounded-full`).
  - Lebar Tombol Seragam: Nav container menggunakan `inline-grid grid-flow-col auto-cols-fr gap-1 items-center` sehingga seluruh tab memiliki lebar seragam mengikuti tab terlebar.
  - Scroll & Layout: Transparan saat di puncak (`scrollY <= 20`), putih semi-transparan berbayang lembut saat di-scroll (`scrollY > 20`), margin rapat simetris `w-full max-w-[98%] xl:max-w-[96%] mx-auto px-2 sm:px-3`.



- **Penyesuaian Margin & Padding Horizontal Global (~70% Ramping / Luas)**:
  - Kurangi nilai padding/margin horizontal (`px-*`, container padding) global menjadi sekitar 30% dari semula (~70% lebih ramping) agar tampilan luas dan optimal.
  - Ubah batas container dari `max-w-7xl` / `max-w-6xl` menjadi `w-full max-w-[98%] xl:max-w-[96%] mx-auto px-1.5 sm:px-3`.
- **Standarisasi Tooltip shadcn/ui**:
  - Ganti seluruh elemen tooltip di aplikasi dengan komponen standar shadcn/ui (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` dari `@radix-ui/react-tooltip`).
  - Pasang `TooltipProvider` secara global di level root/app dan gunakan shadcn Tooltip untuk interaksi hover informasi.
- **Tipografi Global Helvetica Font**:
  - Terapkan font family "Helvetica" secara menyeluruh (global) ke seluruh aplikasi KAVADMIN (HTML native system font tanpa CDN eksternal, `tailwind.config.js` `fontFamily.sans: ['Helvetica', 'Arial', ...defaultTheme.fontFamily.sans]`, root CSS `body` font-family Helvetica, dan membersihkan class font hardcoded pada komponen).
- **Modul Invoice, Kuitansi & Dokumen Vektor `@react-pdf/renderer`**:
  - Pasang `@react-pdf/renderer` dan konfigurasikan `src/services/pdfTypography.js` dengan font format `.ttf` murni (bukan `.woff2`) serta nonaktifkan hyphenation callback (`Font.registerHyphenationCallback(w => [w])`).
- **Rombak Header & 4 Stat Cards Dashboard Siswa (Standard shadcn/ui Minimalist)**:
  - Header: Judul bersih "Dashboard" (tanpa badge "Kavio Edu"), tipografi Inter yang tajam, dan tombol solid hitam "+ Tambah Siswa" (`bg-black text-white hover:bg-neutral-800 rounded-lg shadow-xs`).
  - 4 Kartu Metrik: `Siswa Aktif`, `Pendapatan Terbayar`, `Outstanding`, dan `Total Jam Belajar`.
  - Visual: Menghilangkan garis warna tebal di atas kartu (*top border stripes*) dan pastel box icons. Menggunakan layout standar shadcn (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Progress`), icon monokrom/subtle di kanan atas, tipografi angka besar tebal, serta footer bergaris tipis pembatas.
  - Integritas Data: Mempertahankan 100% seluruh kalkulasi dinamis (siswa aktif, pendapatan terbayar, outstanding, persentase realisasi, sesi & jam belajar).
- **Sesi Mendatang 3 Hari Dashboard Siswa (Standard shadcn/ui Minimalist `UpcomingSessions.jsx`)**:
  - Visual & Struktur: Layout kartu shadcn/ui (`Card`, `CardHeader`, `CardContent`, `Badge`, `Button`), border tipis netral `border-neutral-200`, font Inter.
  - Header: Icon kalender monokrom di container rounded tipis, judul "Sesi Mendatang (3 Hari)", badge total sesi, tombol outline "Detail", dan toggle collapse chevron.
  - 3 Kolom Hari (Hari Ini, Besok, Lusa):
    - Hari Ini: Penegas badge hitam solid (`bg-neutral-900 text-white`), border kontras `border-neutral-900/40 bg-neutral-50/40`.
    - Besok & Lusa: Badge netral abu-abu (`bg-neutral-100 text-neutral-700`).
    - Item Sesi: Jam font mono di badge abu-abu, nama siswa tebal `text-neutral-900`, tag paket uppercase (`GROW`, `SEED`, `BOOST`, `PRO`).
    - Empty State: Container dashed border dengan teks "Tidak ada sesi bimbingan".
- **Rombak Tabel Data Siswa & Filter Bar (Standard shadcn/ui Minimalist `StudentTable.jsx`)**:
  - Komponen: Menggunakan arsitektur dan komponen resmi shadcn/ui (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Input`, `Select`, `Badge`, `Button`, `SimpleTooltip`).
  - Top Bar & View Switcher: Switcher "Daftar Siswa" & "Matriks Jadwal" dengan segmented tab kontras minimalis.
  - Filter & Search Bar: Search input dengan icon di kiri (`Input`) dan 3 dropdown filter (`Select`) seragam: Paket (SEED, GROW, BOOST, MASTER, CUSTOM), Status (LUNAS, DP, PENDING), dan Hari (Senin-Minggu).
  - Tipografi & Kontras: Bersih tanpa warna ungu kontras lama. Tipografi Inter, nama siswa bold gelap (`text-neutral-900 font-semibold hover:underline`), nama wali muted (`text-neutral-500 text-xs`).
  - Jam Belajar: Dihitung rapi (`X.X Jam` font-medium `text-neutral-900`, `(60m/sesi)` `text-neutral-500 text-xs`).
  - Status Bayar: Badge semantik lembut/subtle (Lunas: emerald, DP: amber, Pending: rose).
  - Aksi: Icon buttons minimalis monokrom (`Eye`, `FileText`, `BookOpen`, `Pencil`, `Trash2`) dengan tooltip shadcn.
  - Integritas: Mempertahankan 100% logika filter serta aksi callback modal/drawer.
- **Rombak Matriks Ketersediaan Slot 4 Pekan (Standard shadcn/ui Minimalist `SlotMatrix.jsx`)**:
  - Komponen: Menggunakan arsitektur shadcn/ui (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge`, Lucide icons `CalendarDays`, `Calendar`, `Check`, `Lock`).
  - Visual: Palet netral monochrome, font Inter, header bersih dengan tombol "Kalender Sesi" (`variant="outline" size="sm"`) dan legend dot indikator (Tersedia = emerald, Terkunci = rose).
  - Week Tabs: Kapsul hitam pekat untuk tab aktif (`bg-black text-white shadow-xs`), border netral untuk tab tidak aktif (`bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50`).
  - 7 Kolom Grid (Senin - Minggu): Header tanggal uppercase font mono (`text-[10px] text-neutral-400 font-mono`) dan nama hari tebal (`text-xs font-bold text-neutral-900`).
  - Slot Tersedia: Border netral tipis (`border-neutral-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/20`), waktu font mono, ikon `Check` emerald.
  - Slot Terkunci: Background aksen soft (`bg-rose-50/40 border-rose-200`), ikon `Lock` rose, nama siswa tebal (`text-xs font-bold text-neutral-900`), badge sesi (`bg-rose-100 text-rose-700 font-bold`), dan tag paket monospaced.
  - Integritas Data: Menjaga 100% kalkulasi dinamis slot 4 pekan, filter sesi reservasi siswa (Alya, Hana, dll.), dan trigger callback modal profil/kalender.
- **Rombak Modal Detail Siswa (Standard shadcn/ui Minimalist `StudentDetailModal.jsx`)**:
  - Komponen: Menggunakan komponen resmi shadcn/ui (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Badge`, `Button`, `Separator`, `SimpleTooltip`).
  - Header: Badge paket hitam solid (`bg-black text-white`), badge status bayar semantik (emerald/amber), nama siswa besar tebal (`text-2xl font-bold text-neutral-900`), subtitle nama wali murid.
  - 3 Kartu Metrik Ringkas: Background `bg-neutral-50/40 border-neutral-200`, angka besar mono (`Total Jam Belajar`, `Terbayar`, `Outstanding`).
  - Kontak Langsung WhatsApp: Kartu interaktif outline (`border-neutral-200 hover:bg-neutral-50`) dengan icon `MessageSquare` dan link `https://wa.me/...` untuk wali dan siswa.
  - Profil, Demografi & Jadwal: Label kapital abu-abu netral (`text-[11px] font-bold text-neutral-400 uppercase tracking-wider`), data kontras hitam, kotak target belajar berlatar netral halus.
  - Footer & Quick Actions: 4 shortcut buttons outline ber-tooltip (Invoice, Rapor, Roadmap, Sertifikat) di kiri dan tombol outline "Tutup" di kanan.
- **Standarisasi 100% Badge Resmi shadcn/ui (`@/components/ui/badge`)**:
  - Hapus seluruh badge manual (`<span>` atau `<div>` custom) dan wajib gunakan `<Badge>` resmi shadcn.
  - Informational/Netral: `variant="secondary"` atau `variant="outline"`.
  - Brand & Paket Belajar: `variant="default"` (background hitam pekat).
  - Sukses / Lunas / 100% Aktif: `variant="outline"` dengan class semantik emerald `bg-emerald-50 text-emerald-700 border-emerald-200` dan icon `Check`.
  - Warning / DP / Sisa Tagihan: `variant="outline"` dengan class semantik amber `bg-amber-50 text-amber-700 border-amber-200` dan icon `AlertCircle`.
  - Terkunci / Sesi Terjadwal: `variant="outline"` atau `variant="destructive"` dengan aksen rose `bg-rose-100 text-rose-700 border-rose-200` atau `bg-rose-50 text-rose-700 border-rose-200` dan icon `Lock`.
- **Rombak Modal Tambah & Edit Siswa Baru (Standard shadcn/ui Minimalist `AddStudentModal.jsx`)**:
  - Komponen: Menggunakan komponen resmi shadcn/ui (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Input`, `Label`, `Select`, `Button`, `Badge`).
  - Visual & UX: Estetika monokrom minimalis shadcn (`bg-black text-white` untuk aksi utama & slot terpilih, border halus `border-neutral-200`, font global Helvetica, `overscroll-contain` untuk isolasi scroll dari backdrop).
  - Multi-Step Tabs: 3 tab terstruktur (`1. Profil`, `2. Kontak & Wali`, `3. Paket & Jadwal`).
  - Matriks Slot Anti-Bentrok & Kuota Slot Paket:
    * **SEED / GROW:** Wajib tepat 1 slot per minggu (`targetSlots = 1`).
    * **BOOST / MASTER:** Wajib tepat 2 slot per minggu (`targetSlots = 2`).
    * Slot terkunci di-disable (`bg-rose-50 border-rose-200 text-rose-600 cursor-not-allowed` dengan icon `Lock` dan nama siswa), slot terpilih `bg-black text-white` dengan icon `Check`.
    * Counter dinamis di atas grid (`Pilih 1 slot lagi (1/2)` $\rightarrow$ `Terpilih (2/2)`). Tombol submit di-disable jika kuota belum pas.
  - Ringkasan Finansial Real-time: Card 4 metrik ringkas otomatis (Total Investasi, Total Sesi, Total Jam, Sisa Piutang) menyesuaikan kuota sesi per pekan.
- **Rombak Modal Detail Sesi Bimbingan Mendatang (Standard shadcn/ui Minimalist `UpcomingSessionsDetailModal.jsx`)**:
  - Komponen: Menggunakan komponen resmi shadcn/ui (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Badge`, `Input`, `Button`, Lucide icons `CalendarDays`, `Search`, `Clock`, `MessageSquare`, `ArrowUpRight`, `Calendar`).
  - Visual: Estetika monokrom minimalis shadcn (`border-neutral-200`, `bg-white`, tipografi Helvetica/Inter, font-mono untuk jam & paket).
  - Header: Icon kalender monokrom dalam square netral (`bg-neutral-100 text-neutral-900`), badge outline `3 Hari Ke Depan`, dan badge secondary status sesi terjadwal.
  - Search & Segmented Filter: Input pencarian dengan icon di kiri dan segmented button pills (`Semua`, `Hari Ini`, `Besok`, `Lusa`) dengan active state solid black (`bg-black text-white`).
  - Grid 3 Kolom Responsif: Header hari dengan badge status (`default` untuk Hari Ini, `secondary` untuk Besok/Lusa), kartu sesi siswa dengan badge waktu monospaced, tombol cepat WhatsApp emerald, dan box Target Belajar netral halus.
  - Empty State: Desain dashed border netral dengan icon `Calendar` dan teks abu-abu lembut.
- **Rombak Modal Kalender Ringkas Sesi Belajar (Standard shadcn/ui Minimalist `QuickSessionCalendarModal.jsx`)**:
  - Komponen: Menggunakan komponen resmi shadcn/ui (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Badge`, `Button`, Lucide icons `CalendarDays`, `ChevronLeft`, `ChevronRight`, `Clock`, `User`, `MessageSquare`, `Eye`, `BookOpen`, `CalendarCheck2`, `CalendarX`).
  - Visual: Estetika monokrom minimalis shadcn (`border-neutral-200`, `bg-white`, tipografi Helvetica sans-serif, font-mono untuk jam & kuota).
  - Kalender 7 Kolom (Min - Sab): Tanggal aktif berkapsul hitam solid (`bg-black text-white shadow-xs`), indikator sesi aktif (dot/badge counter emerald `bg-emerald-100 text-emerald-800`), navigasi bulan dan tombol cepat "Hari Ini".
  - Panel Rincian Jadwal Harian: Tanggal terpilih dengan badge status kuota sesi, kartu sesi siswa berlatar putih dengan badge waktu & progress sesi (`Sesi 06 / 12`), tag paket hitam solid, badge status bayar semantik, serta tombol aksi cepat (WA, Profil Siswa, Roadmap).
- **Rombak Modul 1-Batch Modular Learning Roadmap (`RoadmapHeader.jsx` & `RoadmapParameterSidebar.jsx`)**:
  - Komponen: Menggunakan komponen resmi shadcn/ui (`Card`, `CardContent`, `Input`, `Label`, `Select`, `Button`, `Badge`, Lucide icons `BookOpen`, `Sparkles`, `Plus`, `Share2`, `Download`, `FileDown`, `MessageCircle`, `SlidersHorizontal`, `Printer`, `Calendar`, `Clock`, `RotateCcw`, `Layers`, `Pencil`, `Trash2`).
  - Visual: Estetika monokrom modern shadcn/ui (`border-neutral-200`, `bg-white`, font global Helvetica, angka monospaced).
  - Header Bar: Ikon `BookOpen` dalam wadah netral `bg-neutral-100`, tombol Preset Kurikulum outline, Tambah Sesi hitam solid (`bg-black text-white`), tombol share & download icon, PDF A4 outline, dan WhatsApp emerald.
  - Parameter Sidebar:
    * Dropdown Siswa Terdaftar: shadcn `<Select>` dengan format nama, paket, dan jam slot.
    * Ukuran Kertas (A4, F4, Legal, Letter): Grid 2x2 kartu netral minimalis dengan radio dot hitam dan dimensi milimeter.
    * Tanggal & Jam: Input font mono dengan 3 tombol chip waktu cepat (`09:00`, `13:00`, `15:00`).
    * Sesi / Bulan, Durasi, Total Sesi: Input angka dengan kotak Total Sesi monospaced.
    * Tombol Sesuaikan Ulang Daftar Sesi: Button outline dengan ikon `RotateCcw`.
    * Daftar Sesi Granular: Header counter dengan badge tuntas emerald (`1 Tuntas (8%)`), kartu sesi siswa berborder halus dengan badge urutan, tag CEFR, badge status, judul modul tebal, serta tombol aksi cepat edit (`Pencil`) dan hapus (`Trash2`).

- **Rombak Modul Digital Report Card Studio (`ReportCardHeader.jsx` & `ReportCardParameterSidebar.jsx`)**:
  - Komponen: Menggunakan arsitektur & komponen resmi shadcn/ui (`Button`, `Badge`, `Input`, `Label`, `Textarea`, `Slider`, `Switch`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, Lucide icons `Award`, `User`, `Calendar`, `Sliders`, `CheckCircle2`, `RefreshCw`, `Share2`, `Printer`, `Download`, `MessageCircle`, `Check`).
  - Visual: Estetika monokrom minimalis shadcn (`border-neutral-200`, `bg-white`, font global Helvetica, angka skor monospaced).
  - Header Bar:
    * Ikon `Award` monokrom di dalam wadah netral `bg-neutral-100`.
    * Indikator Skor: Kartu ringkas berisi `Score: [85.8]` dan Predikat Grade `[A-]` dengan badge monospaced.
    * Barisan Tombol Aksi: `Share` icon outline, `Print` icon outline, `Download PNG` icon outline, `Export PDF` hitam solid (`bg-neutral-900 text-white`), dan `WhatsApp` solid emerald (`bg-emerald-600 text-white`).
  - Parameter Sidebar:
    * Data Siswa & Periode: Doc number refreshable (`REP/KEEN/...`), Input Nama Siswa dengan Autocomplete dropdown & checklist indikator, 2-kolom sejajar (`Nama Orang Tua/Wali` $\leftrightarrow$ `Paket Program`), 2-kolom sejajar (`Periode Evaluasi` $\leftrightarrow$ `Tanggal Terbit`), Judul Dokumen Rapor.
    * Metrik Presensi: 3-kolom sejajar (`Total Sesi`, `Sesi Hadir`, `Rasio Kehadiran` box otomatis emerald).
    * Matriks Penilaian Kompetensi (0-100): 4 aspek (Tata Bahasa 25%, Kosakata 20%, Kelancaran 25%, Pemahaman 15%) menggunakan `<Slider>` shadcn/ui dengan badge predikat level (Advanced/Proficient/Developing/Novice) dan skor monospaced, reaktif real-time ke skor akhir & grade.
    * Evaluasi Kualitatif & Rekomendasi Mentor: Input `<Textarea>` dan toggle `<Switch>` untuk sertakan catatan guru.
- **Rincian Rekening Resmi & Instruksi Pembayaran Invoice (`InvoicePdfTemplate.jsx` & `DocumentStudio.jsx`)**:
  - Rekening Bank Transfer: **Blu by BCA Digital** No. Rekening: `007187161271` a/n **Fatih Farhat Asshidiq**.
  - E-Wallet (**DANA / GoPay**): `082111500190` a/n **Fatih Farhat Asshidiq**.
  - Tampilan Kotak Pembayaran: Format 2 kolom berdampingan (`paymentGrid` & `paymentCol`) yang bersih, rapi, dan mudah dibaca pada dokumen PDF resmi.
- **Penerbitan Kuitansi Resmi & Logika Bisnis Pembayaran (`ReceiptPdfTemplate.jsx` & `DocumentStudio.jsx`)**:
  - Nomor Dokumen Otomatis: Invoice `INV/KEEN/YYYYMM/XXXX`, Kuitansi `KW/KEEN/YYYYMM/XXXX`.
  - Nominal Kuitansi: Mencerminkan HANYA nominal "Pembayaran Diterima (Transaksi Ini)" dengan teks terbilang otomatis mengikuti pembayaran tersebut.
  - Peniadaan Info Total Tagihan & Outstanding pada Kuitansi: Pada dokumen kuitansi DILARANG menampilkan informasi Total Tagihan, Sisa Tagihan (Outstanding), maupun badge status lunas/sebagian. Kuitansi murni berfungsi sebagai bukti tanda terima pembayaran kas masuk (hanya menampilkan pembayaran diterima).
- **Arsitektur One-to-Many Ledger (1 Master Invoice : N Kuitansi Bertahap)**:
  - Service Ledger Finansial: `src/services/billingLedgerService.js` mengelola pembuatan Master Invoice permanen per siswa, kuitansi beruntun (`KW/KEEN/YYYYMM/XXXX`), dan sinkronisasi saldo atomik di Firestore (`students`, `invoices`, `receipts`).
  - Pendaftaran Siswa Baru (`AddStudentModal.jsx`): Terintegrasi dengan kalkulasi Subtotal, diskon fleksibel (%/Rp), pajak (PPN %), Grand Total, input DP/pembayaran awal dengan format rupiah, dan penerbitan otomatis Master Invoice + Kuitansi #1 jika ada DP.
  - Modal Catat Pembayaran Bertahap (`PaymentEntryModal.jsx`): Memungkinkan pencatatan cicilan/pelunasan langsung dari profil siswa, otomatis menerbitkan Kuitansi #N, meng-update status tagihan siswa (`LUNAS` / `DP X%`) dan status invoice (`PAID` / `PARTIAL`).
  - **Profil Siswa (`StudentDetailModal.jsx`)**: Menampilkan tombol `+ Catat Pembayaran` pada header modal, serta seksi "Riwayat Pembayaran & Kuitansi" real-time dengan aksi download/pratinjau PDF kuitansi per transaksi.
- **Standarisasi React Hooks & Dialog Visibility**:
  - SEMUA hooks (`useState`, `useEffect`, `useMemo`, `useRef`, dll.) WAJIB diletakkan di paling atas fungsi komponen tanpa didahului oleh kondisi `if` atau *early return* apa pun (seperti `if (!isOpen) return null;`).
  - Pengecekan kondisi `if (isOpen && ...)` WAJIB ditaruh di dalam *body* `useEffect`, bukan membungkus hook atau melakukan early return di luar hook.
  - Visibility rendering dialog/modal dikontrol sepenuhnya melalui prop `open={isOpen}` pada komponen `<Dialog>` shadcn/Radix UI.
- **Instruksi Lingkungan & Server Lokal (Localhost)**:
  - Mengaktifkan server pengembangan Vite host (`npm run dev`) pada repositori `/media/fatihfarhat/New Volume1/PROJECTS/kavadmin-main` agar dapat diakses melalui browser lokal.
- **Instruksi Khusus Format Kuitansi**:
  - Pada kuitansi, TIDAK BOLEH ada informasi total tagihan dan sisa tagihan (outstanding). Kuitansi HANYA menampilkan informasi pembayaran yang diterima (nominal dan terbilang transaksi tersebut).
- **Integrasi Modul Pembelajaran Siswa (Student Edition CEFR A1 - C2)**:
  - Memasukkan seluruh data modul pembelajaran siswa (for students) dari direktori `/media/fatihfarhat/New Volume1/FATIH DATA/English Kavio/Student` (mencakup 60 modul dari level A1 hingga C2 lengkap beserta silabus, materi, ringkasan, dan latihan) ke dalam basis data modul bawaan Kavio Edu.
- **Refaktorisasi Gaya UI Dashboard ke Material Design**:
  - Merefaktorisasi seluruh antarmuka komponen Dashboard (`Dashboard.jsx`, `DashboardStudentStats.jsx`, `UpcomingSessions.jsx`, `StudentViewSwitcher.jsx`, `StudentTable.jsx`, `SlotMatrix.jsx`, dan modal terkait) ke standar Material Design 3 (M3).
  - Mengadopsi elevasi tonal, surface containers berlapis (`rounded-2xl`, `shadow-sm hover:shadow-md`), aksen primer Material (`#6442D6` / Deep Indigo), tipografi hierarkis yang tajam, segmented buttons bulat, dan transisi elevasi interaktif dengan tetap mematuhi sistem 8-point grid serta bebas dari komponen di luar instruksi.
- **Audit & Improvement Animasi (`/improve-animations`)**:
  - Melakukan audit komprehensif terhadap animasi dan pergerakan (motion) antarmuka aplikasi berpedoman pada filosofi Emil Kowalski & standar craft tingkat tinggi.
  - Memetakan permukaan motion (stack Framer Motion / CSS / Tailwind / Lenis), mengaudit 8 kategori animasi (Purpose & frequency, Easing & duration, Physicality & origin, Interruptibility, Performance, Accessibility, Cohesion & tokens, Missed opportunities), memprioritaskan temuan berdasarkan leverage (impact ÷ effort), dan menyusun rencana implementasi mandiri (self-contained plans).
  - Eksekusi rencana implementasi mandiri untuk Temuan #1 (Reduced Motion & Accessibility), #2 (Modal Physics & Origin Alignment), dan #3 (Dashboard View Transition Easing & Duration).
- **Acuan Animasi Transisi & Microinteraction dari Mod Minecraft (`ReAnimated` & `HoverItems`)**:
  - Membaca dan mendekompilasi file `.jar` mod di `~/.minecraft/mods/`: `reanimated-26.1.2+1.7.1.jar` (`com.pycodder.reanimated.*`) dan `HoverItems-1.0.0+26.1-26.2.jar` (`me.cutebow.hover_items.*`).
  - Mempelajari konstruksi kode, rumus matematis (easing, spring/overshoot, exponential decay approach, 3-stage smoothstep bounce, cascade stagger, pivot scaling), serta behaviour keduanya untuk dijadikan acuan utama animasi transisi dan microinteraction pada KAVADMIN.
  - Seluruh *popup window* (modal/dialog/popover) dan *sheet* (drawer samping) wajib memiliki animasi transisi keluar dan masuk (*enter & exit*) yang mulus berbasis `<AnimatePresence>` dan fisika `ReAnimated` (tanpa terpotong oleh *early return* `if (!isOpen) return null` di luar `<AnimatePresence>`).
- **Tata Letak Responsif Mobile Header (`Navbar.jsx`)**:
  - Pada tampilan *mobile* / layar kecil (`< lg`), header tidak boleh menumpuk tombol navigasi dalam satu baris sempit (`auto-cols-fr` hanya aktif di `lg:`) dan tidak boleh menampilkan garis scrollbar biru di bawah menu.
  - Gunakan tata letak 2 baris yang bersih di *mobile* (Baris 1: Logo di kiri & tombol `Keluar` di kanan; Baris 2: deretan pil navigasi `flex overflow-x-auto no-scrollbar` dengan `shrink-0` agar teks tidak pernah bertumpuk), sedangkan di *desktop* (`lg:`) tetap satu baris dengan pil berlebar seragam (`lg:inline-grid lg:grid-flow-col lg:auto-cols-fr`).
- **Aturan Keamanan Cloud Firestore (`firestore.rules`) 7 Koleksi Utama**:
  - Seluruh koleksi aplikasi terdaftar dan diatur izin `read, write: if true;` dengan `rules_version = '2';` untuk mendukung alur otentikasi kustom local passcode gate (`200805`) dan verifikasi sesi tunggal:
    1. `/system_auth/{docId}`: Penguncian sesi tunggal aktif (`system_auth/global_session` oleh AuthContext & Flutter).
    2. `/students/{studentId}`: Profil siswa, status belajar, dan rekap tagihan/billing.
    3. `/invoices/{invoiceId}`: Data tagihan master invoice resmi (`INV/KEEN/...`).
    4. `/receipts/{receiptId}`: Catatan tanda terima kuitansi pembayaran kas masuk (`KW/KEEN/...`).
    5. `/modules/{moduleId}`: Modul silabus pembelajaran CEFR A1 - C2.
    6. `/reports/{reportId}`: Rapor akademik evaluasi berkala siswa.
    7. `/roadmaps/{roadmapId}`: Roadmap trajectory dan matriks sesi kurikulum siswa.
  - Seluruh koleksi dan dokumen di luar 7 path tersebut ditolak secara default (`match /{document=**} { allow read, write: if false; }`).
- **Pembaruan Basis Data Siswa Alya & Hana (1 Agustus 2026, Durasi 3 Bulan, LUNAS)**:
  - **Siswa Alya (id: "1")**:
    - Tanggal Mulai & Registrasi: `2026-08-01`.
    - Durasi Belajar: `3` bulan.
    - Paket: `GROW` (4 sesi/bulan, 60 menit/sesi $\rightarrow$ total `12` sesi, `720` menit).
    - Biaya & Status: Nilai/bulan `Rp 200.000`, Total Investasi `Rp 600.000`, Terbayar `Rp 600.000`, Sisa Tagihan (Outstanding) `Rp 0` (Status: **LUNAS**).
    - Jadwal: `Selasa 15.00 WIB`.
    - Invoice: Master Invoice `INV/KEEN/010826/101` bernilai `Rp 600.000` (Status: `LUNAS`).
    - Kuitansi: Kuitansi pelunasan `KW/KEEN/010826/101` bernilai `Rp 600.000` (Metode: Transfer Bank / BCA).
    - Roadmap: 12 sesi kurikulum GROW A2 (Agustus s.d. Oktober 2026) dengan progres berjalan realistis (Sesi 1–10: `SELESAI`, Sesi 11: `SEDANG BERJALAN`, Sesi 12: `BELUM MULAI`).
  - **Siswa Hana (id: "3")**:
    - Tanggal Mulai & Registrasi: `2026-08-01`.
    - Durasi Belajar: `3` bulan.
    - Paket: `GROW` (4 sesi/bulan, 60 menit/sesi $\rightarrow$ total `12` sesi, `720` menit).
    - Biaya & Status: Nilai/bulan `Rp 200.000`, Total Investasi `Rp 600.000`, Terbayar `Rp 600.000`, Sisa Tagihan (Outstanding) `Rp 0` (Status: **LUNAS**).
    - Jadwal: `Minggu 09.00 WIB`.
    - Invoice: Master Invoice `INV/KEEN/010826/103` bernilai `Rp 600.000` (Status: `LUNAS`).
    - Kuitansi: Kuitansi pelunasan `KW/KEEN/010826/103` bernilai `Rp 600.000` (Metode: Transfer Bank / BCA).
    - Roadmap: 12 sesi kurikulum GROW A2 (Agustus s.d. Oktober 2026) dengan progres berjalan realistis (Sesi 1–10: `SELESAI`, Sesi 11: `SEDANG BERJALAN`, Sesi 12: `BELUM MULAI`).
  - **Sinkronisasi**: Tersimpan di Cloud Firestore (`kavio-edu-app`) pada koleksi `students`, `invoices`, `receipts`, dan `roadmaps`, serta diperbarui pada file cadangan lokal `src/backupData.js`.
- **Sistem Unifikasi Master Invoice, Kuitansi Bertahap & Kompresi Bukti Pembayaran (`/grill-me /goal /plan`)**:
  - **1 Siswa = 1 Master Invoice**: Setiap siswa hanya memiliki tepat 1 dokumen master invoice tagihan yang merefleksikan paket belajar, durasi, dan total investasi biaya pendidikannya. Dilarang menduplikasi invoice baru untuk siswa yang sama saat mencatat pembayaran lanjutan.
  - **Otomatisasi Master Invoice saat Siswa Ditambahkan**: Penambahan siswa baru di sistem otomatis menerbitkan dokumen Master Invoice sesuai nominal paket yang diambil.
  - **Pembayaran Awal Menjadi Kuitansi #1**: Jika terdapat pembayaran awal (DP / Pelunasan) saat input siswa baru, sistem langsung mengenerate Kuitansi Pembayaran #1 yang terikat ke master invoice tersebut.
  - **Keterikatan Tunggal Terpadu**: Master invoice, seluruh riwayat pembayaran, dan setiap kuitansi transaksi terikat ketat pada ID siswa yang bersangkutan (`studentId`, `masterInvoiceId`).
  - **Kalkulasi Dinamis Pengurangan Tagihan**: Setiap ada pembayaran baru yang tercatat, sisa tagihan (*remainingAmount* / *outstanding*) pada Master Invoice dan profil siswa otomatis terpotong secara real-time.
  - **Tabel Riwayat Pembayaran Terkonfirmasi di Dokumen Invoice**: Template cetak dokumen/PDF invoice menyajikan tabel riwayat pembayaran yang telah terkonfirmasi (nomor kuitansi, tanggal bayar, nominal, metode, status) sehingga total tagihan, akumulasi pembayaran, dan sisa kewajiban terlihat transparan.
  - **Preservasi Desain**: Desain resmi invoice dan kuitansi yang sudah ada tetap dipertahankan dan diintegrasikan tanpa merusak layout visual.
  - **Kompresi Bukti Pembayaran Klien-Sisi Anti-Stuck**: Fitur upload foto/gambar bukti transfer dilengkapi kompresor otomatis di sisi klien (HTML5 Canvas downscale & WebP/JPEG quality) berukuran kecil (<150KB) sehingga proses simpan instan tanpa stuck loading.
  - **Otomatisasi Kuitansi Baru Tiap Pembayaran Lanjutan**: Setiap kali ada entri pembayaran baru siswa, sistem langsung menghasilkan kuitansi baru dengan nomor urut berikutnya secara otomatis.
- **Standar Modal Popup Tanpa Animasi & Backdrop Solid Dimmed (`/grill-me /goal`)**:
  - **Zero Animation**: Seluruh modal popup di aplikasi harus muncul secara instan tanpa animasi apa pun (hapus semua transisi zoom, fade-in/fade-out, slide-in/slide-out, scaling `data-[state=open]:animate-in`, `scale-95`, dsb.).
  - **Solid Dimmed Backdrop (Zero Blur)**: Latar belakang (backdrop overlay) modal murni berwarna dim gelap solid (`bg-black/50`) tanpa efek `backdrop-blur` sama sekali (zero blur, zero glassmorphism).
- **Migrasi Tab Navigasi Header ke Sidepanel (Sidebar Navigation)**:
  - Seluruh item tab navigasi yang sebelumnya berada di top header dipindahkan ke bilah navigasi samping (Sidepanel / Sidebar).
  - Menggunakan ikon resmi yang disediakan pengguna:
    1. `Dashboard`: `/nav-icons/dashboard.png` (Grid 4-kotak)
    2. `Siswa`: `/nav-icons/students.png` (Topi toga wisuda)
    3. `Jadwal`: `/nav-icons/calendar.png` (Kalender titik)
    4. `Invoice`: `/nav-icons/invoice.png` (Kuitansi struk zig-zag solid hitam resmi)
    5. `Roadmap`: `/nav-icons/roadmap.png` (Jalur lintasan S-curve)
    6. `Rapor`: `/nav-icons/reports.png` (Dokumen grafik tren naik)
    7. `Sertifikat`: `/nav-icons/certificates.png` (Dokumen pita piagam)
    8. `Modul`: `/nav-icons/modules.png` (Buku dengan pita pembatas)
    9. `WhatsApp`: `/nav-icons/whatsapp.png` (Balon percakapan telepon)
  - Layout aplikasi mengadopsi struktur Sidepanel kiri tetap (*fixed/sticky sidebar*) dengan area konten utama di sisi kanan, serta tetap responsif pada tampilan mobile.
- **Standar Corner Radius Kecil & Efek Drop Shadow Seluruh Komponen (`/grill-me`)**:
  - **Corner Radius Kecil**:
    - Kartu & Kontainer (Kartu Metrik Dashboard, Sesi Mendatang, Tabel Siswa, Slot Matriks, dsb.): Menggunakan radius 8px (`rounded-lg`).
    - Tombol, Input, Item Menu Sidepanel, Segmented View Switcher, dan Action Buttons: Menggunakan radius 6px (`rounded-md`).
    - Mengeliminasi corner radius yang terlalu besar (`rounded-2xl`, `rounded-3xl`, dan `rounded-full` yang berlebihan) menjadi tampilan ringkas, tajam, dan presisi.
  - **Efek Drop Shadow Lembut Modern**:
    - Seluruh kartu metrik, kontainer tabel, dan blok antarmuka diberi efek drop shadow lembut natural (`shadow-sm` / `shadow-[0_2px_8px_rgba(0,0,0,0.06)]` dengan border tipis halus).
    - Tombol dan item navigasi aktif diberi aksen shadow halus (`shadow-xs` / `shadow-sm`).
- **Ukuran Modal Popup Full Width & Full Height FIXED**:
  - Seluruh modal popup di aplikasi harus berukuran layar penuh tetap (*fixed full width & full height*): `fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none`.
  - Tidak menggunakan floating card, tidak ada rounded border sudut luar, melainkan menutupi layar secara penuh (*full viewport fixed*) dengan scroll internal area konten yang rapi.
  - Backdrop tetap dim gelap solid (`bg-black/50`) tanpa efek blur.
  - Tidak ada animasi transisi (*zero animation*).
- **Format Tanggal Standar Indonesia (`DatePickerCustom.jsx`)**:
  - Mengikuti standar Indonesia: `DD-MM-YYYY` (e.g. `12-08-2026`) atau `DD MMMM YYYY` (e.g. `12 Agustus 2026`).
  - Label dan tampilan kalender custom UI konsisten dengan penanggalan Indonesia.
- **Custom UI Date Picker Sesi Perdana Siswa (`AddStudentModal.jsx` Tambah & Edit Siswa)**:
  - **Letak & Tampilan**: Ditempatkan di Tab 3 ("Paket & Jadwal") tepat di samping/atas Matriks Slot Jadwal dengan label "Tanggal Sesi Perdana".
  - **Interaksi Popover/Dropdown**: Trigger button menampilkan tanggal dalam format bahasa Indonesia lengkap (e.g. "Selasa, 12 Agustus 2026") dengan ikon kalender resmi (`/nav-icons/calendar.png`). Mengklik tombol membuka dropdown kalender custom UI (navigasi bulan/tahun, header hari Sen-Min, grid tanggal, tanggal aktif kapsul hitam teks putih).
  - **Logika Hari Slot**: Pengguna bebas memilih tanggal apa pun, dengan penanda visual otomatis (*rekomendasi*) untuk tanggal-tanggal yang harinya cocok dengan slot jadwal yang dipilih.
  - **Integrasi Basis Data**: Disimpan ke field `startDate` dan `firstSessionDate` (format `YYYY-MM-DD`). Digunakan sebagai acuan awal tanggal sesi kurikulum roadmap dan tanggal penagihan invoice. Berlaku pada pendaftaran siswa baru maupun edit data siswa.
- **Styling Segmented Button View Switcher (`StudentViewSwitcher.jsx`)**:
  - Pill pembungkus: Berwarna putih (`bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm p-1`).
  - Tombol aktif: Background hitam murni (`bg-black text-white rounded-md shadow-xs`), dengan teks putih dan ikon putih (`brightness-0 invert`).
  - Tombol tidak aktif: Tombol transparan tanpa warna (`bg-transparent text-black dark:text-neutral-200 rounded-md`), dengan teks dan ikon berwarna hitam murni (`brightness-0 opacity-100`).
  - Corner radius ringkas & tajam (`rounded-lg` pembungkus, `rounded-md` tombol internal) konsisten dengan standar design system baru.
- **Desain Kartu Metrik Dashboard (Watermark Icon Offset)**:
  - Lingkaran pembungkus ikon (`w-8 h-8 rounded-full bg-[#f5f5f5]`) dihilangkan secara menyeluruh.
  - Setiap kartu metrik memiliki `overflow-hidden relative`.
  - Ikon ditampilkan berukuran besar di pojok kanan atas, keluar sebagian (*offset* / terpotong tepi kontainer kartu) dan berpenampilan semi-transparan (*subtle watermark*, e.g. `absolute -top-4 -right-4 w-20 h-20 opacity-10 pointer-events-none select-none`).
  - Menggunakan 4 ikon resmi:
    1. Siswa Aktif: `/icons/students.png` (Topi toga wisuda)
    2. Pendapatan Terbayar: `/icons/money.png` (Uang kertas bertumpuk)
    3. Outstanding: `/icons/outstanding.png` (Tanda seru)
    4. Total Jam Belajar: `/icons/hours.png` (Jam analog)
- **Ikon Tombol Aksi Tabel Siswa (`StudentTable.jsx`)**:
  - Tombol "Lihat Detail": Menggunakan ikon kaca pembesar (`/icons/search-detail.png` dari upload `media_1793586729393_bed20ec9.png`), menggantikan ikon mata (`Eye`).
  - Tombol "Invoice / Dokumen": Menggunakan ikon invoice struk zig-zag (`/nav-icons/invoice.png` dari upload `media_1793586577614_33f5d7dd.png`), menggantikan ikon `FileText`.
  - Tombol "Modul" / Roadmap Siswa: Menggunakan ikon buku bersampul dengan pita pembatas solid hitam (`/icons/module.png` dari upload `media_1793586774219_9ecf6db3.png`), menggantikan ikon `BookOpen`.
  - Tombol "Edit Siswa": Menggunakan ikon pensil solid hitam (`/icons/edit.png` dari upload `media_1793586807416_bf09826c.png`), menggantikan ikon `Edit3`.
  - Tombol "Hapus Siswa": Menggunakan ikon tempat sampah solid hitam (`/icons/delete.png` dari upload `media_1793586821453_92836032.png`), menggantikan ikon `Trash2`.
- **Ikon Tombol View Switcher (Daftar Siswa & Matriks Jadwal)**:
  - Tombol "Daftar Siswa": Menggunakan ikon daftar poin (`/icons/student-list.png` dari upload `media_1793586639852_7b3d6b59.png`).
  - Tombol "Matriks Jadwal": Menggunakan ikon kisi 3x3 (`/icons/matrix-grid.png` dari upload `media_1793586671180_426a7309.png`).
- **Ikon Kartu Metrik Dashboard**:
  - Kartu 1 (Siswa Aktif): `/icons/students.png` (Topi toga wisuda).
  - Kartu 2 (Pendapatan Terbayar): `/icons/money.png` (Lembaran uang bertumpuk).
  - Kartu 3 (Outstanding): `/icons/outstanding.png` (Lingkaran tanda seru solid hitam).
  - Kartu 4 (Total Jam Belajar): `/icons/hours.png` (Lingkaran jam dinding solid hitam).
- **Ikon Tombol Invoice**:
  - Menggunakan file `/nav-icons/invoice.png` (Kuitansi struk zig-zag solid hitam dari upload pengguna `media_1793586577614_33f5d7dd.png`).

- **Spesifikasi Halaman Tab Siswa (`activeTab === 'students'`) (`/goal /auditaislop`)**:
  - **Khusus Tab Siswa**: Hanya menampilkan data siswa terdaftar (tidak menampilkan widget "Sesi Mendatang 3 Hari", tidak menampilkan toggle "StudentViewSwitcher", dan tidak menampilkan metrik keuangan/jam belajar).
  - **Definisi Mutlak Siswa Aktif & Selesai (Berdasarkan Kuota Sesi)**:
    - **Siswa Aktif**: Siswa yang masih memiliki sisa sesi bimbingan belajar (`remainingSessions > 0` atau `completedSessions < totalSessions`).
    - **Siswa Selesai**: Siswa yang seluruh sesinya telah selesai dijalani (`remainingSessions === 0` atau `completedSessions >= totalSessions`).
  - **Matriks Siswa (3 Kartu Khusus)**:
    1. **Siswa Aktif**: Menghitung siswa yang masih memiliki sisa sesi (`remainingSessions > 0`).
    2. **Siswa Selesai**: Menghitung siswa yang seluruh sesinya telah tuntas (`remainingSessions === 0`).
    3. **Total Siswa**: Akumulasi seluruh siswa terdaftar (`students.length`).
    - Desain kartu: Mengikuti standar `rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)]` dengan offset watermark icon semi-transparan di pojok kanan atas.
    - Header memuat judul "Daftar Siswa", deskripsi ringkas, dan tombol aksi "Tambah Siswa" (`rounded-md shadow-sm`).
  - **Tabel Data Siswa Lengkap**:
    - **Multi-Field Search Bar**: Mencari secara komprehensif berdasarkan nama siswa, nama wali, nomor HP (siswa & orang tua), paket, status siswa, status bayar, jadwal slot, dan alamat.
    - **Filter Komprehensif**: Filter Paket (Semua, SEED, GROW, BOOST, MASTER, CUSTOM), Filter Status Siswa (Semua, Aktif, Selesai), Filter Status Pembayaran (Semua, Lunas, DP, Belum Bayar), dan Filter Hari (Semua Hari, Senin - Minggu).
    - **Interactive Sorting**: Mendukung pengurutan asc/desc interaktif baik via dropdown sorting maupun klik langsung pada header tabel (Nama A-Z / Z-A, Tanggal Mulai Terbaru/Terlama, Paket, Jam Belajar, Nominal Bayar, Status).
    - **7 Pilar Audit AI-Slop (`/auditaislop`)**:
      - Zero outline strokes (`border-none` pada input, select, tombol, chip).
      - Zero emojis & zero decorative dots.
      - Anti-wrapping ketat (`whitespace-nowrap`, `flex-shrink-0`) dengan container scroll horizontal aman `overflow-x-auto`.
      - Solid tokens monokromatis (`bg-black text-white` aktif, `bg-[#f5f5f5] text-[#111111]` field/subtle).
      - Corner radius kecil (`rounded-lg` kartu/tabel, `rounded-md` tombol/input/filter) dan aksen shadow halus.
      - 5 Tombol aksi ber-ikon resmi: Detail (kaca pembesar), Invoice (struk), Modul (buku pita), Edit (pensil), Hapus (tempat sampah).
- **Evaluasi Otomatis Status Selesai Siswa Berdasarkan Masa Durasi Paket & Tanggal Sesi**:
  - Siswa yang terdaftar dengan tanggal mulai (`startDate`, misal `2026-08-01`) dan durasi paket (`durationMonths`, misal 3 bulan) memiliki masa akhir paket yang dihitung presisi (misal 3 bulan dari 1 Agustus berakhir pada 31 Oktober 2026).
  - Jika waktu sistem/sekarang (`now`) telah melampaui tanggal akhir masa paket, atau seluruh sesi di jadwal/roadmap telah melewati tanggal pelaksanaannya, maka seluruh sesi tersebut secara otomatis tuntas (`SELESAI`), sisa sesi menjadi `0`, dan status siswa otomatis menjadi **SELESAI**.
  - Runtime helper (`studentStatusHelper.js`) dan inisialisasi state (`App.jsx`, `backupData.js`) secara otomatis mengevaluasi kedaluwarsa tanggal dan durasi tersebut agar data tidak tertinggal berstatus aktif.
- **Permintaan Ilustrasi Flat Vector**:
  - Karakter: Orang memakai helm konstruksi (safety hardhat), memegang lembaran blueprint arsitektur/teknis dengan ekspresi bingung (confused expression).
  - Format Output: File Vektor SVG Murni (`public/illustrations/confused-architect.svg`) dan Komponen React Reusable (`src/components/ui/ConfusedArchitectIllustration.jsx`).
  - Komposisi: Upper-body / Half-body (Bust) — fokus menyorot ekspresi wajah bingung, helm proyek di kepala, dan kedua tangan memegang lembaran blueprint terbuka di depan dada.
  - Gaya & Palet Warna: Bold Outline / Cartoon Flat — garis outline hitam tegas (`stroke="#111827"`), warna dasar solid datar yang kontras (helm kuning `#F59E0B`, blueprint biru `#2563EB` dengan denah putih, rompi keselamatan oranye `#F97316`), serta aksen ekspresif tanda tanya melayang (`?`) dan tetesan keringat bingung di samping helm.
- **Standar Penamaan Penerima / Pembayar pada Invoice & Kwitansi**:
  - Acuan Utama: Menggunakan nama wali murid (`parentName`).
  - Fallback / Cadangan: Jika nama wali murid kosong / tidak ada, otomatis menggunakan nama siswa (`studentName`).
  - Format Visual:
    - Jika ada wali: Baris utama menampilkan Nama Wali (misal: "Ibu Rina"), dan baris bawahnya menampilkan sub-keterangan "Siswa: Alya".
    - Jika tanpa wali: Baris utama langsung menampilkan Nama Siswa (misal: "Alya") tanpa sub-keterangan berulang.
  - Format Pesan WhatsApp:
    - Jika ada wali: Sapaan "Yth. Bpk/Ibu [Nama Wali]", baris penerima "Telah diterima dari: [Nama Wali] (Siswa: [Nama Siswa])".
    - Jika tanpa wali: Sapaan langsung "Yth. [Nama Siswa]", baris penerima "Telah diterima dari: [Nama Siswa]".
  - Berlaku Menyeluruh pada:
    1. Lembar Dokumen Invoice (Web View & PDF Vector `InvoicePdfTemplate.jsx`).
    2. Lembar Dokumen Kwitansi / Kuitansi (Modal Kuitansi `ReceiptModal.jsx`, Web View, & PDF Vector `ReceiptPdfTemplate.jsx`).
    3. Template Teks Pengiriman WhatsApp (pesan invoice & kuitansi).
    4. Layanan Pencatatan Keuangan (`billingLedgerService.js`).
- **Mesin Render & Export PDF (jsPDF + html2canvas)**:
  - Ruang Lingkup Universal: Seluruh mesin render dan ekspor PDF berbasis canvas HTML ke dokumen fisik resmi (Invoice, Kwitansi, Rapor, Sertifikat, Roadmap) distandarkan menggunakan kombinasi resmi library `jsPDF` + `html2canvas`.
  - Konfigurasi Ketajaman: Menggunakan `scale: 2` (Retina Sharp 2x pixel density) dengan `useCORS: true`, `allowTaint: true`, `backgroundColor: '#ffffff'`, dan `logging: false` untuk hasil teks dan grafis jernih bebas blur dengan ukuran file efisien.
  - Smart Page-by-Page Capture: Untuk dokumen multi-halaman (seperti Roadmap Modular), setiap halaman (`.roadmap-page`) di-capture tersendiri dengan `html2canvas` dan dimasukkan ke `pdf.addPage()`, menjamin tidak ada kartu atau baris teks yang terpotong di perbatasan halaman. Untuk dokumen tunggal (Invoice, Kwitansi, Sertifikat, Rapor), di-render utuh 1 halaman pas sesuai preset ukuran kertas.
  - Menggantikan ketergantungan `html-to-image` pada `src/utils/documentExportEngine.js` dan `src/utils/roadmapExport.js`.
- **Sinkronisasi Metode Pembayaran pada Pendaftaran Siswa Baru, Invoice & Kuitansi**:
  - Metode pembayaran yang dipilih saat pendaftaran siswa (misal: "Tunai / Cash", "Transfer Bank", dll) wajib disimpan secara sinkron ke dalam record siswa (`student.paymentMethod`) serta kuitansi pembayarannya (`receipt.paymentMethod`).
  - Template kuitansi (`ReceiptPdfTemplate.jsx`, `ReceiptModal.jsx`, `StudentDetailModal.jsx`) dilarang menimpa atau men-default secara hardcoded ke "Transfer Bank / BCA" jika metode pembayaran aktual adalah Tunai/Cash.
- **Penonaktifan Dialog Konfirmasi Refresh & Tutup Aplikasi**:
  - Dialog / prompt konfirmasi native browser pada event `beforeunload` (saat me-refresh atau menutup tab/halaman) dinonaktifkan sepenuhnya.
  - Dialog konfirmasi keluar (`ExitConfirmModal` / `onCloseRequested`) juga dinonaktifkan sehingga aplikasi dapat langsung ditutup atau di-refresh seketika tanpa hambatan dialog konfirmasi.
- **Kartu Metrik Dashboard & Tab Siswa (Hapus Watermark Icon BG & Hapus Badge Pill Pojok Bawah)**:
  - Seluruh kartu metrik pada Dashboard (`DashboardStudentStats.jsx`: Siswa Aktif, Pendapatan Terbayar, Outstanding, Total Jam Belajar) dan Tab Data Siswa (`StudentsStats.jsx`: Siswa Aktif, Siswa Selesai, Total Siswa) dibersihkan dari elemen dekoratif AI-slop:
  - **Dilarang keras**: Menampilkan ikon watermark besar semi-transparan di background sudut kartu (`absolute -top-3 -right-3 ... opacity-10`).
  - **Dilarang keras**: Menampilkan badge/pill di pojok bawah kartu (`bg-[#f5f5f5] px-2.5 py-0.5 rounded-md`).
  - Tampilan kartu mengedepankan prinsip Extreme Minimalism: judul uppercase bersih di atas, angka besar tebal di tengah, dan informasi footer berupa teks halus atau progress bar tanpa pembungkus pill/badge.
- **Standar Desain Formal Kuitansi & Invoice (JetBrains Mono & Formal Ledger Style)**:
  - **Pratinjau (Preview Modal)**: Menyediakan Modal Dialog Pratinjau Dokumen WYSIWYG interaktif dengan aksi Cetak (`window.print()`), Unduh PDF (`jsPDF + html2canvas`), dan Salin Teks / Bagikan WhatsApp, yang dapat diakses langsung dari Detail Siswa (`StudentDetailModal`) dan Dashboard.
  - **Tipografi Monospace**: Selain logotype resmi "KAVIO EDU", seluruh teks dokumen (metadata, nomor bukti, penerima, rincian pembayaran, tabel tagihan, nominal terbilang, dan tanda tangan) wajib menggunakan font **JetBrains Mono**.
  - **Zero UI-Styling / Formal Bank Ledger Aesthetic**:
    - Dilarang keras menggunakan styling visual kartu web UI (seperti background box biru/abu-abu `bg-blue-50`/`bg-slate-100`, corner radius melengkung `rounded-*`, badge pill berwarna-warni, atau shadow tebal).
    - Menerapkan layout formal faktur/ledger resmi: kertas putih murni, garis pembatas horizontal hairline hitam tegas (`border-b border-black`), sudut siku tajam (0px radius), dan kontras hitam-putih profesional.
  - **Anti-Overlapping & Anti-Wrapping**:
    - Struktur layout grid/tabular wajib menjamin tidak ada teks yang menimpa atau menumpuk (seperti kasus nama wali dan siswa tumpang tindih).
    - Nama wali murid ditempatkan sebagai penerima utama ("Telah Diterima Dari"), dengan sub-keterangan "Siswa: [Nama Siswa]" pada baris terpisah yang memiliki spasi/margin vertikal aman.
  - **Otentikasi Dokumen**: Menyertakan tanda tangan digital Direktur Akademik (*Fatih Farhat Asshidiq*) dan stempel resmi Kavio Edu pada blok pengesahan di sudut kanan bawah secara presisi tanpa menabrak teks.
- **Rebranding Resmi Aset Logo Kavio Edu (Logomark & Full Logo SVG)**:
  - Seluruh logo lama digantikan dengan vektor SVG resmi baru dari pengguna:
    1. **Logomark** (Emblem K geometris modern): `viewBox="0 0 348 307"`.
    2. **Full Logo** (Logomark + Wordmark kavio + ACADEMY): `viewBox="0 0 1156 386"`.
  - **Pemetaan Penggunaan**:
    - **Full Logo**: Digunakan pada Navbar utama, lembaran dokumen resmi (Invoice, Kuitansi, Rapor, Sertifikat, Roadmap), dan Login / Passcode Gate.
    - **Logomark**: Digunakan pada mode Sidebar ramping (collapsed), favicon browser, mobile app icon, dan avatar sistem.
  - **Adaptasi Warna**:
    - Monokrom Kontras Adaptif Murni: Solid Hitam (`#111111`) pada dokumen cetak dan mode terang (Light Mode); Solid Putih (`#ffffff`) pada mode gelap (Dark Mode), Sidebar gelap, dan Passcode Gate.
  - Berlaku menyeluruh pada: Navbar, Sidebar, Passcode Gate / Login, Splash Screen, Dokumen Resmi (Invoice, Kuitansi, Sertifikat, Rapor, Roadmap), serta direktori publik/aset (`public/logo.svg`, `src/logo.svg`, `assets/icons/logo.svg`).
- **Penyempurnaan Modal Pratinjau Dokumen (Document Preview Modal Fixes)**:
  - **Dimensi Modal**: Modal window diperbesar hampir memenuhi seluruh layar (`w-[96vw] max-w-6xl h-[94vh]`) dengan area scroll kertas dokumen yang luas.
  - **Backdrop Non-Blur**: Menghilangkan efek blur (`backdrop-blur-*`), menggunakan background redup solid (`bg-black/80`).
  - **Interaktivitas Tombol**: Tombol toolbar atas (Salin WA, Cetak, Unduh PDF, Tutup) harus 100% responsif dan dapat diklik (mengatasi konflik modal trap / z-index dengan `pointer-events-auto` dan isolasi stacking context).
  - **Logo Kavio**: Ukuran Full Logo pada header lembar kuitansi & invoice diperbesar secara tegas (`h-14 sm:h-16 lg:h-20`).
  - **Ukuran Tanda Tangan**: Tanda tangan digital Direktur Akademik (*Fatih Farhat Asshidiq*) disesuaikan ke ukuran ideal dan proporsional (`h-16 sm:h-18` di dalam kontainer `h-18 sm:h-20 w-52 sm:w-56`) pada kedua dokumen (Kuitansi dan Invoice) agar tampil seimbang, otentik, dan tidak terlalu besar.
  - **Toggle Halaman Kedua Invoice (Metode & Saluran Pembayaran)**:
    * Pada toolbar pratinjau invoice, sediakan kontrol toggle cepat `[ Hal 1: Rincian ]` dan `[ Hal 2: Metode Bayar ]`.
    * Halaman kedua menampilkan lembar panduan pembayaran formal A4 berfont JetBrains Mono:
      - **QRIS**: Merchant resmi `KAVIO GLOBAL CREATIVE` dilengkapi render gambar QRIS (`qris.png`) tajam resolusi tinggi untuk scan instan via mobile banking & e-wallet.
      - **Transfer Bank**: `BCA : 687 248 6204 a/n Fatih Farhat Asshidiq`.
      - **e-Wallet**: `0821-1150-0190 (Dana, GoPay a/n Fatih Farhat Asshidiq)`.
      - Instruksi verifikasi dan konfirmasi bukti bayar ke admin.
    * Pembaruan nomor rekening resmi BCA pada seluruh template invoice dan pesan WhatsApp menjadi `687 248 6204`.
  - **Scrollability Dua Dokumen (Kuitansi & Invoice)**: Mengatasi masalah tidak bisa di-scroll akibat Lenis scroll capture:
    * Menyematkan atribut `data-lenis-prevent="true"` pada seluruh kontainer modal dan viewport scroll dokumen.
    * Menghentikan Lenis pada `document.documentElement` (`classList.add('lenis-stopped')`) selama modal pratinjau terbuka.
    * Menerapkan flex layout anti-overflow-trap (`flex-1 min-h-0 overflow-y-auto overscroll-contain`) dan `onWheel={(e) => e.stopPropagation()}` agar dokumen panjang (terutama invoice) dapat digulir dengan sempurna menggunakan wheel mouse, trackpad, maupun touch.
  - **Pengesahan**: Sembunyikan cap/stempel resmi untuk sementara waktu menunggu aset stempel terbaru dari pengguna; posisi tanda tangan digital Direktur Akademik diselaraskan presisi dan proporsional di atas garis tanda tangan.
  - **Teks Terbilang**: Mencegah duplikasi kata ("Rupiah Rupiah") dengan sanitasi teks terbilang otomatis.
- **Redesign Rapor Akademik Formal Kavio Academy (Gaya Lembaga Bahasa / Cambridge Formal Berkelas)**:
  - **Zero UI-Slop & Zero Offset**: Hapus seluruh elemen web UI/dashboard SaaS, progress bar warna-warni, dan diagram radar web. Memperbaiki wrapper scaling canvas (`ResponsiveDocumentWrapper`) agar kertas terpusat simetris dan tidak pernah offset atau terpotong pada sisi kiri.
  - **Branding Header (Tanpa 'Yayasan')**: Menggunakan Full Logo resmi Kavio (vektor SVG `logoSvg`: emblem geometris + kata 'kavio ACADEMY') di kiri atas. Nama lembaga adalah **KAVIO ACADEMY** (dilarang mencantumkan kata 'Yayasan').
  - **Tipografi**: Menggunakan **Serif Elegan** (font Lora & Playfair Display berwibawa khas sertifikat & laporan akademik internasional, dipadukan angka tabular yang rapi dan proporsional).
  - **Identitas Siswa Formal**: Tabel data siswa berbaris rapi dua kolom (Nama Peserta Didik, Nomor Induk/ID, Program Paket Belajar, Nama Orang Tua/Wali, Periode Evaluasi, Tanggal Terbit).
  - **Tabel Capaian Kompetensi (Hairline Clean Bordered Table)**: Garis tabel tipis hairline yang rapi dan halus (`border-neutral-300`/`border-neutral-800`), header netral lembut (`bg-neutral-50/80`), padding sel lapang bernafas (No, Aspek Kompetensi & Bobot %, Nilai Angka, Predikat Huruf, Deskripsi Capaian Pembelajaran).
  - **Susunan Berimbang & Lapang Bagian Bawah**: Presensi Kehadiran & Rangkuman Skor Akhir berdampingan secara proporsional dengan hairline border elegan, disusul Evaluasi Naratif Pembimbing (Kekuatan, Fokus Peningkatan, Target Kurikulum).
  - **Blok Pengesahan 1 Kolom**: Di sudut kanan bawah (Pandeglang, [Tanggal Terbit], tanda tangan digital Direktur Akademik *Fatih Farhat Asshidiq*, stempel disembunyikan sementara).
  - **Proporsi 1 Halaman A4 Pas**: Tepat 1 halaman A4 portrait (210 x 297 mm) siap cetak (*print-ready*) dan ekspor PDF tanpa risiko terpotong.
- **Pembaruan Mesin Render Ekspor Dokumen Resmi (html-to-image + jsPDF Retina Sharp)**:
  - **Migrasi Penuh dari html2canvas ke html-to-image**: Menghentikan penggunaan `html2canvas` yang menyebabkan cacat rendering (teks dobel bertumpuk / overlapping glyphs akibat perhitungan metrik font web & CSS scale transform yang rusak).
  - **Arsitektur Rendering Modern Native**: Menggunakan `html-to-image` yang merender DOM via SVG foreignObject native browser, menjamin hasil ekspor 100% akurat, tajam, presisi, dan identik dengan tampilan di layar.
  - **Resolusi Retina Sharp 2x**: Default `pixelRatio: 2`, `quality: 0.98`, `backgroundColor: '#ffffff'`, `cacheBust: true`, dan `style: { transform: 'none', margin: '0' }` untuk performa cepat (<2 detik) dan ukuran file PDF ringan (<1 MB).
  - **Cakupan Menyeluruh Sistem**: Diterapkan pada seluruh modul ekspor dokumen: Rapor Akademik, Kuitansi Pembayaran, Faktur Tagihan (Invoice Hal 1 & Hal 2), Learning Roadmap, dan Sertifikat Kelulusan.
- **Ekspor Dokumen Pas 100% Edge-to-Edge A4 (Zero Letterbox / Zero Ruang Sisa Kertas)**:
  - Dokumen format standar cetak fixed (A4/A5 seperti Rapor Siswa, Invoice, Kuitansi, dan Sertifikat) wajib mengisi 100% seluruh lembaran kertas PDF dari ujung ke ujung (`pdf.addImage(..., 0, 0, pageWidth, pageHeight)`).
  - Dilarang keras menyisakan ruang kosong atau pita/garis putih sisa (*white bands / letterboxing / pillarboxing*) di sekeliling tepi kertas (kanan-kiri atau atas-bawah).
  - Kanvas dokumen A4 pada level HTML/komponen dikunci presisi ke aspek rasio A4 (`width: '794px'`, `height: '1123px'`, `maxHeight: '1123px'`, `boxSizing: 'border-box'`, `overflow: 'hidden'`) dengan layout `flex flex-col justify-between` agar seluruh konten tersusun seimbang, bernafas, dan tidak pernah overflow atau terpotong.
- **Studio Invoice & Kuitansi Non-Paket Siswa (Tab Invoice `DocumentStudio.jsx`)**:
  - **Tujuan Halaman**: Studio pembuatan dan penerbitan Invoice kustom untuk transaksi di luar paket reguler siswa (klien eksternal, jasa pelatihan, ujian/sertifikasi, modul, mentoring tambahan, privat per sesi, atau klien korporat).
  - **Mode Penerima Tagihan Hybrid**:
    - Mendukung pemilihan siswa terdaftar dari database Firestore (auto-fill nama, wali, no. telp).
    - Mendukung mode "Klien Kustom / Eksternal" dengan form input manual bebas: Nama Penerima / Klien / Instansi, Siswa / Peserta Tambahan (opsional), Nomor WhatsApp / Kontak, dan Alamat / Kota domisili.
  - **Multi-Item Tagihan Dinamis**:
    - Pengguna dapat menambahkan 1 atau banyak baris item transaksi secara leluasa (`+ Tambah Item`).
    - Setiap baris memiliki: Deskripsi Layanan/Produk, Kuantitas (Qty), Satuan (Sesi, Bulan, Modul, Paket, Jam, Item), Harga Satuan (Rp), kalkulasi Subtotal baris otomatis, dan tombol hapus baris.
    - Kalkulasi menyeluruh: Subtotal akumulasi, Diskon (% atau Rp), Total Tagihan (Grand Total), Jumlah Terbayar (dengan shortcut Lunasi / DP 50% / Rp 0), dan Sisa Tagihan (Outstanding) / Status LUNAS.
  - **Desain Formal Bank Ledger JetBrains Mono & HTML WYSIWYG Canvas**:
    - Menggantikan iframe `@react-pdf/renderer` dengan Live HTML Canvas A4 yang dibungkus `ResponsiveDocumentWrapper` (bebas toolbar PDF browser bawaan, render instan, dan anti-offset di mobile/desktop).
    - Tipografi: **JetBrains Mono** murni dengan border hairline hitam tegas (`border-b border-black`) dan Full Logo Resmi SVG Kavio Academy (`logoSvg`).
    - Toggle 2 Halaman Invoice:
      * **Hal 1 (Rincian Tagihan)**: Data penerima, tabel multi-item, rekapitulasi pembayaran, dan pengesahan Direktur Akademik Fatih Farhat Asshidiq.
      * **Hal 2 (Saluran & Metode Pembayaran)**: QRIS resmi merchant *KAVIO GLOBAL CREATIVE*, rekening BCA `687 248 6204` a/n *Fatih Farhat Asshidiq*, dan e-Wallet Dana/GoPay `0821-1150-0190` lengkap dengan panduan bayar.
  - **Dukungan Kuitansi (Tanda Terima)**:
    - Toggle `[ Invoice ]` dan `[ Kuitansi ]` tetap tersedia dengan format Formal Bank Ledger JetBrains Mono yang sama lengkap dengan nominal terbilang Rupiah resmi.
  - **Mesin Ekspor Dokumen**:
    - Menggunakan `documentExportEngine.js` (`html-to-image` + `jsPDF`) resolusi Retina Sharp 2x, pas 100% A4 edge-to-edge tanpa sisa ruang.
    - Fitur Salin Teks WhatsApp format rapi dan Cetak Dokumen langsung (`window.print()`).
- **Pemisahan Kontainer Kategori & Auto-Fill Sidebar Rapor Siswa (`ReportCardParameterSidebar.jsx`)**:
  - **Pemisahan Kontainer Mandiri (5 Kartu Berjarak)**:
    - Sidebar form pengaturan rapor dipecah menjadi kontainer kartu terpisah (`Card`) yang berjarak rapi (`space-y-4`):
      1. *Data Siswa & Periode Rapor*
      2. *Metrik Presensi & Kehadiran*
      3. *Matriks Penilaian Kompetensi (0 - 100)*
      4. *Evaluasi Kualitatif & Rekomendasi Mentor*
      5. *Pengesahan Dokumen*
  - **Auto-Fill Cerdas saat Pemilihan Siswa**:
    - Setiap kali siswa dipilih dari autocomplete/database:
      * Nama Orang Tua / Wali otomatis terisi dari data siswa (`st.parentName`).
      * Paket Program otomatis terisi (`st.programTier || st.packageType || 'GROW'`).
      * Durasi & Jumlah Sesi dihitung otomatis: Total Sesi = `st.totalSessions || (sessionsPerMonth * durationMonths)`.
      * Periode Evaluasi otomatis terisi dengan format: `${batchName} (Sesi 1 - ${totalSessions})` (contoh: `Batch 1 (Sesi 1 - 12)`).
      * Presensi Kehadiran otomatis terisi total sesi siswa dan rasio 100% default.
- **Sistem Siklus Hidup Siswa Multi-Batch (Pendaftaran Ulang / Re-Enrollment)**:
  - **Single Identity with Continuous Batch History**: Satu profil siswa di CRM merepresentasikan satu individu siswa seutuhnya (tanpa duplikasi nama/wali di CRM).
  - **Riwayat Periode / Batch Berkelanjutan**:
    * Saat siswa yang telah lulus/selesai mendaftar kembali, siswa diperbarui ke batch berikutnya (misal: `Batch 2`, `Batch 3`).
    * Paket, durasi, kuota sesi, dan status diaktifkan kembali.
    * Seluruh arsip dokumen (Rapor, Sertifikat, Kuitansi, Roadmap) dari Batch 1 sebelumnya tetap tersimpan abadi dan dapat dibuka kembali kapan saja berdasarkan nomor dokumen dan referensi batch masing-masing.















