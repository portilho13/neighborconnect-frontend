"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building, ArrowLeft, Check } from "lucide-react"

import useUserStore from "../../../../../../lib/userStore"

export default function AddApartmentPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    n_bedrooms: 1,
    floor: 1,
    rent: 0,
    manager_id: user?.id || null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Convert to appropriate types
    if (name === "n_bedrooms" || name === "floor") {
      setFormData({ ...formData, [name]: Number.parseInt(value) || 0 })
    } else if (name === "rent") {
      setFormData({ ...formData, [name]: Number.parseFloat(value) || 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Update with your actual API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/apartment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          manager_id: user?.id || formData.manager_id,
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      setSuccess(true)
      // Reset form
      setFormData({
        n_bedrooms: 1,
        floor: 1,
        rent: 0,
        manager_id: user?.id || 0,
      })

      // Redirect after short delay
      setTimeout(() => {
        router.push("/manager/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Error adding apartment:", err)
      setError(err instanceof Error ? err.message : "Failed to add apartment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-black bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 flex items-center">
          <Link href="/manager/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-[#3F3D56] flex items-center justify-center text-white mr-2">
              <span className="font-bold">NC</span>
            </div>
            <span className="font-bold text-lg text-gray-900">NeighborConnect</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/manager/dashboard"
            className="inline-flex items-center text-sm text-[#3F3D56] hover:text-[#2d2b40] mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Apartment</h1>
          <p className="text-gray-600">Create a new apartment listing in your building.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <Building className="h-5 w-5 text-[#3F3D56] mr-2" />
            <h2 className="font-semibold text-gray-900">Apartment Details</h2>
          </div>

          <div className="p-6">
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">Apartment added successfully!</p>
                    <p className="mt-1 text-sm text-green-700">Redirecting to dashboard...</p>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">Error: {error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="n_bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Bedrooms
                    </label>
                    <input
                      type="number"
                      id="n_bedrooms"
                      name="n_bedrooms"
                      min="0"
                      value={formData.n_bedrooms}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F3D56] focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                      Floor
                    </label>
                    <input
                      type="number"
                      id="floor"
                      name="floor"
                      min="0"
                      value={formData.floor}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F3D56] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="text"
                    id="rent"
                    name="rent"
                    min="0"
                    value={formData.rent}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F3D56] focus:border-transparent"
                    required
                  />
                </div>


                <div className="flex justify-end space-x-3">
                  <Link
                    href="/manager/dashboard"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#3F3D56] text-white rounded-lg text-sm font-medium hover:bg-[#2d2b40] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Adding..." : "Add Apartment"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
