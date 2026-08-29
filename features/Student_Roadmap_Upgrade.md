# 🗺️ Product & Technical Specification: Interactive Learning Roadmap & Curriculum Milestone Engine (KAVADMIN)

> **Document Version:** 2.0.0 (Comprehensive Upgrade)  
> **Target Module:** `kavadmin` — Kavio Edu Management Suite  
> **Target Environment:** React 18.3.1 | Vite 5.4 | Tailwind CSS 3.4 | Electron 43 | Firebase Firestore | Tiptap Suite | jsPDF + html2canvas  
> **File Placement:** `~/kavadmin-main/features/Student_Roadmap_Upgrade.md`

---

## 🎯 1. Executive Summary & Upgrade Objectives

Fitur **Student Roadmap & Milestone Tracker** pada KAVADMIN ditingkatkan dari pelacak daftar linier sederhana menjadi **Sistem Manajemen Alur Belajar & Kurikulum Interaktif (Interactive Learning Roadmap & Milestone Engine)**. 

Peningkatan ini dirancang khusus untuk memenuhi standar operasional **Kavio Edu** (*Private English Class & Academic Mentoring*), memberikan visibilitas penuh bagi tutor, siswa, dan wali murid terhadap lintasan capaian akademik (*learning pathway*).

### 🌟 Pilar Peningkatan Utama:
1. **Interactive Metro-Line / Skill-Tree Visualization:** Visualisasi alur pembelajaran bergaya jalur stasiun modern (*metro-line*) dengan status visual adaptif (`Locked`, `In Progress`, `Under Review`, `Mastered`), garis konektor bercahaya (*glowing pulse*), serta pemisahan kuartal/tingkatan (*Foundation*, *Intermediate*, *Advanced*, *Mastery*).
2. **Direct Tiptap Module Linking & One-Click Drawer:** Setiap titik milestone terhubung langsung ke modul materi di `ModulesManager.jsx` dan dapat dibuka seketika dalam mode baca/latihan tanpa meninggalkan halaman profil siswa.
3. **Preset Kurikulum Berdasarkan Paket Kursus:** Tersedia template kurikulum standar siap pakai untuk paket `SEED`, `GROW`, `BOOST`, `MASTER`, serta *Custom Pathway Builder* (tambah/hapus/atur urutan materi) untuk paket `CUSTOM`.
4. **Granular Checklist & Session Burn-Down:** Rincian sub-target di tiap materi (Teori, Latihan Percakapan, Tugas PR, Kuis Singkat) dengan penghitungan otomatis persentase kelulusan materi dan progres total.
5. **Sinergi Antar-Modul (Presensi & Rapor Digital):** Terhubung ke log presensi jadwal pertemuan dan otomatis mengisi rekomendasi `nextRoadmapTarget` pada modul *Digital Report Card*.
6. **Multi-Format Visual Export & Public Viewer:** Render grafis alur peta belajar ke format PNG HD / PDF ringkas via `html2canvas` + `jsPDF`, serta penyediaan *Public Share Link* interaktif untuk wali murid tanpa autentikasi login.
7. **Otomasi WhatsApp:** Generator pesan otomatis untuk memberi tahu wali murid setiap kali siswa menyelesaikan satu milestone besar atau naik tingkat.

---

## 🏗️ 2. Architectural Blueprint & Directory Structure

Penambahan arsitektur modul baru dan modifikasi file yang sudah ada:

