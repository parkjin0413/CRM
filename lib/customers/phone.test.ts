import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhone } from './phone'

describe('normalizePhone', () => {
  it('strips hyphens', () => {
    expect(normalizePhone('010-1234-5678')).toBe('01012345678')
  })

  it('strips spaces', () => {
    expect(normalizePhone(' 010 1234 5678 ')).toBe('01012345678')
  })

  it('leaves already-normalized numbers unchanged', () => {
    expect(normalizePhone('01012345678')).toBe('01012345678')
  })

  it('returns an empty string for empty input', () => {
    expect(normalizePhone('')).toBe('')
  })
})

describe('formatPhone', () => {
  it('formats an 11-digit mobile number as 3-4-4', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
  })

  it('formats a 10-digit Seoul number (02) as 2-4-4', () => {
    expect(formatPhone('0212345678')).toBe('02-1234-5678')
  })

  it('formats a 10-digit non-Seoul number as 3-3-4', () => {
    expect(formatPhone('0311234567')).toBe('031-123-4567')
  })

  it('formats a 9-digit Seoul number (02) as 2-3-4', () => {
    expect(formatPhone('021234567')).toBe('02-123-4567')
  })

  it('formats an 8-digit number (e.g. customer service line) as 4-4', () => {
    expect(formatPhone('15881234')).toBe('1588-1234')
  })

  it('leaves already-hyphenated input untouched by re-deriving from digits', () => {
    expect(formatPhone('010-1234-5678')).toBe('010-1234-5678')
  })

  it('falls back to the raw digits for a length it cannot confidently format', () => {
    expect(formatPhone('123')).toBe('123')
  })

  it('returns an empty string for empty input', () => {
    expect(formatPhone('')).toBe('')
  })
})
