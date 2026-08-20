import {
  type NextRequest,
  NextResponse,
} from "next/server"
import { authenticateRequest } from "@/lib/session"
import {
  deleteTicket,
  getTicket,
  getTicketEvents,
  updateTicket,
  AccessDeniedError,
} from "@/lib/data"
import type {
  TicketStatus,
  TicketUrgency,
} from "@/lib/types"

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  const user = await authenticateRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    const ticket = await getTicket(id, user)

    if (!ticket) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 },
      )
    }

    const events = await getTicketEvents(id, user)

    return NextResponse.json({
      ticket,
      events,
    })
  } catch (err) {
    const status =
      err instanceof AccessDeniedError ? 403 : 500

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

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  const user = await authenticateRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Cuerpo inválido" },
      { status: 400 },
    )
  }

  try {
    const ticket = await updateTicket(
      id,
      {
        title:
          body.title as string | undefined,

        description:
          body.description as string | undefined,

        status:
          body.status as
            | TicketStatus
            | undefined,

        urgency:
          body.urgency as
            | TicketUrgency
            | undefined,

        category:
          body.category as string | undefined,

        tags:
          body.tags as string[] | undefined,

        assignee_id:
          body.assignee_id as string | null | undefined,

        reporter_id:
          body.reporter_id as string | null | undefined,

        project_id:
          body.project_id as string | undefined,

        due_date:
          body.due_date as string | undefined,
      },
      user.email,
      user,
    )

    if (!ticket) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 },
      )
    }

    return NextResponse.json({ ticket })
  } catch (err) {
    const status =
      err instanceof AccessDeniedError ? 403 : 500

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

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  const user = await authenticateRequest(req)

  if (!user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    const ticket = await getTicket(id, user)

    if (!ticket) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 },
      )
    }

    await deleteTicket(id, user)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const status =
      err instanceof AccessDeniedError ? 403 : 500

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
