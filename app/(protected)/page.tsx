import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [
    { data: animals },
    { data: production },
    { data: sales },
    { data: expenses },
    { data: income },
    { data: employees },
    { data: vendors },
    { data: profile },
  ] = await Promise.all([
    supabase.from("animals").select("*"),
    supabase.from("production").select("*").order("production_date", { ascending: false }),
    supabase.from("sales").select("*").order("sale_date", { ascending: false }),
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
    supabase.from("income").select("*").order("income_date", { ascending: false }),
    supabase.from("employees").select("*"),
    supabase.from("vendors").select("*"),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ])

  return (
    <DashboardClient
      animals={animals || []}
      production={production || []}
      sales={sales || []}
      expenses={expenses || []}
      income={income || []}
      employees={employees || []}
      vendors={vendors || []}
      profile={profile}
    />
  )
}
