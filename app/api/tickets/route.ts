import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/session"
import { createTicket, listTickets } from "@/lib/data"
import { TICKET_STATUSES, TICKET_URGENCIES } from "@/lib/types"
import type { TicketStatus, TicketUrgency } from "@/lib/types"

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as TicketStatus | null
  const urgency = searchParams.get("urgency") as TicketUrgency | null
  const projectId = searchParams.get("projectId")
  const search = searchParams.get("search")

  try {
    const tickets = await listTickets({
      status: status && TICKET_STATUSES.includes(status) ? status : undefined,
      urgency: urgency && TICKET_URGENCIES.includes(urgency) ? urgency : undefined,
      projectId: projectId ?? undefined,
      search: search ?? undefined,
    })
    return NextResponse.json({ tickets })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
  }

  try {
    const ticket = await createTicket(
      {
        title: body.title as string,
        description: (body.description as string) ?? null,
        status: body.status as TicketStatus | undefined,
        urgency: body.urgency as TicketUrgency | undefined,
        category: (body.category as string) ?? null,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
        assignee: (body.assignee as string) ?? null,
        reporter: (body.reporter as string) ?? null,
        project_id: (body.project_id as string) ?? null,
        due_date: (body.due_date as string) ?? null,
      },
      user.email,
    )
    return NextResponse.json({ ticket }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}
