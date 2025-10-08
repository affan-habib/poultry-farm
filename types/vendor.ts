export type Vendor = {
  id: string
  name: string
  vendor_type: "supplier" | "customer" | "both"
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}