import { Apartment } from "./Apartment"
import { UserInfo } from "./UserInfo"
import { Listing } from "./Listing"
import { CommunityEvent } from "./CommunityEvent"

export interface ManagerDashboardInfo {
  apartments: Apartment[] | null
  users: UserInfo[] | null
  listings: Listing[] | null
  events: CommunityEvent[] | null
}