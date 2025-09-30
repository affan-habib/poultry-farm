import { createClient } from "@/lib/supabase/server"
import { VendorsClient } from "./vendors-client"
import { redirect } from "next/navigation"

export default async function VendorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch vendors from database
  const { data: vendors, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vendors:", error)
  }

  return <VendorsClient initialVendors={vendors || []} />
}
