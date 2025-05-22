"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  Bell,
  Menu,
  Home,
  Calendar,
  ShoppingBag,
  Users,
  DollarSign,
  Settings,
  PlusCircle,
  X,
  Check,
  ChevronUp,
  Building,
  LogOut,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react"

import useUserStore from "../../../../lib/userStore"
import { useRouter } from "next/navigation"
import { CommunityEvent } from "../../../../lib/types/CommunityEvent"
import { ManagerDashboardInfo } from "../../../../lib/types/ManagerDashboardInfo"
import { UserInfo } from "../../../../lib/types/UserInfo"
import { Apartment } from "../../../../lib/types/Apartment"



export default function ManagerDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [concludeEventModal, setConcludeEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent>()
  const [dashboardInfo, setDashboardInfo] = useState<ManagerDashboardInfo>()
  const [eventParticipants, setEventParticipants] = useState<UserInfo[]>([])
  const [rewardedIds, setRewardedIds] = useState<number[]>([]);
  const [activeConcludeEventId, setActiveConcludeEventId] = useState<number | null>(null)

  const router = useRouter()

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/manager")
    } else if (user?.id) {
      fetchDashboardInfo(user.id)
    }
  }, [hasHydrated, isAuthenticated, user])

  useEffect(() => {
    if (dashboardInfo) {
      console.log("Updated dashboardInfo:", dashboardInfo)
    }
  }, [dashboardInfo])


  const fetchParticipants = async (id: number) => {
    try {
        const res = await fetch(`http://localhost:1234/api/v1/event/users?event_id=${id}`)
        if (!res.ok) throw new Error(await res.text())
        
        const data: UserInfo[] = await res.json()
        setEventParticipants(data)
    } catch(error) {
        console.error(error)
    }
  }

  const fetchDashboardInfo = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:1234/api/v1/manager/dashboard/info?manager_id=${id}`)
      if (!res.ok) throw new Error(await res.text())

      let data: ManagerDashboardInfo
      try {
        data = await res.json()
        setDashboardInfo(data)
      } catch (error) {
        console.error("JSON parsing error:", error)
        // Don't update state if JSON parsing failed
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !dashboardInfo) {
    console.log(dashboardInfo)
    return <div>Loading dashboard...</div>
  }

  // Mock data for the dashboard
  const stats = [
    { title: "Total Apartments", value: dashboardInfo?.apartments?.length ?? 0, change: null, icon: Building },
    { title: "Active Residents", value: dashboardInfo?.users?.length ?? 0, change: null, icon: Users },
    { title: "Monthly Revenue", value: "$24,500", change: null, icon: DollarSign },
    { title: "Marketplace Listings", value: dashboardInfo?.listings?.length ?? 0, change: null, icon: ShoppingBag },
  ]

  // Mock data for apartments
  const apartments = [
    { id: "A101", status: "Occupied", resident: "Sarah Johnson", rentStatus: "Paid", lastPayment: "May 1, 2023" },
    { id: "A102", status: "Vacant", resident: "-", rentStatus: "-", lastPayment: "-" },
    { id: "A103", status: "Occupied", resident: "Michael Chen", rentStatus: "Overdue", lastPayment: "April 1, 2023" },
    { id: "A104", status: "Occupied", resident: "Emily Davis", rentStatus: "Paid", lastPayment: "May 2, 2023" },
    { id: "A105", status: "Maintenance", resident: "-", rentStatus: "-", lastPayment: "-" },
  ]

  const events = dashboardInfo?.events

  // Mock data for marketplace listings
  const marketplaceListings = [
    {
      id: 1,
      title: "Vintage Coffee Table",
      seller: "Michael Chen",
      price: "$120",
      listed: "May 5, 2023",
      status: "Active",
    },
    {
      id: 2,
      title: "Mountain Bike",
      seller: "Sarah Johnson",
      price: "$350",
      listed: "May 3, 2023",
      status: "Active",
    },
    {
      id: 3,
      title: "Desk Lamp",
      seller: "Emily Davis",
      price: "$25",
      listed: "May 1, 2023",
      status: "Active",
    },
    {
      id: 4,
      title: "Blender",
      seller: "David Wilson",
      price: "$45",
      listed: "April 28, 2023",
      status: "Sold",
    },
  ]

  // Mock data for financial overview
  const financialData = {
    totalRevenue: "$24,500",
    rentCollected: "$22,000",
    marketplaceFees: "$1,500",
    eventFees: "$1,000",
    expenses: "$8,200",
    netProfit: "$16,300",
  }

  // Function to handle concluding an event
  const handleConcludeEvent = async (event: CommunityEvent) => {
    if (!event.id) return;
    await fetchParticipants(event.id);

    setSelectedEvent(event)
    setConcludeEventModal(true)
  }

  const toggleAwardStatus = (participantId: number) => {
    setRewardedIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };
  

  // Function to finalize event conclusion
  const finalizeEventConclusion = async() => {
    try {
        if (!selectedEvent) throw new Error("Event must be selected")
        const res = await fetch("http://localhost:1234/api/v1/event/conclude", {
            method: "POST",
            body: JSON.stringify({
                "community_event_id": selectedEvent.id,
                "awarded_users_ids": rewardedIds
            })
        })

        if (!res.ok) throw new Error(await res.text())
    } catch(error) {
        console.error(error)
    }finally{
        setConcludeEventModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200">
          <Link href="/manager/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-[#3F3D56] flex items-center justify-center text-white mr-2">
              <span className="font-bold">NC</span>
            </div>
            <span className="font-bold text-lg text-gray-900">NeighboorConnect</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "overview"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Home className="mr-3 h-5 w-5" />
              Overview
            </button>

            <button
              onClick={() => setActiveTab("apartments")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "apartments"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Building className="mr-3 h-5 w-5" />
              Apartments
            </button>

            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "events"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Events
            </button>

            <button
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "marketplace"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              Marketplace
            </button>

            <button
              onClick={() => setActiveTab("residents")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "residents"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Residents
            </button>

            <button
              onClick={() => setActiveTab("finances")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "finances"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <DollarSign className="mr-3 h-5 w-5" />
              Finances
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === "settings"
                  ? "bg-[#3F3D56] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
              <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Building Manager</p>
            </div>
            <button className="ml-auto p-1 rounded-full text-gray-400 hover:text-gray-500">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/manager/dashboard" className="ml-2 font-bold text-xl text-[#3F3D56]">
                NeighboorConnect
              </Link>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[250px]"
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
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-3 px-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                  <span className="font-medium text-sm">{user?.name.charAt(0)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <p className="text-xs text-gray-500">Building Manager</p>
                </div>
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
                <button
                  onClick={() => {
                    setActiveTab("overview")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "overview"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Overview
                </button>

                <button
                  onClick={() => {
                    setActiveTab("apartments")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "apartments"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Building className="mr-3 h-5 w-5" />
                  Apartments
                </button>

                <button
                  onClick={() => {
                    setActiveTab("events")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "events"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Events
                </button>

                <button
                  onClick={() => {
                    setActiveTab("marketplace")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "marketplace"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  Marketplace
                </button>

                <button
                  onClick={() => {
                    setActiveTab("residents")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "residents"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Residents
                </button>

                <button
                  onClick={() => {
                    setActiveTab("finances")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "finances"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <DollarSign className="mr-3 h-5 w-5" />
                  Finances
                </button>

                <button
                  onClick={() => {
                    setActiveTab("settings")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "settings"
                      ? "bg-[#3F3D56] text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </button>
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}. Here's what's happening today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-start"
                  >
                    <div className="mr-4 p-3 rounded-lg bg-[#3F3D56]/10">
                      <stat.icon className="h-6 w-6 text-[#3F3D56]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        <span className="ml-2 text-xs font-medium text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rent Payment Received</p>
                          <p className="text-xs text-gray-500">Sarah Johnson (A101) paid $1,200</p>
                          <p className="text-xs text-gray-400">Today, 9:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-[#3F3D56]/10 mr-3">
                          <Users className="h-5 w-5 text-[#3F3D56]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">New Resident</p>
                          <p className="text-xs text-gray-500">Emily Davis registered for apartment A104</p>
                          <p className="text-xs text-gray-400">Yesterday, 2:15 PM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-orange-100 mr-3">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Event Created</p>
                          <p className="text-xs text-gray-500">Community BBQ scheduled for May 20</p>
                          <p className="text-xs text-gray-400">Yesterday, 11:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-red-100 mr-3">
                          <ShoppingBag className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Marketplace Listing Removed</p>
                          <p className="text-xs text-gray-500">Removed inappropriate listing by David Wilson</p>
                          <p className="text-xs text-gray-400">May 8, 4:45 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Quick Actions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab("apartments")}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
                      >
                        <span className="flex items-center">
                          <Building className="h-5 w-5 mr-2 text-[#3F3D56]" />
                          Add New Apartment
                        </span>
                        <PlusCircle className="h-5 w-5 text-[#3F3D56]" />
                      </button>
                      <button
                        onClick={() => setActiveTab("events")}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
                      >
                        <span className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-[#3F3D56]" />
                          Create New Event
                        </span>
                        <PlusCircle className="h-5 w-5 text-[#3F3D56]" />
                      </button>
                      <button
                        onClick={() => setActiveTab("finances")}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
                      >
                        <span className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-[#3F3D56]" />
                          View Financial Reports
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events and Recent Listings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
                    <button onClick={() => setActiveTab("events")} className="text-sm text-[#3F3D56] hover:underline">
                      View All
                    </button>
                  </div>
                  {dashboardInfo?.events && dashboardInfo.events.length > 0 && (
                    <div className="p-6">
                      <div className="space-y-4">
                        {dashboardInfo?.events.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-start">
                            <div className="p-2 rounded-lg bg-[#3F3D56]/10 mr-3 flex-shrink-0">
                              <Calendar className="h-5 w-5 text-[#3F3D56]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{event.name}</p>
                              <p className="text-xs text-gray-500">
                                {event.date_time} • {event.duration}
                              </p>
                              <p className="text-xs text-gray-500">
                                {event.local} • {event.current_ocupation} / {event.capacity} participants
                              </p>
                            </div>
                            <button
                              onClick={() => setActiveTab("events")}
                              className="text-xs text-[#3F3D56] hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900">Recent Marketplace Listings</h2>
                    <button
                      onClick={() => setActiveTab("marketplace")}
                      className="text-sm text-[#3F3D56] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {dashboardInfo?.listings && dashboardInfo.listings.length > 0 && (
                    <div className="p-6">
                      <div className="space-y-4">
                        {marketplaceListings
                          .filter((listing) => listing.status === "Active")
                          .slice(0, 3)
                          .map((listing) => (
                            <div key={listing.id} className="flex items-start">
                              <div className="p-2 rounded-lg bg-[#3F3D56]/10 mr-3 flex-shrink-0">
                                <ShoppingBag className="h-5 w-5 text-[#3F3D56]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                                <p className="text-xs text-gray-500">
                                  {listing.seller} • {listing.price}
                                </p>
                                <p className="text-xs text-gray-400">Listed on {listing.listed}</p>
                              </div>
                              <button
                                onClick={() => setActiveTab("marketplace")}
                                className="text-xs text-[#3F3D56] hover:underline"
                              >
                                Review
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Apartments Tab */}
          {activeTab === "apartments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Apartment Management</h1>
                  <p className="text-gray-600">Manage all apartments in your building.</p>
                </div>
                <button
                  onClick={() => {
                    router.push("/manager/dashboard/apartments/add")
                  }}
                  className="bg-[#3F3D56] text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Apartment
                </button>
              </div>

              {/* Apartment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Apartments</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardInfo?.apartments?.length ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Occupied</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      (dashboardInfo?.apartments ?? []).filter(
                        (apartment: Apartment) => apartment.status === "occupied",
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Vacant</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      (dashboardInfo?.apartments ?? []).filter(
                        (apartment: Apartment) => apartment.status === "unoccupied",
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* Apartment Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">All Apartments</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search apartments..."
                      className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[250px]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Apartment ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Rent Value
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Rent Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Last Payment
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardInfo.apartments?.map((apartment) => (
                        <tr key={apartment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {apartment.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                apartment.status === "occupied"
                                  ? "bg-green-100 text-green-800"
                                  : apartment.status === "unoccupied"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {apartment.status.charAt(0).toUpperCase() + apartment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apartment.rent}</td>
                          {apartment.last_rent ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {apartment.last_rent.status !== "-" ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      apartment.last_rent.status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {apartment.last_rent.status.charAt(0).toUpperCase() +
                                      apartment.last_rent.status.slice(1)}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {apartment.last_rent.month}/{apartment.last_rent.year}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">N/A</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">N/A</td>
                            </>
                          )}

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-[#3F3D56] hover:text-[#2d2b40] mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing 5 of 124 apartments</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-[#3F3D56] text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                  <p className="text-gray-600">Create and manage community events.</p>
                </div>
                <button onClick={() => {router.push("/manager/dashboard/event/create")}} className="bg-[#3F3D56] text-white px-4 py-2 rounded-lg flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Event
                </button>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Events</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Completed Events</p>
                  <p className="text-2xl font-semibold text-gray-900">16</p>
                </div>
              </div>

              {/* Event Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">All Events</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[250px]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Event Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Participants
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    {events && (
                      <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {event.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.date_time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.local}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {event.current_ocupation} | {event.capacity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  event.status === "active" ? "bg-blue-100 text-green-800" : "bg-red-800 text-white"
                                }`}
                              >
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-[#3F3D56] hover:text-[#2d2b40] mr-3">Edit</button>
                              {event.status === "active" ? (
                                <button
                                  onClick={() => handleConcludeEvent(event)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  Conclude
                                </button>
                              ) : (
                                <button className="text-gray-500">Concluded</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing 4 of 24 events</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-[#3F3D56] text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === "marketplace" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
                  <p className="text-gray-600">Review and moderate marketplace listings.</p>
                </div>
              </div>

              {/* Marketplace Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardInfo?.listings?.length ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Active Listings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardInfo?.listings?.filter((li) => li.status === "active").length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Sold Items</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardInfo?.listings?.filter((li) => li.status !== "active").length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Revenue from Fees</p>
                  <p className="text-2xl font-semibold text-gray-900">$1,500</p>
                </div>
              </div>

              {/* Marketplace Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">All Listings</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search listings..."
                      className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-[250px]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Seller
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Buy Now Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Current Bid
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Listed Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardInfo.listings?.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {listing.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.seller.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{listing.buy_now_price}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {listing.current_bid.bid_ammount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                listing.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="text-[#3F3D56] hover:text-[#2d2b40] mr-3"
                              onClick={() => {
                                router.push(`http://localhost:3000/marketplace/${listing.id}`)
                              }}
                            >
                              View
                            </button>
                            <button className="text-red-600 hover:text-red-800">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing 4 of 56 listings</p>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 bg-[#3F3D56] text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Finances Tab */}
          {activeTab === "finances" && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                <p className="text-gray-600">Track revenue, expenses, and financial metrics.</p>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">{financialData.totalRevenue}</p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>8% from last month</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Expenses</p>
                  <p className="text-2xl font-semibold text-gray-900">{financialData.expenses}</p>
                  <div className="mt-2 flex items-center text-xs text-red-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>3% from last month</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Net Profit</p>
                  <p className="text-2xl font-semibold text-gray-900">{financialData.netProfit}</p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>10% from last month</span>
                  </div>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Revenue Breakdown</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Rent Collected</span>
                          <span className="text-sm font-medium text-gray-900">{financialData.rentCollected}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#3F3D56] h-2 rounded-full" style={{ width: "90%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Marketplace Fees</span>
                          <span className="text-sm font-medium text-gray-900">{financialData.marketplaceFees}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#3F3D56] h-2 rounded-full" style={{ width: "6%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700">Event Fees</span>
                          <span className="text-sm font-medium text-gray-900">{financialData.eventFees}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#3F3D56] h-2 rounded-full" style={{ width: "4%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Rent Payment</p>
                          <p className="text-xs text-gray-500">Sarah Johnson (A101)</p>
                          <p className="text-xs text-gray-400">Today, 9:30 AM</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">+$1,200</div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Marketplace Fee</p>
                          <p className="text-xs text-gray-500">Mountain Bike Sale</p>
                          <p className="text-xs text-gray-400">Yesterday, 2:15 PM</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">+$35</div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-red-100 mr-3">
                          <DollarSign className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Maintenance Expense</p>
                          <p className="text-xs text-gray-500">Plumbing Repairs</p>
                          <p className="text-xs text-gray-400">May 8, 11:30 AM</p>
                        </div>
                        <div className="text-sm font-medium text-red-600">-$450</div>
                      </div>
                      <div className="flex items-start">
                        <div className="p-2 rounded-full bg-green-100 mr-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Rent Payment</p>
                          <p className="text-xs text-gray-500">Emily Davis (A104)</p>
                          <p className="text-xs text-gray-400">May 2, 10:15 AM</p>
                        </div>
                        <div className="text-sm font-medium text-green-600">+$1,100</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Monthly Revenue</h2>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-end space-x-2">
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56] h-[60%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Jan</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56] h-[70%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Feb</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56] h-[65%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Mar</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56] h-[80%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Apr</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56] h-[90%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">May</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[75%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Jun</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[85%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Jul</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[80%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Aug</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[90%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Sep</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[85%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Oct</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[75%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Nov</p>
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div className="bg-[#3F3D56]/30 h-[95%] rounded-t-md"></div>
                      <p className="text-xs text-center mt-2 text-gray-500">Dec</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Conclude Event Modal */}
      {concludeEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Conclude Event: {selectedEvent.name}</h3>
              <button onClick={() => setConcludeEventModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select which participants attended the event and should receive points or rewards.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span>{selectedEvent.date_time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span>{selectedEvent.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span>{selectedEvent.local}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                    <Users className="h-3 w-3 text-gray-500" />
                    <span>{selectedEvent.current_ocupation} participants</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Resident
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Apartment
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Award Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventParticipants.map((participant) => {
                        const isRewarded = rewardedIds.includes(participant.id);

                        return (
                        <tr key={participant.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participant.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {participant.apartment_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {isRewarded ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Yes
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <X className="h-3 w-3 mr-1" />
                                No
                                </span>
                            )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <button
                                onClick={() => toggleAwardStatus(participant.id)}
                                className="px-3 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                {isRewarded ? "Selected" : "Select"}
                            </button>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>

                </table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Selected: {rewardedIds.length} participants
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConcludeEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={finalizeEventConclusion}
                    className="px-4 py-2 bg-[#3F3D56] text-white rounded-lg text-sm font-medium hover:bg-[#2d2b40]"
                  >
                    Conclude Event & Award Points
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
