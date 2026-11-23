export const formatRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const cleanNumber = typeof value === 'number' ? value : parseInt(value.toString().replace(/\D/g, ''), 10);
  if (isNaN(cleanNumber)) return '';
  return new Intl.NumberFormat('id-ID').format(cleanNumber);
};

export const parseRupiah = (formattedValue) => {
  if (!formattedValue) return 0;
  const clean = formattedValue.toString().replace(/\D/g, '');
  return parseInt(clean, 10) || 0;
};

export const angkaKeTerbilang = (angka) => {
  const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  const n = Math.floor(Math.abs(Number(angka) || 0));

  if (n < 12) return bilangan[n];
  if (n < 20) return `${bilangan[n - 10]} Belas`;
  if (n < 100) return `${bilangan[Math.floor(n / 10)]} Puluh ${bilangan[n % 10]}`.trim();
  if (n < 200) return `Seratus ${angkaKeTerbilang(n - 100)}`.trim();
  if (n < 1000) return `${bilangan[Math.floor(n / 100)]} Ratus ${angkaKeTerbilang(n % 100)}`.trim();
  if (n < 2000) return `Seribu ${angkaKeTerbilang(n - 1000)}`.trim();
  if (n < 1000000) return `${angkaKeTerbilang(Math.floor(n / 1000))} Ribu ${angkaKeTerbilang(n % 1000)}`.trim();
  if (n < 1000000000) return `${angkaKeTerbilang(Math.floor(n / 1000000))} Juta ${angkaKeTerbilang(n % 1000000)}`.trim();
  if (n < 1000000000000) return `${angkaKeTerbilang(Math.floor(n / 1000000000))} Miliar ${angkaKeTerbilang(n % 1000000000)}`.trim();
  return `${n}`;
};
