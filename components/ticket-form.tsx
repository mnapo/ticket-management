"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  STATUS_META,
  URGENCY_META,
  TICKET_STATUSES,
  TICKET_URGENCIES,
} from "@/lib/types"
import type {
  AppUser,
  Project,
  Ticket,
  TicketStatus,
  TicketUrgency,
  UserRole,
} from "@/lib/types"
import { Loader2, ArrowLeft } from "lucide-react"

const NO_PROJECT = "none"
const NO_USER = "none"

export function TicketForm({
  ticket,
  projects,
  users,
  userRole,
  userProjectId,
  userId,
}: {
  ticket?: Ticket
  projects: Project[]
  users: AppUser[]
  userRole: UserRole
  userProjectId: string | null
  userId: string
}) {
  const router = useRouter()
  const isEdit = Boolean(ticket)
  const isAdmin = userRole === "admin"
  const [loading, setLoading] = useState(false)

  const firstAdmin =
    users.find((user) => user.role === "admin") ?? null

  const defaultReporterId = isAdmin
    ? ticket?.reporter_id ?? NO_USER
    : userId

  const defaultAssigneeId = isAdmin
    ? ticket?.assignee_id ?? NO_USER
    : firstAdmin?.id ?? NO_USER

  const [title, setTitle] = useState(
    ticket?.title ?? "",
  )

  const [description, setDescription] = useState(
    ticket?.description ?? "",
  )

  const [status, setStatus] =
    useState<TicketStatus>(
      ticket?.status ?? "iniciado",
    )

  const [urgency, setUrgency] =
    useState<TicketUrgency>(
      ticket?.urgency ?? "media",
    )

  const [category, setCategory] = useState(
    ticket?.category ?? "",
  )

  const [assigneeId, setAssigneeId] =
    useState(defaultAssigneeId)

  const [reporterId, setReporterId] =
    useState(defaultReporterId)

  const [dueDate, setDueDate] = useState(
    ticket?.due_date ?? "",
  )

  const [tags, setTags] = useState(
    (ticket?.tags ?? []).join(", "),
  )

  const [projectId, setProjectId] =
    useState(
      ticket?.project_id ??
        (isAdmin
          ? NO_PROJECT
          : userProjectId ?? NO_PROJECT),
    )

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Title is obligatory")
      return
    }

    setLoading(true)

    const payload = {
      title: title.trim(),
      description:
        description.trim() || null,
      status,
      urgency,
      category:
        category.trim() || null,

      assignee_id:
        isAdmin
          ? assigneeId === NO_USER
            ? null
            : assigneeId
          : undefined,

      reporter_id:
        isAdmin
          ? reporterId === NO_USER
            ? null
            : reporterId
          : undefined,

      due_date: dueDate || null,

      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),

      project_id:
        projectId === NO_PROJECT
          ? null
          : projectId,
    }

    try {
      const res = await fetch(
        isEdit
          ? `/api/tickets/${ticket!.id}`
          : "/api/tickets",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        throw new Error()
      }

      toast.success(
        isEdit
          ? "Updated ticket"
          : "Created ticket",
      )

      router.push("/")
      router.refresh()
    } catch {
      toast.error(
        "Ticket couldn't be saved",
      )
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-3">
        <Button
          onClick={() =>
            (window.location.href = "/")
          }
          variant="ghost"
          size="icon"
          aria-label="Volver"
        >
          <Link href="/">
            <ArrowLeft
              className="size-4"
              aria-hidden
            />
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEdit
              ? `Edit ticket #${String(
                  ticket!.number,
                ).padStart(3, "0")}`
              : "Nuevo ticket"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update the details and status of the ticket."
              : "Complete the information to register a ticket"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              Título *
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">
              Description
            </Label>

            <Textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Details, stepts to reproduce or context..."
              rows={6}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">
                Category
              </Label>

              <Input
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Bug, Feature, Infra..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">
                Labels
              </Label>

              <Input
                id="tags"
                value={tags}
                onChange={(e) =>
                  setTags(e.target.value)
                }
                placeholder="Separated by comma"
              />
            </div>
          </div>
        </Card>

        <Card className="flex h-fit flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">
              Status
            </Label>

            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as TicketStatus)
              }
            >
              <SelectTrigger
                id="status"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                  >
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="urgency">
              Urgency
            </Label>

            <Select
              value={urgency}
              onValueChange={(v) =>
                setUrgency(
                  v as TicketUrgency,
                )
              }
            >
              <SelectTrigger
                id="urgency"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {TICKET_URGENCIES.map((u) => (
                  <SelectItem
                    key={u}
                    value={u}
                  >
                    {URGENCY_META[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projects.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="project">
                Proyecto
              </Label>

              <Select
                value={projectId}
                onValueChange={(v) =>
                  setProjectId(
                    v || NO_PROJECT,
                  )
                }
              >
                <SelectTrigger
                  id="project"
                  className="w-full"
                >
                  <SelectValue placeholder="No project" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NO_PROJECT}>
                    No Project
                  </SelectItem>

                  {projects.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee">
              Assigned to
            </Label>

            <Select
              value={assigneeId}
              onValueChange={setAssigneeId}
              disabled={!isAdmin}
            >
              <SelectTrigger
                id="assignee"
                className="w-full"
              >
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_USER}>
                  None
                </SelectItem>

                {users.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                  >
                    {user.name ||
                      user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reporter">
              Reported by
            </Label>

            <Select
              value={reporterId}
              onValueChange={setReporterId}
              disabled={!isAdmin}
            >
              <SelectTrigger
                id="reporter"
                className="w-full"
              >
                <SelectValue placeholder="None" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={NO_USER}>
                  None
                </SelectItem>

                {users.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                  >
                    {user.name ||
                      user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="due">
              Limit date
            </Label>

            <Input
              id="due"
              type="date"
              value={dueDate ?? ""}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          onClick={() =>
            (window.location.href = "/")
          }
          variant="outline"
          type="button"
        >
          <Link href="/">
            Cancel
          </Link>
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading && (
            <Loader2
              className="size-4 animate-spin"
              aria-hidden
            />
          )}

          {isEdit
            ? "Save changes"
            : "Create ticket"}
        </Button>
      </div>
    </form>
  )
}
