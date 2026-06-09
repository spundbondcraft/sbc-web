const ones = [
  '', 'satu', 'dua', 'tiga', 'empat', 'lima',
  'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
  'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas',
  'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas',
]

function terbilangKecil(n: number): string {
  if (n < 20) return ones[n]
  if (n < 100) {
    const rem = n % 10
    return (Math.floor(n / 10) === 1 ? 'sepuluh' : ones[Math.floor(n / 10)] + ' puluh') +
      (rem > 0 ? ' ' + ones[rem] : '')
  }
  if (n < 200) return 'seratus' + (n % 100 > 0 ? ' ' + terbilangKecil(n % 100) : '')
  if (n < 1000) {
    const rem = n % 100
    return ones[Math.floor(n / 100)] + ' ratus' +
      (rem > 0 ? ' ' + terbilangKecil(rem) : '')
  }
  return ''
}

export function terbilang(nominal: number): string {
  if (nominal === 0) return 'nol rupiah'

  let n = Math.floor(nominal)
  let result = ''

  if (n >= 1_000_000_000) {
    result += terbilangKecil(Math.floor(n / 1_000_000_000)) + ' miliar '
    n %= 1_000_000_000
  }
  if (n >= 1_000_000) {
    result += terbilangKecil(Math.floor(n / 1_000_000)) + ' juta '
    n %= 1_000_000
  }
  if (n >= 1000) {
    const ribuan = Math.floor(n / 1000)
    result += (ribuan === 1 ? 'seribu' : terbilangKecil(ribuan) + ' ribu') + ' '
    n %= 1000
  }
  if (n > 0) result += terbilangKecil(n)

  return result.trim() + ' rupiah'
}
