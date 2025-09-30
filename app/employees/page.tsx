import { createClient } from "@/lib/supabase/server"
import { EmployeesClient } from "./employees-client"
import { redirect } from "next/navigation"

export default async function EmployeesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: employees, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching employees:", error)
  }

  return <EmployeesClient initialEmployees={employees || []} />
}