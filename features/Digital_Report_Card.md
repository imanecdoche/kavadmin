# 📊 Product & Technical Specification: Digital Report Card & Periodic Evaluation Engine (KAVADMIN)

> **Document Version:** 1.0.0  
> **Target Module:** `kavadmin` — Kavio Edu Management Suite  
> **Author / Architect:** System Architecture Specification Team  
> **Target Target Environment:** React 18.3.1 | Vite 5.4 | Tailwind CSS 3.4 | Electron 43 | Firebase Firestore | jsPDF + html2canvas  
> **File Placement:** `~/kavadmin-main/features/Digital_Report_Card.md`

---

## 🎯 1. Executive Summary & Objective

Modul **Digital Report Card & Periodic Evaluation Engine** adalah subsistem akademik formal terpadu dalam platform **KAVADMIN** yang berfungsi untuk mengukur, mengevaluasi, memvisualisasikan, dan menerbitkan laporan capaian belajar siswa (*Academic Progress Report*) secara berkala untuk **Kavio Edu** (*Private English Class & Academic Mentoring*).

Sistem ini melengkapi ekosistem KAVADMIN yang sudah ada (Invoice Generator, WhatsApp Studio, Word/Tiptap Module Manager, Student Directory) dengan menyediakan dokumen evaluasi berstandar korporat/akademik yang dilengkapi:
1. **Multi-Skill Competency Rubric:** Evaluasi 5 pilar kompetensi bahasa & disiplin akademik berbobot presisi.
2. **Pure SVG Dynamic Radar Chart:** Visualisasi grafis jaring laba-laba (*spider/radar chart*) tanpa ketergantungan library grafik eksternal yang berat.
3. **Split-Screen Studio with Live A4 Preview:** Panel kendali slider interaktif di sisi kiri dan render kanvas cetak A4 instan di sisi kanan bergaya **Microsoft Fluent Design System**.
4. **Document Authenticity Engine:** Penomoran resmi berstruktur `REP/KEEN/YYYYMM/XXXX`, stempel digital Kavio Edu, tanda tangan Founder, serta QR code verifikasi keaslian dokumen.
5. **Multi-Format Export & Public Sharing:** Ekspor PDF resolusi tinggi (via `jsPDF` + `html2canvas`), gambar PNG HD, dan integrasi tautan publik terenkripsi/terstruktur tanpa login untuk wali murid.
6. **WhatsApp Communication Hook:** Pembuatan otomatis draf pesan WhatsApp resmi yang menyertakan ringkasan nilai, link laporan, dan catatan evaluator.

---

## 🏗️ 2. Architectural Blueprint & Directory Structure

Penambahan fitur ini memperluas struktur direktori `src/` yang sudah ada pada proyek `kavadmin`:

```text
kavadmin/
├── src/
│   ├── components/
│   │   ├── reports/
│   │   │   ├── ReportCardStudio.jsx        # Halaman utama: Split-screen studio (Form + Canvas)
│   │   │   ├── ReportCardPreview.jsx       # Kanvas dokumen A4 cetak resmi
│   │   │   ├── ReportRadarChart.jsx        # Komponen murni SVG Radar/Spider Chart
│   │   │   ├── ReportHistoryModal.jsx      # Modal riwayat rapor per siswa
│   │   │   └── PublicReportViewer.jsx      # Komponen tampilan web publik (Read-Only)
│   │   ├── StudentProfileDrawer.jsx        # [Modified] Tambahan tab riwayat rapor siswa
│   │   ├── WhatsAppStudio.jsx              # [Modified] Tambahan template pesan pengiriman rapor
│   │   └── Navigation.jsx                  # [Modified] Menu link akses Report Studio
│   ├── utils/
│   │   ├── reportPdfExport.js              # Driver kompilasi dan download PDF (jsPDF)
│   │   ├── reportCalculator.js            # Algoritma konversi skor, pembobotan, dan GPA
│   │   └── reportShare.js                  # Generator enkripsi payload & URL publik rapor
│   ├── assets.js                           # [Reused] Stempel resmi, logo baru, TTD Founder
│   └── App.jsx                             # [Modified] Routing tab dan state Firestore sync
└── features/
    └── Digital_Report_Card.md              # Spesifikasi master ini
```

---

## 📐 3. Data Schema & Firestore Data Model

### 3.1. Koleksi: `reports` (Top-Level Collection & Subcollection Reference)
Dokumen disimpan pada koleksi `reports` utama untuk querying analitik global, serta direferensikan pada `students/{studentId}`.

