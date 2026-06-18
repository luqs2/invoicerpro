import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'

describe('UiButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Click me' } })
    expect(wrapper.text()).toBe('Click me')
  })

  it('renders as button by default', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Submit' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('renders as anchor when href provided', () => {
    const wrapper = mount(UiButton, {
      props: { href: 'https://example.com' },
      slots: { default: 'Link' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('https://example.com')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Primary' } })
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('applies variant class', () => {
    const wrapper = mount(UiButton, {
      props: { variant: 'danger' },
      slots: { default: 'Delete' },
    })
    expect(wrapper.classes()).toContain('btn-danger')
  })

  it('applies size class', () => {
    const wrapper = mount(UiButton, {
      props: { size: 'lg' },
      slots: { default: 'Large' },
    })
    expect(wrapper.classes()).toContain('btn-lg')
  })

  it('disables when disabled prop is true', () => {
    const wrapper = mount(UiButton, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('disables when loading', () => {
    const wrapper = mount(UiButton, {
      props: { loading: true },
      slots: { default: 'Loading' },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('emits click event', async () => {
    const wrapper = mount(UiButton, { slots: { default: 'Click' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})

describe('UiInput', () => {
  it('renders input element', () => {
    const wrapper = mount(UiInput)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('binds modelValue', () => {
    const wrapper = mount(UiInput, {
      props: { modelValue: 'hello' },
    })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput)
    await wrapper.find('input').setValue('test')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test'])
  })

  it('applies error class when error prop is true', () => {
    const wrapper = mount(UiInput, { props: { error: true } })
    expect(wrapper.classes()).toContain('ui-input-error')
  })

  it('sets type attribute', () => {
    const wrapper = mount(UiInput, { props: { type: 'password' } })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('sets placeholder', () => {
    const wrapper = mount(UiInput, { props: { placeholder: 'Enter email' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter email')
  })

  it('disables when disabled prop is true', () => {
    const wrapper = mount(UiInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
