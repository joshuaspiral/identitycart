"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, ShieldCheck, ArrowRight, Key } from "lucide-react"
import { useRouter } from "next/navigation"

export function PasskeyLogin() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        // Instant snappy transition instead of "simulated scanning"
        setTimeout(() => {
            router.push("/onboarding/chat")
        }, 600)
    }

    return (
        <div className="w-full max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <div className="relative p-8 rounded-2xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/80">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Lock className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="font-medium tracking-tight">Identity Vault</span>
                    </div>
                    <div className="text-[10px] bg-[#0094F5]/10 text-[#0094F5] px-2 py-1 rounded-full border border-[#0094F5]/20 font-bold tracking-wider">
                        1PASSWORD SECURED
                    </div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
                    <p className="text-zinc-400 text-sm">Authenticate to access your shopping profile.</p>
                </div>

                {/* Main Action */}
                <Button
                    size="lg"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-12 bg-[#0094F5] hover:bg-[#0077C5] text-white font-medium text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 animate-pulse" /> Authenticating...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5b/1Password_icon.svg" className="w-5 h-5 brightness-200 grayscale-0 invert" alt="" />
                            Sign in with 1Password
                        </span>
                    )}
                </Button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                    </div>
                </div>

                {/* Secondary Action */}
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" onClick={() => router.push("/onboarding/chat")}>
                    Guest Access <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Button>

                {/* Footer */}
                <div className="text-center">
                    <p className="text-[10px] text-zinc-600">
                        By continuing, you verify that you are the owner of this IdentityCart profile.
                        <br />Zero-Knowledge Encryption enabled.
                    </p>
                </div>
            </div>
        </div>
    )
}
