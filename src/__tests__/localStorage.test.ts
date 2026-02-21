import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Bean } from '@/lib/repositories/types'

// Mock compressImage to avoid heic2any Worker dependency in jsdom
vi.mock('@/lib/compressImage', () => ({
  compressImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,mock'),
}))

const { LocalStorageBeansRepository } = await import('@/lib/repositories/localStorage')

function makeBean(overrides: Partial<Bean> = {}): Bean {
  return {
    id: 'test-1',
    photo: 'data:image/jpeg;base64,abc',
    tastingNotes: 'cherry, chocolate',
    rating: 4,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('LocalStorageBeansRepository', () => {
  let repo: InstanceType<typeof LocalStorageBeansRepository>

  beforeEach(() => {
    localStorage.clear()
    repo = new LocalStorageBeansRepository()
  })

  it('returns empty array when no data stored', async () => {
    expect(await repo.getAll()).toEqual([])
  })

  it('saves and retrieves a bean', async () => {
    const bean = makeBean()
    const saved = await repo.save(bean)
    expect(saved.id).toBe('test-1')

    const all = await repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].tastingNotes).toBe('cherry, chocolate')
  })

  it('updates an existing bean by id', async () => {
    await repo.save(makeBean())
    const updated = await repo.save(makeBean({ rating: 5 }))
    expect(updated.rating).toBe(5)

    const all = await repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].rating).toBe(5)
  })

  it('getById returns null for missing id', async () => {
    expect(await repo.getById('nonexistent')).toBeNull()
  })

  it('getById returns the correct bean', async () => {
    await repo.save(makeBean({ id: 'a' }))
    await repo.save(makeBean({ id: 'b', rating: 2 }))

    const found = await repo.getById('b')
    expect(found?.rating).toBe(2)
  })

  it('deletes a bean', async () => {
    await repo.save(makeBean({ id: 'a' }))
    await repo.save(makeBean({ id: 'b' }))
    await repo.delete('a')

    const all = await repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe('b')
  })

  it('getAll sorts by createdAt descending', async () => {
    await repo.save(makeBean({ id: 'old', createdAt: '2024-01-01T00:00:00.000Z' }))
    await repo.save(makeBean({ id: 'new', createdAt: '2025-06-01T00:00:00.000Z' }))

    const all = await repo.getAll()
    expect(all[0].id).toBe('new')
    expect(all[1].id).toBe('old')
  })

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem('kura_beans', 'not-valid-json{{{')
    expect(await repo.getAll()).toEqual([])
  })

  // Step 0 fix: persist() should not throw on quota exceeded
  it('throws a StorageError when localStorage quota is exceeded', async () => {
    // Simulate quota exceeded
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError')
    })

    try {
      await expect(repo.save(makeBean())).rejects.toThrow('Storage quota exceeded')
    } finally {
      Storage.prototype.setItem = original
    }
  })
})
