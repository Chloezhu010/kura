import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Bean, BeansRepository } from '@/lib/repositories/types'

function makeBean(overrides: Partial<Bean> = {}): Bean {
  return {
    id: 'test-1',
    photo: 'data:image/jpeg;base64,abc',
    tastingNotes: 'fruity',
    rating: 3,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Mock the repository module so useBeans uses our fake
const mockRepo: BeansRepository = {
  getAll: vi.fn(),
  getById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  uploadPhoto: vi.fn(),
}

vi.mock('@/lib/repositories', () => ({
  getRepository: () => mockRepo,
}))

// Import after mock is set up
const { useBeans } = await import('@/hooks/useBeans')

describe('useBeans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads beans on mount', async () => {
    const beans = [makeBean()]
    vi.mocked(mockRepo.getAll).mockResolvedValue(beans)

    const { result } = renderHook(() => useBeans())

    // Initially loading
    expect(result.current.loading).toBe(true)

    await act(async () => {})

    expect(result.current.loading).toBe(false)
    expect(result.current.beans).toEqual(beans)
  })

  it('saveBean calls repo.save and returns saved bean', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([])
    const saved = makeBean({ rating: 5 })
    vi.mocked(mockRepo.save).mockResolvedValue(saved)

    const { result } = renderHook(() => useBeans())
    await act(async () => {})

    // After save, refresh is called
    vi.mocked(mockRepo.getAll).mockResolvedValue([saved])

    let returned: Bean | undefined
    await act(async () => {
      returned = await result.current.saveBean(makeBean())
    })

    expect(returned?.rating).toBe(5)
    expect(mockRepo.save).toHaveBeenCalledOnce()
  })

  it('deleteBean calls repo.delete and refreshes', async () => {
    const bean = makeBean()
    vi.mocked(mockRepo.getAll).mockResolvedValue([bean])
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const { result } = renderHook(() => useBeans())
    await act(async () => {})

    vi.mocked(mockRepo.getAll).mockResolvedValue([])

    await act(async () => {
      await result.current.deleteBean('test-1')
    })

    expect(mockRepo.delete).toHaveBeenCalledWith('test-1')
    expect(result.current.beans).toEqual([])
  })

  // Step 0 fix: saveBean should not trigger a full getAll() refresh
  it('saveBean does NOT call getAll after save', async () => {
    vi.mocked(mockRepo.getAll).mockResolvedValue([])
    vi.mocked(mockRepo.save).mockResolvedValue(makeBean())

    const { result } = renderHook(() => useBeans())
    await act(async () => {})

    // Reset call count after initial load
    vi.mocked(mockRepo.getAll).mockClear()

    await act(async () => {
      await result.current.saveBean(makeBean())
    })

    expect(mockRepo.getAll).not.toHaveBeenCalled()
  })
})
