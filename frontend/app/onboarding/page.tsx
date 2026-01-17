"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Zap, BookOpen, Gamepad2, Hammer, Leaf, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [role, setRole] = useState("")
    const [budget, setBudget] = useState([1000])
    const [values, setValues] = useState<string[]>([])

    const roles = [
        { id: "student", label: "Student", icon: <BookOpen className="h-6 w-6" /> },
        { id: "gamer", label: "Gamer", icon: <Gamepad2 className="h-6 w-6" /> },
        { id: "creator", label: "Creator", icon: <Zap className="h-6 w-6" /> },
    ]

    const userValues = [
        { id: "Repairability", label: "Right to Repair", icon: <Hammer className="h-4 w-4" /> },
        { id: "Eco", label: "Eco-Friendly", icon: <Leaf className="h-4 w-4" /> },
        { id: "Performance", label: "Max Performance", icon: <Zap className="h-4 w-4" /> },
        { id: "Privacy", label: "Privacy Focus", icon: <ShieldCheck className="h-4 w-4" /> },
        { id: "Minimalism", label: "Minimalist", icon: <Sparkles className="h-4 w-4" /> },
    ]

    const toggleValue = (val: string) => {
        if (values.includes(val)) {
            setValues(values.filter(v => v !== val))
        } else {
            setValues([...values, val])
        }
    }

    const handleFinish = () => {
        // Save to localStorage
        const identity = { role, budget: budget[0], values }
        localStorage.setItem("identity_profile", JSON.stringify(identity))
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-slate-900 text-white">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Setup ID
                    </h1>
                    <p className="text-gray-400">Construct your Identity Profile for authorized shopping.</p>
                </div>

                <Card className="glass-panel border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Step {step} of 3</CardTitle>
                        <CardDescription className="text-gray-400">
                            {step === 1 && "Choose your primary role."}
                            {step === 2 && "Set your budget constraint."}
                            {step === 3 && "Define your core values."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {roles.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setRole(r.id)}
                                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${role === r.id ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {r.icon}
                                            <span className="font-medium">{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black px-2 text-gray-500">Or define your own</span>
                                    </div>
                                </div>
                                <Input
                                    placeholder="e.g. Data Scientist, competitive FPS player..."
                                    className="bg-white/5 border-white/10 focus-visible:ring-blue-500 text-center"
                                    value={!roles.find(r => r.id === role) ? role : ""}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 py-4">
                                <div className="text-center">
                                    <span className="text-5xl font-bold font-mono text-green-400">${budget[0]}</span>
                                </div>
                                <Slider
                                    defaultValue={[1000]}
                                    max={5000}
                                    min={200}
                                    step={50}
                                    value={budget}
                                    onValueChange={setBudget}
                                    className="py-4"
                                />
                                <p className="text-center text-sm text-gray-500">Move slider to adjust</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {userValues.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => toggleValue(v.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 text-center rounded-xl border transition-all ${values.includes(v.id) ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            {v.icon}
                                            <span className="text-xs font-bold uppercase tracking-wide">{v.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <Input
                                        placeholder="Add a custom value (e.g. 'Linux Support')..."
                                        className="bg-black/50 border-white/10 text-center focus-visible:ring-purple-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = e.currentTarget.value.trim()
                                                if (val && !values.includes(val)) {
                                                    setValues([...values, val])
                                                    e.currentTarget.value = ""
                                                }
                                            }
                                        }}
                                    />
                                    <p className="text-[10px] text-gray-500 text-center mt-2">Press Enter to add</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center min-h-[30px]">
                                    {values.map(v => !userValues.find(uv => uv.id === v) && (
                                        <Badge key={v} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/30 flex gap-1 items-center">
                                            {v}
                                            <button onClick={() => toggleValue(v)} className="hover:text-white ml-1">×</button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="text-gray-400 hover:text-white">
                            Back
                        </Button>

                        {step < 3 ? (
                            <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !role} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleFinish} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white w-full sm:w-auto">
                                Initialize Dashboard
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
