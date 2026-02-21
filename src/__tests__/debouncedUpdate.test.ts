import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Bean } from '@/lib/repositories/types'

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

/**
 * Extracts the debounced-update logic from BeanDetailScreen into a testable unit.
 * This mirrors the beanRef + pendingPatch + debounce pattern used in the component.
 */
function createDebouncedUpdater(saveBean: (bean: Bean) => Promise<Bean>, delay = 600) {
  let bean: Bean | null = null
  const pendingPatch: { current: Partial<Bean> } = { current: {} }
  let timer: ReturnType<typeof setTimeout> | null = null
  let onSaved: ((bean: Bean) => void) | undefined

  function setBean(b: Bean | null) { bean = b }
  function getBean() { return bean }

  function update(patch: Partial<Bean>) {
    if (!bean) return
    // Optimistic UI update
    bean = { ...bean, ...patch }
    // Merge into pending
    pendingPatch.current = { ...pendingPatch.current, ...patch }
    // Debounce
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      if (!bean) return
      const toSave = { ...bean, ...pendingPatch.current }
      pendingPatch.current = {}
      const saved = await saveBean(toSave)
      bean = saved
      onSaved?.(saved)
    }, delay)
  }

  function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
      if (bean && Object.keys(pendingPatch.current).length > 0) {
        const toSave = { ...bean, ...pendingPatch.current }
        pendingPatch.current = {}
        saveBean(toSave).then((saved) => { bean = saved })
      }
    }
  }

  return { setBean, getBean, update, flush, onSaved: (fn: (b: Bean) => void) => { onSaved = fn } }
}

describe('debounced update logic', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('merges rapid patches into a single save call', async () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean())

    // Simulate rapid changes: name blur, then rating click, then origin blur
    updater.update({ name: 'Yirgacheffe' })
    updater.update({ rating: 5 })
    updater.update({ origin: 'Ethiopia' })

    // No save yet — still within debounce window
    expect(saveBean).not.toHaveBeenCalled()

    // Advance past debounce
    await vi.advanceTimersByTimeAsync(600)

    // Single save with all three patches merged
    expect(saveBean).toHaveBeenCalledOnce()
    const savedBean = saveBean.mock.calls[0][0]
    expect(savedBean.name).toBe('Yirgacheffe')
    expect(savedBean.rating).toBe(5)
    expect(savedBean.origin).toBe('Ethiopia')
  })

  it('applies patches optimistically — getBean reflects changes immediately', () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean({ rating: 3 }))

    updater.update({ rating: 5 })

    // Before debounce fires, bean already has the new value
    expect(updater.getBean()?.rating).toBe(5)
    expect(saveBean).not.toHaveBeenCalled()
  })

  it('second patch sees the first patch (no stale read)', () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean({ name: 'Old', rating: 2 }))

    updater.update({ name: 'New' })
    // The next update should see name='New', not 'Old'
    expect(updater.getBean()?.name).toBe('New')

    updater.update({ rating: 5 })
    expect(updater.getBean()?.name).toBe('New')
    expect(updater.getBean()?.rating).toBe(5)
  })

  it('separate bursts produce separate save calls', async () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean())

    // First burst
    updater.update({ name: 'First' })
    await vi.advanceTimersByTimeAsync(600)
    expect(saveBean).toHaveBeenCalledOnce()

    // Second burst
    updater.update({ name: 'Second' })
    await vi.advanceTimersByTimeAsync(600)
    expect(saveBean).toHaveBeenCalledTimes(2)
  })

  it('flush sends pending patches immediately (unmount safety)', async () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean())

    updater.update({ name: 'WillFlush' })
    expect(saveBean).not.toHaveBeenCalled()

    updater.flush()
    expect(saveBean).toHaveBeenCalledOnce()
    expect(saveBean.mock.calls[0][0].name).toBe('WillFlush')
  })

  it('flush is a no-op when nothing is pending', () => {
    const saveBean = vi.fn().mockImplementation(async (b: Bean) => b)
    const updater = createDebouncedUpdater(saveBean)
    updater.setBean(makeBean())

    updater.flush()
    expect(saveBean).not.toHaveBeenCalled()
  })
})
