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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  MetricsCards,
  StatusDistribution,
} from "@/components/metrics-cards"
import { TicketTable } from "@/components/ticket-table"
import { SettingsPanel } from "@/components/settings-panel"
import {
  STATUS_META,
  URGENCY_META,
  TICKET_STATUSES,
  TICKET_URGENCIES,
} from "@/lib/types"
import type { Metrics } from "@/lib/data"
import type {
  Project,
  Ticket,
} from "@/lib/types"
import { Search } from "lucide-react"

export function Dashboard({
  tickets,
  projects,
  metrics,
  isAdmin,
}: {
  tickets: Ticket[]
  projects: Project[]
  metrics: Metrics
  isAdmin: boolean
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] =
    useState<string | null>("all")
  const [urgency, setUrgency] =
    useState<string | null>("all")
  const [project, setProject] =
    useState<string | null>("all")

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      if (
        status !== "all" &&
        ticket.status !== status
      ) {
        return false
      }

      if (
        urgency !== "all" &&
        ticket.urgency !== urgency
      ) {
        return false
      }

      // El filtro de proyecto solamente existe
      // para admin. Los usuarios no-admin ya
      // reciben exclusivamente su proyecto desde
      // el servidor.
      if (
        isAdmin &&
        project !== "all" &&
        ticket.project_id !== project
      ) {
        return false
      }

      if (
        search &&
        !ticket.title
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false
      }

      return true
    })
  }, [
    tickets,
    status,
    urgency,
    project,
    search,
    isAdmin,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Main panel
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage, filter and monitor all your team's tickets
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <Tabs
        defaultValue="tickets"
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="tickets">
            Tickets
          </TabsTrigger>

          <TabsTrigger value="config">
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="tickets"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 sm:min-w-56">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title..."
                className="pl-9"
                aria-label="Search tickets"
              />
            </div>

            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Filter by status"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Every status
                </SelectItem>

                {TICKET_STATUSES.map((value) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {STATUS_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={urgency}
              onValueChange={setUrgency}
            >
              <SelectTrigger
                className="w-full sm:w-36"
                aria-label="Filter by urgency"
              >
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Every Urgency
                </SelectItem>

                {TICKET_URGENCIES.map((value) => (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {URGENCY_META[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdmin && projects.length > 0 && (
              <Select
                value={project}
                onValueChange={setProject}
              >
                <SelectTrigger
                  className="w-full sm:w-40"
                  aria-label="Filter by project"
                >
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Every project
                  </SelectItem>

                  {projects.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filtered.length}{" "}
              {filtered.length === 1
                ? "ticket"
                : "tickets"}
            </span>
          </div>

          <TicketTable
            tickets={filtered}
            projects={projects}
          />

          <StatusDistribution metrics={metrics} />
        </TabsContent>

        <TabsContent value="config">
          <SettingsPanel projects={projects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
