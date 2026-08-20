'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateAuthToken } from '@/lib/auth/token'

export async function login(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''
  const from = formData.get('from')?.toString() || '/'
  const secret = process.env.SITE_PASSWORD

  if (!secret || password !== secret) {
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`)
  }

  const token = generateAuthToken(secret)
  const cookieStore = await cookies()
  cookieStore.set('crm_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect(from)
}
