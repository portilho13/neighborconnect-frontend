"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import LogoImage from '../../../../images/ImagemInicial.svg'
import { useRouter } from "next/navigation"
import useUserStore from "../../../../lib/userStore"
import { User } from "../../../../lib/userStore"


export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const setUser = useUserStore((state) => state.setUser);

  const router = useRouter()

  const userI = useUserStore((state) => state.user);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    let valid = true
    const newErrors = {
      email: "",
      password: "",
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/manager/login`, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
            },
          body: JSON.stringify({
              email: formData.email,
              password: formData.password,
          })
        })

        
        if (!res.ok) {
          const errorMessage = await res.text();
          throw new Error(errorMessage || 'Failed to register');
        }

        const data = await res.json()
        const user: User  = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          apartmentId: data.apartment_id,
          avatar: data.avatar,
          role: "manager"
        }

        setUser(user)
        router.push("/manager/dashboard")
      }catch(error) {
        console.log(error)
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

          {/* Login Form */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <h1 className="text-white text-center font-bold text-3xl mb-6">Welcome Back</h1>
            <p className="text-white/70 text-center mb-8">Sign in to your NeighboorConnect account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-white/90 text-sm">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[#4987FF] text-sm hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-white/20 border ${errors.password ? "border-red-500" : "border-white/30"} rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4987FF]`}
                    placeholder="Enter your password"
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

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-white/30 bg-white/20 text-[#4987FF] focus:ring-[#4987FF]"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-white/80">
                  Remember me
                </label>
              </div>

              <div className="pt-2">
                <button
                  className="w-full bg-[#4987FF] hover:bg-[#3a78f0] transition-colors px-8 py-4 rounded-xl font-medium text-white shadow-lg shadow-[#4987FF]/30"
                  type="submit"
                >
                  Sign In
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#4987FF] hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section */}
      <div className="w-full bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-bold text-xl text-[#3F3D56] mb-4">Join Our Community</h2>
            <p className="text-gray-600 mb-2">Subscribe</p>
            <p className="text-gray-600 mb-4">Get 10% Off</p>
            <div className="flex">
              <input
                className="bg-gray-100 border border-gray-300 rounded-l-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#4987FF]"
                type="email"
                placeholder="Your email"
              />
              <button className="bg-[#4987FF] text-white px-4 py-2 rounded-r-md hover:bg-[#3a78f0]">Join</button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-[#3F3D56]">About</h3>
            <p className="text-gray-600 text-sm">About Us</p>
            <p className="text-gray-600 text-sm">Features</p>
            <p className="text-gray-600 text-sm">News & Blog</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-[#3F3D56]">Support</h3>
            <p className="text-gray-600 text-sm">FAQs</p>
            <p className="text-gray-600 text-sm">Support Center</p>
            <p className="text-gray-600 text-sm">Contact Us</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-[#3F3D56]">Legal</h3>
            <p className="text-gray-600 text-sm">Terms & Conditions</p>
            <p className="text-gray-600 text-sm">Privacy Policy</p>
            <p className="text-gray-600 text-sm">Cookies</p>
          </div>
        </div>
      </div>
    </div>
  )
}
