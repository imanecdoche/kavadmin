/**
 * 📊 Report Calculator & Rubric Helpers for Kavio Edu
 * Implements weighted competency score calculations, letter grade mapping,
 * performance categories, and official report identification formatting.
 */

export const DEFAULT_COMPETENCIES = [
  {
    key: 'grammar',
    label: 'Grammar & Structure',
    shortLabel: 'Grammar',
    weight: 25,
    score: 85,
    benchmark: 'Proficient',
    tutorComment: ''
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary & Idiom',
    shortLabel: 'Vocabulary',
    weight: 20,
    score: 85,
    benchmark: 'Proficient',
    tutorComment: ''
  },
  {
    key: 'speaking',
    label: 'Speaking Fluency & Pronunciation',
    shortLabel: 'Speaking',
    weight: 25,
    score: 85,
    benchmark: 'Proficient',
    tutorComment: ''
  },
  {
    key: 'listening',
    label: 'Listening & Comprehension',
    shortLabel: 'Listening',
    weight: 15,
    score: 85,
    benchmark: 'Proficient',
    tutorComment: ''
  },
  {
    key: 'discipline',
    label: 'Discipline & Homework',
    shortLabel: 'Discipline',
    weight: 15,
    score: 90,
    benchmark: 'Excellent',
    tutorComment: ''
  }
]

/**
 * Get individual benchmark status based on score
 * @param {number} score 0 - 100
 * @returns {string} Benchmark label
 */
export const getBenchmark = (score) => {
  const num = Number(score) || 0
  if (num >= 85) return 'Excellent'
  if (num >= 75) return 'Good'
  if (num >= 65) return 'Satisfactory'
  return 'Needs Improvement'
}

/**
 * Calculates the composite weighted score based on competencies array.
 * Formula: sum(score_i * (weight_i / 100))
 * @param {Array} competencies Array of { key, weight, score }
 * @returns {number} Weighted composite score rounded to 2 decimal places
 */
export const calculateCompositeScore = (competencies = []) => {
  if (!Array.isArray(competencies) || competencies.length === 0) return 0

  let totalWeightedScore = 0
  let totalWeights = 0

  competencies.forEach((item) => {
    const weight = Number(item.weight) || 0
    const score = Math.max(0, Math.min(100, Number(item.score) || 0))
    totalWeightedScore += score * (weight / 100)
    totalWeights += weight
  })

  // Normalize if sum of weights is not exactly 100
  if (totalWeights > 0 && totalWeights !== 100) {
    const normalized = (totalWeightedScore / totalWeights) * 100
    return Math.round(normalized * 10) / 10
  }

  return Math.round(totalWeightedScore * 10) / 10
}

/**
 * Returns letter grade based on composite score
 * @param {number} score 0 - 100
 * @returns {"A+" | "A" | "B+" | "B" | "C" | "D"}
 */
export const getLetterGrade = (score) => {
  const s = Number(score) || 0
  if (s >= 93.0) return 'A+'
  if (s >= 85.0) return 'A'
  if (s >= 78.0) return 'B+'
  if (s >= 70.0) return 'B'
  if (s >= 60.0) return 'C'
  return 'D'
}

/**
 * Returns comprehensive performance category, descriptions, and theme color
 * @param {number} score 0 - 100
 */
export const getPerformanceCategory = (score) => {
  const s = Number(score) || 0
  if (s >= 93.0) {
    return {
      category: 'Distinction',
      label: 'DISTINCTION',
      description: 'Penguasaan materi luar biasa, mandiri & sangat natural.',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  }
  if (s >= 85.0) {
    return {
      category: 'Proficient',
      label: 'PROFICIENT',
      description: 'Pemahaman materi sangat solid, komunikasi aktif & minim kesalahan mendasar.',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }
  if (s >= 78.0) {
    return {
      category: 'Upper Competent',
      label: 'UPPER COMPETENT',
      description: 'Komunikasi lancar dengan penguasaan konsep tata bahasa yang baik.',
      color: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
    }
  }
  if (s >= 70.0) {
    return {
      category: 'Competent',
      label: 'COMPETENT',
      description: 'Memahami konsep materi inti, membutuhkan pengembangan variasi ekspresi.',
      color: 'text-teal-700',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-300',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300'
    }
  }
  if (s >= 60.0) {
    return {
      category: 'Developing',
      label: 'DEVELOPING',
      description: 'Menunjukkan perkembangan, perlu bimbingan intensif pada tenses & pengucapan.',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }
  return {
    category: 'Novice',
    label: 'NOVICE',
    description: 'Membutuhkan penguatan dan perombakan fondasi materi dasar secara menyeluruh.',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
  }
}

/**
 * Generates an official report identification string with structure: REP/KEEN/YYYYMM/XXXX
 * @param {Date|string} date Date of issuance
 * @param {string|number} seq Optional custom 4-digit sequence number
 * @returns {string} e.g. "REP/KEEN/202608/8391"
 */
export const generateReportNumber = (date = new Date(), seq = null) => {
  const d = date instanceof Date ? date : new Date(date || Date.now())
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyymm = `${yyyy}${mm}`

  const random4 = seq ? String(seq).padStart(4, '0') : String(Math.floor(Math.random() * 9000) + 1000)
  return `REP/KEEN/${yyyymm}/${random4}`
}
