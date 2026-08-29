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
    id: 'mod-cefr-a1-s01-introductions-greetings',
    title: 'CEFR A1 (Sesi 1): Greetings, Personal Introductions & Verb "To Be"',
    category: 'General English',
    level: 'Beginner',
    summary: 'Fondasi bahasa Inggris A1 Sesi 1: Menguasai ragam salam formal & informal, memperkenalkan identitas diri (nama, asal, usia, pekerjaan), pelafalan alfabet & ejaan, serta tata bahasa Subject Pronouns dan Verb "To Be" (am, is, are).',
    tags: ['CEFR A1', 'Sesi 1', 'Greetings', 'Self-Introduction', 'Verb To Be', 'Pronouns', 'Spelling'],
    createdAt: '2026-08-30T00:00:00.000Z',
    updatedAt: '2026-08-30T00:00:00.000Z',
    content: `
      <h2>🎯 1. Target Capaian Pembelajaran (Learning Objectives)</h2>
      <p>Berdasarkan standar kerangka <strong>CEFR A1 (Breakthrough / Beginner)</strong>, pada Sesi 1 ini siswa ditargetkan untuk:</p>
      <ul>
        <li>Mampu menyapa dan merespons salam dalam berbagai situasi (formal, semi-formal, dan kasual).</li>
        <li>Mampu memperkenalkan identitas diri (nama lengkap, nama panggilan, asal kota, profesi, dan usia) dengan runtut dan percaya diri.</li>
        <li>Mampu mengeja nama serta informasi kontak menggunakan <em>English Alphabet Phonetics</em>.</li>
        <li>Mampu memahami dan menerapkan rumus <strong>Subject Pronouns</strong> dan <strong>Verb "To Be"</strong> (<em>am / is / are</em>) pada kalimat positif, negatif, dan tanya.</li>
      </ul>

      <hr/>

      <h2>👋 2. Greetings & Farewell Expressions (Ragam Salam & Perpisahan)</h2>
      <p>Salam dalam bahasa Inggris dibagi berdasarkan tingkat formalitas dan waktu terjadinya percakapan:</p>

      <h3>A. Formal & Professional Greetings</h3>
      <ul>
        <li><strong>Good morning</strong> (00:00 – 11:59 WIB) : Selamat pagi.</li>
        <li><strong>Good afternoon</strong> (12:00 – 17:59 WIB) : Selamat siang / sore.</li>
        <li><strong>Good evening</strong> (18:00 – malam saat menyapa) : Selamat malam saat baru bertemu. <em>(Catatan: "Good night" hanya digunakan saat berpamitan untuk tidur/pulang).</em></li>
        <li><strong>How do you do?</strong> : Ungkapan formal saat pertama kali berkenalan. Respons yang tepat adalah menjawab kembali dengan <em>"How do you do?"</em>.</li>
        <li><strong>It is a pleasure to meet you.</strong> : Senang berkenalan dengan Anda.</li>
      </ul>

      <h3>B. Casual / Informal Greetings (Teman & Sehari-hari)</h3>
      <ul>
        <li><strong>Hello! / Hi!</strong> : Halo / Hai.</li>
        <li><strong>How are you doing? / How's it going?</strong> : Bagaimana kabarmu?</li>
        <li><strong>Good to see you!</strong> : Senang bertemu denganmu lagi!</li>
      </ul>

      <h3>C. Farewell Expressions (Ungkapan Berpamitan)</h3>
      <ul>
        <li><strong>Goodbye / Bye!</strong> : Selamat tinggal / Dadah.</li>
        <li><strong>Have a great day ahead!</strong> : Semoga harimu menyenangkan!</li>
        <li><strong>See you next session / See you soon!</strong> : Sampai jumpa di sesi berikutnya!</li>
      </ul>

      <hr/>

      <h2>👤 3. Self-Introduction Blueprint (Kerangka Memperkenalkan Diri)</h2>
      <p>Gunakan formula 5 langkah berikut untuk memperkenalkan diri secara sistematis:</p>
      <blockquote>
        <p>
          <strong>1. Greeting:</strong> <em>"Hello everyone, good morning."</em><br/>
          <strong>2. Name & Nickname:</strong> <em>"My name is Alya Nabila. You can call me Alya."</em><br/>
          <strong>3. Origin & Residence:</strong> <em>"I am from Pandeglang, Banten, and I live in Cikeda."</em><br/>
          <strong>4. Age & Occupation:</strong> <em>"I am 17 years old. I am a 12th-grade student at SMAN 1."</em><br/>
          <strong>5. Hobbies & Interests:</strong> <em>"In my spare time, I love reading English novels and listening to podcasts."</em><br/>
          <strong>6. Closing:</strong> <em>"I am very glad to be here. Nice to meet you all!"</em>
        </p>
      </blockquote>

      <hr/>

      <h2>🔤 4. Alphabet & Spelling Guide (Panduan Ejaan Alfabet)</h2>
      <p>Kerap terjadi kesalahan pelafalan huruf antara penutur bahasa Indonesia dengan bahasa Inggris. Perhatikan bunyi vokal & konsonan berikut:</p>
      <ul>
        <li><code>A [eɪ]</code> | <code>E [i:]</code> | <code>I [aɪ]</code> | <code>O [oʊ]</code> | <code>U [ju:]</code></li>
        <li><code>G [dʒi:]</code> vs <code>J [dʒeɪ]</code></li>
        <li><code>C [si:]</code> vs <code>S [es]</code></li>
        <li><code>R [ɑ:r]</code> (lidah ditarik ke belakang, tidak bergetar tajam)</li>
        <li><code>V [vi:]</code> (gigi atas menyentuh bibir bawah) vs <code>F [ef]</code> vs <code>P [pi:]</code></li>
        <li><code>W [ˈdʌbəl.ju:]</code> | <code>Y [waɪ]</code> | <code>Z [zed / zi:]</code></li>
      </ul>

      <p><strong>Contoh Tanya Jawab Ejaan:</strong></p>
      <p><em>Q: "Could you spell your nickname, please?"</em><br/>
      <em>A: "Sure, it is <strong>A-L-Y-A</strong>."</em></p>

      <hr/>

      <h2>📚 5. Grammar Foundation: Subject Pronouns & Verb "To Be"</h2>
      <p>Kata kerja bantu <em>(linking verb)</em> <strong>To Be</strong> digunakan untuk menghubungkan subjek dengan kata benda (<em>noun</em>), kata sifat (<em>adjective</em>), atau keterangan lokasi (<em>adverb of place</em>).</p>

      <h3>A. Tabel Pasangan Subjek & To Be</h3>
      <ul>
        <li><strong>I</strong> ➔ <code>am</code> (Singkatan: <em>I'm</em>)</li>
        <li><strong>You / We / They</strong> ➔ <code>are</code> (Singkatan: <em>You're / We're / They're</em>)</li>
        <li><strong>He / She / It</strong> ➔ <code>is</code> (Singkatan: <em>He's / She's / It's</em>)</li>
      </ul>

      <h3>B. Struktur Pola Kalimat</h3>
      <blockquote>
        <p><strong>(+) Positif:</strong> Subject + to be + Complement<br/>
        Contoh: <em>She is a dedicated English student. / They are in the classroom.</em></p>
        <p><strong>(-) Negatif:</strong> Subject + to be + NOT + Complement<br/>
        Contoh: <em>I am not tired. / He is not (isn't) late today.</em></p>
        <p><strong>(?) Tanya:</strong> To be + Subject + Complement?<br/>
        Contoh: <em>Are you ready for the speaking practice? ➔ Yes, I am. / No, I'm not.</em></p>
      </blockquote>

      <hr/>

      <h2>💬 6. Interactive Role-Play Dialogue (Simulasi Percakapan)</h2>
      <p>Praktikkan dialog berikut bersama tutor / partner belajar:</p>
      <p>
        <strong>Coach:</strong> <em>"Good afternoon! Welcome to your first session at Kavio Edu."</em><br/>
        <strong>Student:</strong> <em>"Good afternoon, Coach! Thank you very much."</em><br/>
        <strong>Coach:</strong> <em>"What is your full name, and how do you spell your first name?"</em><br/>
        <strong>Student:</strong> <em>"My name is Zahwan Pratama. That is Z-A-H-W-A-N."</em><br/>
        <strong>Coach:</strong> <em>"Great to meet you, Zahwan! Where are you from?"</em><br/>
        <strong>Student:</strong> <em>"I am from Pandeglang. I am ready to boost my English skills!"</em><br/>
        <strong>Coach:</strong> <em>"Awesome enthusiasm! Let's get started with our lesson."</em>
      </p>

      <hr/>

      <h2>✍️ 7. Practical Exercise & Assignment (Latihan Mandiri Sesi 1)</h2>
      <ol>
        <li><strong>Fill in the blanks:</strong> Lengkapi kalimat dengan <em>am / is / are</em>:
          <ul>
            <li>a) <em>She ___ very happy to study English.</em></li>
            <li>b) <em>We ___ ready for our learning milestone.</em></li>
            <li>c) <em>I ___ a high school student from Banten.</em></li>
          </ul>
        </li>
        <li><strong>Speaking Action Task:</strong> Rekam suara Anda (maksimal 60 detik) membawakan perkenalan diri lengkap dengan menyertakan nama, ejaan nama, kota asal, dan profesi.</li>
      </ol>
    `
  },
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
