import { cn } from "@/lib/utils"
import { STATUS_META, URGENCY_META } from "@/lib/types"
import type { TicketStatus, TicketUrgency } from "@/lib/types"

const STATUS_CLASSES: Record<TicketStatus, string> = {
  iniciado: "bg-status-iniciado text-status-iniciado-foreground",
  en_proceso: "bg-status-en-proceso text-status-en-proceso-foreground",
  en_prueba: "bg-status-en-prueba text-status-en-prueba-foreground",
  con_problemas: "bg-status-con-problemas text-status-con-problemas-foreground",
  demorado: "bg-status-demorado text-status-demorado-foreground",
  cerrado: "bg-status-cerrado text-status-cerrado-foreground",
}

const URGENCY_CLASSES: Record<TicketUrgency, string> = {
  baja: "bg-urgency-baja text-urgency-baja-foreground",
  media: "bg-urgency-media text-urgency-media-foreground",
  alta: "bg-urgency-alta text-urgency-alta-foreground",
  critica: "bg-urgency-critica text-urgency-critica-foreground",
}

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {STATUS_META[status].label}
    </span>
  )
}

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: TicketUrgency
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        URGENCY_CLASSES[urgency],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {URGENCY_META[urgency].label}
    </span>
  )
}
