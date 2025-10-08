import { createClient } from "@/lib/supabase/server"
import { ProductionClient } from "./production-client"
import { redirect } from "next/navigation"

export default async function ProductionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: production, error } = await supabase
    .from("production")
    .select("*")
    .order("production_date", { ascending: false })

  if (error) {
    console.error("Error fetching production:", error)
  }

  return <ProductionClient initialProduction={production || []} />
}