```typescript
interface CompetencyItem {
  key: string;              // "grammar" | "vocabulary" | "speaking" | "listening" | "discipline"
  label: string;            // Nama tampil, misal: "Grammar & Structure"
  weight: number;           // Persentase bobot, total harus 100 (misal: 25)
  score: number;            // 0 - 100
  benchmark: string;        // "Needs Improvement" | "Satisfactory" | "Good" | "Excellent"
  tutorComment?: string;    // Catatan spesifik per kompetensi
}

interface AcademicReportDocument {
  id: string;                      // Format: REP/KEEN/YYYYMM/XXXX (misal: REP/KEEN/202608/8391)
  studentId: string;              // Foreign key ke dokumen siswa
  studentName: string;            // Nama lengkap siswa
  guardianName?: string;          // Nama orang tua / wali
  programTier: "SEED" | "GROW" | "BOOST" | "MASTER" | "CUSTOM";
  periodName: string;             // Misal: "Batch 1 (Sesi 1 - 8)" atau "Agustus 2026"
  issueDate: string;              // ISO string: "YYYY-MM-DD"
  evaluatorName: string;          // Default: "Fatih Farhat Asshidiq"
  evaluatorTitle: string;         // Default: "Academic Director & Founder"
  
  // Metrik Presensi
  attendance: {
    totalSessions: number;        // Misal: 8
    attendedSessions: number;     // Misal: 8
    attendanceRate: number;       // Persentase kalkulasi: (attended/total)*100
    punctualityRate: number;      // 0 - 100
  };

  // Matriks Penilaian
  competencies: CompetencyItem[];

  // Nilai Akhir Terkalkulasi
  compositeScore: number;         // Nilai tertimbang (0.0 - 100.0)
  letterGrade: "A+" | "A" | "B+" | "B" | "C" | "D";
  performanceCategory: "Distinction" | "Proficient" | "Competent" | "Developing" | "Novice";

  // Catatan Kualitatif & Evaluasi
  qualitativeAssessment: {
    keyStrengths: string;         // Poin-poin keunggulan siswa
    areasForImprovement: string;  // Bagian yang perlu ditingkatkan
    generalNotes: string;         // Catatan umum kepribadian & belajar
    nextRoadmapTarget: string;    // Rencana modul/topik sesi berikutnya
  };

  // Metadata Keaslian Dokumen
  verification: {
    verificationHash: string;     // SHA-256 / base64 truncated hash dari id + compositeScore
    publicSlug: string;           // URL friendly slug
    isSigned: boolean;            // Status overlay tanda tangan digital
    isStamped: boolean;           // Status overlay stempel resmi Kavio Edu
  };

  createdAt: string;              // Timestamp ISO
  updatedAt: string;              // Timestamp ISO
}
```

---

## 🧮 4. Mathematical Engine & Evaluation Matrix

### 4.1. Pembobotan Kompetensi Standar (Default Weights)

| Kompetensi | Kunci (*Key*) | Bobot ($\omega_i$) | Indikator Penilaian |
| :--- | :--- | :---: | :--- |
| **Grammar & Structure** | `grammar` | 25% (0.25) | Ketepatan tenses, auxiliary verbs, sintaksis kalimat formal & kasual. |
| **Vocabulary & Idiom** | `vocabulary` | 20% (0.20) | Ragam diksi, collocation, ekspresi kontekstual, pemahaman sinonim. |
| **Speaking Fluency & Pronunciation** | `speaking` | 25% (0.25) | Artikulasi fonetik, intonasi, kelancaran bicara spontan (*fluency*). |
| **Listening & Comprehension** | `listening` | 15% (0.15) | Kecepatan memahami instruksi audio, respons tanya-jawab langsung. |
| **Discipline & Homework** | `discipline` | 15% (0.15) | Presensi, ketepatan waktu, inisiatif latihan di luar jam kelas. |
| **Total** | | **100% (1.00)** | |

### 4.2. Formula Perhitungan Skor Gabungan (*Composite Score*)
$$	ext{Composite Score} = \sum_{i=1}^{n} (	ext{Score}_i 	imes \omega_i)$$

Contoh kalkulasi:
- Grammar: $85 	imes 0.25 = 21.25$
- Vocabulary: $90 	imes 0.20 = 18.00$
- Speaking: $82 	imes 0.25 = 20.50$
- Listening: $88 	imes 0.15 = 13.20$
- Discipline: $95 	imes 0.15 = 14.25$
- **Total Composite Score:** $87.20$

### 4.3. Tabel Konversi Predikat Huruf (*Letter Grade Matrix*)

