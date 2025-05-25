"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  ShoppingBag,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  HomeIcon,
  Calendar,
  ShoppingBagIcon,
  User,
  Check,
  AlertCircle,
  X,
  Clock,
} from "lucide-react"

import useUserStore from "../../../lib/userStore"
import LoadingSpinner from "../../../components/loading-spinner"
import { useRouter } from "next/navigation"
import { Rent } from "../../../lib/types/Rent"
import { AccountDetail } from "../../../lib/types/AccountDetail"
import { TransactionJson } from "../../../lib/types/TransactionJson"
import { AccountMovement } from "../../../lib/types/AccountMovement"
import Header from "../../../components/header"


const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const maxDiscout = 400

export default function Dashboard() {

  const [isLoading, setIsLoading] = useState(false)
  const [rents, setRents] = useState<Rent[]>([])
  const [discountCodePopupOpen, setDiscountCodePopupOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountCodeError, setDiscountCodeError] = useState("")
  const [discountCodeSuccess, setDiscountCodeSuccess] = useState("")
  const [pendingTransactions, setPendingTransactions] = useState<TransactionJson[]>([])
  const [accountDetail, setAccountDetail] = useState<AccountDetail>()

  // Add this state after the other state declarations
  const [accountMovements, setAccountMovements] = useState<AccountMovement[]>()

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const router = useRouter()

  const fetchRent = async (apartment_id: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`http://localhost:1234/api/v1/rent?apartment_id=${apartment_id}`)

      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }

      const data: Rent[] = await res.json()

      setRents(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }


  const fetchAccount = async () => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/account?user_id=${user?.id.toString()}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch transactoions")
      }

      const data: AccountDetail = await res.json()


      setAccountDetail(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAccountMovement = async () => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/account/movement?user_id=${user?.id.toString()}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch transactoions")
      }

      const data: AccountMovement[] = await res.json()


      setAccountMovements(data)
    } catch (error) {
      console.error(error)
    }
  }


  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    } else if (user?.apartmentId) {
      fetchRent(user.apartmentId)
      fetchAccount()
      fetchAccountMovement()
    }
  }, [hasHydrated, isAuthenticated, user])

  // Rent data with discount information
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountCodeError("Please enter a discount code")
      return
    }

    try {
      const res = await fetch("http://localhost:1234/api/v1/event/reward", {
        method: "POST",
        body: JSON.stringify({
          code: discountCode,
          user_id: user?.id,
        }),
      })

      if (!res.ok) {
        setDiscountCodeError(await res.text())
      } else {
        setDiscountCodeSuccess("Discount code applied successfully!")
      }
    } catch (error) {
      console.log(error)
    }

    setTimeout(() => {
      setDiscountCodePopupOpen(false)
      setDiscountCodeSuccess("")
      setDiscountCode("")
    }, 1000)
    router.push("/dashboard")
  }

  if (isLoading) {
    return <LoadingSpinner loading={true} size="lg" className="absolute left-4" />
  }

  const currentRent = rents[currentMonthIndex]

  if (!currentRent) {
    return <div>Rent information not found for the selected month.</div>
  }

  // Calculate the discount amount as a percentage of the base amount
  const discountAmount = (currentRent.base_amount * currentRent.reduction).toFixed(2)

  // For display purposes
  const discountPercentage = currentRent.reduction * 100

  // Percentage of rent being paid after discount (for circular progress bar)
  const percentagePaid = (currentRent.final_amount / currentRent.base_amount) * 100

  // Circle progress bar setup
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentagePaid / 100) * circumference

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonthIndex < rents.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1)
    }
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const toggleTransactionSelection = (id: number) => {
    if (pendingTransactions) {
      setPendingTransactions(
        pendingTransactions.map((transaction) =>
          transaction.id === id ? { ...transaction, selected: !transaction.selected } : transaction,
        ),
      )
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header></Header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Greeting section */}
        <div className="mb-8">
          <h2 className="text-gray-500 text-sm">{getGreeting()}</h2>
          <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rent card */}
          <div className="bg-white rounded-xl p-6 shadow-md md:col-span-2 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">Your Rent</h2>
                <span className="text-xl font-semibold ml-2 text-[#3F3D56]">- {months[currentRent.month - 1]}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                  onClick={goToPreviousMonth}
                  disabled={currentMonthIndex >= rents.length - 1}
                  aria-label="Previous month"
                >
                  <ChevronLeft className={`h-5 w-5 ${currentMonthIndex >= rents.length - 1 ? "opacity-50" : ""}`} />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                  onClick={goToNextMonth}
                  disabled={currentMonthIndex <= 0}
                  aria-label="Next month"
                >
                  <ChevronRight className={`h-5 w-5 ${currentMonthIndex <= 0 ? "opacity-50" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="relative w-[220px] h-[220px] mb-6 md:mb-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(209, 213, 219, 0.5)" strokeWidth="12" />
                  {/* Progress circle with gradient */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                  {/* Define gradient */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3F3D56" />
                      <stop offset="50%" stopColor="#3F3D56" />
                      <stop offset="100%" stopColor="#6c6a8a" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900">${currentRent.base_amount}</span>
                    <div className="flex items-center gap-1 text-red-500">
                      <span className="text-lg">-${discountAmount}</span>
                    </div>
                    <div className="w-24 h-px bg-gray-200 my-2"></div>
                    <span className="text-2xl font-bold text-gray-900">${currentRent.final_amount}</span>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Discount Progress</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        ${discountAmount}/${maxDiscout}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#3F3D56] to-[#6c6a8a] h-2 rounded-full"
                      style={{ width: `${discountPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Due by {currentRent.due_day}</div>
                </div>

                {/* Payment Status - Added between discount progress and buttons */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status</span>
                    <div className="flex items-center">
                      {currentRent.status === "paid" ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <Check className="h-4 w-4 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600 text-sm font-medium">
                          <AlertCircle className="h-4 w-4 mr-1" /> Unpaid
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 relative">
                  <button
                    className="flex items-center justify-center gap-2 bg-[#3F3D56] hover:bg-[#2d2b40] transition-colors rounded-lg py-3 font-medium text-white"
                    onClick={() => setDiscountCodePopupOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Discount Code
                  </button>
                  <button
                    onClick={() => {if (currentRent.status !== "paid") router.push(`/checkout/rent?id=${currentRent.id}`) }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 font-medium ${
                      currentRent.status === "paid"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                    }`}
                    disabled={currentRent.status === "paid"}
                  >
                    <CreditCard className="h-4 w-4" />
                    {currentRent.status === "paid" ? "Paid" : "Pay Rent"}
                  </button>

                  {/* Discount Code Popup */}
                  {discountCodePopupOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full z-10">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">Enter Discount Code</h3>
                        <button
                          onClick={() => {
                            setDiscountCodePopupOpen(false)
                            setDiscountCode("")
                            setDiscountCodeError("")
                            setDiscountCodeSuccess("")
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <input
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Enter code"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                        />
                        {discountCodeError && <p className="text-red-500 text-xs mt-1">{discountCodeError}</p>}
                        {discountCodeSuccess && <p className="text-green-500 text-xs mt-1">{discountCodeSuccess}</p>}
                      </div>

                      <button
                        onClick={handleApplyDiscountCode}
                        className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white rounded-lg py-2 text-sm font-medium"
                      >
                        Apply Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions card */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/events"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Events</span>
              </Link>

              <Link
                href="/dashboard/marketplace"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Marketplace</span>
              </Link>

              <Link
                href="/dashboard/neighbors"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <User className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Neighbors</span>
              </Link>

              <Link
                href="/dashboard/apartment"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <HomeIcon className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Apartment</span>
              </Link>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium mb-3 text-gray-900">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-[#3F3D56]/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[#3F3D56]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Community Meeting</p>
                    <p className="text-xs text-gray-500">Tomorrow, 7:00 PM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-[#3F3D56]/10 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-[#3F3D56]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New Items in Marketplace</p>
                    <p className="text-xs text-gray-500">3 new items added</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Wallet</h2>
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div className="flex-1">
                <p className="text-gray-600 mb-2">Current Balance</p>
                <h3 className="text-3xl font-bold text-gray-900">{accountDetail?.balance} {accountDetail?.currency}</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={()=> {router.push("/checkout/funds")}} className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Add Funds
                </button>
                <button onClick={() => {router.push('/dashboard/withdraw')}} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors">
                  Withdraw
                </button>
              </div>
            </div>

            {/* Account Movements Table */}
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Recent Movements</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  {accountMovements && accountMovements.length > 0 && (
                    <tbody className="bg-white divide-y divide-gray-200">
                    {accountMovements.map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}</td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                            movement.type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {movement.type === "deposit" ? "+" : "-"}${movement.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link href="/dashboard/events" className="text-[#3F3D56] text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
              <div className="h-32 bg-gradient-to-r from-[#3F3D56]/10 to-[#6c6a8a]/10 relative">
                <div className="absolute bottom-3 left-3 bg-[#3F3D56] text-white text-xs font-medium px-2 py-1 rounded">
                  Jan 28
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 text-gray-900">Community Barbecue</h3>
                <p className="text-sm text-gray-600 mb-2">Join us for a neighborhood gathering with food and games.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">2:00 PM - 6:00 PM</span>
                  <button className="text-xs text-[#3F3D56] hover:underline">RSVP</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
              <div className="h-32 bg-gradient-to-r from-[#3F3D56]/10 to-[#6c6a8a]/10 relative">
                <div className="absolute bottom-3 left-3 bg-[#3F3D56] text-white text-xs font-medium px-2 py-1 rounded">
                  Jan 30
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 text-gray-900">Building Maintenance</h3>
                <p className="text-sm text-gray-600 mb-2">Scheduled maintenance for the building's common areas.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">9:00 AM - 12:00 PM</span>
                  <button className="text-xs text-[#3F3D56] hover:underline">Details</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
              <div className="h-32 bg-gradient-to-r from-[#3F3D56]/10 to-[#6c6a8a]/10 relative">
                <div className="absolute bottom-3 left-3 bg-[#3F3D56] text-white text-xs font-medium px-2 py-1 rounded">
                  Feb 2
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 text-gray-900">Yoga in the Park</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Outdoor yoga session for all residents. Bring your own mat.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">8:00 AM - 9:00 AM</span>
                  <button className="text-xs text-[#3F3D56] hover:underline">RSVP</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 mt-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900">NeighboorConnect</h3>
            <p className="text-gray-600 text-sm mb-4">Building stronger communities through better connections.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Download on App Store</span>
              </a>

              <a
                href="#"
                className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-4 py-2 flex items-center gap-2 text-gray-800 border border-gray-200"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.654 2.998C3.113 3 2.588 3.23 2.197 3.619 1.807 4.008 1.577 4.533 1.579 5.074v13.852c-.002.541.229 1.066.619 1.455.39.39.915.62 1.456.618h16.788c.541.002 1.066-.228 1.456-.618.39-.389.62-.914.618-1.455V5.074c.002-.541-.228-1.066-.618-1.455C21.508 3.23 20.983 3 20.442 2.998H3.654zm4.707 3h7.278c.144.002.28.058.38.158.1.1.156.236.158.38v10.928a.537.537 0 01-.158.38.537.537 0 01-.38.158H8.361a.537.537 0 01-.38-.158.537.537 0 01-.158-.38V6.536c-.002-.144.058-.28.158-.38.1-.1.236-.156.38-.158zm-2.36 2h1v8h-1v-8zm12.001 0h1v8h-1v-8z" />
                </svg>
                <span className="text-sm font-medium">Get it on Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
