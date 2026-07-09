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
import type { Project, Ticket, TicketStatus, TicketUrgency } from "@/lib/types"
import { Loader2, ArrowLeft } from "lucide-react"

const NO_PROJECT = "none"

export function TicketForm({
  ticket,
  projects,
}: {
  ticket?: Ticket
  projects: Project[]
}) {
  const router = useRouter()
  const isEdit = Boolean(ticket)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(ticket?.title ?? "")
  const [description, setDescription] = useState(ticket?.description ?? "")
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "iniciado")
  const [urgency, setUrgency] = useState<TicketUrgency>(ticket?.urgency ?? "media")
  const [category, setCategory] = useState(ticket?.category ?? "")
  const [assignee, setAssignee] = useState(ticket?.assignee ?? "")
  const [reporter, setReporter] = useState(ticket?.reporter ?? "")
  const [dueDate, setDueDate] = useState(ticket?.due_date ?? "")
  const [tags, setTags] = useState((ticket?.tags ?? []).join(", "))
  const [projectId, setProjectId] = useState(ticket?.project_id ?? NO_PROJECT)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("El título es obligatorio")
      return
    }
    setLoading(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      urgency,
      category: category.trim() || null,
      assignee: assignee.trim() || null,
      reporter: reporter.trim() || null,
      due_date: dueDate || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      project_id: projectId === NO_PROJECT ? null : projectId,
    }

    try {
      const res = await fetch(
        isEdit ? `/api/tickets/${ticket!.id}` : "/api/tickets",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )
      if (!res.ok) throw new Error()
      toast.success(isEdit ? "Ticket actualizado" : "Ticket creado")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("No se pudo guardar el ticket")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Volver">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isEdit ? `Editar ticket #${String(ticket!.number).padStart(3, "0")}` : "Nuevo ticket"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Actualiza los detalles y el estado del ticket."
              : "Completa la información para registrar un ticket."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumen breve del problema o tarea"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, pasos para reproducir, contexto..."
              rows={6}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Bug, Feature, Infra..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Separadas por comas"
              />
            </div>
          </div>
        </Card>

        <Card className="flex h-fit flex-col gap-4 p-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="urgency">Urgencia</Label>
            <Select value={urgency} onValueChange={(v) => setUrgency(v as TicketUrgency)}>
              <SelectTrigger id="urgency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_URGENCIES.map((u) => (
                  <SelectItem key={u} value={u}>
                    {URGENCY_META[u].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {projects.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="project">Proyecto</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project" className="w-full">
                  <SelectValue placeholder="Sin proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>Sin proyecto</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="assignee">Asignado a</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Nombre del responsable"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reporter">Reportado por</Label>
            <Input
              id="reporter"
              value={reporter}
              onChange={(e) => setReporter(e.target.value)}
              placeholder="Quién reporta"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="due">Fecha límite</Label>
            <Input
              id="due"
              type="date"
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button asChild variant="outline" type="button">
          <Link href="/">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isEdit ? "Guardar cambios" : "Crear ticket"}
        </Button>
      </div>
    </form>
  )
}
