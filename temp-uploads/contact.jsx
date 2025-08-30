// components/Footer.jsx

import {Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 border-b border-gray-700 pb-10">
        
        {/* About */}
        <div>
          <h3 className="text-lg font-semibold mb-4">ABOUT</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Press</a></li>
            <li><a href="#" className="hover:text-white">Corporate Information</a></li>
          </ul>
        </div>

        {/* Group Companies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">GROUP COMPANIES</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">xyz</a></li>
            <li><a href="#" className="hover:text-white">xyz</a></li>
            <li><a href="#" className="hover:text-white">xyz</a></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="text-lg font-semibold mb-4">HELP</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Payments</a></li>
            <li><a href="#" className="hover:text-white">Shipping</a></li>
            <li><a href="#" className="hover:text-white">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-lg font-semibold mb-4">CONSUMER POLICY</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Terms Of Use</a></li>
            <li><a href="#" className="hover:text-white">Security</a></li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Sitemap</a></li>
            <li><a href="#" className="hover:text-white">Grievance Redressal</a></li>
            <li><a href="#" className="hover:text-white">EPR Compliance</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-lg font-semibold mb-4">Mail Us:</h3>
          <p className="text-sm text-gray-400">
            Accessibility Analyzer Pvt. Ltd.<br />
           Bhopal, Madhya Pradesh, India<br />
            PIN - 462001
          </p>

          <h3 className="text-lg font-semibold mt-6 mb-4">Social</h3>
          <div className="flex gap-4 text-xl">
            <a href="#" className="hover:text-white"><Facebook /></a>
            <a href="#" className="hover:text-white"><Twitter /></a>
            <a href="#" className="hover:text-white"><Instagram /></a>
            <a href="#" className="hover:text-white"><Youtube /></a>
            <a href="#" className="hover:text-white"><Linkedin /></a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between mt-6 text-gray-400 text-md">
        <p>© {new Date().getFullYear()} Accessibility Analyzer. All Rights Reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Become a Partner</a>
          <a href="#" className="hover:text-white">Advertise</a>
          <a href="#" className="hover:text-white">Help Center</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
