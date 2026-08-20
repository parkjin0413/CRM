import { NextResponse, type NextRequest } from 'next/server'
import { verifyAuthToken } from '@/lib/auth/token'

const COOKIE_NAME = 'crm_auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const secret = process.env.SITE_PASSWORD
  if (secret && verifyAuthToken(secret, token)) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

export const runtime = 'nodejs'
