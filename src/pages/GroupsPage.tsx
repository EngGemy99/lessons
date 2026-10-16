import { Link } from 'react-router'
import { AppShell } from '../components/AppShell'
import { Card, EmptyState, StatPill } from '../components/ui'
import { formatCurrency, formatMonthLabel, toMonthKey } from '../lib/dates'
import { useLessonsStore } from '../store/useLessonsStore'

export function GroupsPage() {
  const groups = useLessonsStore((state) => state.groups)
  const students = useLessonsStore((state) => state.students)
  const payments = useLessonsStore((state) => state.payments)
  const getMonthSummary = useLessonsStore((state) => state.getMonthSummary)
  const getGroupStudents = useLessonsStore((state) => state.getGroupStudents)
  const month = toMonthKey()
  void students
  void payments

  return (
    <AppShell
      title="متابعة دفع الدروس"
      subtitle={formatMonthLabel(month)}
      action={
        <Link
          to="/groups/new"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-white/15 text-2xl font-bold transition hover:bg-white/25"
          aria-label="إضافة مجموعة"
        >
          +
        </Link>
      }
    >
      <div className="mb-4">
        <Link
          to="/groups/new"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-800"
        >
          إضافة مجموعة جديدة
        </Link>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="لا توجد مجموعات بعد"
          description="أنشئ أول مجموعة وأضف الطلاب ثم تابع الدفع الشهري بسهولة من التليفون."
          action={
            <Link
              to="/groups/new"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white"
            >
              إنشاء مجموعة
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const summary = getMonthSummary(group.id, month)
            const studentsCount = getGroupStudents(group.id).filter(
              (student) => student.active,
            ).length

            return (
              <Link key={group.id} to={`/groups/${group.id}`} className="block">
                <Card className="transition hover:border-brand-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-900">
                        {group.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {studentsCount} طالب · {formatCurrency(group.monthlyFee)} / شهر
                      </p>
                      {group.notes ? (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {group.notes}
                        </p>
                      ) : null}
                    </div>
                    <span className="text-slate-400">‹</span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <StatPill label="الإجمالي" value={summary.total} />
                    <StatPill
                      label="دفع"
                      value={summary.paid}
                      tone="success"
                    />
                    <StatPill
                      label="لم يدفع"
                      value={summary.unpaid}
                      tone="warning"
                    />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
