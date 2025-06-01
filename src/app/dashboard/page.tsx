"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  HomeIcon,
  Calendar,
  User,
  Check,
  AlertCircle,
  X,
} from "lucide-react"

import useUserStore from "../../../lib/userStore"
import LoadingSpinner from "../../../components/loading-spinner"
import { useRouter } from "next/navigation"
import type { Rent } from "../../../lib/types/Rent"
import type { AccountDetail } from "../../../lib/types/AccountDetail"
import type { TransactionJson } from "../../../lib/types/TransactionJson"
import type { AccountMovement } from "../../../lib/types/AccountMovement"
import Header from "../../../components/header"
import { CommunityEvent } from "../../../lib/types/CommunityEvent"
import Image from "next/image"
import Footer from "../../../components/footer"

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

interface Neighbor {
  id: number
  name: string
  email: string
  phone: string
  apartment_id: number
  profile_picture: string
}

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

  const [neighbors, setNeighbors] = useState<Neighbor[]>([])

  const [searchTerm, setSearchTerm] = useState("")

  const [neighborPopupOpen, setNeighborPopupOpen] = useState(false)
  const [apartmentPopupOpen, setApartmentPopupOpen] = useState(false)

  const [events, setEvents] = useState<CommunityEvent[]>([])

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const router = useRouter()

  const fetchRent = async (apartment_id: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/rent?apartment_id=${apartment_id}`)

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

  const fetchNeighbors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/client`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch transactoions")
      }

      const data: Neighbor[] = await res.json()

      setNeighbors(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAccount = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/account?user_id=${user?.id.toString()}`)
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/account/movement?user_id=${user?.id.toString()}`)
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event?user_id=${user?.id}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch events")
      }

      const data = await res.json()
      setEvents(data)
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
      fetchNeighbors()
      fetchEvents()
    }
  }, [hasHydrated, isAuthenticated, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".relative")) {
        setNeighborPopupOpen(false)
        setApartmentPopupOpen(false)
      }
    }

    if (neighborPopupOpen || apartmentPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [neighborPopupOpen, apartmentPopupOpen])

  // Rent data with discount information
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountCodeError("Please enter a discount code")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event/reward`, {
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
                    <span className="text-xl font-bold text-gray-900">{currentRent.base_amount} €</span>
                    <div className="flex items-center gap-1 text-red-500">
                      <span className="text-lg">-{discountAmount} €</span>
                    </div>
                    <div className="w-24 h-px bg-gray-200 my-2"></div>
                    <span className="text-2xl font-bold text-gray-900">{currentRent.final_amount} €</span>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Discount Progress</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {discountAmount} € / {maxDiscout} €
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
                    onClick={() => {
                      if (currentRent.status !== "paid") router.push(`/checkout/rent?id=${currentRent.id}`)
                    }}
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
                href="/events"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Events</span>
              </Link>

              <Link
                href="/marketplace"
                className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                  <ShoppingBag className="h-5 w-5 text-[#3F3D56]" />
                </div>
                <span className="text-sm text-gray-700">Marketplace</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setNeighborPopupOpen(!neighborPopupOpen)}
                  className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100 w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                    <User className="h-5 w-5 text-[#3F3D56]" />
                  </div>
                  <span className="text-sm text-gray-700">Neighbors</span>
                </button>

                {/* Neighbors Directory Popup */}
                {neighborPopupOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Neighbors Directory</h3>
                      <button onClick={() => setNeighborPopupOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Search bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search neighbors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                        />
                      </div>

                      {/* Neighbors list */}
                      <div className="space-y-2">
                        {neighbors
                          .filter(
                            (neighbor) =>
                              neighbor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              neighbor.apartment_id.toString().toLowerCase().includes(searchTerm.toLowerCase()),
                          )
                          .map((neighbor) => (
                            <div
                              key={neighbor.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center relative">
                                <User className="h-5 w-5 text-[#3F3D56]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{neighbor.name}</p>
                                <p className="text-xs text-gray-500">
                                  Apt {neighbor.apartment_id} • {neighbor.email}
                                </p>
                                <p className="text-xs text-gray-500">{neighbor.phone}</p>
                              </div>
                            </div>
                          ))}

                        {neighbors.filter(
                          (neighbor) =>
                            neighbor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            neighbor.apartment_id.toString().toLowerCase().includes(searchTerm.toLowerCase()),
                        ).length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No neighbors found matching &quot;{searchTerm}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setApartmentPopupOpen(!apartmentPopupOpen)}
                  className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-4 border border-gray-100 w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-[#3F3D56]/10 flex items-center justify-center mb-2">
                    <HomeIcon className="h-5 w-5 text-[#3F3D56]" />
                  </div>
                  <span className="text-sm text-gray-700">Apartment</span>
                </button>

                {/* Apartment Popup */}
                {apartmentPopupOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64 z-20">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">Apartment Details</h3>
                      <button
                        onClick={() => setApartmentPopupOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#3F3D56]/10 flex items-center justify-center">
                          <HomeIcon className="h-4 w-4 text-[#3F3D56]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Apartment {user?.apartmentId || "N/A"}</p>
                          <p className="text-xs text-gray-500">Your Home</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Apartment ID:</span>
                          <span className="text-gray-900">#{user?.apartmentId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bedrooms:</span>
                          <span className="text-gray-900">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Floor:</span>
                          <span className="text-gray-900">4th Floor</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <Link
                          href="/dashboard/apartment"
                          className="text-[#3F3D56] text-sm hover:underline"
                          onClick={() => setApartmentPopupOpen(false)}
                        >
                          View Full Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
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
                <h3 className="text-3xl font-bold text-gray-900">
                  {accountDetail?.balance} {accountDetail?.currency}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    router.push("/checkout/funds")
                  }}
                  className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Funds
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/withdraw")
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors"
                >
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                              movement.type === "deposit" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {movement.type === "deposit" ? "+" : "-"} {movement.amount.toFixed(2)} €
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events && events.length > 0
              ? events.map((event) => {
                  const eventDate = new Date(event.date_time)
                  const dateString = eventDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                  const timeString = eventDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  const endTime = new Date(eventDate.getTime() + event.duration / 1000000).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                  const occupancyPercentage = (event.current_ocupation / event.capacity) * 100

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                    >
                      <div className="h-32 relative">
                        {event.event_image ? (
                          <Image
                            src={event.event_image || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="h-full bg-gradient-to-r from-[#3F3D56]/10 to-[#6c6a8a]/10" />
                        )}
                        <div className="absolute bottom-3 left-3 bg-[#3F3D56] text-white text-xs font-medium px-2 py-1 rounded">
                          {dateString}
                        </div>
                        {event.status === "active" && (
                          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                            Active
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1 text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Reward: {parseFloat(event.percentage.toFixed(2)) * 100} %
                        </p>
                        <p className="text-sm text-gray-600 mb-2">Location: {event.local}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {timeString} - {endTime}
                          </span>
                          <span className="text-xs text-gray-500">
                            {event.current_ocupation}/{event.capacity} spots
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div
                            className="bg-[#3F3D56] h-1.5 rounded-full"
                            style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{occupancyPercentage.toFixed(0)}% full</span>
                          <button className="text-xs text-[#3F3D56] hover:underline">
                            {event.current_ocupation >= event.capacity ? "Full" : "RSVP"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              : // Fallback content when no events are available
                <></>}
          </div>
        </div>
      </main>

      <Footer></Footer>
    </div>
  )
}
