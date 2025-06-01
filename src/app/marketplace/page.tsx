"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Plus } from "lucide-react"
import useUserStore from "../../../lib/userStore"
import { useRouter } from "next/navigation"
import Header from "../../../components/header"
import Footer from "../../../components/footer"
import { Listing } from "../../../lib/types/Listing"
import { Category } from "../../../lib/types/Category"

export default function Marketplace() {
  const router = useRouter()

  const handleMarketListingRedirect = (listing_id: number) => {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/${listing_id}`)
  }

  const [listings, setListings] = useState<Listing[]>([])
  const [myAuctions, setMyAuctions] = useState<Listing[]>([])

  const [categories, setCategories] = useState<Category[]>([])

  const { user, isAuthenticated, hasHydrated } = useUserStore()

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const fetchListings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing/all`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }

      const data: Listing[] = await res.json()

      setListings(data)

      const myAuctionsArr: Listing[] = []

      if (listings && listings.length > 0) {
        data.forEach((listing: Listing) => {
          console.log(listing.id)
          if (user?.id == listing.seller.id) {
            myAuctionsArr.push(listing)
          }
        })
      }
      setMyAuctions(myAuctionsArr)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/category`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }

      setCategories(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  // Filter listings based on selected category
  const filteredListings = selectedCategory
    ? listings.filter((listing) => listing.category.id === selectedCategory)
    : listings

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    } else if (user?.apartmentId) {
      fetchListings(), fetchCategories()
    }
  }, [hasHydrated, isAuthenticated, user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header></Header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Create Listing Button */}
        <div className="mb-8 flex justify-end">
          <Link
            href="/marketplace/create"
            className="flex items-center gap-2 bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Listing</span>
          </Link>
        </div>

        {categories && categories.length > 0 && (
          <>
            {/* Categories section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${
                    selectedCategory === null
                      ? "bg-[#3F3D56] text-white border-[#3F3D56]"
                      : "bg-white hover:bg-[#3F3D56] text-[#3F3D56] hover:text-white border-[#3F3D56]"
                  }`}
                >
                  All
                </button>
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${
                      selectedCategory === category.id
                        ? "bg-[#3F3D56] text-white border-[#3F3D56]"
                        : "bg-white hover:bg-[#3F3D56] text-[#3F3D56] hover:text-white border-[#3F3D56]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {filteredListings && filteredListings.length > 0 && (
          <>
            {/* Trending Auction section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory
                    ? `${categories.find((cat) => cat.id === selectedCategory)?.name} Auctions`
                    : "Trending Auction"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredListings.map((auction, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
                    onClick={() => handleMarketListingRedirect(auction.id)}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={auction.listing_photos[0].url || "/placeholder.svg"}
                        alt={auction.name}
                        fill
                        className="object-cover"
                      />
                      <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{auction.name}</h3>
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Bid</span>
                          <span className="font-medium text-gray-900">${auction.current_bid.bid_ammount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Buy Now Price</span>
                          <span className="font-medium text-gray-900">${auction.buy_now_price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/marketplace/${auction.id}`)}
                        className="w-full bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        See more
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedCategory && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found in this category.</p>
            <button onClick={() => setSelectedCategory(null)} className="mt-4 text-[#3F3D56] hover:underline">
              View all listings
            </button>
          </div>
        )}

        {myAuctions && myAuctions.length > 0 && (
          <>
            {/* My Auctions section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Auctions</h2>
                <Link
                  href="/dashboard/marketplace/my-auctions"
                  className="text-[#3F3D56] text-sm hover:underline flex items-center"
                >
                  See All
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myAuctions.map((auction, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
                    onClick={() => handleMarketListingRedirect(auction.id)}
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={auction.listing_photos[0].url || "/placeholder.svg"}
                        alt={auction.name}
                        fill
                        className="object-cover"
                      />
                      <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{auction.name}</h3>
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Bid</span>
                          <span className="font-medium text-gray-900">${auction.current_bid.bid_ammount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Buy Now Price</span>
                          <span className="font-medium text-gray-900">${auction.buy_now_price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/marketplace/${auction.id}`)}
                        className="w-full bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        See more
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer></Footer>
    </div>
  )
}
