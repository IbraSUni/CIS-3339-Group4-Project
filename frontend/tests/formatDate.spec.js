
import { describe, it, expect } from 'vitest'
import {
  formatDate,
  toDateInputValue
} from '../src/utils/formatDate'

describe('Date Formatting Tests', () => {
  it('formats a date correctly', () => {
    expect(formatDate('2026-10-30')).toBe('10/30/2026')
  })

  it('returns empty string for missing dates', () => {
    expect(formatDate(null)).toBe('')
  })

  it('handles invalid dates safely', () => {
    expect(formatDate('invalid-date')).toBe('')
  })

  it('converts dates for HTML date inputs', () => {
    expect(toDateInputValue('2026-10-30'))
      .toBe('2026-10-30')
  })

  it('handles missing date input values', () => {
    expect(toDateInputValue(null)).toBe('')
  })
})
