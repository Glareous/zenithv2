import { NextResponse } from 'next/server'

// @ts-ignore
import { withAuth } from 'next-auth/middleware'

export default withAuth(function middleware(req: any) {
  if (!req.nextauth.token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.rewrite(url)
  }

  // Protect /admin routes - only SUPERADMIN can access
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const userRole = req.nextauth.token?.role

    if (userRole !== 'SUPERADMIN') {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboards/ecommerce'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
})

export const config = { matcher: ['/(.*?)'] }
