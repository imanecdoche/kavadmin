// Helper to convert numeric IDR amount to Indonesian spelled-out text (Terbilang)
// Example: 200000 -> "Dua Ratus Ribu Rupiah"

export function terbilangRupiah(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0))
  if (num === 0) return 'Nol Rupiah'

  const angka = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas']

  function konversi(n) {
    if (n < 12) return angka[n]
    if (n < 20) return konversi(n - 10) + ' Belas'
    if (n < 100) return konversi(Math.floor(n / 10)) + ' Puluh ' + konversi(n % 10)
    if (n < 200) return 'Seratus ' + konversi(n - 100)
    if (n < 1000) return konversi(Math.floor(n / 100)) + ' Ratus ' + konversi(n % 100)
    if (n < 2000) return 'Seribu ' + konversi(n - 1000)
    if (n < 1000000) return konversi(Math.floor(n / 1000)) + ' Ribu ' + konversi(n % 1000)
    if (n < 1000000000) return konversi(Math.floor(n / 1000000)) + ' Juta ' + konversi(n % 1000000)
    return konversi(Math.floor(n / 1000000000)) + ' Milyar ' + konversi(n % 1000000000)
  }

  const result = konversi(num).trim().replace(/\s+/g, ' ')
  return result ? `${result} Rupiah` : 'Nol Rupiah'
}
