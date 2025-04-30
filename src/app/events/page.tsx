"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Bell, Menu, Calendar, Users, MapPin, Clock, Filter, ChevronDown } from "lucide-react"
import useUserStore from "../../../lib/userStore"


interface Event {
  id: number;
  name: string;
  percentage: number;
  capacity: number;
  date_time: string;
  manager_id: number;
  event_image: string;
  duration: number;
  local: string;
  current_ocupation: number;
}


export default function Activities() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [upcommingEvents, setUpcommingEvents] = useState<Event[]>([])

  const user = useUserStore((state) => state.user);

  const fetchEvents = async() => {
    try {
      const res = await fetch("http://localhost:1234/api/v1/event")

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || 'Failed to register');
      }
      
      const data = await res.json()
      setEvents(data)


    } catch(error) {
      console.error(error)
    }
  }

  const fetchUpcommingEvents = async(user_id: Number) => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/event?user_id=${String(user_id)}`)

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || 'Failed to register');
      }
      
      const data = await res.json()
      setUpcommingEvents(data)


    } catch(error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchEvents()
    if (user?.id) {
      fetchUpcommingEvents(Number(user.id))
    }
  }, [user])
 

  // Activity categories
  const categories = [
    { name: "All", count: 24 },
    { name: "Community", count: 8 },
    { name: "Volunteer", count: 6 },
    { name: "Education", count: 5 },
    { name: "Fitness", count: 3 },
    { name: "Social", count: 2 },
  ]

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
              <Link href="/activities" className="text-gray-900 font-medium">
                Activities
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
                placeholder="Search activities..."
                className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[250px] lg:w-[300px]"
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
                <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search activities..."
                className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <nav className="flex flex-col space-y-3">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/activities" className="text-gray-900 font-medium">
                Activities
              </Link>
              <Link href="/auction" className="text-gray-600 hover:text-gray-900 transition-colors">
                Auction
              </Link>
              <Link href="/dashboard/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Activities</h1>
          <p className="text-gray-600 mt-2">
            Discover and join activities happening in your neighborhood. Connect with your community and make a
            difference.
          </p>
        </div>

        {/* Filter and sort section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filter
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3F3D56]">
                <option>Latest</option>
                <option>Oldest</option>
                <option>Most Popular</option>
                <option>Upcoming</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter dropdown */}
        {filterOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
                <input
                  type="date"
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]">
                <option>All Locations</option>
                <option>Community Center</option>
                <option>Park</option>
                <option>Library</option>
                <option>Town Hall</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-[#3F3D56] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#2d2b40] transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Featured activities */}
        {events && events.length > 0 && (
          <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Activities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src="/placeholder.svg"
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">{event.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.percentage}</p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-[#3F3D56]" />
                      {event.date_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-[#3F3D56]" />
                      {event.date_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-[#3F3D56]" />
                      {event.local}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-[#3F3D56]" />
                      {event.current_ocupation} participants
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-2 rounded-md text-sm font-medium transition-colors">
                      Join Activity
                    </button>
                    <Link
                      href={`/activities/${event.id}`}
                      className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )} 

        {/* Upcoming activities */}
        {upcommingEvents && upcommingEvents.length > 0 && (
          <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
            <Link href="/activities/upcoming" className="text-[#3F3D56] text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcommingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src="/placeholder.svg"
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg text-gray-900 mb-2">{event.name}</h3>
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1 text-[#3F3D56]" />
                      {event.date_time}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1 text-[#3F3D56]" />
                      {event.date_time}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1 text-[#3F3D56]" />
                      {event.local}
                    </div>
                  </div>
                  <Link
                    href={`/activities/${event.id}`}
                    className="block w-full text-center bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Activity calendar */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Activity Calendar</h2>
            <Link href="/activities/calendar" className="text-[#3F3D56] text-sm hover:underline">
              View Full Calendar
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              <div className="text-center text-sm font-medium text-gray-500">Sun</div>
              <div className="text-center text-sm font-medium text-gray-500">Mon</div>
              <div className="text-center text-sm font-medium text-gray-500">Tue</div>
              <div className="text-center text-sm font-medium text-gray-500">Wed</div>
              <div className="text-center text-sm font-medium text-gray-500">Thu</div>
              <div className="text-center text-sm font-medium text-gray-500">Fri</div>
              <div className="text-center text-sm font-medium text-gray-500">Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, index) => {
                const day = index - 3 // Start from previous month
                const isCurrentMonth = day > 0 && day <= 31
                const hasEvent = [5, 10, 12, 15, 22].includes(day)
                const isToday = day === 15

                return (
                  <div
                    key={index}
                    className={`aspect-square p-1 border rounded-md ${
                      isCurrentMonth ? "border-gray-200" : "border-gray-100 bg-gray-50"
                    } ${isToday ? "border-[#3F3D56] bg-[#3F3D56]/5" : ""}`}
                  >
                    <div className="h-full w-full flex flex-col">
                      <span
                        className={`text-xs ${
                          isCurrentMonth ? "text-gray-700" : "text-gray-400"
                        } ${isToday ? "font-bold text-[#3F3D56]" : ""}`}
                      >
                        {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 31}
                      </span>
                      {hasEvent && isCurrentMonth && (
                        <div className="mt-auto">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#3F3D56]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111] text-white py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Exclusive</h3>
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Subscribe</h4>
              <p className="text-gray-400 text-sm mb-4">Get 10% off your first order</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#222] border border-[#333] rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#3F3D56] text-white"
                />
                <button className="bg-[#3F3D56] text-white px-4 py-2 rounded-r-md hover:bg-[#2d2b40] flex items-center justify-center">
                  <span className="sr-only">Subscribe</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 5L16 12L9 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <p className="mb-1">111 Bijoy sarani, Dhaka,</p>
                <p>DH 1515, Bangladesh.</p>
              </li>
              <li>
                <p>exclusive@gmail.com</p>
              </li>
              <li>
                <p>+88015-88888-9999</p>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/dashboard/account" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/login/client" className="hover:text-white transition-colors">
                  Login / Register
                </Link>
              </li>
              <li>
                <Link href="/dashboard/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Link</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms Of Use
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto mt-8 pt-8 border-t border-[#333] flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 NeighboorConnect. All rights reserved</p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
