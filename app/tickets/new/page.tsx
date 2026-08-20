import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import {
  listProjects,
  listUsers,
} from "@/lib/data"
import { AppHeader } from "@/components/app-header"
import { TicketForm } from "@/components/ticket-form"

export const dynamic = "force-dynamic"

export default async function NewTicketPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const [projects, users] = await Promise.all([
    listProjects(session),
    listUsers(),
  ])

  return (
    <div className="min-h-screen">
      <AppHeader
        userName={session.name}
        userEmail={session.email}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <TicketForm
          projects={projects}
          users={users}
          userRole={session.role}
          userProjectId={session.project_id}
          userId={session.sub}
        />
      </main>
    </div>
  )
}
