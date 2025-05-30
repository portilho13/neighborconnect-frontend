"use client"

import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Wallet, Building2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { AccountDetail } from "../../../../lib/types/AccountDetail"
import useUserStore from "../../../../lib/userStore"


interface FormData {
  firstName: string
  lastName: string
  address: string
  apartment: string
  city: string
  phone: string
  email: string
  iban: string
}

export default function WithdrawalCheckout() {
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(100)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [ibanError, setIbanError] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
    iban: "",
  })
  const [accountDetail, setAccountDetail] = useState<AccountDetail>()
    const { user, isAuthenticated, hasHydrated } = useUserStore()


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

    const rawBalance = Number.parseFloat(accountDetail?.balance ?? "0");
    const isBalanceZero = rawBalance <= 0;

    const fees = isBalanceZero ? 0 : 2.5; // No fee if no balance
    const total = isBalanceZero ? 0 : withdrawalAmount + fees;
    const remainingBalance = rawBalance - total;

useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    } else if (user?.apartmentId) {
      fetchAccount()
    }
  }, [hasHydrated, isAuthenticated, user])


  const router = useRouter()

  // Validate Portuguese IBAN
  const validatePortugueseIban = (iban: string): boolean => {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, "").toUpperCase()

    // Check if it starts with PT and has correct length (25 characters)
    if (!cleanIban.startsWith("PT") || cleanIban.length !== 25) {
      return false
    }

    // Basic format check: PT + 2 digits + 21 alphanumeric characters
    const ibanRegex = /^PT\d{2}\d{4}\d{4}\d{11}\d{2}$/
    return ibanRegex.test(cleanIban)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "iban") {
      setFormData({
        ...formData,
        [name]: value,
      })

      if (value && !validatePortugueseIban(value)) {
        setIbanError("Please enter a valid Portuguese IBAN (PT followed by 23 digits)")
      } else {
        setIbanError("")
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleWithdrawalAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty input (user is typing)
    if (inputValue === "") {
      setWithdrawalAmount(0)
      return
    }

    const value = Number.parseFloat(inputValue)
    if (!isNaN(value) && value >= 0) {
      setWithdrawalAmount(value)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validatePortugueseIban(formData.iban)) {
      setIbanError("Please enter a valid Portuguese IBAN")
      return
    }

    if (accountDetail && total > Number.parseFloat(accountDetail.balance)) {
      alert("Insufficient funds for this withdrawal")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "iban",
          amount: withdrawalAmount,
          user_id: user?.id,
        }),
      })

      if (res.ok) {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
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

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Withdraw Funds from Your Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Details</h2>

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
                <label htmlFor="iban" className="block text-sm font-medium text-gray-700 mb-1">
                  Portuguese IBAN<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="iban"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  placeholder="PT50 0002 0123 1234 5678 9015 4"
                  required
                  className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56] ${
                    ibanError ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {ibanError && (
                  <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {ibanError}
                  </div>
                )}
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

          {/* Withdrawal Details */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Withdrawal Details</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="withdrawalAmount" className="block text-sm font-medium text-gray-700">
                  Amount to Withdraw
                </label>
                <span className="text-sm text-gray-500">Available Balance: €{accountDetail?.balance || "0.00"}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                <input
                  type="number"
                  id="withdrawalAmount"
                  name="withdrawalAmount"
                  value={withdrawalAmount === 0 ? "" : withdrawalAmount}
                  onChange={handleWithdrawalAmountChange}
                  min="10"
                  max={Number.parseFloat(accountDetail?.balance || "0") - fees}
                  step="10"
                  placeholder="Enter amount"
                  required
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3F3D56] text-lg font-medium"
                />
              </div>
              <div className="flex justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setWithdrawalAmount(50)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  €50
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalAmount(100)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  €100
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalAmount(250)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  €250
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalAmount(500)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  €500
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Withdrawal Amount:</span>
                <span className="font-medium text-gray-900">€{withdrawalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="font-medium text-gray-900">€{fees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Deducted:</span>
                <span className="font-medium text-gray-900">€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-medium text-gray-900">Remaining Balance:</span>
                <span className={`text-lg font-bold ${remainingBalance >= 0 ? "text-gray-900" : "text-red-600"}`}>
                  €{remainingBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Transfer Method</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Bank Transfer (SEPA)</span>
                  </div>
                  <div className="ml-auto text-sm text-gray-600">1-2 business days</div>
                </div>
              </div>
            </div>

            {remainingBalance < 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Insufficient funds for this withdrawal</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || remainingBalance < 0 || !!ibanError || !formData.iban}
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
                "Request Withdrawal"
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
