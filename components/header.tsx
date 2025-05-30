"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Menu, ShoppingBagIcon, Clock, LogOut, Camera, ChevronDown } from "lucide-react"

import useUserStore from "../lib/userStore"
import { useRouter } from "next/navigation"
import type { TransactionJson } from "../lib/types/TransactionJson"
import Image from "next/image"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<TransactionJson[]>([])

  const toggleTransactionSelection = (id: number) => {
    if (pendingTransactions) {
      setPendingTransactions(
        pendingTransactions.map((transaction) =>
          transaction.id === id ? { ...transaction, selected: !transaction.selected } : transaction,
        ),
      )
    }
  }

  const getTimeLeft = (dueTime: Date): string => {
    const now = new Date()
    const due = new Date(dueTime)
    const diffMs = due.getTime() - now.getTime()

    if (diffMs <= 0) return "Expired"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000)

    let timeLeftStr = ""
    if (diffDays > 0) {
      timeLeftStr += `${diffDays}d `
    }
    timeLeftStr += `${diffHrs}h ${diffMins.toString().padStart(2, "0")}m ${diffSecs.toString().padStart(2, "0")}s`

    return timeLeftStr
  }

  const calculateTotal = () => {
    return (
      pendingTransactions
        ?.filter((transaction) => transaction.selected)
        .reduce((total, transaction) => total + transaction.final_price, 0) || 0
    )
  }

  const { user, isAuthenticated, hasHydrated, logout } = useUserStore()

  const router = useRouter()


  const handleLogout = () => {
    logout()
    router.push("/login/client")
  }

const handleProfilePictureChange = () => {
  if (!user) return;
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "image/*"
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("user_id", user.id.toString())
    formData.append("profilePicture", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/client/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Upload successful:", data)

      // Optional: Update user profile picture in the UI or state here

    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  input.click()
}

    const fetchPendingTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/transaction?user_id=${user?.id.toString()}`)
        if (!res.ok) {
          const errorMessage = await res.text()
          throw new Error(errorMessage || "Failed to fetch transactions")
        }

        const data: TransactionJson[] = await res.json()
        console.log(data)
        setPendingTransactions(data)
      } catch (error) {
        console.error(error)
      }
    }


useEffect(() => {
  if (!hasHydrated) return;

  if (!isAuthenticated) {
    router.push("/login/client");
  } else if (user?.apartmentId) {
    
    fetchPendingTransactions();
  }
}, [hasHydrated, isAuthenticated, user, router]);


  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".user-menu-container")) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-bold text-xl text-[#3F3D56]">
            NeighboorConnect
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-900 font-medium">
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
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[200px] lg:w-[250px]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setCartOpen(!cartOpen)}
            >
              <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-[#3F3D56] rounded-full w-2 h-2"></span>
            </button>
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 top-full">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium text-gray-900">Pending Transactions</h3>
                  <p className="text-xs text-gray-500 mt-1">Select items to checkout</p>
                </div>

                {pendingTransactions && pendingTransactions.length > 0 ? (
                  <>
                    <div className="max-h-80 overflow-y-auto">
                      {pendingTransactions.map((transaction: TransactionJson) => (
                        <div key={transaction.id} className="p-3 border-b border-gray-100 flex items-center">
                          <input
                            type="checkbox"
                            checked={transaction.selected || false}
                            onChange={() => toggleTransactionSelection(transaction.id)}
                            className="h-4 w-4 text-[#3F3D56] rounded border-gray-300 focus:ring-[#3F3D56] mr-3"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{transaction.listing.name}</p>
                            <p className="text-sm text-gray-600">${transaction.final_price}</p>
                          </div>
                          <div className="text-xs text-red-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeLeft(transaction.payment_due_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-sm font-medium">${calculateTotal()}</span>
                      </div>
                      <button
                        className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-2 rounded-md text-sm font-medium transition-colors"
                        disabled={!pendingTransactions.some((t) => t.selected)}
                      >
                        Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No pending transactions</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-3 relative user-menu-container">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
            {user && user.avatar ? (
              <div className="h-8 w-8 rounded-full overflow-hidden bg-[#3F3D56]">
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
              </div>
            )}

              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                      <span className="font-medium">{user?.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={handleProfilePictureChange}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    Change Profile Picture
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-3 px-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
            <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
              <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Mobile User Actions */}
          <div className="mb-4 space-y-2">
            <button
              onClick={handleProfilePictureChange}
              className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Camera className="h-4 w-4" />
              Change Profile Picture
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <nav className="flex flex-col space-y-3">
            <Link href="/dashboard" className="text-gray-900 font-medium">
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
      )}
    </header>
  )
}
