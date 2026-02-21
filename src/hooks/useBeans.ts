'use client'

import { useCallback, useEffect, useState } from 'react'
import { getRepository } from '@/lib/repositories'
import type { Bean } from '@/lib/repositories/types'

export function useBeans() {
  const [beans, setBeans] = useState<Bean[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await getRepository().getAll()
    setBeans(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const saveBean = useCallback(
    async (bean: Bean): Promise<Bean> => {
      const saved = await getRepository().save(bean)
      setBeans((prev) => {
        const idx = prev.findIndex((b) => b.id === saved.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = saved
          return next
        }
        return [saved, ...prev]
      })
      return saved
    },
    []
  )

  const deleteBean = useCallback(
    async (id: string): Promise<void> => {
      await getRepository().delete(id)
      await refresh()
    },
    [refresh]
  )

  const getBeanById = useCallback(async (id: string): Promise<Bean | null> => {
    return getRepository().getById(id)
  }, [])

  const uploadPhoto = useCallback(async (file: File): Promise<string> => {
    return getRepository().uploadPhoto(file)
  }, [])

  return { beans, loading, saveBean, deleteBean, getBeanById, refresh, uploadPhoto }
}