| Rentang Skor | Predikat (*Grade*) | Kategori (*Status*) | Keterangan Akademik |
| :---: | :---: | :---: | :--- |
| **$93.0 - 100.0$** | **A+** | *Distinction* | Penguasaan materi luar biasa, mandiri & natural |
| **$85.0 - 92.9$** | **A** | *Proficient* | Pemahaman sangat solid, minim kesalahan mendasar |
| **$78.0 - 84.9$** | **B+** | *Upper Competent* | Komunikasi lancar dengan penguasaan konsep baik |
| **$70.0 - 77.9$** | **B** | *Competent* | Memahami konsep inti, butuh variasi ekspresi |
| **$60.0 - 69.9$** | **C** | *Developing* | Perlu bimbingan intensif pada tenses & vokal |
| **$< 60.0$** | **D** | *Novice* | Membutuhkan perombakan materi dasar |

---

## 🎨 5. UI/UX Design & Layout Specification (Microsoft Fluent Style)

### 5.1. Split-Screen Studio Layout
Antarmuka `ReportCardStudio.jsx` mengadopsi layout 2 kolom:
1. **Left Panel (Control Center - 45% Width):**
   - **Student Selector Combobox:** Pilihan siswa dengan pencarian cepat, auto-fill nama paket & riwayat presensi.
   - **Period & Attendance Inputs:** Periode sesi, total pertemuan, dan kehadiran aktual.
   - **Interactive Sliders / Number Steppers:** Slider interaktif nilai kompetensi (0 - 100) dengan indikator warna dinamis (*Emerald* untuk >85, *Blue* untuk 75-84, *Amber* untuk <75).
   - **Narrative Textareas:** Input teks terstruktur untuk kelebihan (*strengths*), area peningkatan (*improvements*), dan catatan instruktur.
   - **Action Bar:** Tombol Simpan (Firestore), Download PDF, Copy Tautan Publik, dan Generate Pesan WhatsApp.
2. **Right Panel (Live A4 Paper Canvas - 55% Width):**
   - Lembar kerja proporsional A4 (`210mm x 297mm`) berlatar putih bersih dengan bayangan lembut (*subtle fluent shadow* `0 8px 30px rgba(0,0,0,0.12)`).
   - Seluruh perubahan data di panel kiri ter-render secara instan (*zero latency*).

### 5.2. Anatomi Lembar Rapor A4 (`ReportCardPreview.jsx`)
- **Top Header Bar:**
  - Logo Resmi Kavio Edu di kiri atas.
  - Judul Dokumen: `OFFICIAL ACADEMIC PROGRESS REPORT` / `LAPORAN PERKEMBANGAN BELAJAR RESMI`.
  - Metadata Box di kanan atas: Nomor Rapor (`REP/KEEN/...`), Tanggal Terbit, Periode Evaluasi, Program Tier.
- **Section 1: Student Profile & Attendance Card:**
  - Grid informasi: Nama Siswa, Nomor Induk Siswa, Total Sesi, Rasio Presensi (Badge Persentase Hijau).
- **Section 2: Multi-Axis Performance Visualization (Grid 2 Kolom):**
  - **Kiri:** SVG Pure Radar/Spider Chart yang merender 5 titik sumbu kompetensi dengan polygon semi-transparan bergradasi biru/cyan.
  - **Kanan:** Tabel Rincian Skor (Kompetensi, Bobot, Skor Angka, Predikat Mini, Bar Kemajuan).
- **Section 3: Summary Achievement Badge:**
  - Box sorotan besar berisi: Skor Akhir Kumulatif (misal `87.2 / 100`), Predikat Huruf (`GRADE A`), dan Pita Kategori (`PROFICIENT`).
- **Section 4: Evaluator's Comprehensive Feedback:**
  - 3 Kolom/Box: *Key Strengths & Achievements*, *Areas for Targeted Growth*, dan *Next Academic Roadmap Target*.
- **Section 5: Legal Verification & Signature Footer:**
  - Kolom Kiri: QR Code verifikasi dokumen (menuju *Public Share Link*) & Verification Hash.
  - Kolom Kanan: Lokasi penerbitan (*Pandeglang, Banten*), Tanggal, Tanda Tangan Digital Founder, Stempel Resmi Lembaga, dan Nama Terang Founder (`Fatih Farhat Asshidiq`).

---

## 🕸️ 6. Pure SVG Radar Chart Implementation Logic

Komponen `ReportRadarChart.jsx` dibangun tanpa dependensi eksternal untuk menjamin kompatibilitas 100% saat di-render oleh `html2canvas` dan `jsPDF`.

