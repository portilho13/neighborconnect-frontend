"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Bell, Menu, Heart, Plus } from "lucide-react"
import useUserStore from "../../../lib/userStore"
import { useRouter } from "next/navigation"

interface Listing_Photo {
  id: number;
  url: string;
}

interface SellerInfo {
  id: number;
  name: string;
}

interface BidInfo {
  id: number | null;
  bid_ammount: number;
  users_id: number | null;
  listing_id: number;
}

interface Listing {
  id: number
  name: string
  description: string
  buy_now_price: number
  startPrice: number
  current_bid: BidInfo
  createdAt: Date
  expiration_date: Date
  status: string
  seller: SellerInfo
  category_id: Category
  listing_photos: Listing_Photo[]
}


interface Category {
  id: number
  name: string
  url: string
}

export default function Marketplace() {

  const router = useRouter()

  const handleMarketListingRedirect = (listing_id: number) => {
    router.push(`http://localhost:3000/marketplace/${listing_id}`)
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [myAuctions, setMyAuctions] = useState<Listing[]>([])
  const user = useUserStore((state) => state.user)

  const [categories, setCategories] = useState<Category[]>([])

  // Trending auctions data
  const trendingAuctions = [
    {
      name: "Hermes Sculpture",
      image: "/placeholder.svg?height=200&width=200",
      currentBid: 1500,
      buyNowPrice: 1520,
    },
    {
      name: "Hermes Sculpture",
      image: "/placeholder.svg?height=200&width=200",
      currentBid: 1500,
      buyNowPrice: 1520,
    },
    {
      name: "Gucci Painting",
      image: "/placeholder.svg?height=200&width=200",
      currentBid: 4400,
      buyNowPrice: 4450,
    },
    {
      name: "Gucci Painting",
      image: "/placeholder.svg?height=200&width=200",
      currentBid: 4400,
      buyNowPrice: 4450,
    },
  ]

  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:1234/api/v1/listing/all")
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
      const res = await fetch("http://localhost:1234/api/v1/category")
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }

      setCategories(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchListings(), fetchCategories()
  }, [])

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
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="What are you looking for?"
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
                placeholder="What are you looking for?"
                className="bg-gray-100 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F3D56] w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
              <Link href="/dashboard/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </Link>
            </nav>
          </div>
        )}
      </header>

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
                <Link
                  href="/marketplace/categories"
                  className="text-[#3F3D56] text-sm hover:underline flex items-center"
                >
                  See All
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => (
                  <Link key={index} href={`/marketplace/category/${category.name.toLowerCase()}`} className="group">
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 group-hover:shadow-md group-hover:border-[#3F3D56]/20">
                      <div className="relative h-40 w-full">
                        <Image
                          src={category.url || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {listings && listings.length > 0 && (
          <>
            {/* Trending Auction section */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Trending Auction</h2>
                <Link
                  href="/dashboard/marketplace/trending"
                  className="text-[#3F3D56] text-sm hover:underline flex items-center"
                >
                  See All
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((auction, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-[#3F3D56]/20"
                    onClick={() => handleMarketListingRedirect(auction.id)}
                  >
                    <div className="relative h-48 w-full">
                      <Image src={auction.listing_photos[0].url || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
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
                      <button className="w-full bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors">
                        See more
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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
                      <Image src={auction.listing_photos[0].url || "/placeholder.svg"} alt={auction.name} fill className="object-cover" />
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
                      <button className="w-full bg-[#3F3D56]/10 hover:bg-[#3F3D56]/20 text-[#3F3D56] py-2 rounded-md text-sm font-medium transition-colors">
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