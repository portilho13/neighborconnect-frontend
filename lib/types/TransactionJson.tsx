import { Listing } from "./Listing"

export interface TransactionJson {
    id: number
    final_price: number
    transaction_time: Date
    transaction_type: string
    seller_id: number
    buyer_id: number
    listing: Listing
    payment_status: string
    payment_due_time: Date
    selected?: boolean
  }