import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { listProjects } from "@/lib/data"
import { AppHeader } from "@/components/app-header"
import { TicketForm } from "@/components/ticket-form"

export const dynamic = "force-dynamic"

export default async function NewTicketPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const projects = await listProjects(session)

  return (
    <div className="min-h-screen">
      <AppHeader userName={session.name} userEmail={session.email} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <TicketForm
          projects={projects}
          userRole={session.role}
          userProjectId={session.project_id}
        />
      </main>
    </div>
  )
}
