import { describe, it, expect } from 'vitest'
import { normalizePhone } from './phone'

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