```text
kavadmin/
├── src/
│   ├── components/
│   │   ├── roadmap/
│   │   │   ├── StudentRoadmapStudio.jsx     # Workspace utama roadmap: Pathway + Editor Panel
│   │   │   ├── RoadmapMetroGraph.jsx        # Komponen grafis visual jalur Metro-Line / Skill-Tree
│   │   │   ├── MilestoneNodeCard.jsx        # Komponen kartu node milestone dengan state interaktif
│   │   │   ├── MilestoneDetailDrawer.jsx    # Drawer detail: checklist tugas, catatan tutor & quick module
│   │   │   ├── RoadmapPresetSelector.jsx    # Modal pemilih template kurikulum (SEED/GROW/BOOST/MASTER)
│   │   │   ├── CustomMilestoneModal.jsx     # Modal pembuatan/pengeditan milestone kustom
│   │   │   └── PublicRoadmapViewer.jsx      # Portal web publik read-only untuk wali murid
│   │   ├── StudentProfileDrawer.jsx         # [Modified] Tab "Roadmap Belajar" terintegrasi penuh
│   │   ├── WhatsAppStudio.jsx               # [Modified] Template pesan notifikasi milestone selesai
│   │   ├── reports/ReportCardStudio.jsx     # [Modified] Hook data target roadmap ke draf rapor
│   │   └── Navigation.jsx                   # [Modified] Shortcut akses Roadmap Studio
│   ├── utils/
│   │   ├── curriculumPresets.js             # Data pustaka kurikulum resmi Kavio Edu
│   │   ├── roadmapCalculator.js             # Kalkulasi persentase kelulusan, XP, dan estimasi waktu
│   │   ├── roadmapExport.js                 # Mesin snapshot grafis PNG/PDF (html2canvas + jsPDF)
│   │   └── roadmapShare.js                  # Generator URL publik terenkripsi/terstruktur
│   └── App.jsx                              # [Modified] Routing tab & sinkronisasi Firestore
└── features/
    └── Student_Roadmap_Upgrade.md           # Master spesifikasi ini
```

---

## 📐 3. Data Schema & Firestore Data Model

### 3.1. Koleksi: `roadmaps`
Dokumen roadmap disimpan secara mandiri dengan `studentId` sebagai kunci pencarian utama:

```typescript
type MilestoneStatus = "Locked" | "In Progress" | "Under Review" | "Mastered";
type AcademicLevel = "Foundation" | "Intermediate" | "Advanced" | "Mastery";

interface RoadmapChecklistItem {
  id: string;              // Misal: "chk-01"
  label: string;           // Misal: "Pemahaman Aturan Tense & Signal Words"
  isCompleted: boolean;
  completedAt?: string;    // Timestamp ISO
}

interface MilestoneItem {
  id: string;                      // Format: "MS-01", "MS-02", dst.
  orderIndex: number;              // 1, 2, 3... untuk pengurutan tampilan
  title: string;                   // Judul materi (misal: "Auxiliary Verbs Mastery")
  level: AcademicLevel;
  targetSessions: number;          // Estimasi alokasi sesi (misal: 2 sesi)
  linkedModuleId?: string | null;  // Foreign key ke koleksi `modules` (Tiptap doc)
  status: MilestoneStatus;
  startedAt?: string | null;       // Tanggal mulai (YYYY-MM-DD)
  completedAt?: string | null;     // Tanggal tuntas (YYYY-MM-DD)
  tutorNotes: string;              // Catatan perkembangan spesifik tutor
  checklist: RoadmapChecklistItem[];
  badgeIcon?: string;              // Nama ikon Lucide (misal: "BookOpen", "Sparkles", "Mic")
}

interface StudentRoadmapDocument {
  id: string;                      // Format: "RDM-{studentId}"
  studentId: string;               // Foreign key ke koleksi `students`
  studentName: string;
  programTier: "SEED" | "GROW" | "BOOST" | "MASTER" | "CUSTOM";
  presetTemplateId?: string;       // Misal: "GROW_CORE_V1"
  
  // Statistik & Metrik Progres
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  overallProgress: number;         // 0.0 - 100.0 (%)
  currentLevel: AcademicLevel;
  totalEstimatedSessions: number;
  sessionsCompletedCount: number;

  // Daftar Node Milestone Terurut
  milestones: MilestoneItem[];

  // Riwayat Catatan & Log Evaluasi
  roadmapLogs: {
    timestamp: string;
    milestoneId: string;
    milestoneTitle: string;
    action: "STATUS_CHANGE" | "CHECKLIST_UPDATE" | "NOTE_ADDED";
    description: string;
  }[];

  createdAt: string;
  updatedAt: string;
}
```

