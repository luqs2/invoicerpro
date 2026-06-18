import { describe, it, expect } from 'vitest'
import { useFormatters } from '@/composables/useFormatters'

describe('useFormatters', () => {
  const { formatCurrency, formatDate, getInitials } = useFormatters()

  describe('formatCurrency', () => {
    it('formats MYR by default', () => {
      expect(formatCurrency(1234.56)).toBe('RM 1,234.56')
    })

    it('formats USD', () => {
      expect(formatCurrency(99.9, 'USD')).toBe('$ 99.90')
    })

    it('formats SGD', () => {
      expect(formatCurrency(50, 'SGD')).toBe('S$ 50.00')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('RM 0.00')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-100)).toBe('RM -100.00')
    })

    it('falls back to currency code for unknown', () => {
      expect(formatCurrency(10, 'JPY')).toBe('JPY 10.00')
    })
  })

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = formatDate('2026-06-18')
      expect(result).toContain('Jun')
      expect(result).toContain('2026')
    })

    it('handles ISO datetime', () => {
      const result = formatDate('2026-01-01T12:00:00Z')
      expect(result).toContain('2026')
    })
  })

  describe('getInitials', () => {
    it('returns two initials for a full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('returns single initial for one name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('limits to 2 characters', () => {
      expect(getInitials('John Michael Smith')).toBe('JM')
    })

    it('uppercase initials', () => {
      expect(getInitials('jane doe')).toBe('JD')
    })
  })
})
