export type IncomeRecord = {
  id: string
  income_date: string
  source: string
  description: string
  amount: number
  customer_name: string | null
  payment_method: string
  reference_number: string | null
  notes: string | null
}