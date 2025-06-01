"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Clock, Share2 } from "lucide-react"
import useUserStore from "../lib/userStore"
import { BidInfo } from "../lib/types/BidInfo"
import { Listing } from "../lib/types/Listing"
import Header from "./header"
import Footer from "./footer"




interface RelatedListing {
  id: number
  name: string
  image: string
  current_bid: number
  buy_now_price: number
}

interface ListingDetailProps {
  id: string
}

export default function ListingDetail({ id }: ListingDetailProps) {
  const router = useRouter()
  const [listing, setListing] = useState<Listing>()
  const [isLoading, setIsLoading] = useState(true)
  const [bid, setBid] = useState<BidInfo>()
  const [bidAmount, setBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const dateNow = new Date()
      if (listing?.expiration_date && new Date(listing.expiration_date) <= dateNow) {
        router.push("/marketplace")
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [listing?.expiration_date, router])

  // Get current image URL
  const currentImageUrl =
    listing?.listing_photos && listing.listing_photos.length > 0 && currentImageIndex < listing.listing_photos.length
      ? listing.listing_photos[currentImageIndex].url
      : "/placeholder.svg?height=400&width=400"

  // Navigation functions
  const nextImage = () => {
    if (listing?.listing_photos && listing.listing_photos.length > 0) {
      setCurrentImageIndex((prev) => (prev === listing.listing_photos?.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (listing?.listing_photos && listing.listing_photos.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.listing_photos.length - 1 : prev - 1))
    }
  }

  const handlePlaceBid = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bid/`, {
      method: "POST",
      body: JSON.stringify({
        bid_ammount: Number(bidAmount),
        users_id: user?.id,
        listing_id: Number(id),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create listing")
    }
  }

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    }
  }, [hasHydrated, isAuthenticated, user, router])

  // Sample related listings
  const relatedListings: RelatedListing[] = [
    {
      id: 1,
      name: "Vintage Camera",
      image: "/placeholder.svg?height=200&width=200",
      current_bid: 120,
      buy_now_price: 180,
    },
    {
      id: 2,
      name: "Antique Watch",
      image: "/placeholder.svg?height=200&width=200",
      current_bid: 250,
      buy_now_price: 300,
    },
    {
      id: 3,
      name: "Collectible Coins",
      image: "/placeholder.svg?height=200&width=200",
      current_bid: 75,
      buy_now_price: 100,
    },
    {
      id: 4,
      name: "Rare Book",
      image: "/placeholder.svg?height=200&width=200",
      current_bid: 90,
      buy_now_price: 120,
    },
  ]

  const fetchListing = async (id: number) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing?id=${id}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch")
      }

      const data: Listing = await res.json()

      setListing(data)
      setCurrentImageIndex(0) // Reset to first image when new listing is loaded
    } catch (error) {
      console.error("Error fetching listing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch listing data
  useEffect(() => {
    const wsUrl = `ws://localhost:1234/ws?listing_id=${id}`
    const socket = new WebSocket(wsUrl)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        const bid: BidInfo = {
          id: data.id ?? null,
          bid_ammount: data.bid_ammount,
          bid_time: new Date(),
          users_id: data.users_id ?? null,
          listing_id: data.listing_id,
        }

        setBid(bid)
      } catch (err) {
        console.error("Failed to parse bid info:", err)
      }
    }

    fetchListing(Number(id))

    return () => {
      socket.close()
    }
  }, [id])

  // Calculate time left until expiration
  useEffect(() => {
    if (!listing) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const expiration = new Date(listing.expiration_date)
      const difference = expiration.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft("Auction ended")
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000) // Update every second instead of every minute

    return () => clearInterval(timer)
  }, [listing])

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(bidAmount)

    if (isNaN(amount) || amount <= (listing?.current_bid.bid_ammount || 0)) {
      alert("Please enter a bid higher than the current bid")
      return
    }

    setBidAmount("")
  }

  const handleBuyNow = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/buy/`, {
        method: "POST",
        body: JSON.stringify({
          listing_id: Number(id),
          user_id: Number(user?.id),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to buy listing")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#3F3D56] border-gray-200 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-md transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header></Header>

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

        {/* Listing Detail */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Carousel */}
            <div className="order-2 lg:order-1">
              {/* Main Carousel */}
              <div className="relative mb-4">
                {listing.listing_photos && listing.listing_photos.length > 0 ? (
                  <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={currentImageUrl || "/placeholder.svg"}
                      alt={`${listing.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                      }}
                    />

                    {/* Navigation arrows */}
                    {listing.listing_photos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                          aria-label="Previous image"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                          aria-label="Next image"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-700 rotate-180" />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-50/80 py-2 px-3 text-sm text-gray-500 text-center">
                      Image {currentImageIndex + 1} of {listing.listing_photos.length}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails carousel */}
              {listing.listing_photos && listing.listing_photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {listing.listing_photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative min-w-[60px] w-[60px] h-[60px] rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? "border-[#3F3D56]" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={photo.url || "/placeholder.svg?height=60&width=60"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=60&width=60"
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Info */}
            <div className="order-1 lg:order-2">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{listing.name}</h1>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#3F3D56]/10 text-[#3F3D56] text-sm font-medium px-3 py-1 rounded-full">
                  {listing.category.name}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{timeLeft} left</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600">{listing.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Seller Information</h2>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                    <span className="font-medium text-sm">
                      {listing.seller.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{listing.seller.name}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Starting Price</p>
                    <p className="text-lg font-medium text-gray-900">${listing.start_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Bid</p>
                    <p className="text-lg font-medium text-gray-900">${bid?.bid_ammount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className={`text-md ${bid?.users_id == user?.id ? "text-green-600" : "text-red-600"}`}>
                      {bid?.users_id == user?.id ? "You are Winning !" : "You NOT Winning"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBid} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={listing?.current_bid ? listing.current_bid.bid_ammount + 0.01 : 0.01}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`${(listing?.current_bid ? listing.current_bid.bid_ammount + 1 : 1).toFixed(2)} or higher`}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F3D56] focus:border-transparent"
                        required
                      />
                    </div>
                    {listing?.seller.id !== user?.id ? (
                    <button
                      type="submit"
                      className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-md transition-colors"
                      onClick={handlePlaceBid}
                    >
                      Place Bid
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-md border border-gray-300 text-gray-500 text-center">
                      You&apos;re the Seller
                    </div>
                  )}

                  </div>
                </form>
                {listing?.seller.id !== user?.id ? (
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-3 rounded-md text-sm font-medium transition-colors"
                >
                  Buy Now for ${listing?.buy_now_price.toFixed(2)}
                </button>
              ) : (
                <div className="w-full text-center py-3 text-gray-500 font-medium border border-gray-300 rounded-md">
                  You&apos;re the Seller
                </div>
              )}

              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Related Listings</h2>
            <Link href="/marketplace" className="text-[#3F3D56] text-sm hover:underline flex items-center">
              See All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
              >
                <div className="relative h-48 w-full">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Bid</span>
                      <span className="font-medium text-gray-900">${item.current_bid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Buy Now Price</span>
                      <span className="font-medium text-gray-900">${item.buy_now_price}</span>
                    </div>
                  </div>
                  <button className="w-full bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors">
                    See more
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer></Footer>
    </div>
  )
}
