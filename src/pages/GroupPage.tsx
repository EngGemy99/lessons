import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { AppShell } from '../components/AppShell'
import {
  Card,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  StatPill,
} from '../components/ui'
import { formatCurrency, formatMonthLabel, toMonthKey } from '../lib/dates'
import { useLessonsStore } from '../store/useLessonsStore'

export function GroupPage() {
  const { groupId = '' } = useParams()
  const group = useLessonsStore((state) =>
    state.groups.find((item) => item.id === groupId),
  )
  const allStudents = useLessonsStore((state) => state.students)
  const payments = useLessonsStore((state) => state.payments)
  const getMonthSummary = useLessonsStore((state) => state.getMonthSummary)
  const month = toMonthKey()
  const summary = group ? getMonthSummary(group.id, month) : null
  void payments

  const students = useMemo(
    () =>
      allStudents
        .filter((student) => student.groupId === groupId)
        .sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [allStudents, groupId],
  )

  if (!group) {
    return (
      <AppShell title="المجموعة غير موجودة" backTo="/">
        <p className="text-slate-600">هذه المجموعة محذوفة أو غير موجودة.</p>
      </AppShell>
    )
  }

  const activeStudents = students.filter((student) => student.active)
  const inactiveStudents = students.filter((student) => !student.active)

  return (
    <AppShell
      title={group.name}
      subtitle={`${formatCurrency(group.monthlyFee)} / شهر`}
      backTo="/"
      action={
        <Link
          to={`/groups/${group.id}/edit`}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white/15 px-3 text-sm font-semibold transition hover:bg-white/25"
        >
          تعديل
        </Link>
      }
    >
      {group.notes ? (
        <Card className="mb-4 bg-brand-50/70">
          <p className="text-sm leading-6 text-slate-700">{group.notes}</p>
        </Card>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Link to={`/groups/${group.id}/month/${month}`} className="block">
          <PrimaryButton className="w-full">سجل {formatMonthLabel(month)}</PrimaryButton>
        </Link>
        <Link to={`/groups/${group.id}/students/new`} className="block">
          <SecondaryButton className="w-full">إضافة طالب</SecondaryButton>
        </Link>
      </div>

      {summary ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatPill label="الطلاب" value={summary.total} />
          <StatPill label="دفع" value={summary.paid} tone="success" />
          <StatPill label="لم يدفع" value={summary.unpaid} tone="warning" />
          <StatPill label="المحصل" value={formatCurrency(summary.collected)} />
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">الطلاب</h2>
          <span className="text-sm text-slate-500">
            {activeStudents.length} نشط
          </span>
        </div>

        {students.length === 0 ? (
          <EmptyState
            title="لا يوجد طلاب"
            description="أضف طلاب المجموعة عشان تقدر تسجل الدفع الشهري."
            action={
              <Link
                to={`/groups/${group.id}/students/new`}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 font-semibold text-white"
              >
                إضافة طالب
              </Link>
            }
          />
        ) : (
          <>
            {activeStudents.map((student) => (
              <StudentRow
                key={student.id}
                groupId={group.id}
                studentId={student.id}
                name={student.name}
                phone={student.phone}
                active
              />
            ))}

            {inactiveStudents.length > 0 ? (
              <div className="pt-2">
                <h3 className="mb-2 text-sm font-semibold text-slate-500">
                  طلاب موقوفون
                </h3>
                <div className="space-y-3">
                  {inactiveStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      groupId={group.id}
                      studentId={student.id}
                      name={student.name}
                      phone={student.phone}
                      active={false}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </AppShell>
  )
}

function StudentRow({
  groupId,
  studentId,
  name,
  phone,
  active,
}: {
  groupId: string
  studentId: string
  name: string
  phone: string
  active: boolean
}) {
  return (
    <Link to={`/groups/${groupId}/students/${studentId}`} className="block">
      <Card
        className={`flex items-center justify-between gap-3 transition hover:border-brand-200 ${
          active ? '' : 'opacity-70'
        }`}
      >
        <div className="min-w-0">
          <p className="truncate font-bold text-slate-900">{name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {phone || 'بدون رقم'}
            {active ? '' : ' · موقوف'}
          </p>
        </div>
        <span className="text-slate-400">‹</span>
      </Card>
    </Link>
  )
}