### Algoritma Poligon Radar:
1. Titik pusat lingkaran radar: $(C_x, C_y) = (150, 150)$, Radius maksimal $R = 100$.
2. Jumlah sumbu $N = 5$.
3. Sudut per sumbu: $	heta_i = \left(rac{2\pi}{N}ight) 	imes i - rac{\pi}{2}$ (dimulai dari atas).
4. Titik koordinat data:
   $$X_i = C_x + \left(R 	imes rac{	ext{Score}_i}{100}ight) 	imes \cos(	heta_i)$$
   $$Y_i = C_y + \left(R 	imes rac{	ext{Score}_i}{100}ight) 	imes \sin(	heta_i)$$
5. Dihubungkan menjadi SVG `<polygon points="X0,Y0 X1,Y1 ... Xn,Yn" fill="rgba(0,120,212,0.25)" stroke="#0078D4" stroke-width="2.5" />`.

---

## 🖨️ 7. PDF Compilation & Rendering Engine

Menggunakan konfigurasi `jsPDF` + `html2canvas` standar KAVADMIN di `src/utils/reportPdfExport.js`:

```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportReportToPdf = async (elementId, reportMeta) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Preview element not found");

  // Opsi canvas resolusi tinggi (scale 2 untuk retensi ketajaman cetak)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  
  const sanitizedName = (reportMeta.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedPeriod = (reportMeta.periodName || 'Period').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Rapor_KavioEdu_${sanitizedName}_${sanitizedPeriod}.pdf`;
  
  pdf.save(filename);
  return filename;
};
```

---

## 💬 8. WhatsApp Studio Integration Template

Integrasikan generator draf pesan laporan hasil belajar pada `src/components/WhatsAppStudio.jsx` dan tombol pintas di `ReportCardStudio.jsx`:

```javascript
export const generateReportWhatsAppMessage = (reportData, shareUrl) => {
  const { studentName, periodName, compositeScore, letterGrade, qualitativeAssessment } = reportData;

  return `*LAPORAN PERKEMBANGAN BELAJAR SISWA (ACADEMIC PROGRESS REPORT)*
*KAVIO EDU — Private English Class & Mentoring*
━━━━━━━━━━━━━━━━━━━━━

Yth. Orang Tua / Wali dari *${studentName}*,

Berikut kami sampaikan rincian evaluasi perkembangan belajar berkala untuk periode *${periodName}*:

📊 *RINGKASAN CAPAIAN AKADEMIK:*
• Skor Akhir: *${compositeScore.toFixed(1)} / 100*
• Predikat: *${letterGrade}*
• Kehadiran: *${reportData.attendance.attendedSessions}/${reportData.attendance.totalSessions} Sesi (${reportData.attendance.attendanceRate}%)*

🌟 *Sorotan Kemajuan:*
"${qualitativeAssessment.keyStrengths}"

🎯 *Fokus Pengembangan Selanjutnya:*
"${qualitativeAssessment.areasForImprovement}"

📄 *DOKUMEN RESMI & GRAFIK LENGKAP:*
Laporan digital resmi dengan stempel dan tanda tangan dapat diakses dan diunduh melalui tautan berikut:
👉 ${shareUrl}

Terima kasih atas kepercayaan dan kerja sama Bapak/Ibu dalam mendukung proses belajar ${studentName}.

Salam hangat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`;
};
```

---

## 🤖 9. AI Agent 4-Phase Implementation Instructions

Gunakan instruksi terstruktur 4 fase di bawah ini saat menugaskan AI Coding Agent untuk mengimplementasikan fitur ini secara menyeluruh pada repositori `kavadmin`.

```markdown
### 📋 INSTRUCTIONS FOR AI CODING AGENT: 4-PHASE IMPLEMENTATION PLAN

Follow these 4 phases sequentially. Complete and verify each phase before moving to the next.

---

#### 🔹 PHASE 1: Mathematical Engine, Rubric Helpers & Pure SVG Radar Chart
1. **Create `src/utils/reportCalculator.js`**:
   - Implement `calculateCompositeScore(competencies)` with weighted sum algorithm.
   - Implement `getLetterGrade(score)` and `getPerformanceCategory(score)`.
   - Implement `generateReportNumber(date, sequenceNumber)` returning format `REP/KEEN/YYYYMM/XXXX`.
   - Implement default benchmark generator for individual scores (e.g., >=85: "Excellent", >=75: "Good", >=65: "Satisfactory", <65: "Needs Improvement").
2. **Create `src/components/reports/ReportRadarChart.jsx`**:
   - Write a zero-dependency SVG component rendering dynamic polygonal radar/spider charts based on 5 competencies.
   - Include concentric background polygons, axis labels, dynamic data polygon with subtle gradients, and data point circles.
   - Ensure complete responsiveness and compatibility with `html2canvas`.

