import { getAdminClient } from "@/lib/supabase/admin"
import type { SessionUser } from "@/lib/auth"
import type {
  AppUser,
  Project,
  Ticket,
  TicketEvent,
  TicketStatus,
  TicketUrgency,
} from "@/lib/types"

export interface TicketFilters {
  status?: TicketStatus
  urgency?: TicketUrgency
  projectId?: string
  search?: string
}

export class AccessDeniedError extends Error {
  constructor(message = "Acceso denegado") {
    super(message)
    this.name = "AccessDeniedError"
  }
}

function getProjectScope(user: SessionUser): string | null {
  if (user.role === "admin") {
    return null
  }

  if (!user.project_id) {
    throw new AccessDeniedError(
      "El usuario no tiene un proyecto asignado",
    )
  }

  return user.project_id
}

export async function listUsers(): Promise<AppUser[]> {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,name,role,project_id")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as AppUser[]
}

async function getFirstAdmin(): Promise<AppUser | null> {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,name,role,project_id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as AppUser) ?? null
}

async function attachUsersToTickets(
  tickets: Ticket[],
): Promise<Ticket[]> {
  if (tickets.length === 0) {
    return tickets
  }

  const supabase = getAdminClient()

  const userIds = Array.from(
    new Set(
      tickets.flatMap((ticket) =>
        [
          ticket.assignee_id,
          ticket.reporter_id,
        ].filter(
          (id): id is string => Boolean(id),
        ),
      ),
    ),
  )

  if (userIds.length === 0) {
    return tickets.map((ticket) => ({
      ...ticket,
      assignee: null,
      reporter: null,
    }))
  }

  const { data, error } = await supabase
    .from("app_users")
    .select("id,email,name,role,project_id")
    .in("id", userIds)

  if (error) {
    throw new Error(error.message)
  }

  const users = (data ?? []) as AppUser[]

  const usersById = new Map(
    users.map((user) => [user.id, user]),
  )

  return tickets.map((ticket) => ({
    ...ticket,
    assignee: ticket.assignee_id
      ? usersById.get(ticket.assignee_id) ?? null
      : null,
    reporter: ticket.reporter_id
      ? usersById.get(ticket.reporter_id) ?? null
      : null,
  }))
}

export async function listTickets(
  filters: TicketFilters = {},
  user: SessionUser,
): Promise<Ticket[]> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  let query = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.urgency) {
    query = query.eq("urgency", filters.urgency)
  }

  // Admin puede filtrar libremente.
  // Todo otro usuario queda forzado a su proyecto.
  if (projectScope) {
    query = query.eq("project_id", projectScope)
  } else if (filters.projectId) {
    query = query.eq(
      "project_id",
      filters.projectId,
    )
  }

  if (filters.search) {
    query = query.ilike(
      "title",
      `%${filters.search}%`,
    )
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return attachUsersToTickets(
    (data ?? []) as Ticket[],
  )
}

export async function getTicket(
  id: string,
  user: SessionUser,
): Promise<Ticket | null> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  let query = supabase
    .from("tickets")
    .select("*")
    .eq("id", id)

  if (projectScope) {
    query = query.eq(
      "project_id",
      projectScope,
    )
  }

  const { data, error } =
    await query.maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const tickets = await attachUsersToTickets([
    data as Ticket,
  ])

  return tickets[0] ?? null
}

export interface CreateTicketInput {
  title: string
  description?: string | null
  status?: TicketStatus
  urgency?: TicketUrgency
  category?: string | null
  tags?: string[]
  assignee_id?: string | null
  reporter_id?: string | null
  project_id?: string | null
  due_date?: string | null
}

export async function createTicket(
  input: CreateTicketInput,
  actor: string,
  user: SessionUser,
): Promise<Ticket> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  // Admin puede elegir el proyecto enviado.
  // Los demás usuarios siempre quedan ligados a su proyecto.
  const projectId =
    projectScope !== null
      ? projectScope
      : input.project_id ?? null

  if (!projectId) {
    throw new AccessDeniedError(
      "El ticket debe tener un proyecto asignado",
    )
  }

  let reporterId =
    input.reporter_id ?? null

  let assigneeId =
    input.assignee_id ?? null

  // Los usuarios no-admin no pueden elegir
  // reporter ni assignee.
  if (user.role !== "admin") {
    reporterId = user.sub

    const firstAdmin = await getFirstAdmin()

    if (!firstAdmin) {
      throw new AccessDeniedError(
        "No hay ningún usuario administrador disponible",
      )
    }

    assigneeId = firstAdmin.id
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      title: input.title,
      description:
        input.description ?? null,
      status:
        input.status ?? "iniciado",
      urgency:
        input.urgency ?? "media",
      category:
        input.category ?? null,
      tags:
        input.tags ?? [],
      assignee_id: assigneeId,
      reporter_id: reporterId,
      project_id: projectId,
      due_date:
        input.due_date ?? null,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await supabase
    .from("ticket_events")
    .insert({
      ticket_id: data.id,
      type: "created",
      to_status: data.status,
      actor,
      note: "Ticket creado",
    })

  const tickets = await attachUsersToTickets([
    data as Ticket,
  ])

  return tickets[0]
}

