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
import type { CommunityEvent } from "../../../../lib/types/CommunityEvent"
import type { ManagerDashboardInfo } from "../../../../lib/types/ManagerDashboardInfo"
import type { UserInfo } from "../../../../lib/types/UserInfo"
import type { Apartment } from "../../../../lib/types/Apartment"

export default function ManagerDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [concludeEventModal, setConcludeEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent>()
  const [dashboardInfo, setDashboardInfo] = useState<ManagerDashboardInfo>()
  const [eventParticipants, setEventParticipants] = useState<UserInfo[]>([])
  const [rewardedIds, setRewardedIds] = useState<number[]>([])

  const router = useRouter()

  const { user, isAuthenticated, hasHydrated, logout } = useUserStore()

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event/users?event_id=${id}`)
      if (!res.ok) throw new Error(await res.text())

      const data: UserInfo[] = await res.json()
      setEventParticipants(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login/manager")
  }

  const fetchDashboardInfo = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/manager/dashboard/info?manager_id=${id}`)
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
    {
      title: "Monthly Revenue",
      value: `€${dashboardInfo?.manager_transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0}`,
      change: null,
      icon: DollarSign,
    },
    { title: "Marketplace Listings", value: dashboardInfo?.listings?.length ?? 0, change: null, icon: ShoppingBag },
    {
      title: "Active Events",
      value: dashboardInfo?.events?.filter((event) => event.status === "active").length ?? 0,
      change: null,
      icon: Calendar,
    },
  ]

  const events = dashboardInfo?.events

  // Function to handle concluding an event
  const handleConcludeEvent = async (event: CommunityEvent) => {
    if (!event.id) return
    await fetchParticipants(event.id)

    setSelectedEvent(event)
    setConcludeEventModal(true)
  }

  const toggleAwardStatus = (participantId: number) => {
    setRewardedIds((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  // Function to finalize event conclusion
  const finalizeEventConclusion = async () => {
    try {
      if (!selectedEvent) throw new Error("Event must be selected")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event/conclude`, {
        method: "POST",
        body: JSON.stringify({
          community_event_id: selectedEvent.id,
          awarded_users_ids: rewardedIds,
        }),
      })

      if (!res.ok) throw new Error(await res.text())
    } catch (error) {
      console.error(error)
    } finally {
      setConcludeEventModal(false)
    }
  }

  const handleDeleteApartment = async (apartmentId: number) => {
    if (!confirm("Are you sure you want to delete this apartment? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/apartment?apartment_id=${apartmentId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error(await res.text())

      // Refresh dashboard data
      if (user?.id) {
        await fetchDashboardInfo(user.id)
      }
    } catch (error) {
      console.error("Error deleting apartment:", error)
      alert("Failed to delete apartment. Please try again.")
    }
  }

  const handleDeleteListing = async (listingId: number) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing?listing_id=${listingId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error(await res.text())

      // Refresh dashboard data
      if (user?.id) {
        await fetchDashboardInfo(user.id)
      }
    } catch (error) {
      console.error("Error deleting listing:", error)
      alert("Failed to delete listing. Please try again.")
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
            <span className="font-bold text-lg text-gray-900">NeighborConnect</span>
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
            <button onClick={() => handleLogout()} className="ml-auto p-1 rounded-full text-gray-400 hover:text-gray-500">
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
                NeigborConnect
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
                <p className="text-gray-600">Welcome back, {user?.name}. Here&apos;s what&apos;s happening today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                      {dashboardInfo?.manager_activities && dashboardInfo.manager_activities.length > 0 ? (
                        dashboardInfo.manager_activities.map((activity) => {
                          // Determine icon based on activity type
                          let IconComponent = DollarSign
                          let iconBgColor = "bg-green-100"
                          let iconColor = "text-green-600"

                          if (activity.type.toLowerCase().includes("rent")) {
                            IconComponent = DollarSign
                            iconBgColor = "bg-green-100"
                            iconColor = "text-green-600"
                          } else if (activity.type.toLowerCase().includes("resident")) {
                            IconComponent = Users
                            iconBgColor = "bg-[#3F3D56]/10"
                            iconColor = "text-[#3F3D56]"
                          } else if (activity.type.toLowerCase().includes("event")) {
                            IconComponent = Calendar
                            iconBgColor = "bg-orange-100"
                            iconColor = "text-orange-600"
                          } else if (activity.type.toLowerCase().includes("marketplace")) {
                            IconComponent = ShoppingBag
                            iconBgColor = "bg-red-100"
                            iconColor = "text-red-600"
                          }

                          return (
                            <div key={activity.id} className="flex items-start">
                              <div className={`p-2 rounded-full ${iconBgColor} mr-3`}>
                                <IconComponent className={`h-5 w-5 ${iconColor}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                                <p className="text-xs text-gray-500">{activity.description}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(activity.created_at).toLocaleDateString()}{" "}
                                  {new Date(activity.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-gray-500">No recent activities</p>
                      )}
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
                      <div className="grid grid-cols-1 gap-4">
                        {dashboardInfo?.events.slice(0, 3).map((event) => {
                          const eventDate = new Date(event.date_time)
                          const dateString = eventDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                          const timeString = eventDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          const occupancyPercentage = (event.current_ocupation / event.capacity) * 100

                          return (
                            <div
                              key={event.id}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-[#3F3D56]/10">
                                    <Calendar className="h-5 w-5 text-[#3F3D56]" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                                    <p className="text-sm text-gray-600">{event.local}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="bg-[#3F3D56] text-white text-xs font-medium px-2 py-1 rounded">
                                    {dateString}
                                  </div>
                                  {event.status === "active" && (
                                    <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded mt-1">
                                      Active
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">{timeString}</span>
                                <span className="text-sm text-gray-600">
                                  {event.current_ocupation}/{event.capacity} participants
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div
                                  className="bg-[#3F3D56] h-2 rounded-full"
                                  style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                                ></div>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{occupancyPercentage.toFixed(0)}% full</span>
                                <button
                                  onClick={() => setActiveTab("events")}
                                  className="text-sm text-[#3F3D56] hover:underline font-medium"
                                >
                                  Manage →
                                </button>
                              </div>
                            </div>
                          )
                        })}
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
                        {dashboardInfo?.listings
                          ?.filter((listing) => listing.status === "active")
                          .slice(0, 3)
                          .map((listing) => (
                            <div key={listing.id} className="flex items-start">
                              <div className="p-2 rounded-lg bg-[#3F3D56]/10 mr-3 flex-shrink-0">
                                <ShoppingBag className="h-5 w-5 text-[#3F3D56]" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{listing.name}</p>
                                <p className="text-xs text-gray-500">
                                  {listing.seller.name} • {listing.buy_now_price}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Listed on {new Date(listing.created_at).toLocaleDateString()}
                                </p>
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
                            <button
                              onClick={() => handleDeleteApartment(apartment.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
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
                <button
                  onClick={() => {
                    router.push("/manager/dashboard/event/create")
                  }}
                  className="bg-[#3F3D56] text-white px-4 py-2 rounded-lg flex items-center"
                >
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(event.date_time).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
                              {new Date(event.date_time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </td>
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
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
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

          {/* Residents Tab */}
          {activeTab === "residents" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Residents Management</h1>
                  <p className="text-gray-600">View and manage all residents in your building.</p>
                </div>
              </div>

              {/* Residents Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Residents</p>
                  <p className="text-2xl font-semibold text-gray-900">{dashboardInfo?.users?.length ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Active Residents</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardInfo?.users?.filter((user) => user.apartment_id !== null).length ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Vacant Units</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      (dashboardInfo?.apartments ?? []).filter(
                        (apartment: Apartment) => apartment.status === "unoccupied",
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* Residents Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-900">All Residents</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search residents..."
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
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Phone
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Apartment
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
                      {dashboardInfo?.users?.map((resident) => (
                        <tr key={resident.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {resident.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {resident.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resident.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resident.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {resident.apartment_id ? `Apt ${resident.apartment_id}` : "Unassigned"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                resident.apartment_id ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {resident.apartment_id ? "Active" : "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-[#3F3D56] hover:text-[#2d2b40] mr-3">View</button>
                            <button className="text-red-600 hover:text-red-800">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing {dashboardInfo?.users?.length ?? 0} residents</p>
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
                  <p className="text-2xl font-semibold text-gray-900">
                    €
                    {dashboardInfo?.manager_transactions?.reduce((sum, transaction) => sum + transaction.amount, 0) ||
                      0}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>From {dashboardInfo?.manager_transactions?.length || 0} transactions</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Rent Collected</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    €
                    {dashboardInfo?.manager_transactions
                      ?.filter((t) => t.type === "rent")
                      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>
                      From {dashboardInfo?.manager_transactions?.filter((t) => t.type === "rent").length || 0} payments
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Marketplace Fees</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    €
                    {dashboardInfo?.manager_transactions
                      ?.filter((t) => t.type === "Fee")
                      .reduce((sum, transaction) => sum + transaction.amount, 0) || 0}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>
                      From {dashboardInfo?.manager_transactions?.filter((t) => t.type === "Fee").length || 0}{" "}
                      transactions
                    </span>
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
                      {(() => {
                        const totalRevenue =
                          dashboardInfo?.manager_transactions?.reduce(
                            (sum, transaction) => sum + transaction.amount,
                            0,
                          ) || 0

                        // Group by transaction type
                        const revenueByType: Record<string, number> = {}
                        dashboardInfo?.manager_transactions?.forEach((transaction) => {
                          if (!revenueByType[transaction.type]) {
                            revenueByType[transaction.type] = 0
                          }
                          revenueByType[transaction.type] += transaction.amount
                        })

                        return Object.entries(revenueByType).map(([type, amount]) => {
                          const percentage = totalRevenue > 0 ? ((amount as number) / totalRevenue) * 100 : 0

                          return (
                            <div key={type}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700">
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </span>
                                <span className="text-sm font-medium text-gray-900">€{amount}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#3F3D56] h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {dashboardInfo?.manager_transactions && dashboardInfo.manager_transactions.length > 0 ? (
                        dashboardInfo.manager_transactions.map((transaction) => {
                          // Determine icon based on transaction type
                          const iconBgColor = transaction.type.toLowerCase() === "fee" ? "bg-blue-100" : "bg-green-100"
                          const iconColor =
                            transaction.type.toLowerCase() === "fee" ? "text-blue-600" : "text-green-600"
                          const amountColor = "text-green-600"
                          const amountPrefix = "+"

                          return (
                            <div key={transaction.id} className="flex items-start">
                              <div className={`p-2 rounded-full ${iconBgColor} mr-3`}>
                                <DollarSign className={`h-5 w-5 ${iconColor}`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </p>
                                <p className="text-xs text-gray-500">{transaction.description}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className={`text-sm font-medium ${amountColor}`}>
                                {amountPrefix}€{transaction.amount}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-gray-500">No recent transactions</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Chart - Keep this as is for now */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Monthly Revenue</h2>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-end space-x-2">
                    {(() => {
                      // Create an array of months
                      const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]

                      // Group transactions by month
                      const monthlyRevenue = Array(12).fill(0)

                      if (dashboardInfo?.manager_transactions) {
                        dashboardInfo.manager_transactions.forEach((transaction) => {
                          const date = new Date(transaction.date)
                          const month = date.getMonth()
                          monthlyRevenue[month] += transaction.amount
                        })
                      }

                      // Find the maximum revenue for scaling
                      const maxRevenue = Math.max(...monthlyRevenue, 1) // Avoid division by zero

                      // Current month for highlighting
                      const currentMonth = new Date().getMonth()

                      return months.map((month, index) => {
                        const height = monthlyRevenue[index] > 0 ? (monthlyRevenue[index] / maxRevenue) * 100 : 0

                        const isCurrentMonth = index === currentMonth
                        const isPastMonth = index <= currentMonth

                        return (
                          <div key={month} className="flex-1 flex flex-col justify-end">
                            <div
                              className={`${isPastMonth ? "bg-[#3F3D56]" : "bg-[#3F3D56]/30"} ${isCurrentMonth ? "ring-2 ring-[#3F3D56]" : ""} h-[${Math.max(height, 5)}%] rounded-t-md relative group`}
                            >
                              {monthlyRevenue[index] > 0 && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                  €{monthlyRevenue[index]}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-500">{month}</p>
                          </div>
                        )
                      })
                    })()}
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
                      const isRewarded = rewardedIds.includes(participant.id)

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
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">Selected: {rewardedIds.length} participants</p>
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
