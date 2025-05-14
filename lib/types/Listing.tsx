import { BidInfo } from "./BidInfo"
import { SellerInfo } from "./SellerInfo"
import { Category } from "./Category"
import { ListingPhoto } from "./ListingPhoto"

export   interface Listing {
    id: number
    name: string
    description: string
    buy_now_price: number
    start_price: number
    current_bid: BidInfo
    created_at: Date
    expiration_date: Date
    status: string
    seller: SellerInfo
    category: Category
    listing_photos: ListingPhoto[]
  }