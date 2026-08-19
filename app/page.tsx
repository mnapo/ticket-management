import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import {
  listTickets,
  listProjects,
  getMetrics,
} from "@/lib/data"
import { AppHeader } from "@/components/app-header"
import { Dashboard } from "@/components/dashboard"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const [tickets, projects, metrics] =
    await Promise.all([
      listTickets({}, session),
      listProjects(session),
      getMetrics(session),
    ])

  return (
    <div className="min-h-screen">
      <AppHeader
        userName={session.name}
        userEmail={session.email}
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Dashboard
          tickets={tickets}
          projects={projects}
          metrics={metrics}
          isAdmin={session.role === "admin"}
        />
      </main>
    </div>
  )
}
