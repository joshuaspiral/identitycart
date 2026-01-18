"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserCircle, Save, ArrowLeft, ShieldCheck, CreditCard, Sparkles, Tag, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
    const router = useRouter()
    // Initialize with a safe default structure matching the backend
    const [identity, setIdentity] = useState<any>({
        summary: "",
        role: "shopper",
        budget: { preferred: 0, maximum: 0 },
        interests: [],
        values: [],
        use_case: ""
    })
    const [message, setMessage] = useState("")

    useEffect(() => {
        const saved = localStorage.getItem("identity_profile")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // Ensure budget object exists even if legacy data
                if (typeof parsed.budget === 'number') {
                    parsed.budget = { preferred: parsed.budget, maximum: parsed.budget }
                }
                // BUG FIX: Force maximum to be tied to preferred to prevent "Stuck 10k" issue
                if (parsed.budget?.preferred) {
                    parsed.budget.maximum = parsed.budget.preferred * 1.2
                }
                setIdentity(parsed)
            } catch (e) {
                console.error("Failed to parse identity", e)
            }
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem("identity_profile", JSON.stringify(identity))
        setMessage("Updates saved.")
        setTimeout(() => setMessage(""), 3000)
    }

    const handleBudgetChange = (val: string) => {
        const num = parseInt(val) || 0
        setIdentity({ ...identity, budget: { ...identity.budget, preferred: num, maximum: num * 1.2 } })
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white">
            {/* Header */}
            <div className="border-b border-black/5 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
                    <Button variant="ghost" className="text-zinc-500 hover:text-black hover:bg-black/5 gap-2" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </div>
            </div>

            <div className="container mx-auto p-6 max-w-3xl py-12">

                {/* Profile Card */}
                <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm relative group">
                    <div className="p-8 border-b border-black/5 bg-zinc-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm">
                                <UserCircle className="h-8 w-8 text-black" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Identity Profile</h1>
                                <p className="text-zinc-500 text-sm">Parameters extracted from your onboarding conversation.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">

                        {/* Section 1: Core Parameters */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Shopping Goal</Label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                    <Input
                                        value={identity.use_case || identity.summary || ""}
                                        onChange={(e) => setIdentity({ ...identity, use_case: e.target.value })}
                                        className="bg-white border-black/10 pl-10 h-11 text-zinc-900 focus:border-black/30 focus:ring-0 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">Budget Target ($)</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                    <Input
                                        type="number"
                                        value={identity.budget?.preferred || 0}
                                        onChange={(e) => handleBudgetChange(e.target.value)}
                                        className="bg-white border-black/10 pl-10 h-11 text-zinc-900 focus:border-black/30 focus:ring-0 shadow-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Tags & Values */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-bold">
                                    <Tag className="w-3 h-3" /> Interests Detected
                                </Label>
                                <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 rounded-xl border border-dashed border-black/10 min-h-[60px]">
                                    {identity.interests && identity.interests.length > 0 ? (
                                        identity.interests.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-black/10 rounded-md text-sm text-zinc-700 shadow-sm">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-400 text-sm italic">No specific interests detected yet.</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-bold">
                                    <Heart className="w-3 h-3" /> Values & Priorities
                                </Label>
                                <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 rounded-xl border border-dashed border-black/10 min-h-[60px]">
                                    {identity.values && identity.values.length > 0 ? (
                                        identity.values.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-sm text-emerald-700 shadow-sm">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-zinc-400 text-sm italic">No value constraints set.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: AI Summary */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider font-bold">AI Helper Note</Label>
                            <Textarea
                                className="bg-zinc-50 border-black/10 min-h-[100px] text-zinc-600 resize-none focus:border-black/30 focus:bg-white transition-all p-4"
                                value={identity.summary || "No summary available."}
                                readOnly
                            />
                        </div>

                        <div className="pt-4 border-t border-black/5">
                            <Button onClick={handleSave} className="w-full h-12 bg-black text-white hover:bg-zinc-800 font-medium transition-all shadow-lg shadow-black/5" size="lg">
                                {message ? (
                                    <span className="text-emerald-400 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {message}</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Profile Updates</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
