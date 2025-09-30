import { createClient } from "@/lib/supabase/server"
import { ReportsClient } from "./reports-client"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch all data for reports
  const [{ data: animals }, { data: production }, { data: sales }, { data: expenses }] = await Promise.all([
    supabase.from("animals").select("*"),
    supabase.from("production").select("*").order("production_date", { ascending: false }),
    supabase.from("sales").select("*").order("sale_date", { ascending: false }),
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
  ])

  return (
    <ReportsClient
      animals={animals || []}
      production={production || []}
      sales={sales || []}
      expenses={expenses || []}
    />
  )
}
