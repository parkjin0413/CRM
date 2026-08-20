import { describe, it, expect } from 'vitest'
import { generateAuthToken, verifyAuthToken } from './token'

describe('auth token', () => {
  it('verifies a token generated with the same secret', () => {
    const token = generateAuthToken('correct-password')
    expect(verifyAuthToken('correct-password', token)).toBe(true)
  })

  it('rejects a token generated with a different secret', () => {
    const token = generateAuthToken('correct-password')
    expect(verifyAuthToken('wrong-password', token)).toBe(false)
  })

  it('rejects an undefined token', () => {
    expect(verifyAuthToken('correct-password', undefined)).toBe(false)
  })

  it('rejects a garbage token', () => {
    expect(verifyAuthToken('correct-password', 'not-a-real-token')).toBe(false)
  })
})
