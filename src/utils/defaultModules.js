export const DEFAULT_MODULE_CATEGORIES = [
  'Semua',
  'Grammar & Structure',
  'Speaking & Conversation',
  'Academic Writing',
  'Vocabulary & Idioms',
  'TOEFL / IELTS Prep',
  'General English'
]

export const MODULE_LEVELS = [
  { id: 'all', label: 'Semua Level' },
  { id: 'Beginner', label: 'Beginner (Dasar)' },
  { id: 'Intermediate', label: 'Intermediate (Menengah)' },
  { id: 'Advanced', label: 'Advanced (Lanjutan)' }
]

export const INITIAL_MODULES_BACKUP = [
  {
    id: 'mod-01-tenses-foundation',
    title: 'Mastering English Tenses: Present, Past & Future',
    category: 'Grammar & Structure',
    level: 'Beginner',
    summary: 'Panduan komprehensif menguasai 3 fondasi tenses utama bahasa Inggris beserta pola kalimat aktif dan pasif.',
    tags: ['Grammar', 'Tenses', 'Daily English', 'Foundation'],
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-23T02:00:00.000Z',
    content: `
      <h2>1. Pengenalan Tenses Utama</h2>
      <p>Tenses adalah bentuk kata kerja dalam bahasa Inggris untuk menunjukkan waktu terjadinya suatu perbuatan atau peristiwa. Tiga dimensi waktu utama meliputi:</p>
      <ul>
        <li><strong>Present Tense:</strong> Kejadian saat ini, kebiasaan rutin, dan fakta umum.</li>
        <li><strong>Past Tense:</strong> Kejadian yang sudah selesai di masa lampau.</li>
        <li><strong>Future Tense:</strong> Kejadian atau rencana yang akan terjadi di masa depan.</li>
      </ul>

      <h3>A. Simple Present Tense</h3>
      <p>Digunakan untuk menyatakan fakta ilmiah (<em>general truth</em>) atau kebiasaan sehari-hari (<em>habitual actions</em>).</p>
      <blockquote>
        <p><strong>Rumus Positif:</strong> Subject + Verb 1 (s/es) + Object / Complement<br/>
        <strong>Contoh:</strong> <em>She speaks English fluently every day.</em></p>
      </blockquote>

      <h3>B. Simple Past Tense</h3>
      <p>Menjelaskan aktivitas yang tuntas di masa lampau pada waktu yang spesifik (<em>yesterday, last week, 2 years ago</em>).</p>
      <blockquote>
        <p><strong>Rumus Positif:</strong> Subject + Verb 2 + Object / Complement<br/>
        <strong>Contoh:</strong> <em>We completed the final academic project last night.</em></p>
      </blockquote>

      <h3>C. Simple Future Tense</h3>
      <p>Mengungkapkan rencana atau prediksi masa depan menggunakan <code>will</code> atau <code>be going to</code>.</p>
      <blockquote>
        <p><strong>Rumus:</strong> Subject + will + Verb 1 + Object<br/>
        <strong>Contoh:</strong> <em>They will join the intensive TOEFL simulation tomorrow morning.</em></p>
      </blockquote>

      <hr/>
      <h3>Latihan Mandiri & Evaluasi:</h3>
      <ol>
        <li>Ubah kalimat: <em>"He (write) an essay yesterday."</em> ke dalam bentuk Simple Past yang tepat.</li>
        <li>Buat 2 contoh kalimat Present Continuous yang menunjukkan aktivitas saat ini!</li>
      </ol>
    `
  },
  {
    id: 'mod-02-academic-writing-ielts',
    title: 'Academic Essay Writing & IELTS Task 2 Structure',
    category: 'Academic Writing',
    level: 'Advanced',
    summary: 'Struktur esai akademis 4 paragraf standar internasional: Introduction, 2 Body Paragraphs, dan Conclusion.',
    tags: ['IELTS', 'Academic Writing', 'Essay', 'Structure'],
    createdAt: '2026-08-21T14:30:00.000Z',
    updatedAt: '2026-08-23T02:15:00.000Z',
    content: `
      <h2>The Standard 4-Paragraph Academic Essay Blueprint</h2>
      <p>Menulis esai akademis formal membutuhkan koherensi (<em>coherence</em>), kepaduan (<em>cohesion</em>), serta pilihan diksi akademis yang presisi.</p>

      <h3>1. Paragraph 1: Introduction</h3>
      <ul>
        <li><strong>Hook / General Statement:</strong> Paraphrase topik soal menggunakan kosakata setara (<em>synonyms</em>).</li>
        <li><strong>Thesis Statement:</strong> Nyatakan argumen utama atau posisi penulis secara lugas dan eksplisit.</li>
      </ul>

      <h3>2. Paragraph 2 & 3: Body Paragraphs (PEEL Method)</h3>
      <blockquote>
        <p><strong>P - Point:</strong> Ide pokok kalimat topik (<em>Topic Sentence</em>).<br/>
        <strong>E - Explanation:</strong> Penjelasan mendalam mengapa hal tersebut benar.<br/>
        <strong>E - Example:</strong> Bukti konkret, data, studi kasus, atau contoh riil.<br/>
        <strong>L - Link:</strong> Hubungkan kembali contoh dengan argumen utama.</p>
      </blockquote>

      <h3>3. Paragraph 4: Conclusion</h3>
      <p>Rangkum kembali poin-poin kunci tanpa menambahkan argumen baru (<em>do not introduce new points</em>), dan berikan rekomendasi atau pandangan akhir.</p>
    `
  },
  {
    id: 'mod-03-public-speaking-presentations',
    title: 'Professional Speaking: Formal Presentation & Q&A Mastery',
    category: 'Speaking & Conversation',
    level: 'Intermediate',
    summary: 'Frasa kunci transisi presentasi bisnis/akademis, teknik intonasi, dan cara menjawab pertanyaan audiens.',
    tags: ['Speaking', 'Presentation', 'Business English', 'Public Speaking'],
    createdAt: '2026-08-22T09:15:00.000Z',
    updatedAt: '2026-08-23T02:30:00.000Z',
    content: `
      <h2>Key Signposting Phrases for Presentations</h2>
      <p><em>Signposting</em> membantu audiens mengikuti alur presentasi Anda dengan jelas dan terstruktur.</p>

      <h3>1. Welcoming & Outlining</h3>
      <ul>
        <li><em>"Good morning ladies and gentlemen, today I would like to present on..."</em></li>
        <li><em>"My presentation is divided into three main sections: first..., second..., and finally..."</em></li>
      </ul>

      <h3>2. Moving to the Next Point</h3>
      <ul>
        <li><em>"Now that we have covered the background, let us move on to the practical methodology."</em></li>
        <li><em>"This brings me to my next point, which is..."</em></li>
      </ul>

      <h3>3. Handling Difficult Questions</h3>
      <blockquote>
        <p><em>"That is an excellent question. Let me address that by looking at our latest research data..."</em></p>
      </blockquote>
    `
  }
]
