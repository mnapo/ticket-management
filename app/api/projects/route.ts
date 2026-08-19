import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/session"
import { listProjects } from "@/lib/data"

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    )
  }

  try {
    const projects = await listProjects(user)

    return NextResponse.json({ projects })
  } catch (err) {
    const status =
      err instanceof Error &&
      err.message.includes("no tiene un proyecto")
        ? 403
        : 500

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error interno",
      },
      { status },
    )
  }
}
