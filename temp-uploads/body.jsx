"use client"
import { Zap, BookCheck, Braces } from "lucide-react"
import Urlbox from "./url"
import Textbox from "./html"
import { useState } from "react"


export default function Body() {
  const [active, setActive] = useState("html")

  

  return (
    <main className="bg-gray-900 text-white min-h-screen p-8 w-full relative overflow-hidden">
      {/* Subtle background decorative elements */}
      <div className="absolute inset-0 bg-gray-800/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Main heading with elegant animation */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">Analyse the Web Accessibility</h1>
          <div className="w-32 h-1 bg-gray-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtitle with delayed animation */}
        <p className="text-2xl text-gray-300 text-center max-w-5xl leading-relaxed animate-fade-in-up animation-delay-300">
          Powered by <span className="text-gray-100 font-semibold">axe-core</span> — Identify and fix accessibility
          issues to make your web pages inclusive for everyone.
        </p>

        {/* Feature badges with staggered animation */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {[
            { icon: Zap, text: "Instant Analysis", delay: "animation-delay-500" },
            { icon: BookCheck, text: "WCAG Guideline", delay: "animation-delay-700" },
            { icon: Braces, text: "Best Practices", delay: "animation-delay-900" },
          ].map(({ icon: Icon, text, delay }, index) => (
            <div key={index} className={`group animate-fade-in-up ${delay}`}>
              <span className="text-lg bg-gray-700/80 backdrop-blur-sm border border-gray-600/50 p-4 flex items-center gap-3 rounded-xl hover:bg-gray-600/90 hover:border-gray-500/70 hover:shadow-lg hover:shadow-gray-900/50 transition-all duration-500 hover:-translate-y-1 cursor-pointer">
                <Icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                <span className="font-medium">{text}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="w-full max-w-7xl mt-20 animate-fade-in-up animation-delay-1100">
          {/* Tab buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button
              onClick={() => setActive("html")}
              className={`group relative text-xl p-6 rounded-2xl transition-all duration-500 overflow-hidden ${
                active === "html"
                  ? "bg-gray-700 shadow-2xl shadow-gray-900/50 scale-105 border-2 border-gray-500"
                  : "bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/70 hover:border-gray-500/70 hover:shadow-xl hover:shadow-gray-900/30 hover:scale-102"
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Braces
                  className={`w-6 h-6 transition-all duration-300 ${
                    active === "html" ? "text-white" : "text-gray-300 group-hover:text-gray-100"
                  }`}
                />
                <span className="font-semibold">Analyse HTML</span>
              </div>
              {active === "html" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400 rounded-b-2xl"></div>
              )}
            </button>

            <button
              onClick={() => setActive("url")}
              className={`group relative text-xl p-6 rounded-2xl transition-all duration-500 overflow-hidden ${
                active === "url"
                  ? "bg-gray-700 shadow-2xl shadow-gray-900/50 scale-105 border-2 border-gray-500"
                  : "bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 hover:bg-gray-700/70 hover:border-gray-500/70 hover:shadow-xl hover:shadow-gray-900/30 hover:scale-102"
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Zap
                  className={`w-6 h-6 transition-all duration-300 ${
                    active === "url" ? "text-white" : "text-gray-300 group-hover:text-gray-100"
                  }`}
                />
                <span className="font-semibold">Analyse URL</span>
              </div>
              {active === "url" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-400 rounded-b-2xl"></div>
              )}
            </button>
          </div>

          {/* Content area with smooth transition */}
          <div className="relative">
            <div
              className={`transition-all duration-700 ${
                active === "html"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
              }`}
            >
              {active === "html" && <Textbox />}
            </div>
            <div
              className={`transition-all duration-700 ${
                active === "url"
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
              }`}
            >
              {active === "url" && <Urlbox />}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
