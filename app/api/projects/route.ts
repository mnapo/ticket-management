import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/session"
import { listProjects } from "@/lib/data"

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const projects = await listProjects()
    return NextResponse.json({ projects })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}
