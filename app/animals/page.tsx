import { createClient } from "@/lib/supabase/server"
import { AnimalsClient } from "./animals-client"
import { redirect } from "next/navigation"

export default async function AnimalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: animals, error } = await supabase
    .from("animals")
    .select("*, vendors(name)")
    .order("created_at", { ascending: false })

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .or("vendor_type.eq.supplier,vendor_type.eq.both")
    .order("name")

  if (error) {
    console.error("Error fetching animals:", error)
  }

  return <AnimalsClient initialAnimals={animals || []} vendors={vendors || []} />
}
