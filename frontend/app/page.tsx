"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans selection:bg-black selection:text-white">

      <nav className="p-8 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tight">IdentityCart</div>
        {/* <div className="text-sm font-medium text-zinc-400">Assistant v2</div> */}
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">

        <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/5 shadow-sm text-sm font-medium text-zinc-600 mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
            <span>Product Research Tool</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black leading-[1.1]">
            Find the right tech.<br />
            <span className="text-zinc-400">Without the noise.</span>
          </h1>

          <p className="text-xl text-zinc-500 max-w-lg mx-auto leading-relaxed">
            A research tool that compares products based on your specific needs, budget, and technical requirements.
          </p>

          <div className="pt-8 flex flex-col items-center gap-4">
            <Link href="/onboarding/chat">
              <Button className="h-14 px-8 rounded-full text-lg bg-black text-white hover:bg-zinc-800 transition-all hover:scale-105 shadow-xl shadow-black/10">
                Start Conversation <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
              No Account Required
            </p>
          </div>

        </div>

      </div>

      {/* Footer Removed by User Request */}

    </div>
  )
}