---

#### 🔹 PHASE 2: Live A4 Printable Preview Canvas & Split-Screen Studio UI
1. **Create `src/components/reports/ReportCardPreview.jsx`**:
   - Build a pixel-perfect A4 canvas container (`210mm x 297mm` aspect ratio).
   - Incorporate Kavio Edu branding from `src/assets.js` (Logo, Seal, Founder Signature).
   - Implement clean Microsoft Fluent styling: high-contrast headers, attendance metrics, radar chart integration, evaluation tables, narrative feedback boxes, and digital signature/seal placement.
2. **Create `src/components/reports/ReportCardStudio.jsx`**:
   - Build the 2-column split-screen layout (Form Controls on the left, Live A4 Preview on the right).
   - Integrate student auto-complete / selector connected to Firestore `students` state.
   - Implement interactive sliders for scores (0-100) with dynamic color feedback.
   - Add input fields for period, attendance, qualitative feedback (strengths, growth areas, next targets).
   - Bind real-time state changes to the right-hand preview without re-render stutter.

---

#### 🔹 PHASE 3: PDF Export Engine, Verification Hash, and WhatsApp Automation
1. **Create `src/utils/reportPdfExport.js`**:
   - Implement high-definition canvas-to-PDF export pipeline using `jsPDF` and `html2canvas` at 2x scale.
   - Add image smoothing and exact A4 boundary cropping to prevent blank trailing pages.
2. **Create `src/utils/reportShare.js`**:
   - Implement URL generation for public sharing with base64/JSON URL-safe encoding or Firestore document ID lookup.
3. **Update `src/components/WhatsAppStudio.jsx` & Add Action Hooks in Studio**:
   - Add the Academic Report WhatsApp template to the WhatsApp Studio.
   - Add quick "Copy WA Draft", "Download PDF", and "Save to Firestore" action buttons with toast/dialog feedback in `ReportCardStudio.jsx`.

---

#### 🔹 PHASE 4: Firestore Sync, Navigation, Student Profile Drawer & Route Integration
1. **Update Firebase Integration & Firestore Collections**:
   - Ensure `reports` collection CRUD functions (save report, fetch reports by student ID, delete report) are wired to `src/firebase.js` or state hooks.
2. **Update `src/components/StudentProfileDrawer.jsx`**:
   - Add a dedicated **"Rapor & Evaluasi"** tab inside the student drawer to display all past issued report cards for that student with instant download / view links.
3. **Update `src/components/Navigation.jsx` & `src/App.jsx`**:
   - Add the **"Academic Reports"** / **"Rapor Siswa"** navigation tab in the top header.
   - Configure view state router in `App.jsx` to mount `ReportCardStudio.jsx` seamlessly alongside existing tabs (Dashboard, Invoice, Modules, WhatsApp).
4. **Create `src/components/reports/PublicReportViewer.jsx`**:
   - Standalone clean view for public URL access allowing guardians to view and download their student's report card directly in browser.
5. **Run Lint & Build Verification**:
   - Execute `npm run build` and test both Web and Electron views to ensure zero compile warnings or rendering glitches.
```

---

## 🔒 10. Security & Firestore Rules

Tambahkan aturan keamanan Firestore berikut pada `firestore.rules` untuk melindungi dokumen evaluasi siswa:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Koleksi Laporan Rapor
    match /reports/{reportId} {
      // Membaca diperbolehkan secara publik jika mengakses ID dokumen valid (untuk wali murid)
      allow read: if true;
      // Menulis/Mengubah/Menghapus hanya untuk admin terotentikasi
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📌 11. Checklist Verifikasi Akhir (Definition of Done)

- [ ] Kalkulasi nilai berbobot ($25\%, 20\%, 25\%, 15\%, 15\%$) akurat 100% terhadap tabel konversi nilai.
- [ ] Grafik SVG Radar Chart ter-render sempurna tanpa lag dan tercetak jernih di file PDF.
- [ ] File PDF hasil ekspor pas di 1 halaman A4 portrait tanpa elemen yang terpotong.
- [ ] Stempel resmi, tanda tangan digital Founder, dan nomor registrasi `REP/KEEN/...` terpasang rapi di footer dokumen.
- [ ] Tombol WhatsApp menghasilkan format draf pesan formal yang rapi dengan link publik yang dapat diklik.
- [ ] Drawer profil siswa dapat menampilkan riwayat rapor yang pernah diterbitkan untuk siswa terkait.
- [ ] Build produksi `npm run build` dan `npm run electron:linux` / `npm run electron:build` sukses tanpa *error*.