---

## 📚 4. Curriculum Presets Library (`curriculumPresets.js`)

Kavio Edu memiliki kurikulum terstruktur yang dipetakan langsung ke paket kursus:

### 4.1. Paket SEED (Foundational English & Communication Basics)
*Target: Pemula / Pembangunan Fondasi Kalimat Sederhana (3 Sesi/Bulan)*
1. **MS-01: Subject Pronouns & To-Be Verbs in Present/Past** (Foundation | 2 Sesi)
2. **MS-02: Daily Routine & Simple Present Action Verbs** (Foundation | 2 Sesi)
3. **MS-03: Essential Question Words (5W+1H) & Responses** (Foundation | 2 Sesi)
4. **MS-04: Everyday Vocabulary & Basic Interactive Speaking** (Foundation | 3 Sesi)

### 4.2. Paket GROW (Core Grammar & Conversational Fluency)
*Target: Tingkat Menengah / Kelancaran Percakapan & Tata Bahasa Komprehensif (4 Sesi/Bulan)*
1. **MS-01: Auxiliary Verbs & Modal Mastery (Can, Could, Should, Must)** (Foundation | 2 Sesi)
2. **MS-02: Dynamic Storytelling: Simple Past vs Present Perfect** (Intermediate | 3 Sesi)
3. **MS-03: Expressing Future Plans & Intentions (Will vs Going To)** (Intermediate | 2 Sesi)
4. **MS-04: Common Phrasal Verbs & Natural Idiomatic Expressions** (Intermediate | 3 Sesi)
5. **MS-05: Spontaneous Conversational Drills & Topic Debates** (Intermediate | 2 Sesi)

### 4.3. Paket BOOST (Academic Acceleration & Test Preparation)
*Target: Akselerasi / Ujian & Pemahaman Bacaan Mendalam (8 Sesi/Bulan)*
1. **MS-01: Advanced Sentence Clauses & Connectors (Relative, Adverbial)** (Intermediate | 3 Sesi)
2. **MS-02: Passive Voice & Impersonal Academic Structures** (Intermediate | 3 Sesi)
3. **MS-03: Conditional Sentences (Types 1, 2, 3 & Mixed Conditionals)** (Advanced | 4 Sesi)
4. **MS-04: Fast Reading Comprehension & Inference Strategies** (Advanced | 3 Sesi)
5. **MS-05: Speed Vocabulary Acquisition & Contextual Synonyms** (Advanced | 3 Sesi)

### 4.4. Paket MASTER (Academic Writing & Critical Discourse)
*Target: Tingkat Mahir / Penulisan Esai Formal & Diskusi Kritis (8 Sesi @ 90 Menit)*
1. **MS-01: Academic Essay Structuring (Thesis Statement, Cohesion)** (Advanced | 4 Sesi)
2. **MS-02: Critical Discourse Analysis & Article Review** (Advanced | 4 Sesi)
3. **MS-03: Formal Presentation Skills & Impromptu Public Speaking** (Mastery | 4 Sesi)
4. **MS-04: Professional Business Correspondence & Argumentative Debate** (Mastery | 4 Sesi)

---

## 🧮 5. Progress Calculation & Leveling Engine (`roadmapCalculator.js`)

### 5.1. Formula Progres Milestone Individual
Tiap milestone memiliki sub-checklist tugas. Progres milestone ($P_{	ext{ms}}$) dihitung:
$$P_{	ext{ms}} = egin{cases} 
100\% & 	ext{jika status } = 	ext{"Mastered"} \
0\% & 	ext{jika status } = 	ext{"Locked"} \
\left(rac{N_{	ext{completed\_tasks}}}{N_{	ext{total\_tasks}}}ight) 	imes 100\% & 	ext{jika status } \in \{	ext{"In Progress"}, 	ext{"Under Review"}\}
\end{cases}$$

