export type SalesRecord = {
  id: string
  sale_date: string
  vendor_id: string | null
  product_type: string
  quantity: number
  unit: string
  unit_price: number
  total_amount: number
  payment_method: string
  payment_status: string
  invoice_number: string | null
  notes: string | null
  vendors?: { name: string } | null
}

export type Vendor = {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
}