import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/session"
import { getMetrics } from "@/lib/data"

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const metrics = await getMetrics()
    return NextResponse.json({ metrics })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}
