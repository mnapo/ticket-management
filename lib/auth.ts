import { SignJWT, jwtVerify, type JWTPayload } from "jose"

const COOKIE_NAME = "ticket_session"
const ISSUER = "ticketing-app"
const AUDIENCE = "ticketing-admin"

export const SESSION_COOKIE = COOKIE_NAME

export interface SessionUser {
  sub: string
  email: string
  name: string
  role: "admin" | "agent" | "viewer"
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    throw new Error("Falta AUTH_JWT_SECRET en las variables de entorno.")
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("8h")
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

function payloadToUser(payload: JWTPayload): SessionUser {
  return {
    sub: String(payload.sub),
    email: String(payload.email ?? ""),
    name: String(payload.name ?? ""),
    role: (payload.role as SessionUser["role"]) ?? "agent",
  }
}

/**
 * Validates credentials against the single-admin env vars.
 * Designed to be swapped later for a DB-backed multi-user lookup.
 */
export function validateAdminCredentials(
  email: string,
  password: string,
): SessionUser | null {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.")
  }

  const emailMatch = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
  const passwordMatch = password === adminPassword

  if (emailMatch && passwordMatch) {
    return {
      sub: "admin",
      email: adminEmail,
      name: "Administrador",
      role: "admin",
    }
  }

  return null
}
