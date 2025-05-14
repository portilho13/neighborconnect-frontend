import { Rent } from "./Rent"

export interface Apartment {
  id: number
  n_bedrooms: number
  floor: number
  rent: number
  manager_id: number
  status: string
  last_rent: Rent
}