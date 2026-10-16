export type MonthKey = `${number}-${string}`

export interface Group {
  id: string
  name: string
  monthlyFee: number
  notes: string
  createdAt: string
}

export interface Student {
  id: string
  groupId: string
  name: string
  phone: string
  active: boolean
  createdAt: string
}

export interface Payment {
  studentId: string
  groupId: string
  month: MonthKey
  paid: boolean
  paidAt: string | null
  amount: number
}

export type PaymentFilter = 'all' | 'paid' | 'unpaid'

export interface LessonsState {
  groups: Group[]
  students: Student[]
  payments: Payment[]
}
