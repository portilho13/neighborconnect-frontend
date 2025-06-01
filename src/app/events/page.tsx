"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Users, MapPin, Clock, Filter, ChevronDown } from "lucide-react"
import useUserStore from "../../../lib/userStore"
import type { CommunityEvent } from "../../../lib/types/CommunityEvent"
import Header from "../../../components/header"
import Footer from "../../../components/footer"

export default function Activities() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [joinedEventIds, setJoinedEventIds] = useState<number[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CommunityEvent[]>([])

  // Filter states
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [location, setLocation] = useState<string>("All Locations")
  const [sortBy, setSortBy] = useState<string>("Latest")

  const user = useUserStore((state) => state.user)

  // Calendar day type
  interface CalendarDay {
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    hasEvent: boolean
  }

  // Generate calendar days
const generateCalendarDays = (): CalendarDay[] => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const today = now.getDate()

  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const prevMonth = new Date(currentYear, currentMonth - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()

  const days: CalendarDay[] = []

  // Default events to empty array if null or undefined
  const safeEvents = Array.isArray(events) ? events : []

  // Add days from previous month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const hasEvent = safeEvents.some((event: CommunityEvent) => {
      const eventDate = new Date(event.date_time)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      )
    })

    days.push({
      day,
      isCurrentMonth: true,
      isToday: day === today,
      hasEvent,
    })
  }

  // Add days from next month to fill the grid (42 days total - 6 weeks)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      hasEvent: false,
    })
  }

  return days
}


  const calendarDays = generateCalendarDays()

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event`)

      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch events")
      }

      const data = await res.json()
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      console.error(error)
    }
  }

  const applyFilters = () => {
    let filtered = [...(events || [])];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date_time)
        const filterDate = new Date(startDate)
        return eventDate >= filterDate
      })
    }

    if (endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date_time)
        const filterDate = new Date(endDate)
        return eventDate <= filterDate
      })
    }

    // Filter by location
    if (location !== "All Locations") {
      filtered = filtered.filter((event) => event.local === location)
    }

    // Apply sorting
    if (sortBy === "Latest") {
      filtered.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
    } else if (sortBy === "Oldest") {
      filtered.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    } else if (sortBy === "Most Popular") {
      filtered.sort((a, b) => b.current_ocupation - a.current_ocupation)
    } else if (sortBy === "Upcoming") {
      const now = new Date()
      filtered = filtered.filter((event) => new Date(event.date_time) > now)
      filtered.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
    }

    setFilteredEvents(filtered)
  }

  const fetchUserEventsList = async (event_id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event/users?event_id=${event_id}`)
      if (!res.ok) throw new Error(await res.text())

      const users: { id: number }[] = await res.json()
      if (users) {
        if (users.some((u) => u.id === user?.id)) {
          setJoinedEventIds((prev) => [...prev, event_id])
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (events && user?.id) {
      events.forEach((event) => {
        fetchUserEventsList(event.id)
      })
    }
  }, [events, user])

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [startDate, endDate, location, sortBy, events])

  const joinActivity = async (event_id: number, user_id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/event/add`, {
        method: "POST",
        body: JSON.stringify({
          community_event_id: event_id,
          user_id: user_id,
        }),
      })

      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }
      setJoinedEventIds([...joinedEventIds, event_id])

      // Update event's current_ocupation
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === event_id ? { ...event, current_ocupation: event.current_ocupation + 1 } : event,
        ),
      )
      applyFilters()
    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header></Header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Events</h1>
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
              <select
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option>All Locations</option>
                {/* Get unique locations from events */}
                {Array.from(new Set(events.map((event) => event.local))).map((loc) => (
                  <option key={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-[#3F3D56] text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-[#2d2b40] transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Featured activities */}
        {filteredEvents && filteredEvents.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Activities</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const eventDate = new Date(event.date_time)
                const formattedDate = eventDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                const formattedStart = eventDate.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })

                const endTime = new Date(eventDate.getTime() + event.duration / 1000000).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.event_image || "/placeholder.svg?height=200&width=400"}
                        alt={event.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-xl text-gray-900 mb-2">{event.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{(event.percentage * 100).toFixed(2)}% Reward</p>
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-[#3F3D56]" />
                          {formattedDate}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-[#3F3D56]" />
                          {formattedStart} - {endTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-[#3F3D56]" />
                          {event.local}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-[#3F3D56]" />
                          {event.current_ocupation}/{event.capacity} participants
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {joinedEventIds.includes(event.id) ? (
                          <div className="flex-1 bg-gray-100 text-gray-500 py-2 rounded-md text-sm font-medium text-center cursor-not-allowed">
                            You&apos;re already joined
                          </div>
                        ) : (
                          <button
                            onClick={() => joinActivity(event.id, Number(user?.id))}
                            className="flex-1 bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-2 rounded-md text-sm font-medium transition-colors"
                            disabled={event.current_ocupation >= event.capacity}
                          >
                            {event.current_ocupation >= event.capacity ? "Event Full" : "Join Activity"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found matching your criteria.</p>
          </div>
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
              {calendarDays.map((day: CalendarDay, index: number) => (
                <div
                  key={index}
                  className={`aspect-square p-1 border rounded-md ${
                    day.isCurrentMonth ? "border-gray-200" : "border-gray-100 bg-gray-50"
                  } ${day.isToday ? "border-[#3F3D56] bg-[#3F3D56]/5" : ""}`}
                >
                  <div className="h-full w-full flex flex-col">
                    <span
                      className={`text-xs ${
                        day.isCurrentMonth ? "text-gray-700" : "text-gray-400"
                      } ${day.isToday ? "font-bold text-[#3F3D56]" : ""}`}
                    >
                      {day.day}
                    </span>
                    {day.hasEvent && (
                      <div className="mt-auto">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#3F3D56]"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer></Footer>
    </div>
  )
}
