import { describe, it, expect } from 'vitest'
import { useConfirm } from '@/composables/useConfirm'

describe('useConfirm', () => {
  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm()

  it('starts closed', () => {
    expect(isOpen.value).toBe(false)
  })

  it('opens with default options', async () => {
    const promise = confirm({ title: 'Test', message: 'Are you sure?' })
    expect(isOpen.value).toBe(true)
    expect(options.value.title).toBe('Test')
    expect(options.value.message).toBe('Are you sure?')
    expect(options.value.variant).toBe('danger')

    handleCancel()
    const result = await promise
    expect(result).toBe(false)
  })

  it('resolves true on confirm', async () => {
    const promise = confirm({ title: 'Delete', message: 'Confirm?' })
    handleConfirm()
    const result = await promise
    expect(result).toBe(true)
  })

  it('resolves false on cancel', async () => {
    const promise = confirm({ title: 'Delete', message: 'Confirm?' })
    handleCancel()
    const result = await promise
    expect(result).toBe(false)
  })

  it('merges custom options with defaults', async () => {
    const promise = confirm({
      title: 'Warning',
      message: 'Something',
      confirmText: 'Yes, do it',
      cancelText: 'Nope',
      variant: 'warning',
    })

    expect(options.value.confirmText).toBe('Yes, do it')
    expect(options.value.cancelText).toBe('Nope')
    expect(options.value.variant).toBe('warning')

    handleCancel()
    await promise
  })

  it('resolves true and clears resolver after confirm', async () => {
    const promise = confirm({ title: 'Test', message: '?' })
    expect(isOpen.value).toBe(true)
    handleConfirm()
    const result = await promise
    expect(result).toBe(true)
  })
})
