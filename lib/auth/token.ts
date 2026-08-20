import crypto from 'node:crypto'

export function generateAuthToken(secret: string): string {
  return crypto.createHmac('sha256', secret).update('authenticated').digest('hex')
}

export function verifyAuthToken(secret: string, token: string | undefined): boolean {
  if (!token) return false
  const expected = generateAuthToken(secret)
  const expectedBuf = Buffer.from(expected)
  const tokenBuf = Buffer.from(token)
  if (expectedBuf.length !== tokenBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, tokenBuf)
}
