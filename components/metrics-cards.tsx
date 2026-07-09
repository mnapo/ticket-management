import { Card } from "@/components/ui/card"
import { STATUS_META, URGENCY_META } from "@/lib/types"
import type { Metrics } from "@/lib/data"
import type { TicketStatus, TicketUrgency } from "@/lib/types"
import { Layers, FolderOpen, CheckCircle2, AlertTriangle } from "lucide-react"

const STATUS_BAR: Record<TicketStatus, string> = {
  iniciado: "bg-status-iniciado-foreground",
  en_proceso: "bg-status-en-proceso-foreground",
  en_prueba: "bg-status-en-prueba-foreground",
  con_problemas: "bg-status-con-problemas-foreground",
  demorado: "bg-status-demorado-foreground",
  cerrado: "bg-status-cerrado-foreground",
}

export function MetricsCards({ metrics }: { metrics: Metrics }) {
  const cards = [
    {
      label: "Total de tickets",
      value: metrics.total,
      icon: Layers,
      tone: "text-foreground",
    },
    {
      label: "Abiertos",
      value: metrics.open,
      icon: FolderOpen,
      tone: "text-primary",
    },
    {
      label: "Cerrados",
      value: metrics.closed,
      icon: CheckCircle2,
      tone: "text-status-cerrado-foreground",
    },
    {
      label: "Críticos activos",
      value: metrics.critical,
      icon: AlertTriangle,
      tone: "text-urgency-critica-foreground",
    },
  ]

  const maxStatus = Math.max(1, ...Object.values(metrics.byStatus))

  return (
    <section aria-label="Métricas" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="gap-0 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`size-4 ${c.tone}`} aria-hidden />
            </div>
            <span className="mt-2 font-mono text-3xl font-semibold tabular-nums">
              {c.value}
            </span>
          </Card>
        ))}
      </div>

      <Card className="gap-0 p-4">
        <h2 className="text-sm font-medium">Distribución por estado</h2>
        <div className="mt-4 flex flex-col gap-3">
          {(Object.keys(STATUS_META) as TicketStatus[]).map((status) => {
            const count = metrics.byStatus[status] ?? 0
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted-foreground">
                  {STATUS_META[status].label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${STATUS_BAR[status]}`}
                    style={{ width: `${(count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