### 5.2. Formula Progres Keseluruhan (*Overall Roadmap Progress*)
$$P_{	ext{total}} = rac{\sum_{i=1}^{M} P_{	ext{ms}, i}}{M}$$
*(Di mana $M$ adalah total milestone pada roadmap siswa).*

### 5.3. Logika Auto-Advancement & Status Transisi:
- **Locked $ightarrow$ In Progress:** Terbuka otomatis saat milestone sebelumnya mencapai status `Mastered`, atau diubah manual oleh tutor.
- **In Progress $ightarrow$ Under Review:** Terpicu otomatis jika semua item checklist sub-tugas telah dicentang ($100\%$), menandakan siswa siap masuk sesi evaluasi/tutor review.
- **Under Review $ightarrow$ Mastered:** Divalidasi oleh tutor dengan pengisian tanggal kelulusan `completedAt` dan catatan evaluasi ringkas.

---

## 🎨 6. UI/UX Design & Layout Specification (Microsoft Fluent Style)

### 6.1. Visualisasi Metro-Line Graph (`RoadmapMetroGraph.jsx`)
- **Tampilan Vertikal/Z-Pattern S-Curve:** Jalur metro vertikal yang berkelok elegan dengan lekukan kurva SVG (`cubic-bezier`).
- **Node Node Stasiun:** Lingkaran node berdiameter 48px dengan status visual:
  - `Mastered`: Lingkaran hijau zamrud (*Emerald 500*), ikon centang putih, bercahaya lembut (*glow ring*).
  - `In Progress`: Lingkaran biru Fluent (*Fluent Blue 600*), ikon modul aktif, animasi denyut (*pulse animation*).
  - `Under Review`: Lingkaran oranye terang (*Amber 500*), ikon pensil/evaluasi.
  - `Locked`: Lingkaran abu-abu (*Slate 300* / *Slate 700 dark mode*), ikon gembok terkunci.
- **Level Headers:** Garis pemisah horizontal berpenanda tingkatan (*Badge: Foundation, Intermediate, Advanced, Mastery*).

### 6.2. Panel Kendali Studio (`StudentRoadmapStudio.jsx`)
- **Top Metrics Bar:** Menampilkan nama siswa, paket aktif, total progres (dengan bar animasi Fluent), kuota sesi terpakai vs estimasi, dan tombol aksi (*Load Preset*, *Add Milestone*, *Export Snapshot*, *Share Link*).
- **Interactive Node Click Action:** Mengklik node mana saja akan membuka **Milestone Detail Drawer** dari sisi kanan layar.

### 6.3. Drawer Detail Milestone (`MilestoneDetailDrawer.jsx`)
- **Header:** Judul materi, nomor urutan, dropdown ubah status instan.
- **Tiptap Linked Module Section:**
  - Menampilkan judul modul Tiptap yang terhubung.
  - Tombol **"Buka Materi di Word Editor"** / **"Quick Preview"** yang memuat materi secara *popover*.
- **Sub-Task Checklist Manager:**
  - Tambah, centang, atau hapus item tugas belajar secara interaktif.
- **Catatan Tutor & Log Kemajuan:**
  - Textarea untuk menulis evaluasi materi pertemuan.

---

## 🔗 7. Deep Integration: Tiptap Editor, Student Drawer, & Report Card

### 7.1. Integrasi dengan Modul Materi Tiptap (`ModulesManager.jsx`)
- Saat membuat atau mengedit milestone, tutor dapat memilih modul dari dropdown yang mengambil data langsung dari koleksi `modules`.
- Ketika tombol "Buka Materi" diklik, sistem membuka `FullPageWordEditor.jsx` dengan memuat dokumen Tiptap yang sesuai berdasarkan `linkedModuleId`.

### 7.2. Integrasi dengan `StudentProfileDrawer.jsx`
- Pada panel profil siswa, tab **"Roadmap Belajar"** menampilkan versi ringkas *Metro-Line Graph* dan ringkasan persentase penyelesaian materi.
- Tutor dapat mencentang tugas langsung dari profil siswa tanpa harus membuka studio roadmap utama.

