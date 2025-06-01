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
import Footer from "../../../../components/footer"

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/client/login`, {
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
          role: "client"
        }

        setUser(user)
        router.push("/dashboard")
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
            <p className="text-white/70 text-center mb-8">Sign in to your NeighborConnect account</p>

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
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[#4987FF] hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  )
}
