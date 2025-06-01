"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import LoadingSpinner from "../../../components/loading-spinner"
import LogoImage from "../../../images/ImagemInicial.svg"
import { useRouter } from "next/navigation"
import Footer from "../../../components/footer"

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    apartmentId: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    apartmentId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateStep1 = () => {
    let valid = true
    const newErrors = {
      ...errors,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      valid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
      valid = false
    } else if (!/^\+?[0-9]{9,15}$/.test(formData.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (formData.password.length < 3) {
      newErrors.password = "Password must be at least 8 characters"
      valid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const validateStep2 = () => {
    let valid = true
    const newErrors = {
      ...errors,
      apartmentId: "",
    }

    if (!formData.apartmentId.trim()) {
      newErrors.apartmentId = "Apartment ID is required"
      valid = false
    } else if (formData.apartmentId.length < 0) {
      newErrors.apartmentId = "Apartment ID must be at least 3 characters"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep === totalSteps && validateStep2()) {
      setIsSubmitting(true)

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/client/register`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
              },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                apartment_id: parseInt(formData.apartmentId)
            })
        })

        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage || 'Failed to register');
        }

      }catch(err) {
          console.error(err)
      } finally {
        setIsSubmitting(false)
        router.push("/login/client")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#3F3D56] flex flex-col items-center justify-between">
      {/* Main Content */}
      <div className="bg-gradient-to-br from-[#3F3D56] to-[#2d2b40] min-h-screen w-full flex flex-col">
        <div className="container mx-auto px-6 py-8 flex flex-col items-center">
          {/* Back button */}
          <div className="self-start mb-6">
            <Link href="/" className="text-white/80 hover:text-white flex items-center transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Image */}
          <div className="w-full max-w-md mb-8 flex justify-center">
            <div className="relative w-full max-w-xs">
              <div className="absolute -inset-1 bg-[#4987FF]/30 rounded-full blur-xl"></div>
              <Image
                width={300}
                height={300}
                src={LogoImage}
                alt="Neighborhood Connection"
                className="relative z-10 w-full h-auto"
              />
            </div>
          </div>

          {/* Registration Form */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative">
            <h1 className="text-white text-center font-bold text-3xl mb-6">Create Your Account</h1>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-white/80 text-sm">Personal Info</span>
                <span className="text-white/80 text-sm">Apartment Details</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div
                  className="bg-[#4987FF] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-white/60 text-xs">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-white/60 text-xs">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-white/90 mb-1 text-sm">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-white/20 border ${errors.name ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white/90 mb-1 text-sm">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-white/20 border ${errors.email ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-white/90 mb-1 text-sm">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-white/20 border ${errors.phone ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-white/90 mb-1 text-sm">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full bg-white/20 border ${errors.password ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-red-400 text-xs">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-white/90 mb-1 text-sm">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full bg-white/20 border ${errors.confirmPassword ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}

              {/* Step 2: Apartment Information */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label htmlFor="apartmentId" className="block text-white/90 mb-1 text-sm">
                      Apartment ID
                    </label>
                    <input
                      type="text"
                      id="apartmentId"
                      name="apartmentId"
                      value={formData.apartmentId}
                      onChange={handleChange}
                      className={`w-full bg-white/20 border ${errors.apartmentId ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                      placeholder="Enter your apartment ID"
                    />
                    {errors.apartmentId && <p className="mt-1 text-red-400 text-xs">{errors.apartmentId}</p>}
                  </div>
                  <div className="py-4">
                    <p className="text-white/70 text-sm">
                      Your Apartment ID helps us connect you with your neighbors in the same building. You can find this
                      ID on your lease agreement or ask your property manager.
                    </p>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center text-white bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg"
                    disabled={isSubmitting}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </button>
                ) : (
                  <div></div> // Empty div to maintain flex spacing
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center text-white bg-[#4987FF] hover:bg-[#3a78f0] transition-colors px-6 py-2 rounded-lg ml-auto"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-[#4987FF] hover:bg-[#3a78f0] transition-colors px-8 py-3 rounded-xl font-medium text-white shadow-lg shadow-[#4987FF]/30 relative disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <LoadingSpinner loading={true} size="lg" className="absolute left-4" />}
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                Already have an account?{" "}
                <Link href="/login" className="text-[#4987FF] hover:underline">
                  Login
                </Link>
              </p>
            </div>

            {/* Form loading overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-[#3F3D56]/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <LoadingSpinner loading={true} size="lg" text="Creating your account..." />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer></Footer>
    </div>
  )
}
