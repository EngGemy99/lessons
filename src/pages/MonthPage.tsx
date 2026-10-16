import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AppShell } from '../components/AppShell'
import { Card, EmptyState, StatPill, TextInput } from '../components/ui'
import {
  formatCurrency,
  formatMonthLabel,
  shiftMonth,
  toMonthKey,
} from '../lib/dates'
import { useLessonsStore } from '../store/useLessonsStore'
import type { MonthKey, PaymentFilter } from '../types'

export function MonthPage() {
  const { groupId = '', month: monthParam } = useParams()
  const navigate = useNavigate()
  const month = (monthParam ?? toMonthKey()) as MonthKey

  const group = useLessonsStore((state) =>
    state.groups.find((item) => item.id === groupId),
  )
  const payments = useLessonsStore((state) => state.payments)
  const students = useLessonsStore((state) => state.students)
  const togglePayment = useLessonsStore((state) => state.togglePayment)
  const getMonthSummary = useLessonsStore((state) => state.getMonthSummary)

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<PaymentFilter>('all')

  const monthStudents = useMemo(() => {
    const groupStudents = students.filter(
      (student) => student.groupId === groupId,
    )

    return groupStudents
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
  }, [students, payments, groupId, month])

  const paidMap = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const payment of payments) {
      if (payment.month === month && payment.groupId === groupId) {
        map.set(payment.studentId, payment.paid)
      }
    }
    return map
  }, [payments, month, groupId])

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return monthStudents.filter((student) => {
      const paid = paidMap.get(student.id) === true
      if (filter === 'paid' && !paid) return false
      if (filter === 'unpaid' && paid) return false
      if (!normalizedQuery) return true
      return (
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.phone.includes(normalizedQuery)
      )
    })
  }, [monthStudents, paidMap, filter, query])

  if (!group) {
    return (
      <AppShell title="المجموعة غير موجودة" backTo="/">
        <p className="text-slate-600">هذه المجموعة محذوفة أو غير موجودة.</p>
      </AppShell>
    )
  }

  const summary = getMonthSummary(group.id, month)

  function goToMonth(nextMonth: MonthKey) {
    navigate(`/groups/${groupId}/month/${nextMonth}`, { replace: true })
  }

  return (
    <AppShell
      title="سجل الشهر"
      subtitle={group.name}
      backTo={`/groups/${group.id}`}
    >
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => goToMonth(shiftMonth(month, -1))}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700"
            aria-label="الشهر السابق"
          >
            →
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">
              {formatMonthLabel(month)}
            </p>
            <p className="text-sm text-slate-500">
              {formatCurrency(group.monthlyFee)} للطالب
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToMonth(shiftMonth(month, 1))}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700"
            aria-label="الشهر التالي"
          >
            ←
          </button>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <StatPill label="دفع" value={`${summary.paid}/${summary.total}`} tone="success" />
        <StatPill label="لم يدفع" value={summary.unpaid} tone="warning" />
        <StatPill label="المحصل" value={formatCurrency(summary.collected)} tone="success" />
        <StatPill label="المتبقي" value={formatCurrency(summary.remaining)} tone="warning" />
      </div>

      <div className="mb-3">
        <TextInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="بحث بالاسم أو رقم الموبايل"
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {(
          [
            ['all', 'الكل'],
            ['paid', 'دفع'],
            ['unpaid', 'لم يدفع'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`min-h-12 rounded-xl text-sm font-semibold transition ${
              filter === value
                ? 'bg-brand-700 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="لا يوجد طلاب في هذا العرض"
          description="جرّب تغيير البحث أو الفلتر، أو أضف طلاب للمجموعة."
        />
      ) : (
        <div className="space-y-2">
          {filteredStudents.map((student) => {
            const paid = paidMap.get(student.id) === true

            return (
              <button
                key={student.id}
                type="button"
                onClick={() =>
                  togglePayment({
                    studentId: student.id,
                    groupId: group.id,
                    month,
                    monthlyFee: group.monthlyFee,
                  })
                }
                className={`flex w-full min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right transition ${
                  paid
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">
                    {student.name}
                    {!student.active ? (
                      <span className="mr-2 text-xs font-medium text-slate-500">
                        (موقوف)
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {paid ? 'تم الدفع' : 'لم يدفع بعد'}
                  </p>
                </div>

                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold ${
                    paid
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
              </button>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
