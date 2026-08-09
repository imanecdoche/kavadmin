// Helper to format ISO date string (YYYY-MM-DD) to Indonesian standard date format (e.g. 8 Agustus 2026)

export function formatDateIndonesian(dateStr) {
  if (!dateStr) return '-'
  try {
    // Handle YYYY-MM-DD string directly to avoid timezone shift
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-')
      if (parts.length === 3) {
        const year = parts[0]
        const monthIdx = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)

        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]

        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${months[monthIdx]} ${year}`
        }
      }
    }

    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ]
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    }

    return dateStr
  } catch (e) {
    return dateStr
  }
}
