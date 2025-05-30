import { Apartment } from "./Apartment"
import { UserInfo } from "./UserInfo"
import { Listing } from "./Listing"
import { CommunityEvent } from "./CommunityEvent"
import { ManagerActivity } from "./ManagerActivity"
import { ManagerTransaction } from "./ManagerTransaction"

export interface ManagerDashboardInfo {
  apartments: Apartment[] | null
  users: UserInfo[] | null
  listings: Listing[] | null
  events: CommunityEvent[] | null
  manager_activities: ManagerActivity[] | null
  manager_transactions: ManagerTransaction[] | null
}