import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AppShell } from '../components/AppShell'
import {
  DangerButton,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from '../components/ui'
import { useStoreHydration } from '../hooks/useStoreHydration'
import { useLessonsStore } from '../store/useLessonsStore'
import type { Group, Student } from '../types'

export function StudentFormPage() {
  const { groupId = '', studentId } = useParams()
  const hydrated = useStoreHydration()
  const group = useLessonsStore((state) =>
    state.groups.find((item) => item.id === groupId),
  )
  const student = useLessonsStore((state) =>
    studentId
      ? state.students.find((item) => item.id === studentId)
      : undefined,
  )

  if (!hydrated) {
    return (
      <AppShell
        title={studentId ? 'تعديل الطالب' : 'طالب جديد'}
        backTo={`/groups/${groupId}`}
      >
        <p className="text-slate-600">جاري التحميل...</p>
      </AppShell>
    )
  }

  return (
    <StudentForm
      key={studentId ?? `new-${groupId}`}
      groupId={groupId}
      studentId={studentId}
      group={group}
      student={student}
    />
  )
}

function StudentForm({
  groupId,
  studentId,
  group,
  student,
}: {
  groupId: string
  studentId?: string
  group?: Group
  student?: Student
}) {
  const navigate = useNavigate()
  const isEdit = Boolean(studentId)
  const addStudent = useLessonsStore((state) => state.addStudent)
  const updateStudent = useLessonsStore((state) => state.updateStudent)
  const deleteStudent = useLessonsStore((state) => state.deleteStudent)

  const [name, setName] = useState(student?.name ?? '')
  const [phone, setPhone] = useState(student?.phone ?? '')
  const [active, setActive] = useState(student?.active ?? true)
  const [error, setError] = useState('')

  if (!group) {
    return (
      <AppShell title="المجموعة غير موجودة" backTo="/">
        <p className="text-slate-600">هذه المجموعة محذوفة أو غير موجودة.</p>
      </AppShell>
    )
  }

  if (isEdit && !student) {
    return (
      <AppShell title="الطالب غير موجود" backTo={`/groups/${groupId}`}>
        <p className="text-slate-600">هذا الطالب محذوف أو غير موجود.</p>
      </AppShell>
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!name.trim()) {
      setError('اسم الطالب مطلوب')
      return
    }

    if (isEdit && studentId) {
      updateStudent(studentId, { name, phone, active })
      navigate(`/groups/${groupId}`)
      return
    }

    addStudent({ groupId, name, phone })
    navigate(`/groups/${groupId}`)
  }

  function handleDelete() {
    if (!studentId) return
    const confirmed = window.confirm(
      'هل تريد حذف الطالب وسجل الدفع الخاص به؟',
    )
    if (!confirmed) return
    deleteStudent(studentId)
    navigate(`/groups/${groupId}`)
  }

  return (
    <AppShell
      title={isEdit ? 'تعديل الطالب' : 'طالب جديد'}
      subtitle={group.name}
      backTo={`/groups/${groupId}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="student-name">اسم الطالب</FieldLabel>
          <TextInput
            id="student-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="اسم الطالب"
            autoFocus
          />
        </div>

        <div>
          <FieldLabel htmlFor="student-phone">رقم الموبايل (اختياري)</FieldLabel>
          <TextInput
            id="student-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="01xxxxxxxxx"
          />
        </div>

        {isEdit ? (
          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-5 w-5 accent-brand-700"
            />
            <span className="text-sm font-semibold text-slate-700">
              الطالب نشط ويظهر في الشهور القادمة
            </span>
          </label>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <PrimaryButton type="submit" className="w-full">
          {isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
        </PrimaryButton>

        {isEdit ? (
          <div className="grid grid-cols-2 gap-3">
            <SecondaryButton type="button" onClick={() => navigate(-1)}>
              إلغاء
            </SecondaryButton>
            <DangerButton type="button" onClick={handleDelete}>
              حذف
            </DangerButton>
          </div>
        ) : null}
      </form>
    </AppShell>
  )
}
