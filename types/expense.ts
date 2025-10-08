export type ExpenseRecord = {
  id: string
  expense_date: string
  category: string
  description: string
  amount: number
  vendor_id: string | null
  payment_method: string
  receipt_number: string | null
  notes: string | null
  vendors?: { name: string } | null
}

export type Vendor = {
  id: string
  name: string
}