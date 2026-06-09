export function formatRupiah(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'Rp 0'
  return 'Rp ' + Math.floor(num).toLocaleString('id-ID')
}

export function parseRupiah(formatted: string): number {
  return parseInt(formatted.replace(/[^0-9]/g, '')) || 0
}
