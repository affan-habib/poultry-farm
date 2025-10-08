export type Animal = {
  id: string
  tag_number: string
  breed: string
  animal_type: string
  age_months: number | null
  weight_kg: number | null
  health_status: string
  location: string | null
  date_acquired: string
  purchase_price: number | null
  vendor_id: string | null
  notes: string | null
  vendors?: { name: string } | null
}

export type Vendor = {
  id: string
  name: string
}