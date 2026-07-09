import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "@/lib/auth"

/** Reads the session from the cookie (for server components / pages). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

/**
 * Authenticates an API request. Accepts either the session cookie or a
 * Bearer token in the Authorization header (for external API consumers).
 */
export async function authenticateRequest(
  req: NextRequest,
): Promise<SessionUser | null> {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim()
    const user = await verifySessionToken(token)
    if (user) return user
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    return verifySessionToken(token)
  }

  return null
}
