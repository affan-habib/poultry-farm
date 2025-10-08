import { createClient } from "@/lib/supabase/server"
import { IncomeClient } from "./income-client"
import { redirect } from "next/navigation"

export default async function IncomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: income, error } = await supabase
    .from("income")
    .select("*")
    .order("income_date", { ascending: false })

  if (error) {
    console.error("Error fetching income:", error)
  }

  return <IncomeClient initialIncome={income || []} />
}