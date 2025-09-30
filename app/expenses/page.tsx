import { createClient } from "@/lib/supabase/server"
import { ExpensesClient } from "./expenses-client"
import { redirect } from "next/navigation"

export default async function ExpensesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*, vendors(name)")
    .order("expense_date", { ascending: false })

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .or("vendor_type.eq.supplier,vendor_type.eq.both")
    .order("name")

  if (error) {
    console.error("Error fetching expenses:", error)
  }

  return <ExpensesClient initialExpenses={expenses || []} vendors={vendors || []} />
}
