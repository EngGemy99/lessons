import type { MonthKey } from '../types'

const arabicMonths = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

export function toMonthKey(date = new Date()): MonthKey {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}` as MonthKey
}

export function parseMonthKey(month: MonthKey): Date {
  const [year, monthPart] = month.split('-').map(Number)
  return new Date(year, monthPart - 1, 1)
}

export function formatMonthLabel(month: MonthKey): string {
  const date = parseMonthKey(month)
  return `${arabicMonths[date.getMonth()]} ${date.getFullYear()}`
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const date = parseMonthKey(month)
  date.setMonth(date.getMonth() + delta)
  return toMonthKey(date)
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ar-EG')} ج.م`
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}
