"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge, UrgencyBadge } from "@/components/status-badge"
import { STATUS_META, TICKET_STATUSES } from "@/lib/types"
import type { Project, Ticket, TicketStatus } from "@/lib/types"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react"

export function TicketTable({
  tickets,
  projects,
}: {
  tickets: Ticket[]
  projects: Project[]
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  const projectName = (id: string | null) =>
    projects.find((p) => p.id === id)?.name ?? "—"

  async function changeStatus(id: string, status: TicketStatus) {
    setBusyId(id)

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error()

      toast.success(
        `Status updated to "${STATUS_META[status].label}"`,
      )

      router.refresh()
    } catch {
      toast.error("Status couldn't be updated")
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string) {
    if (
      !confirm(
        "Delete ticket? This action can't be undone.",
      )
    ) {
      return
    }

    setBusyId(id)

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      toast.success("Ticket deleted")
      router.refresh()
    } catch {
      toast.error("The ticket couldn't be deleted")
    } finally {
      setBusyId(null)
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium">No matches</p>

        <p className="mt-1 text-sm text-muted-foreground">
          Adjust the filters or create a new ticket.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">
              Status
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              Urgency
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Project
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              Assigned
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {tickets.map((t, index) => (
            <TableRow
              key={t.id}
              data-busy={busyId === t.id}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {String(tickets.length - index).padStart(3, "0")}
              </TableCell>

              <TableCell>
                <Link
                  href={`/tickets/${t.id}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {t.title}
                </Link>

                <div className="mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
                  <StatusBadge status={t.status} />
                  <UrgencyBadge urgency={t.urgency} />
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        className="inline-flex items-center gap-1"
                        disabled={busyId === t.id}
                        aria-label="Cambiar estado"
                      >
                        <StatusBadge status={t.status} />
                        <ChevronDown
                          className="size-3 text-muted-foreground"
                          aria-hidden
                        />
                      </button>
                    }
                  >
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>
                      Change status
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {TICKET_STATUSES.map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() =>
                          changeStatus(t.id, s)
                        }
                        disabled={s === t.status}
                      >
                        <StatusBadge status={s} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <UrgencyBadge urgency={t.urgency} />
              </TableCell>

              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {projectName(t.project_id)}
              </TableCell>

              <TableCell className="hidden text-sm lg:table-cell">
                {t.assignee ? (
                  t.assignee.name ?? t.assignee.email
                ) : (
                  <span className="text-muted-foreground">
                    Sin asignar
                  </span>
                )}
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Acciones"
                      >
                        <MoreHorizontal
                          className="size-4"
                          aria-hidden
                        />
                      </Button>
                    }
                  >
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/tickets/${t.id}`)}
                    >
                      <Pencil
                        className="size-4"
                        aria-hidden
                      />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => remove(t.id)}
                    >
                      <Trash2
                        className="size-4"
                        aria-hidden
                      />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
