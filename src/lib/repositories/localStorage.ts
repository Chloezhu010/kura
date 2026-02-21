import type { Bean, BeansRepository } from './types'
import { compressImage } from '@/lib/compressImage'

const STORAGE_KEY = 'kura_beans'

function load(): Bean[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Bean[]
  } catch {
    return []
  }
}

function persist(beans: Bean[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beans))
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Try removing some beans or photos.')
    }
    throw e
  }
}

export class LocalStorageBeansRepository implements BeansRepository {
  async getAll(): Promise<Bean[]> {
    return load().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  async getById(id: string): Promise<Bean | null> {
    return load().find((b) => b.id === id) ?? null
  }

  async save(bean: Bean): Promise<Bean> {
    const beans = load()
    const idx = beans.findIndex((b) => b.id === bean.id)
    const updated: Bean = { ...bean, updatedAt: new Date().toISOString() }

    if (idx >= 0) {
      beans[idx] = updated
    } else {
      beans.unshift(updated)
    }

    persist(beans)
    return updated
  }

  async delete(id: string): Promise<void> {
    persist(load().filter((b) => b.id !== id))
  }

  async uploadPhoto(file: File): Promise<string> {
    return compressImage(file)
  }
}
