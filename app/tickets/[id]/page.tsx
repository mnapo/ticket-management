import { notFound, redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getTicket, getTicketEvents, listProjects } from "@/lib/data"
import { AppHeader } from "@/components/app-header"
import { TicketForm } from "@/components/ticket-form"
import { Card } from "@/components/ui/card"
import { STATUS_META } from "@/lib/types"
import { History } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await params
  const ticket = await getTicket(id)
  if (!ticket) notFound()

  const [projects, events] = await Promise.all([
    listProjects(),
    getTicketEvents(id),
  ])

  return (
    <div className="min-h-screen">
      <AppHeader userName={session.name} userEmail={session.email} />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
        <TicketForm ticket={ticket} projects={projects} />

        <Card className="gap-0 p-5">
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-medium">Historial</h2>
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {events.length === 0 && (
              <li className="text-sm text-muted-foreground">Sin eventos registrados.</li>
            )}
            {events.map((ev) => (
              <li key={ev.id} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {ev.type === "status_change" && ev.to_status
                      ? `Estado → ${STATUS_META[ev.to_status].label}`
                      : ev.note}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ev.created_at).toLocaleString("es-ES")} · {ev.actor ?? "sistema"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </main>
    </div>
  )
}
