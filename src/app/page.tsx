'use client'

import Image from "next/image"
import Link from "next/link"
import ImagemInicial from "../../images/ImagemInicial.svg"
import { useRouter } from "next/navigation"
import Footer from "../../components/footer"

export default function Home() {
  const router = useRouter();

  const redirectTo = (link: string) => {
    router.push(link);
  };
  return (
    <div className="min-h-screen bg-[#3F3D56] flex flex-col items-center justify-between">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#3F3D56] to-[#2d2b40] min-h-screen w-full flex flex-col">
        <div className="container mx-auto px-6 pt-24 pb-16 flex flex-col items-center">
          {/* Image now comes first */}
          <div className="w-full max-w-md mb-12 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-[#4987FF]/30 rounded-full blur-xl"></div>
              <Image
                width={500}
                height={500}
                src={ImagemInicial || "/placeholder.svg"}
                alt="Neighborhood Connection"
                className="relative z-10 w-full h-auto"
              />
            </div>
          </div>

          {/* Text content comes after the image */}
          <div className="text-white text-center max-w-2xl">
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
              <span className="block">Welcome To</span>
              <span className="block text-[#4987FF]">NeighborConnect!</span>
            </h1>
            <p className="mt-6 text-lg text-white/80 mx-auto max-w-md">
              Connect with your neighbors, build community, and make your neighborhood a better place to live.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => redirectTo("/register")}
                className="bg-[#4987FF] hover:bg-[#3a78f0] transition-colors px-8 py-4 rounded-xl font-medium text-white shadow-lg shadow-[#4987FF]/30"
                type="submit"
              >
                Sign Up
              </button>
              <Link
                href="/login/client"
                className="inline-flex items-center justify-center text-white hover:text-[#4987FF] transition-colors px-4 py-2"
              >
                Already have an account? <span className="ml-1 underline">Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer></Footer>
    </div>
  )
}
