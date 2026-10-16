import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createId } from '../lib/dates'
import type { Group, MonthKey, Payment, Student } from '../types'

interface LessonsStore {
  groups: Group[]
  students: Student[]
  payments: Payment[]
  addGroup: (input: { name: string; monthlyFee: number; notes?: string }) => string
  updateGroup: (
    id: string,
    input: { name: string; monthlyFee: number; notes?: string },
  ) => void
  deleteGroup: (id: string) => void
  addStudent: (input: {
    groupId: string
    name: string
    phone?: string
  }) => string
  updateStudent: (
    id: string,
    input: { name: string; phone?: string; active: boolean },
  ) => void
  deleteStudent: (id: string) => void
  togglePayment: (input: {
    studentId: string
    groupId: string
    month: MonthKey
    monthlyFee: number
  }) => void
  getGroup: (id: string) => Group | undefined
  getStudent: (id: string) => Student | undefined
  getGroupStudents: (groupId: string) => Student[]
  getMonthStudents: (groupId: string, month: MonthKey) => Student[]
  isPaid: (studentId: string, month: MonthKey) => boolean
  getPayment: (studentId: string, month: MonthKey) => Payment | undefined
  getMonthSummary: (
    groupId: string,
    month: MonthKey,
  ) => { total: number; paid: number; unpaid: number; collected: number; remaining: number }
}

export const useLessonsStore = create<LessonsStore>()(
  persist(
    (set, get) => ({
      groups: [],
      students: [],
      payments: [],

      addGroup: ({ name, monthlyFee, notes = '' }) => {
        const id = createId()
        const group: Group = {
          id,
          name: name.trim(),
          monthlyFee,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ groups: [group, ...state.groups] }))
        return id
      },

      updateGroup: (id, { name, monthlyFee, notes = '' }) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id
              ? {
                  ...group,
                  name: name.trim(),
                  monthlyFee,
                  notes: notes.trim(),
                }
              : group,
          ),
        }))
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
          students: state.students.filter((student) => student.groupId !== id),
          payments: state.payments.filter((payment) => payment.groupId !== id),
        }))
      },

      addStudent: ({ groupId, name, phone = '' }) => {
        const id = createId()
        const student: Student = {
          id,
          groupId,
          name: name.trim(),
          phone: phone.trim(),
          active: true,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ students: [student, ...state.students] }))
        return id
      },

      updateStudent: (id, { name, phone = '', active }) => {
        set((state) => ({
          students: state.students.map((student) =>
            student.id === id
              ? {
                  ...student,
                  name: name.trim(),
                  phone: phone.trim(),
                  active,
                }
              : student,
          ),
        }))
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((student) => student.id !== id),
          payments: state.payments.filter((payment) => payment.studentId !== id),
        }))
      },

      togglePayment: ({ studentId, groupId, month, monthlyFee }) => {
        set((state) => {
          const existing = state.payments.find(
            (payment) =>
              payment.studentId === studentId && payment.month === month,
          )

          if (existing) {
            if (existing.paid) {
              return {
                payments: state.payments.filter(
                  (payment) =>
                    !(
                      payment.studentId === studentId &&
                      payment.month === month
                    ),
                ),
              }
            }

            return {
              payments: state.payments.map((payment) =>
                payment.studentId === studentId && payment.month === month
                  ? {
                      ...payment,
                      paid: true,
                      paidAt: new Date().toISOString(),
                      amount: monthlyFee,
                    }
                  : payment,
              ),
            }
          }

          const payment: Payment = {
            studentId,
            groupId,
            month,
            paid: true,
            paidAt: new Date().toISOString(),
            amount: monthlyFee,
          }

          return { payments: [...state.payments, payment] }
        })
      },

      getGroup: (id) => get().groups.find((group) => group.id === id),

      getStudent: (id) => get().students.find((student) => student.id === id),

      getGroupStudents: (groupId) =>
        get()
          .students.filter((student) => student.groupId === groupId)
          .sort((a, b) => a.name.localeCompare(b.name, 'ar')),

      getMonthStudents: (groupId, month) => {
        const students = get().students.filter(
          (student) => student.groupId === groupId,
        )
        const payments = get().payments

        return students
          .filter((student) => {
            if (student.active) return true
            return payments.some(
              (payment) =>
                payment.studentId === student.id &&
                payment.month === month &&
                payment.paid,
            )
          })
          .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
      },

      isPaid: (studentId, month) =>
        Boolean(
          get().payments.find(
            (payment) =>
              payment.studentId === studentId &&
              payment.month === month &&
              payment.paid,
          ),
        ),

      getPayment: (studentId, month) =>
        get().payments.find(
          (payment) =>
            payment.studentId === studentId && payment.month === month,
        ),

      getMonthSummary: (groupId, month) => {
        const group = get().getGroup(groupId)
        const fee = group?.monthlyFee ?? 0
        const students = get().getMonthStudents(groupId, month)
        const paidStudents = students.filter((student) =>
          get().isPaid(student.id, month),
        )
        const paid = paidStudents.length
        const total = students.length
        const unpaid = total - paid
        const collected = paidStudents.reduce((sum, student) => {
          const payment = get().getPayment(student.id, month)
          return sum + (payment?.amount ?? fee)
        }, 0)
        const remaining = unpaid * fee

        return { total, paid, unpaid, collected, remaining }
      },
    }),
    {
      name: 'lessons-payments-v1',
      partialize: (state) => ({
        groups: state.groups,
        students: state.students,
        payments: state.payments,
      }),
    },
  ),
)
