import { useEffect, useState } from 'react'
import { useLessonsStore } from '../store/useLessonsStore'

export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(() =>
    useLessonsStore.persist.hasHydrated(),
  )

  useEffect(() => {
    if (hydrated) return
    return useLessonsStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
  }, [hydrated])

  return hydrated
}
