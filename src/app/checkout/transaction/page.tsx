"use client"

import { useEffect, useState, type ChangeEvent, type FormEvent, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingBag, CreditCard, Clock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import useUserStore from "../../../../lib/userStore"
import { TransactionJson } from "../../../../lib/types/TransactionJson"
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

// Separate component that uses useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams()
  const idsParam = searchParams.get("ids");
  const ids: number[] = idsParam ? JSON.parse(idsParam) : [];
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
  const [pendingTransactions, setPendingTransactions] = useState<TransactionJson[]>([])

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, string>>({});

  const [accountDetail, setAccountDetail] = useState<AccountDetail>()

  const fees = 15 // Service and processing fees
  const total = fees

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transaction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "type": selectedPaymentMethod,
            "transaction_ids": ids,
            "user_id": user?.id
          })
        });
  
        if (!res.ok) {
          const errorMessage = await res.text();
          throw new Error(errorMessage || "Failed to submit payment");
        }

        //router.push("/dashboard")
      } catch (error) {
        console.error(error);
      }
  };

  const router = useRouter()

        const fetchAccount = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/account?user_id=${user?.id.toString()}`)
          if (!res.ok) {
            const errorMessage = await res.text()
            throw new Error(errorMessage || "Failed to fetch transactions")
          }

          const data: AccountDetail = await res.json()

          setAccountDetail(data)
        } catch (error) {
          console.error(error)
        }
      }

            const fetchPendingTransactions = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transaction?user_id=${user?.id.toString()}`)
          if (!res.ok) {
            const errorMessage = await res.text()
            throw new Error(errorMessage || "Failed to fetch transactions")
          }

          const data: TransactionJson[] = await res.json()

          const pendingTractionsArray: TransactionJson[] = []
          data.forEach((transaction: TransactionJson) => {
            if (ids.includes(transaction.id)) {
                pendingTractionsArray.push(transaction)
            }
          })

          setPendingTransactions(pendingTractionsArray)
        } catch (error) {
          console.error(error)
        }
      }

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    } else if (user?.apartmentId) {

      fetchPendingTransactions()
      fetchAccount()
    }
  }, [hasHydrated, isAuthenticated, user])

  useEffect(() => {
    const updateTimes = () => {
      const newMap: Record<string, string> = {};
  
      pendingTransactions.forEach((transaction) => {
        const due = new Date(transaction.payment_due_time);
        const now = new Date();
        const diffMs = due.getTime() - now.getTime();
  
        if (diffMs <= 0) {
          newMap[transaction.id] = "Expired";
          return;
        }
  
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
        let str = "";
        if (days > 0) str += `${days}d `;
        str += `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  
        newMap[transaction.id] = str;
      });
  
      setTimeLeftMap(newMap);
    };
  
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, [pendingTransactions]);

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingBag className="h-5 w-5 text-gray-600" />
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
            href="/marketplace"
            className="inline-flex items-center text-[#3F3D56] hover:text-[#2d2b40] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

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

          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {pendingTransactions.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                    <Image src={item?.listing?.listing_photos?.[0]?.url ?? "/placeholder.svg"} alt={item.listing.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.listing.name}</h3>
                    <div className="flex items-center text-xs text-red-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{timeLeftMap[item.id] || ""}</span>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">${item.final_price}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Fees:</span>
                <span className="font-medium text-gray-900">${fees}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">${total}</span>
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
                    value="cash"
                    checked={selectedPaymentMethod === "wallet"}
                    onChange={() => setSelectedPaymentMethod("wallet")}
                    className="h-4 w-4 text-[#3F3D56] focus:ring-[#3F3D56]"
                  />
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Wallet  ({accountDetail?.balance} €)</span>
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

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-3 rounded-lg font-medium transition-colors"
            >
              Place Order
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

// Loading component for Suspense fallback
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3F3D56] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading checkout...</p>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function Checkout() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}