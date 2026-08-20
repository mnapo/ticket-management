export const TICKET_STATUSES = [
  "iniciado",
  "en_proceso",
  "en_prueba",
  "con_problemas",
  "demorado",
  "cerrado",
] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_URGENCIES = [
  "baja",
  "media",
  "alta",
  "critica",
] as const

export type TicketUrgency =
  (typeof TICKET_URGENCIES)[number]

export type UserRole =
  | "admin"
  | "agent"
  | "viewer"
  | "project_viewer"

export interface AppUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  project_id: string | null
}

export interface Ticket {
  id: string
  number: number
  title: string
  description: string | null
  status: TicketStatus
  urgency: TicketUrgency
  category: string | null
  tags: string[]
  assignee_id: string | null
  reporter_id: string | null
  assignee: AppUser | null
  reporter: AppUser | null
  project_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  created_at: string
}

export interface TicketEvent {
  id: string
  ticket_id: string
  type: string
  from_status: TicketStatus | null
  to_status: TicketStatus | null
  note: string | null
  actor: string | null
  created_at: string
}

export const STATUS_META: Record<
  TicketStatus,
  { label: string; token: string }
> = {
  iniciado: {
    label: "Iniciado",
    token: "status-iniciado",
  },
  en_proceso: {
    label: "En proceso",
    token: "status-en-proceso",
  },
  en_prueba: {
    label: "En prueba",
    token: "status-en-prueba",
  },
  con_problemas: {
    label: "Con problemas",
    token: "status-con-problemas",
  },
  demorado: {
    label: "Demorado",
    token: "status-demorado",
  },
  cerrado: {
    label: "Cerrado",
    token: "status-cerrado",
  },
}

export const URGENCY_META: Record<
  TicketUrgency,
  { label: string; token: string }
> = {
  baja: {
    label: "Baja",
    token: "urgency-baja",
  },
  media: {
    label: "Media",
    token: "urgency-media",
  },
  alta: {
    label: "Alta",
    token: "urgency-alta",
  },
  critica: {
    label: "Crítica",
    token: "urgency-critica",
  },
}
