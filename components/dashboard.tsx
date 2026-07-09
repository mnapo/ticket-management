"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricsCards } from "@/components/metrics-cards"
import { TicketTable } from "@/components/ticket-table"
import { SettingsPanel } from "@/components/settings-panel"
import {
  STATUS_META,
  URGENCY_META,
  TICKET_STATUSES,
  TICKET_URGENCIES,
} from "@/lib/types"
import type { Metrics } from "@/lib/data"
import type { Project, Ticket } from "@/lib/types"
import { Search } from "lucide-react"

export function Dashboard({
  tickets,
  projects,
  metrics,
}: {
  tickets: Ticket[]
  projects: Project[]
  metrics: Metrics
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [urgency, setUrgency] = useState<string>("all")
  const [project, setProject] = useState<string>("all")

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (status !== "all" && t.status !== status) return false
      if (urgency !== "all" && t.urgency !== urgency) return false
      if (project !== "all" && t.project_id !== project) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tickets, status, urgency, project, search])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panel principal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona, filtra y monitorea todos los tickets del equipo.
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <Tabs defaultValue="tickets" className="gap-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 sm:min-w-56">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                className="pl-9"
                aria-label="Buscar tickets"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filtrar por estado">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Filtrar por urgencia">
                <SelectValue placeholder="Urgencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda urgencia</SelectItem>
                {TICKET_URGENCIES.map((u) => (
                  <SelectItem key={u} value={u}>
                    {URGENCY_META[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {projects.length > 0 && (
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger className="w-full sm:w-40" aria-label="Filtrar por proyecto">
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length}{" "}
              {filtered.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>

          <TicketTable tickets={filtered} projects={projects} />
        </TabsContent>

        <TabsContent value="config">
          <SettingsPanel projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
