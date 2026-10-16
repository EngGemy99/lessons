import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { AppShell } from '../components/AppShell'
import {
  DangerButton,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from '../components/ui'
import { useStoreHydration } from '../hooks/useStoreHydration'
import { useLessonsStore } from '../store/useLessonsStore'
import type { Group } from '../types'

export function GroupFormPage() {
  const { groupId } = useParams()
  const hydrated = useStoreHydration()
  const group = useLessonsStore((state) =>
    groupId ? state.groups.find((item) => item.id === groupId) : undefined,
  )

  if (!hydrated) {
    return (
      <AppShell title={groupId ? 'تعديل المجموعة' : 'مجموعة جديدة'} backTo="/">
        <p className="text-slate-600">جاري التحميل...</p>
      </AppShell>
    )
  }

  return (
    <GroupForm
      key={groupId ?? 'new'}
      groupId={groupId}
      group={group}
    />
  )
}

function GroupForm({
  groupId,
  group,
}: {
  groupId?: string
  group?: Group
}) {
  const navigate = useNavigate()
  const isEdit = Boolean(groupId)
  const addGroup = useLessonsStore((state) => state.addGroup)
  const updateGroup = useLessonsStore((state) => state.updateGroup)
  const deleteGroup = useLessonsStore((state) => state.deleteGroup)

  const [name, setName] = useState(group?.name ?? '')
  const [monthlyFee, setMonthlyFee] = useState(
    group ? String(group.monthlyFee) : '',
  )
  const [notes, setNotes] = useState(group?.notes ?? '')
  const [error, setError] = useState('')

  if (isEdit && !group) {
    return (
      <AppShell title="المجموعة غير موجودة" backTo="/">
        <p className="text-slate-600">هذه المجموعة محذوفة أو غير موجودة.</p>
      </AppShell>
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const fee = Number(monthlyFee)

    if (!name.trim()) {
      setError('اسم المجموعة مطلوب')
      return
    }

    if (!Number.isFinite(fee) || fee <= 0) {
      setError('أدخل رسوم شهرية صحيحة أكبر من صفر')
      return
    }

    if (isEdit && groupId) {
      updateGroup(groupId, { name, monthlyFee: fee, notes })
      navigate(`/groups/${groupId}`)
      return
    }

    const id = addGroup({ name, monthlyFee: fee, notes })
    navigate(`/groups/${id}`)
  }

  function handleDelete() {
    if (!groupId) return
    const confirmed = window.confirm(
      'هل تريد حذف المجموعة وكل طلابها وسجل الدفع الخاص بها؟',
    )
    if (!confirmed) return
    deleteGroup(groupId)
    navigate('/')
  }

  return (
    <AppShell
      title={isEdit ? 'تعديل المجموعة' : 'مجموعة جديدة'}
      backTo={isEdit && groupId ? `/groups/${groupId}` : '/'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="name">اسم المجموعة</FieldLabel>
          <TextInput
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="مثال: مجموعة الأحد مساءً"
            autoFocus
          />
        </div>

        <div>
          <FieldLabel htmlFor="fee">الرسوم الشهرية لكل طالب (ج.م)</FieldLabel>
          <TextInput
            id="fee"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={monthlyFee}
            onChange={(event) => setMonthlyFee(event.target.value)}
            placeholder="مثال: 200"
          />
        </div>

        <div>
          <FieldLabel htmlFor="notes">ملاحظات (اختياري)</FieldLabel>
          <TextArea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="المادة، الميعاد، المكان..."
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <PrimaryButton type="submit" className="w-full">
          {isEdit ? 'حفظ التعديلات' : 'إنشاء المجموعة'}
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
