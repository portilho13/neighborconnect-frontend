"use client"

export default function Footer() {
    return (
        <>

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
        </>
    )
}