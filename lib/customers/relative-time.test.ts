import { describe, it, expect } from 'vitest'
import { formatRelativeDays } from './relative-time'

const NOW = new Date('2026-08-20T12:00:00')

describe('formatRelativeDays', () => {
  it('labels the same day as 오늘', () => {
    expect(formatRelativeDays('2026-08-20', NOW)).toBe('오늘')
  })

  it('labels the day before as 어제', () => {
    expect(formatRelativeDays('2026-08-19', NOW)).toBe('어제')
  })

  it('labels a few days ago in days', () => {
    expect(formatRelativeDays('2026-08-15', NOW)).toBe('5일 전')
  })

  it('labels roughly a month ago in months', () => {
    expect(formatRelativeDays('2026-07-10', NOW)).toBe('1개월 전')
  })

  it('labels over a year ago in years', () => {
    expect(formatRelativeDays('2025-01-01', NOW)).toBe('1년 전')
  })

  it('labels a future date in days', () => {
    expect(formatRelativeDays('2026-08-23', NOW)).toBe('3일 후')
  })
})