### 7.3. Integrasi dengan `ReportCardStudio.jsx` (Rapor Digital)
- Saat menerbitkan rapor baru, dropdown `nextRoadmapTarget` otomatis menyarankan judul milestone berikutnya yang berstatus `In Progress` atau `Locked`.

---

## 📸 8. Visual Snapshot Export & Public Sharing Engine

### 8.1. Snapshot Generator (`roadmapExport.js`)
Menggunakan `html2canvas` dan `jsPDF` untuk membuat infografis peta capaian belajar siswa:
- **Format PNG HD:** Render kanvas alur roadmap lengkap dengan header nama siswa, logo Kavio Edu, dan total progres untuk dibagikan ke media sosial / status WhatsApp.
- **Format PDF Progress Summary:** Dokumen 1 lembar A4 berisi tabel alur materi, status per milestone, catatan tutor, dan stempel resmi.

### 8.2. Public Viewer (`PublicRoadmapViewer.jsx`)
- URL publik: `https://kavioedu.com/roadmap?id=RDM-STD-XXXX&verify=hash`
- Tampilan web bersih (*mobile-friendly*) bagi orang tua untuk memantau kemajuan belajar anak mereka kapan saja secara *real-time*.

---

## 💬 9. WhatsApp Automation Integration

Integrasikan template pesan progres roadmap ke dalam `src/components/WhatsAppStudio.jsx`:

```javascript
export const generateRoadmapUpdateWhatsAppMessage = (studentName, milestone, progressPercent, publicUrl) => {
  return `*UPDATE CAPAIAN BELAJAR SISWA (MILESTONE COMPLETED)*
*KAVIO EDU — Private English Class & Mentoring*
━━━━━━━━━━━━━━━━━━━━━

Yth. Orang Tua / Wali dari *${studentName}*,

Kabar gembira! Siswa kami *${studentName}* telah berhasil menyelesaikan target pembelajaran baru:

🎯 *Materi Tuntas:*
• *${milestone.orderIndex}. ${milestone.title}* (${milestone.level})
• *Catatan Tutor:* "${milestone.tutorNotes || 'Menguasai materi dengan sangat baik dan aktif dalam sesi latihan.'}"

📊 *Progres Kurikulum Keseluruhan:*
• Capaian Belajar: *${progressPercent.toFixed(1)}% Selesai*

🗺️ *PETA BELAJAR INTERAKTIF:*
Bapak/Ibu dapat melihat alur lengkap peta belajar, materi yang sudah tuntas, dan target selanjutnya melalui tautan publik berikut:
👉 ${publicUrl}

Terima kasih atas kerja sama dan dukungan Bapak/Ibu dalam mendampingi proses belajar ${studentName}!

Salam hormat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`;
};
```

---

## 🤖 10. AI Agent 4-Phase Implementation Instructions

Instruksi terstruktur bagi AI Coding Agent untuk mengimplementasikan fitur upgrade roadmap secara menyeluruh pada repositori `kavadmin`:

