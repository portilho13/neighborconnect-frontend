"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Clock, Share2, Bell, Menu } from "lucide-react"
import useUserStore from "../lib/userStore"

interface Listing_Photo {
  id: number
  url: string
}

interface Listing {
  id: number
  name: string
  description: string
  buy_now_price: number
  start_price: number
  current_bid: number
  created_at: Date
  expiration_date: Date
  status: string
  sellerId: number
  category_id: Category[]
  listing_photos: Listing_Photo[]
}

interface Category {
  id: number
  name: string
  url: string
}

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [listing, setListing] = useState<Listing>()
  const [isLoading, setIsLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const user = useUserStore((state) => state.user)

  // Get current image URL
  const currentImageUrl =
    listing?.listing_photos && listing.listing_photos.length > 0 && currentImageIndex < listing.listing_photos.length
      ? listing.listing_photos[currentImageIndex].url
      : "/placeholder.svg?height=400&width=400"

  // Navigation functions
  const nextImage = () => {
    if (listing?.listing_photos && listing.listing_photos.length > 0) {
      setCurrentImageIndex((prev) => (prev === listing.listing_photos.length - 1 ? 0 : prev + 1))
      console.log(
        "Next image clicked, new index:",
        currentImageIndex === listing.listing_photos.length - 1 ? 0 : currentImageIndex + 1,
      )
    }
  }

  const prevImage = () => {
    if (listing?.listing_photos && listing.listing_photos.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? listing.listing_photos.length - 1 : prev - 1))
      console.log(
        "Previous image clicked, new index:",
        currentImageIndex === 0 ? listing.listing_photos.length - 1 : currentImageIndex - 1,
      )
    }
  }

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
      const res = await fetch(`http://localhost:1234/api/v1/listing?id=${id}`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to fetch")
      }

      const data: Listing = await res.json()
      console.log("Fetched listing data:", data)
      console.log("Listing photos:", data.listing_photos)

      setListing(data)
      setCurrentImageIndex(0) // Reset to first image when new listing is loaded
      setImageError(false)
    } catch (error) {
      console.error("Error fetching listing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch listing data
  useEffect(() => {
    fetchListing(Number(id))
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

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [listing])

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseFloat(bidAmount)

    if (isNaN(amount) || amount <= (listing?.current_bid || 0)) {
      alert("Please enter a bid higher than the current bid")
      return
    }

    // Here you would normally send the bid to your API
    alert(`Bid of $${amount} placed successfully!`)
    // Update the current bid in the UI
    if (listing) {
      setListing({
        ...listing,
        current_bid: amount,
      })
    }
    setBidAmount("")
  }

  const handleBuyNow = () => {
    // Here you would normally send the purchase to your API
    alert(`Item purchased for $${listing?.buy_now_price}!`)
    // Redirect to checkout or confirmation page
    // router.push("/checkout")
  }

  const handleImageError = () => {
    console.error("Image failed to load")
    setImageError(true)
  }

  const scrollToImage = (direction: 'next' | 'prev') => {
    if (!listing?.listing_photos || listing.listing_photos.length <= 1) return;
    
    const currentElement = document.querySelector('.image-container:focus-within') || 
                          document.getElementById(`image-${currentImageIndex}`);
    
    if (currentElement) {
      const allImages = Array.from(document.querySelectorAll('.image-container'));
      const currentIndex = allImages.indexOf(currentElement as HTMLElement);
      
      let targetIndex;
      if (direction === 'next') {
        targetIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
      } else {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
      }
      
      const targetElement = allImages[targetIndex];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setCurrentImageIndex(targetIndex);
      }
    }
  };

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
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
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

  // Debug info
  console.log("Current image index:", currentImageIndex)
  console.log("Current image URL:", currentImageUrl)
  console.log("Total images:", listing.listing_photos?.length || 0)

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
              <Link href="/activities" className="text-gray-600 hover:text-gray-900 transition-colors">
                Activities
              </Link>
              <Link href="/marketplace" className="text-gray-900 font-medium">
                Marketplace
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 bg-[#3F3D56] rounded-full w-2 h-2"></span>
            </button>

            <div className="hidden md:flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#3F3D56] flex items-center justify-center text-white">
                <span className="font-medium text-sm">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.name || "User"}</span>
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
                <span className="font-medium text-sm">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{user?.name || "User"}</span>
            </div>

            <nav className="flex flex-col space-y-3">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/activities" className="text-gray-600 hover:text-gray-900 transition-colors">
                Activities
              </Link>
              <Link href="/auction" className="text-gray-600 hover:text-gray-900 transition-colors">
                Auction
              </Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </Link>
            </nav>
          </div>
        )}
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

        {/* Listing Detail */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Carousel */}
            <div className="order-2 lg:order-1">
              {/* Main Carousel */}
              <div className="relative mb-4">
                {listing.listing_photos && listing.listing_photos.length > 0 ? (
                  <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200">
                    <img
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
                        currentImageIndex === index ? 'border-[#3F3D56]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
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
                  Categoria
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
                    <span className="font-medium text-sm">NV</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nome Vendedor</p>
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
                    <p className="text-lg font-medium text-gray-900">${listing.current_bid.toFixed(2)}</p>
                  </div>
                </div>

                <form onSubmit={handleBid} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min={listing?.current_bid ? listing.current_bid + 0.01 : 0.01}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`${(listing?.current_bid ? listing.current_bid + 1 : 1).toFixed(2)} or higher`}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F3D56] focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#3F3D56] hover:bg-[#2d2b40] text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Place Bid
                    </button>
                  </div>
                </form>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#3F3D56] hover:bg-[#2d2b40] text-white py-3 rounded-md text-sm font-medium transition-colors"
                >
                  Buy Now for ${listing?.buy_now_price.toFixed(2)}
                </button>
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
                <Link href="/dashboard/marketplace" className="hover:text-white transition-colors">
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
          </div>
        </div>
      </footer>
    </div>
  )
}
