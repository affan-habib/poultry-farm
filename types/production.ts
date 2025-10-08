export type ProductionRecord = {
  id: string
  production_date: string
  product_type: string
  quantity: number
  unit: string
  quality_grade: string | null
  batch_number: string | null
  notes: string | null
  created_at: string
}