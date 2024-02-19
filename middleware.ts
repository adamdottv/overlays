import { NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/api/unauthorized", "/api/twitch", "/api/srt"]

export function middleware(req: NextRequest) {
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const key =
    req.nextUrl.searchParams.get("key") || req.headers.get("x-api-key")

  if (!key || key !== process.env.API_KEY) {
    const loginUrl = new URL("/api/unauthorized", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
