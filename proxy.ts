import { type NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth"

const PUBLIC_PATHS = ["/login"]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API auth routes and static assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const user = token ? await verifySessionToken(token) : null

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Unauthenticated users trying to reach a protected page → login
  if (!user && !isPublic && !pathname.startsWith("/api")) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated users on the login page → dashboard
  if (user && pathname.startsWith("/login")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
