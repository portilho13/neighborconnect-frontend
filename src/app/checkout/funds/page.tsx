"use client"

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Wallet, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import useUserStore from "../../../../lib/userStore"

interface FormData {
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  phone: string
  email: string
}

export default function AddFunds() {

  const [fundAmount, setFundAmount] = useState<number>(100)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
  })
  const [paymentType, setPaymentType] = useState<string>("credit card")


  const { user, isAuthenticated, hasHydrated } = useUserStore()
  const router = useRouter()

    useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    }
  }, [hasHydrated, isAuthenticated, user, router])


  const fees = 5 // Service and processing fees
  const total = fundAmount + fees

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFundAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value) && value > 0) {
      setFundAmount(value)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/deposit`, {
        method: "POST",
        body: JSON.stringify({
            "type": paymentType,
            "amount": fundAmount,
            "user_id": user?.id
        })
      })
      
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch transactoions")
      }


      // Redirect after successful payment
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-[#3F3D56]">
              NeighborConnect
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

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add Funds to Your Wallet</h1>

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

          {/* Fund Details */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Funds</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="fundAmount" className="block text-sm font-medium text-gray-700">
                  Amount to Add
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  id="fundAmount"
                  name="fundAmount"
                  value={fundAmount}
                  onChange={handleFundAmountChange}
                  min="10"
                  step="10"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56] text-lg font-medium"
                />
              </div>
              <div className="flex justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setFundAmount(50)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  $50
                </button>
                <button
                  type="button"
                  onClick={() => setFundAmount(100)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  $100
                </button>
                <button
                  type="button"
                  onClick={() => setFundAmount(200)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  $200
                </button>
                <button
                  type="button"
                  onClick={() => setFundAmount(500)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  $500
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">${fundAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium text-gray-900">${fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
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
                    defaultChecked={true}
                    onChange={(e) => setPaymentType(e.target.value)}
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
            </div>
            </div>


            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
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
                "Add Funds"
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-4 mt-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">© 2023 NeighborConnect. All rights reserved</p>
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
