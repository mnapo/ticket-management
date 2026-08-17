import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import bcrypt from "bcrypt"
import { getAdminClient } from "@/lib/supabase/admin"

const COOKIE_NAME = "ticket_session"
const ISSUER = "ticketing-app"
const AUDIENCE = "ticketing-admin"

const SESSION_DURATION = "8h"
const REMEMBERED_SESSION_DURATION = "30d"

export const SESSION_COOKIE = COOKIE_NAME

export interface SessionUser {
  sub: string
  email: string
  name: string
  role: "admin" | "agent" | "viewer" | "project_viewer"
  project_id?: string | null
}

export function getSessionDuration(rememberMe = false): string {
  return rememberMe ? REMEMBERED_SESSION_DURATION : SESSION_DURATION
}

export function getSessionMaxAge(rememberMe = false): number {
  return rememberMe
    ? 60 * 60 * 24 * 30
    : 60 * 60 * 8
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET

  if (!secret) {
    throw new Error("Falta AUTH_JWT_SECRET en las variables de entorno.")
  }

  return new TextEncoder().encode(secret)
}

export async function createSessionToken(
  user: SessionUser,
  rememberMe = false,
): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    project_id: user.project_id ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(getSessionDuration(rememberMe))
    .sign(getSecret())
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    })

    return payloadToUser(payload)
  } catch {
    return null
  }
}

export async function validateUserCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const supabase = getAdminClient()

  const { data: user, error } = await supabase
    .from("app_users")
    .select("id,email,name,role,project_id,password_hash")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle()

  if (error || !user) {
    return null
  }

  if (!user.password_hash) {
    return null
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password_hash,
  )

  if (!validPassword) {
    return null
  }

  return {
    sub: user.id,
    email: user.email,
    name: user.name ?? "",
    role: user.role,
    project_id: user.project_id,
  }
}

function payloadToUser(payload: JWTPayload): SessionUser {
  return {
    sub: String(payload.sub),
    email: String(payload.email ?? ""),
    name: String(payload.name ?? ""),
    role: (payload.role as SessionUser["role"]) ?? "agent",
    project_id: String(payload.project_id ?? "") || null,
  }
}