export async function updateTicket(
  id: string,
  input: Partial<CreateTicketInput>,
  actor: string,
  user: SessionUser,
): Promise<Ticket | null> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  // La consulta existente también queda limitada por proyecto.
  let existingQuery = supabase
    .from("tickets")
    .select("*")
    .eq("id", id)

  if (projectScope) {
    existingQuery = existingQuery.eq(
      "project_id",
      projectScope,
    )
  }

  const {
    data: existingData,
    error: existingError,
  } = await existingQuery.maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (!existingData) {
    return null
  }

  const existing = existingData as Ticket

  // Un no-admin nunca puede mover un ticket
  // a otro proyecto.
  const safeProjectId =
    projectScope !== null
      ? projectScope
      : input.project_id !== undefined
        ? input.project_id
        : undefined

  let reporterId =
    input.reporter_id

  let assigneeId =
    input.assignee_id

  // En edición, los no-admin tampoco pueden
  // modificar estas relaciones.
  if (user.role !== "admin") {
    reporterId = user.sub

    const firstAdmin = await getFirstAdmin()

    if (!firstAdmin) {
      throw new AccessDeniedError(
        "No hay ningún usuario administrador disponible",
      )
    }

    assigneeId = firstAdmin.id
  }

  const updateData = {
    ...(input.title !== undefined
      ? { title: input.title }
      : {}),
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.status !== undefined
      ? { status: input.status }
      : {}),
    ...(input.urgency !== undefined
      ? { urgency: input.urgency }
      : {}),
    ...(input.category !== undefined
      ? { category: input.category }
      : {}),
    ...(input.tags !== undefined
      ? { tags: input.tags }
      : {}),
    ...(input.assignee_id !== undefined ||
    user.role !== "admin"
      ? { assignee_id: assigneeId ?? null }
      : {}),
    ...(input.reporter_id !== undefined ||
    user.role !== "admin"
      ? { reporter_id: reporterId ?? null }
      : {}),
    ...(safeProjectId !== undefined
      ? { project_id: safeProjectId }
      : {}),
    ...(input.due_date !== undefined
      ? { due_date: input.due_date }
      : {}),
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (
    input.status !== undefined &&
    input.status !== existing.status
  ) {
    await supabase
      .from("ticket_events")
      .insert({
        ticket_id: id,
        type: "status_change",
        from_status: existing.status,
        to_status: input.status,
        actor,
        note: `Estado cambiado de ${existing.status} a ${input.status}`,
      })
  } else {
    await supabase
      .from("ticket_events")
      .insert({
        ticket_id: id,
        type: "updated",
        actor,
        note: "Ticket actualizado",
      })
  }

  const tickets = await attachUsersToTickets([
    data as Ticket,
  ])

  return tickets[0]
}

export async function deleteTicket(
  id: string,
  user: SessionUser,
): Promise<boolean> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  let query = supabase
    .from("tickets")
    .delete()
    .eq("id", id)

  if (projectScope) {
    query = query.eq(
      "project_id",
      projectScope,
    )
  }

  const { error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export async function getTicketEvents(
  ticketId: string,
  user: SessionUser,
): Promise<TicketEvent[]> {
  // Primero verificamos que el usuario pueda
  // acceder al ticket.
  const ticket = await getTicket(
    ticketId,
    user,
  )

  if (!ticket) {
    return []
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from("ticket_events")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TicketEvent[]
}

export async function listProjects(
  user: SessionUser,
): Promise<Project[]> {
  const supabase = getAdminClient()
  const projectScope = getProjectScope(user)

  let query = supabase
    .from("projects")
    .select("*")
    .order("name")

  if (projectScope) {
    query = query.eq(
      "id",
      projectScope,
    )
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as Project[]
}

export interface Metrics {
  total: number
  open: number
  closed: number
  critical: number
  byStatus: Record<string, number>
  byUrgency: Record<string, number>
}

export async function getMetrics(
  user: SessionUser,
): Promise<Metrics> {
  const tickets = await listTickets(
    {},
    user,
  )

  const byStatus: Record<
    string,
    number
  > = {}

  const byUrgency: Record<
    string,
    number
  > = {}

  for (const ticket of tickets) {
    byStatus[ticket.status] =
      (byStatus[ticket.status] ?? 0) + 1

    byUrgency[ticket.urgency] =
      (byUrgency[ticket.urgency] ?? 0) + 1
  }

  return {
    total: tickets.length,
    open: tickets.filter(
      (ticket) =>
        ticket.status !== "cerrado",
    ).length,
    closed:
      byStatus["cerrado"] ?? 0,
    critical: tickets.filter(
      (ticket) =>
        ticket.urgency === "critica" &&
        ticket.status !== "cerrado",
    ).length,
    byStatus,
    byUrgency,
  }
}
