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
      await refresh()
      return saved
    },
    [refresh]
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

  return { beans, loading, saveBean, deleteBean, getBeanById, refresh }
}
