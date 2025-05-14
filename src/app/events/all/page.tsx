"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  Building,
  LogOut,
  Clock,
  MapPin,
  Filter,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { CommunityEvent } from "../../../../lib/types/CommunityEvent"


export default function EventsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [concludeEventModal, setConcludeEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null)
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  // Mock user data - in a real app, this would come from authentication
  const user = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  }


  // Function to handle concluding an event
  const handleConcludeEvent = (event: CommunityEvent) => {
    setSelectedEvent(event)
    setConcludeEventModal(true)
  }

  // Function to filter events
  const filteredEvents = events.filter((event) => {
    // Filter by search query
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.local.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by status
    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "upcoming") {
      return matchesSearch && new Date(event.date_time.split(" - ")[0]) > new Date()
    }
    if (activeFilter === "past") {
      return matchesSearch && new Date(event.date_time.split(" - ")[0]) < new Date()
    }

    return matchesSearch
  })

  // Mock data for event participants
  const eventParticipants = [
    { id: 1, name: "Sarah Johnson", apartment: "A101", attended: true, awarded: false },
    { id: 2, name: "Michael Chen", apartment: "A103", attended: true, awarded: false },
    { id: 3, name: "Emily Davis", apartment: "A104", attended: true, awarded: false },
    { id: 4, name: "David Wilson", apartment: "A107", attended: false, awarded: false },
    { id: 5, name: "Jessica Brown", apartment: "A110", attended: true, awarded: false },
    { id: 6, name: "Robert Taylor", apartment: "A112", attended: true, awarded: false },
    { id: 7, name: "Amanda White", apartment: "A115", attended: false, awarded: false },
    { id: 8, name: "James Martin", apartment: "A118", attended: true, awarded: false },
  ]

  // Function to toggle award status for a participant
  const toggleAwardStatus = (participantId: number) => {
    // In a real app, you would update the state here
    console.log("Toggled award status for participant:", participantId)
  }

  // Function to finalize event conclusion
  const finalizeEventConclusion = () => {
    // In a real app, you would update the event status and award points
    console.log("Event concluded:", selectedEvent)
    setConcludeEventModal(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading events...</div>
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
            <Link
              href="/manager/dashboard"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Home className="mr-3 h-5 w-5" />
              Overview
            </Link>

            <Link
              href="/manager/dashboard/apartments"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Building className="mr-3 h-5 w-5" />
              Apartments
            </Link>

            <Link
              href="/manager/dashboard/events"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md bg-[#3F3D56] text-white"
            >
              <Calendar className="mr-3 h-5 w-5" />
              Events
            </Link>

            <Link
              href="/manager/dashboard/marketplace"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              Marketplace
            </Link>

            <Link
              href="/manager/dashboard/residents"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Users className="mr-3 h-5 w-5" />
              Residents
            </Link>

            <Link
              href="/manager/dashboard/finances"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <DollarSign className="mr-3 h-5 w-5" />
              Finances
            </Link>

            <Link
              href="/manager/dashboard/settings"
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
              <span className="font-medium text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
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
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  <span className="font-medium text-sm">{user.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-3 px-4">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                  <span className="font-medium text-sm">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <p className="text-xs text-gray-500">Building Manager</p>
                </div>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              <nav className="flex flex-col space-y-3">
                <Link
                  href="/manager/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Home className="mr-3 h-5 w-5" />
                  Overview
                </Link>

                <Link
                  href="/manager/dashboard/apartments"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Building className="mr-3 h-5 w-5" />
                  Apartments
                </Link>

                <Link
                  href="/manager/dashboard/events"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-[#3F3D56] text-white"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Events
                </Link>

                <Link
                  href="/manager/dashboard/marketplace"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  Marketplace
                </Link>

                <Link
                  href="/manager/dashboard/residents"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Users className="mr-3 h-5 w-5" />
                  Residents
                </Link>

                <Link
                  href="/manager/dashboard/finances"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <DollarSign className="mr-3 h-5 w-5" />
                  Finances
                </Link>

                <Link
                  href="/manager/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Community Events</h1>
                <p className="text-gray-600">Manage and view all community events</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative md:hidden">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                <button className="bg-[#3F3D56] text-white px-4 py-2 rounded-lg flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Create Event
                </button>
              </div>
            </div>

            {/* Event Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                  activeFilter === "all"
                    ? "bg-[#3F3D56] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                All Events
              </button>
              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                  activeFilter === "upcoming"
                    ? "bg-[#3F3D56] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter("past")}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                  activeFilter === "past"
                    ? "bg-[#3F3D56] text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Past Events
              </button>
            </div>

            {/* Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={event.event_image || "/placeholder.svg"}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-4 text-white">
                        <h3 className="font-bold text-lg">{event.name}</h3>
                        <div className="flex items-center text-sm mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{event.date_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{event.local}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{event.duration}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Capacity</span>
                          <span className="font-medium">
                            {event.current_ocupation} / {event.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#3F3D56] h-2 rounded-full"
                            style={{ width: `${(event.current_ocupation / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Code: {event.code}
                        </span>
                        <div className="flex gap-2">
                          <button
                            className="text-[#3F3D56] hover:text-[#2d2b40] text-sm font-medium"
                            onClick={() => router.push(`/manager/dashboard/events/${event.id}`)}
                          >
                            Details
                          </button>
                          {new Date(event.date_time.split(" - ")[0]) < new Date() && (
                            <button
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                              onClick={() => handleConcludeEvent(event)}
                            >
                              Conclude
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                  <p className="text-gray-500 mb-4">There are no events matching your search criteria.</p>
                  <button
                    className="bg-[#3F3D56] text-white px-4 py-2 rounded-lg flex items-center"
                    onClick={() => {
                      setSearchQuery("")
                      setActiveFilter("all")
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Attended
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Award Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eventParticipants.map((participant) => (
                      <tr key={participant.id} className={!participant.attended ? "bg-gray-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.apartment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {participant.attended ? (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {participant.attended && (
                            <button
                              onClick={() => toggleAwardStatus(participant.id)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                participant.awarded
                                  ? "bg-[#3F3D56] text-white"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              }`}
                            >
                              {participant.awarded ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Selected
                                </>
                              ) : (
                                "Select"
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Selected: {eventParticipants.filter((p) => p.awarded).length} participants
                  </p>
                  <p className="text-xs text-gray-500">Each participant will receive 50 points</p>
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
