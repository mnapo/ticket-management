import { type NextRequest, NextResponse } from "next/server"
import {
  createSessionToken,
  getSessionMaxAge,
  SESSION_COOKIE,
  validateUserCredentials,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  let body: {
    email?: string
    password?: string
    rememberMe?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido" },
      { status: 400 },
    )
  }

  const { email, password, rememberMe = false } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios" },
      { status: 400 },
    )
  }

  const user = await validateUserCredentials(email, password)

  if (!user) {
    return NextResponse.json(
      { error: "Credenciales incorrectas" },
      { status: 401 },
    )
  }

  const token = await createSessionToken(user, rememberMe)

  const res = NextResponse.json({
    user,
    token,
  })

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAge(rememberMe),
  })

  return res
}
