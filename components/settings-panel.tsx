import { Card } from "@/components/ui/card"
import { StatusBadge, UrgencyBadge } from "@/components/status-badge"
import {
  TICKET_STATUSES,
  TICKET_URGENCIES,
} from "@/lib/types"
import type { Project } from "@/lib/types"
import { FolderGit2, KeyRound } from "lucide-react"

const ENDPOINTS = [
  { method: "POST", path: "/api/auth/login", desc: "Iniciar sesión y obtener token" },
  { method: "GET", path: "/api/tickets", desc: "Listar tickets (filtros por query)" },
  { method: "POST", path: "/api/tickets", desc: "Crear un nuevo ticket" },
  { method: "GET", path: "/api/tickets/:id", desc: "Obtener ticket e historial" },
  { method: "PATCH", path: "/api/tickets/:id", desc: "Actualizar / cambiar estado" },
  { method: "DELETE", path: "/api/tickets/:id", desc: "Eliminar ticket" },
  { method: "GET", path: "/api/metrics", desc: "Métricas del panel" },
]

export function SettingsPanel({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="gap-0 p-5">
        <h2 className="text-sm font-medium">Estados y colores</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Flujo de trabajo de cada ticket.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TICKET_STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Card>

      <Card className="gap-0 p-5">
        <h2 className="text-sm font-medium">Niveles de urgencia</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Prioridad independiente del estado.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TICKET_URGENCIES.map((u) => (
            <UrgencyBadge key={u} urgency={u} />
          ))}
        </div>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center gap-2">
          <FolderGit2 className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-medium">Proyectos</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Los tickets pueden asociarse a un proyecto.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {projects.length === 0 && (
            <li className="text-sm text-muted-foreground">Aún no hay proyectos.</li>
          )}
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: p.color ?? "var(--primary)" }}
                aria-hidden
              />
              <span className="text-sm font-medium">{p.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {p.slug}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="gap-0 p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-medium">API</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Endpoints protegidos con JWT. Envía el token en{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            Authorization: Bearer &lt;token&gt;
          </code>
          .
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {ENDPOINTS.map((e) => (
            <li key={e.method + e.path} className="flex items-center gap-2 text-xs">
              <span className="w-14 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono font-medium">
                {e.method}
              </span>
              <code className="font-mono text-foreground">{e.path}</code>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
