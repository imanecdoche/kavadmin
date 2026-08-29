import React, { useState } from 'react'
import { MessageSquare, Copy, Check, User, Calendar, CreditCard, Send } from 'lucide-react'

export default function WhatsAppStudio() {
  const [studentName, setStudentName] = useState('Alya')
  const [parentName, setParentName] = useState('Ibu Rina')
  const [scheduleText, setScheduleText] = useState('Selasa & Rabu, 15.00 WIB')
  const [amountText, setAmountText] = useState('200.000')
  const [activePresetIndex, setActivePresetIndex] = useState(0)

  const [copiedIndex, setCopiedIndex] = useState(null)

  const presets = [
    {
      title: 'Konfirmasi Diskusi / Pertemuan Perdana',
      category: 'Diskusi Awal',
      generate: () => `Halo Bpk/Ibu ${parentName || studentName},

Salam dari Kavio Edu. Semoga Bpk/Ibu dalam keadaan sehat.

Kami ingin mengonfirmasi jadwal pertemuan perdana / diskusi kebutuhan kursus private English untuk ${studentName} yang telah direncanakan pada:

Jadwal: ${scheduleText}

Mohon konfirmasinya jika waktu tersebut sudah sesuai. Jika ada perubahan jadwal, silakan mengabari kami.

Terima kasih banyak atas kerjasamanya.

Hormat kami,
Fatih Farhat Asshidiq (Founder Kavio Edu)`
    },
    {
      title: 'Penagihan / Informasi Rekening (DP 50% / Lunas)',
      category: 'Tagihan Pembayaran',
      generate: () => `Yth. Bpk/Ibu ${parentName || studentName},

Berikut kami sampaikan rincian tagihan investasi kursus private English Kavio Edu untuk siswa: ${studentName}.

Nominal Investasi: Rp ${amountText}

Rincian Rekening Pembayaran Resmi Kavio Edu:
1. Bank BCA: 6872486204 a.n. FATIH FARHAT ASSHIDIQ
2. Bank Blu by BCA Digital: 007187161271 a.n. FATIH FARHAT ASSHIDIQ
3. GoPay / DANA / ShopeePay: 082111500190

Mohon untuk melampirkan bukti transfer setelah melakukan pembayaran. Pembayaran dapat berupa DP 50% atau pelunasan 100%.

Terima kasih atas perhatian dan kerjasamanya.

Salam hangat,
Kavio Edu Management`
    },
    {
      title: 'Konfirmasi Bukti Transfer (Penerimaan Pembayaran)',
      category: 'Konfirmasi Bayar',
      generate: () => `Yth. Bpk/Ibu ${parentName || studentName},

Terima kasih banyak. Pembayaran sebesar Rp ${amountText} untuk kursus private English ${studentName} telah kami terima dengan baik.

Status pembayaran untuk periode ini telah diperbarui di sistem Kavio Edu.

Jadwal sesi kelas berikutnya:
${scheduleText}

Jika ada kendala atau pertanyaan mengenai materi pembelajaran, kami siap membantu.

Salam hangat,
Kavio Edu Management`
    },
    {
      title: 'Reminder Kelas Perdana / Kelas Mingguan',
      category: 'Pengingat Kelas',
      generate: () => `Halo ${studentName} & Bpk/Ibu ${parentName || studentName},

Ini adalah pesan pengingat untuk sesi kelas private English Kavio Edu yang akan dilaksanakan pada:

Waktu: ${scheduleText}

Mohon pastikan persiapan perangkat dan materi pendukung telah siap 10 menit sebelum sesi dimulai.

Sampai jumpa di kelas.

Salam hangat,
Kavio Edu Team`
    },
    {
      title: 'Laporan Capaian Belajar Siswa (Academic Progress Report)',
      category: 'Laporan Rapor',
      generate: () => `*LAPORAN PERKEMBANGAN BELAJAR SISWA (ACADEMIC PROGRESS REPORT)*
*KAVIO EDU — Private English Class & Academic Mentoring*
━━━━━━━━━━━━━━━━━━━━━

Yth. Bpk/Ibu ${parentName || studentName},

Berikut kami sampaikan rincian evaluasi capaian belajar berkala ananda *${studentName}*:

📊 *RINGKASAN AKADEMIK:*
• Status: *Laporan Resmi Selesai Dievaluasi*
• Jadwal Sesi: *${scheduleText}*

🌟 Dokumen digital resmi lengkap dengan visualisasi Radar Chart 5 Kompetensi, catatan keunggulan, serta tanda tangan & stempel Founder dapat dilihat melalui tautan rapor siswa.

Terima kasih atas kepercayaan dan kerja sama Bapak/Ibu dalam mendukung proses belajar ananda ${studentName}.

Salam hangat,
*Fatih Farhat Asshidiq*
Founder & Academic Director, Kavio Edu`
    }
  ]

  const handleCopy = (index) => {
    const text = presets[index].generate()
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-fluent-text tracking-tight">
          Studio WhatsApp
        </h1>
        <p className="text-xs text-fluent-textSecondary mt-0.5">
          Generator template pesan resmi WhatsApp Kavio Edu.
        </p>
      </div>

      {/* Input Variable Controls */}
      <div className="bg-white p-5 rounded-fluent border border-fluent-border shadow-fluent space-y-4">
        <h2 className="text-sm font-bold text-fluent-text uppercase tracking-wider text-fluent-blue">
          Variabel Parameter Pesan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Nama Siswa
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Nama Orang Tua
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Jadwal / Waktu Sesi
            </label>
            <input
              type="text"
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-fluent-textSecondary mb-1">
              Nominal (Rp)
            </label>
            <input
              type="text"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-fluent-border rounded-fluent focus:outline-none focus:border-fluent-blue"
            />
          </div>
        </div>
      </div>

      {/* Preset List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presets.map((preset, index) => {
          const generatedText = preset.generate()
          const isCopied = copiedIndex === index

          return (
            <div 
              key={index}
              className="bg-white rounded-fluent border border-fluent-border shadow-fluent p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-fluent-border pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-fluent-blue uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                      {preset.category}
                    </span>
                    <h3 className="text-base font-bold text-fluent-text mt-1">
                      {preset.title}
                    </h3>
                  </div>
                  <MessageSquare className="w-5 h-5 text-fluent-textSecondary" />
                </div>

                <pre className="bg-fluent-subtle p-3 rounded border border-fluent-border text-xs text-fluent-text whitespace-pre-wrap font-sans font-normal leading-relaxed max-h-60 overflow-y-auto">
                  {generatedText}
                </pre>
              </div>

              <div className="pt-2 border-t border-fluent-border flex justify-end">
                <button
                  onClick={() => handleCopy(index)}
                  title={isCopied ? 'Tersalin ke Clipboard!' : 'Salin Pesan WhatsApp'}
                  aria-label="Salin Pesan WhatsApp"
                  className={`p-2.5 rounded-fluent flex items-center justify-center transition-colors shadow-xs ${
                    isCopied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-fluent-blue hover:bg-fluent-blueHover text-white'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
