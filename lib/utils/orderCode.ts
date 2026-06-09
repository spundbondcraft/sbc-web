import { format } from 'date-fns'

export function generateOrderCode(input: string, phase: 'pra' | 'fixed'): string {
  const suffix = phase === 'pra' ? '-PRA' : ''
  if (input.trim()) {
    const padded = input.trim().padStart(3, '0')
    return `SBC-${padded}${suffix}`
  }
  const now = new Date()
  const datePart = format(now, 'ddMMyy')
  const timePart = format(now, 'HHmm')
  return `SBC-${datePart}-${timePart}${suffix}`
}

export function generateInvoiceNumber(orderCode: string, year?: number): string {
  const y = year ?? new Date().getFullYear()
  const num = orderCode.replace(/[^0-9]/g, '').padStart(4, '0')
  return `INV/SBC/${y}/${num}`
}

export function generateOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
