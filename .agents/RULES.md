# Workspace Rules & Instructions Log

## 📌 Absolute Rules (Acuan Utama & Mutlak)
1. Setiap ada instruksi tambahan, langsung catat ke `.agents/RULES.md` dan jadikan file instruksi itu sebagai acuan utama dan mutlak selalu benar.

## 📝 Instruksi Tambahan & Konfigurasi
- **Network / Remote Access via Tailscale**:
  - Dev server dijalankan menggunakan Vite dengan host binding (`vite --host`, port `5173`).
  - Tailscale IP host: `100.73.151.12` (Node: `kaviopc`).
  - URL Akses:
    - Localhost: `http://localhost:5173`
    - LAN: `http://192.168.1.2:5173`
    - Remote Tailscale: `http://100.73.151.12:5173`
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
