import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/session"
import {
  deleteTicket,
  getTicket,
  getTicketEvents,
  updateTicket,
} from "@/lib/data"
import type { TicketStatus, TicketUrgency } from "@/lib/types"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await authenticateRequest(req)
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  try {
    const ticket = await getTicket(id)
    if (!ticket) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    const events = await getTicketEvents(id)
    return NextResponse.json({ ticket, events })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await authenticateRequest(req)
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 })
  }

  try {
    const ticket = await updateTicket(
      id,
      {
        title: body.title as string | undefined,
        description: body.description as string | undefined,
        status: body.status as TicketStatus | undefined,
        urgency: body.urgency as TicketUrgency | undefined,
        category: body.category as string | undefined,
        tags: body.tags as string[] | undefined,
        assignee: body.assignee as string | undefined,
        reporter: body.reporter as string | undefined,
        project_id: body.project_id as string | undefined,
        due_date: body.due_date as string | undefined,
      },
      user.email,
    )
    if (!ticket) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json({ ticket })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await authenticateRequest(req)
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  try {
    await deleteTicket(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    )
  }
}
