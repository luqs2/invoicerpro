import { describe, it, expect, vi } from 'vitest'
import { debounce } from '@/utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('cancels previous call on rapid invocations', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    vi.advanceTimersByTime(50)
    debounced('second')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')
  })

  it('passes arguments correctly', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 50)

    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(50)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('executes each call after full delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    debounced('second')
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
