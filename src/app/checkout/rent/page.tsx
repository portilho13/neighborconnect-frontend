"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Wallet, CreditCard, Clock, Home } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import useUserStore from "../../../../lib/userStore"
import { Rent } from "../../../../lib/types/Rent"
import { AccountDetail } from "../../../../lib/types/AccountDetail"


interface FormData {
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  phone: string
  email: string
}

export default function PayRent() {
  const searchParams = useSearchParams()
  const idParam = searchParams.get("id")
  const rentId: number = idParam ? Number.parseInt(idParam, 10) : 0

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "wallet">("card")
  const [couponCode, setCouponCode] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
  })
  const [pendingRentPayment, setPendingRentPayment] = useState<Rent | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const subtotal = pendingRentPayment ? pendingRentPayment.final_amount : 0
  const rawReduction = pendingRentPayment?.reduction ?? 0;
  const reduction = Math.round(rawReduction * 100) / 100;
  const total = subtotal - subtotal * reduction;
  

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API call to process payment
      const res = await fetch("http://localhost:1234/api/v1/rent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rent_id: rentId,
          payment_type: selectedPaymentMethod,
          user_id: user?.id,
        }),
      })

      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to process payment")
      }

      // Redirect after successful payment
      router.push("/dashboard?payment=success&type=rent")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const router = useRouter()

  // Fetch account details
  const fetchAccount = async () => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/account?user_id=${user?.id.toString()}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch account details")
      }

      const data: AccountDetail = await res.json()
      setAccountDetail(data)
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch rent payment
  const fetchRentPayment = async () => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/rent/info?id=${rentId.toString()}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch rent payment")
      }

      const data: Rent = await res.json()
      setPendingRentPayment(data)

    } catch (error) {
      console.error(error)
    }
  }

  // Check authentication and fetch data
  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    } else if (user?.id && rentId > 0) {
      fetchAccount()
      fetchRentPayment()
    }
  }, [hasHydrated, isAuthenticated, user, rentId])

  // Update countdown timer
  useEffect(() => {
    if (!pendingRentPayment) return

    const updateTime = () => {
      const now = new Date()
      const currentYear = pendingRentPayment.year
      const currentMonth = pendingRentPayment.month - 1 // JavaScript months are 0-indexed
      const dueDay = pendingRentPayment.due_day

      const dueDate = new Date(currentYear, currentMonth, dueDay)

      // If due date has passed, show overdue
      if (now > dueDate) {
        setTimeLeft("Overdue")
        return
      }

      const diffMs = dueDate.getTime() - now.getTime()
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      let str = ""
      if (days > 0) str += `${days}d `
      str += `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`

      setTimeLeft(str)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [pendingRentPayment])

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-[#3F3D56]">
              NeighboorConnect
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 transition-colors">
                Events
              </Link>
              <Link href="/payments" className="text-gray-600 hover:text-gray-900 transition-colors">
                Payments
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Wallet className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-[#3F3D56] rounded-full w-2 h-2"></span>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                <span className="font-medium text-sm">U</span>
              </div>
              <span className="text-sm font-medium text-gray-900">User</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#3F3D56] hover:text-[#2d2b40] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Pay Rent</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Details</h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment, floor, etc. (optional)
                </label>
                <input
                  type="text"
                  id="apartment"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Town/City<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>
            </form>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Summary</h2>

            <div className="space-y-4 mb-6">
              {pendingRentPayment ? (
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <Home className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Aparment #{pendingRentPayment.apartment_id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(pendingRentPayment.year, pendingRentPayment.month - 1).toLocaleString("default", {
                        month: "long",
                      })}{" "}
                      {pendingRentPayment.year}
                    </p>
                    <div className="flex items-center text-xs text-red-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Due in: {timeLeft}</span>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">${pendingRentPayment.final_amount.toFixed(2)}</div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No pending rent payment found.</p>
                </div>
              )}
            </div>

            {pendingRentPayment && (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium text-gray-900">${pendingRentPayment.base_amount.toFixed(2)}</span>
                  </div>
                  {pendingRentPayment.reduction > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Reduction:</span>
                      <span className="font-medium text-green-600">-${(pendingRentPayment.reduction * pendingRentPayment.base_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-gray-900">${pendingRentPayment.final_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={selectedPaymentMethod === "card"}
                        onChange={() => setSelectedPaymentMethod("card")}
                        className="h-4 w-4 text-[#3F3D56] focus:ring-[#3F3D56]"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Credit/Debit Card</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Image src="/placeholder.svg?height=24&width=36" alt="Visa" width={36} height={24} />
                        <Image src="/placeholder.svg?height=24&width=36" alt="Mastercard" width={36} height={24} />
                        <Image src="/placeholder.svg?height=24&width=36" alt="Amex" width={36} height={24} />
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        checked={selectedPaymentMethod === "wallet"}
                        onChange={() => setSelectedPaymentMethod("wallet")}
                        className="h-4 w-4 text-[#3F3D56] focus:ring-[#3F3D56]"
                      />
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          Wallet Balance (${accountDetail?.balance || "0.00"})
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                    />
                    <button
                      type="button"
                      className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Apply Coupon
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !pendingRentPayment}
              className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Pay Rent"
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">© 2023 NeighboorConnect. All rights reserved</p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
