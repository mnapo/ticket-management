import { getAdminClient } from "@/lib/supabase/admin"
import type {
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

export async function listTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  const supabase = getAdminClient()
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false })

  if (filters.status) query = query.eq("status", filters.status)
  if (filters.urgency) query = query.eq("urgency", filters.urgency)
  if (filters.projectId) query = query.eq("project_id", filters.projectId)
  if (filters.search) query = query.ilike("title", `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as Ticket[]
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("tickets").select("*").eq("id", id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Ticket) ?? null
}

export interface CreateTicketInput {
  title: string
  description?: string | null
  status?: TicketStatus
  urgency?: TicketUrgency
  category?: string | null
  tags?: string[]
  assignee?: string | null
  reporter?: string | null
  project_id?: string | null
  due_date?: string | null
}

export async function createTicket(
  input: CreateTicketInput,
  actor: string,
): Promise<Ticket> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? "iniciado",
      urgency: input.urgency ?? "media",
      category: input.category ?? null,
      tags: input.tags ?? [],
      assignee: input.assignee ?? null,
      reporter: input.reporter ?? null,
      project_id: input.project_id ?? null,
      due_date: input.due_date ?? null,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  await supabase.from("ticket_events").insert({
    ticket_id: data.id,
    type: "created",
    to_status: data.status,
    actor,
    note: "Ticket creado",
  })

  return data as Ticket
}

export async function updateTicket(
  id: string,
  input: Partial<CreateTicketInput>,
  actor: string,
): Promise<Ticket | null> {
  const supabase = getAdminClient()
  const existing = await getTicket(id)
  if (!existing) return null

  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.urgency !== undefined ? { urgency: input.urgency } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.assignee !== undefined ? { assignee: input.assignee } : {}),
      ...(input.reporter !== undefined ? { reporter: input.reporter } : {}),
      ...(input.project_id !== undefined ? { project_id: input.project_id } : {}),
      ...(input.due_date !== undefined ? { due_date: input.due_date } : {}),
    })
    .eq("id", id)
    .select("*")
    .single()

  if (error) throw new Error(error.message)

  if (input.status !== undefined && input.status !== existing.status) {
    await supabase.from("ticket_events").insert({
      ticket_id: id,
      type: "status_change",
      from_status: existing.status,
      to_status: input.status,
      actor,
      note: `Estado cambiado de ${existing.status} a ${input.status}`,
    })
  } else {
    await supabase.from("ticket_events").insert({
      ticket_id: id,
      type: "updated",
      actor,
      note: "Ticket actualizado",
    })
  }

  return data as Ticket
}

export async function deleteTicket(id: string): Promise<boolean> {
  const supabase = getAdminClient()
  const { error } = await supabase.from("tickets").delete().eq("id", id)
  if (error) throw new Error(error.message)
  return true
}

export async function getTicketEvents(ticketId: string): Promise<TicketEvent[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("ticket_events")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as TicketEvent[]
}

export async function listProjects(): Promise<Project[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase.from("projects").select("*").order("name")
  if (error) throw new Error(error.message)
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

export async function getMetrics(): Promise<Metrics> {
  const tickets = await listTickets()
  const byStatus: Record<string, number> = {}
  const byUrgency: Record<string, number> = {}

  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1
    byUrgency[t.urgency] = (byUrgency[t.urgency] ?? 0) + 1
  }

  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status !== "cerrado").length,
    closed: byStatus["cerrado"] ?? 0,
    critical: tickets.filter((t) => t.urgency === "critica" && t.status !== "cerrado").length,
    byStatus,
    byUrgency,
  }
}