```markdown
### 📋 INSTRUCTIONS FOR AI CODING AGENT: 4-PHASE ROADMAP UPGRADE PLAN

Execute the following 4 phases in exact sequence. Verify each phase before moving to the next.

---

#### 🔹 PHASE 1: Data Models, Preset Library & Progress Calculator
1. **Create `src/utils/curriculumPresets.js`**:
   - Define structured curriculum templates for SEED, GROW, BOOST, and MASTER program tiers with milestones, target sessions, academic levels, and checklist items.
2. **Create `src/utils/roadmapCalculator.js`**:
   - Implement `calculateMilestoneProgress(milestone)`, `calculateOverallRoadmapProgress(milestones)`, and `getAcademicLevelBadge(level)`.
   - Implement `autoAdvanceRoadmap(milestones)` to unlock the next milestone when the previous one is completed.
3. **Create `src/utils/roadmapShare.js`**:
   - Implement URL generator for public read-only access with sanitized parameters.

---

#### 🔹 PHASE 2: Metro-Line Graph, Node Components & Interactive Drawer
1. **Create `src/components/roadmap/RoadmapMetroGraph.jsx`**:
   - Build a responsive SVG + Tailwind visual component rendering the connected metro-line track with glowing status nodes, level section dividers, and fluid animation.
2. **Create `src/components/roadmap/MilestoneNodeCard.jsx`**:
   - Build interactive node cards displaying title, status badges, progress bars, and hover tooltips.
3. **Create `src/components/roadmap/MilestoneDetailDrawer.jsx`**:
   - Implement slide-over drawer with status updater, interactive checklist items, tutor evaluation notes textarea, and quick-link button to open the linked Tiptap module.
4. **Create `src/components/roadmap/RoadmapPresetSelector.jsx`**:
   - Modal to select and load standard curriculum presets (SEED/GROW/BOOST/MASTER) into a student's profile.

---

#### 🔹 PHASE 3: Custom Builder, Tiptap Linking, Visual Snapshot & WhatsApp Hook
1. **Create `src/components/roadmap/CustomMilestoneModal.jsx`**:
   - Modal to create or edit custom milestones (Title, Level, Target Sessions, Linked Module Selector, Checklists).
2. **Create `src/utils/roadmapExport.js`**:
   - Implement high-res PNG snapshot & PDF export via `html2canvas` and `jsPDF`.
3. **Update `src/components/WhatsAppStudio.jsx`**:
   - Add the "Roadmap Milestone Update" message generator template.
4. **Create `src/components/roadmap/StudentRoadmapStudio.jsx`**:
   - Master workspace component binding the Top Metrics Bar, Metro Graph, Preset Loader, Custom Builder, and Snapshot actions.

---

#### 🔹 PHASE 4: Firestore Sync, Navigation, Profile Drawer & Public Viewer
1. **Connect Firestore CRUD**:
   - Add functions to save, fetch, and update student roadmaps in the `roadmaps` Firestore collection.
2. **Update `src/components/StudentProfileDrawer.jsx`**:
   - Embed the interactive `RoadmapMetroGraph` and progress summary into the "Roadmap Belajar" tab.
3. **Create `src/components/roadmap/PublicRoadmapViewer.jsx`**:
   - Build a clean, responsive, read-only public web view for parents.
4. **Update `src/components/Navigation.jsx` & `src/App.jsx`**:
   - Add navigation tab "Roadmap Kurikulum" / "Student Roadmap" and wire view routing.
5. **Run Lint & Build Verification**:
   - Run `npm run build` and test both Web and Electron views to ensure zero compile warnings or rendering errors.
```

---

## 🔒 11. Security & Firestore Rules

Tambahkan aturan keamanan Firestore berikut pada `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Koleksi Roadmap Siswa
    match /roadmaps/{roadmapId} {
      // Akses baca diizinkan secara publik untuk verifikasi link wali murid
      allow read: if true;
      // Operasi tulis/update hanya untuk admin terotentikasi
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📌 12. Checklist Verifikasi Akhir (Definition of Done)

- [ ] Preset kurikulum (SEED, GROW, BOOST, MASTER) berhasil dimuat dan terisi otomatis sesuai paket siswa.
- [ ] Visualisasi Metro-Line ter-render rapi dan responsif dengan status warna presisi (`Locked`, `In Progress`, `Under Review`, `Mastered`).
- [ ] Mengklik tombol materi di dalam drawer langsung membuka modul di Tiptap editor tanpa kendala.
- [ ] Tombol checklist sub-tugas memperbarui persentase progres total secara *real-time*.
- [ ] Ekspor gambar PNG dan PDF peta belajar beresolusi tinggi tanpa ada teks yang terpotong.
- [ ] Tombol WhatsApp menghasilkan draf pesan resmi dengan link publik yang valid.
- [ ] Tab Roadmap pada `StudentProfileDrawer.jsx` menampilkan grafik yang sinkron dengan data utama.
- [ ] `npm run build` dan `npm run electron:build` sukses tanpa kesalahan kompilasi.
