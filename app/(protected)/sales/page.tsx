import { createClient } from "@/lib/supabase/server"
import { SalesClient } from "./sales-client"
import { redirect } from "next/navigation"

export default async function SalesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: sales, error } = await supabase
    .from("sales")
    .select("*, vendors(name)")
    .order("sale_date", { ascending: false })

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .or("vendor_type.eq.customer,vendor_type.eq.both")
    .order("name")

  if (error) {
    console.error("Error fetching sales:", error)
  }

  return <SalesClient initialSales={sales || []} vendors={vendors || []} />
}
