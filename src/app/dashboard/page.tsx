"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  HomeIcon,
  Calendar,
  ShoppingBag,
  User,
} from "lucide-react"

import useUserStore from "../../../lib/userStore"

export default function Dashboard() {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const userName = "Rodrigo Moura"
  const currentDate = new Date()
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const formattedDate = currentDate.toLocaleDateString("en-US", options)
  const endDate = "Jan 31"

  // Balance data
  const totalPoints = 400
  const usedPoints = 30
  const currentBalance = totalPoints - usedPoints
  const percentageRemaining = (currentBalance / totalPoints) * 100

  // Calculate the circle's circumference and offset
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentageRemaining / 100) * circumference

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    console.log(user)
  })

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
              <Link href="/dashboard" className="text-gray-900 font-medium">
                Home
              </Link>
              <Link href="/activities" className="text-gray-600 hover:text-gray-900 transition-colors">
                Activities
              </Link>
              <Link href="/auction" className="text-gray-600 hover:text-gray-900 transition-colors">
                Auction
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
                Community
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

            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-[#3F3D56] rounded-full w-2 h-2"></span>
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
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
                <span className="font-medium text-sm">{userName.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{userName}</span>
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
              <Link href="/activities" className="text-gray-600 hover:text-gray-900 transition-colors">
                Activities
              </Link>
              <Link href="/auction" className="text-gray-600 hover:text-gray-900 transition-colors">
                Auction
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
                Community
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
<main className="container mx-auto px-4 py-8">
  {/* Greeting section */}
  <div className="mb-8">
    <h2 className="text-gray-500 text-sm">{getGreeting()}</h2>
    <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
  </div>

  {/* Dashboard grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Balance card */}
    <div className="bg-white rounded-xl p-6 shadow-md md:col-span-2 border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Balance</h2>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="relative w-[180px] h-[180px] mb-6 md:mb-0">
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
            <span className="text-3xl font-bold text-gray-900">{currentBalance}</span>
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-xs">-{usedPoints}</span>
              <div className="w-12 h-px bg-gray-200 my-1"></div>
              <span className="text-sm text-gray-600">{totalPoints}</span>
            </div>
            <span className="text-gray-400 text-xs mt-1">points</span>
          </div>

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3F3D56]/10 text-[#3F3D56] px-3 py-1 rounded-full">
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Monthly Limit</span>
              <span className="text-sm font-medium text-gray-900">
                {currentBalance}/{totalPoints}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#3F3D56] to-[#6c6a8a] h-2 rounded-full"
                style={{ width: `${percentageRemaining}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">Until {endDate}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-[#3F3D56] hover:bg-[#2d2b40] transition-colors rounded-lg py-3 font-medium text-white">
              <Plus className="h-4 w-4" />
              Add Code
            </button>
            <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg py-3 font-medium text-gray-700 border border-gray-200">
              <CreditCard className="h-4 w-4" />
              Pay Rent
            </button>
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
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <p className="text-gray-600 mb-2">Current Balance</p>
          <h3 className="text-3xl font-bold text-gray-900">100 USD</h3>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Add Funds
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium border border-gray-200 transition-colors">
            Withdraw
          </button>
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
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Community Guidelines
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Account</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  My Apartment
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Payment History
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 transition-colors">
                  Settings
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-gray-900">Download App</h3>
            <p className="text-sm text-gray-600 mb-4">Get the NeighboorConnect app for iOS and Android.</p>
            <div className="flex flex-col space-y-2">
              <a
                href="#"
                className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-4 py-2 flex items-center gap-2 text-gray-800 border border-gray-200"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5234 12.0371C17.5088 9.45234 19.4547 8.04492 19.5387 7.99219C18.2979 6.14062 16.3793 5.89453 15.7031 5.87695C14.0449 5.70312 12.4395 6.84961 11.5957 6.84961C10.7344 6.84961 9.43359 5.89453 8.02617 5.92969C6.21094 5.96484 4.53516 7.01953 3.62109 8.64258C1.72266 11.9414 3.15234 16.7871 4.98633 19.3301C5.90039 20.5801 6.96094 21.9873 8.34375 21.9258C9.69141 21.8643 10.207 21.0469 11.8301 21.0469C13.4355 21.0469 13.9336 21.9258 15.3516 21.8906C16.8047 21.8643 17.7188 20.6143 18\
18.7891 19.5234 18.7891C17.7461 18.7891 16.9961 17.7188 15.3516 17.7461C13.9336 17.7734 13.2891 18.6426 11.8301 18.6426C10.3711 18.6426 9.69141 17.7461 8.35938 17.7461C6.76172 17.7461 5.64453 19.4375 5.64453 19.4375L5.60156 19.498C4.64844 17.8555 4.05859 16.0352 4.05859 14.2305C4.05859 11.1758 6.36719 8.86719 9.42188 8.86719C10.5938 8.86719 11.6133 9.44141 12.375 10.1172C13.0898 9.40625 14.0742 8.86719 15.2109 8.86719C17.8594 8.86719 19.6289 11.0273 19.6289 13.9375C19.6289 16.2891 18.1211 18.1016 17.5234 18.8652Z" />
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
  );
}

