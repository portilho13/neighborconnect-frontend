export interface Rent {
  id: number
  month: number
  year: number
  base_amount: number
  reduction: number
  final_amount: number
  apartment_id: number
  status: string
  due_day: number
}