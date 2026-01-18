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
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground transition-colors duration-500">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter text-primary">
                        Setup ID
                    </h1>
                    <p className="text-muted-foreground">Construct your Identity Profile for authorized shopping.</p>
                </div>

                <Card className="industrial-panel bg-card/50 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Step {step} of 3</CardTitle>
                        <CardDescription>
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
                                            className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${role === r.id ? 'bg-primary/10 border-primary text-foreground shadow-[0_0_20px_rgba(var(--primary),0.2)]' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {r.icon}
                                            <span className="font-medium">{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Or define your own</span>
                                    </div>
                                </div>
                                <Input
                                    placeholder="e.g. Data Scientist, competitive FPS player..."
                                    className="bg-background border-border focus-visible:ring-primary text-center"
                                    value={!roles.find(r => r.id === role) ? role : ""}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 py-4">
                                <div className="text-center">
                                    <span className="text-5xl font-bold font-mono text-primary">${budget[0]}</span>
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
                                <p className="text-center text-sm text-muted-foreground">Move slider to adjust</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {userValues.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => toggleValue(v.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 text-center rounded-xl border transition-all ${values.includes(v.id) ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'}`}
                                        >
                                            {v.icon}
                                            <span className="text-xs font-bold uppercase tracking-wide">{v.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-2">
                                    <Input
                                        placeholder="Add a custom value (e.g. 'Linux Support')..."
                                        className="bg-background border-border text-center focus-visible:ring-primary"
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
                                    <p className="text-[10px] text-muted-foreground text-center mt-2">Press Enter to add</p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center min-h-[30px]">
                                    {values.map(v => !userValues.find(uv => uv.id === v) && (
                                        <Badge key={v} variant="secondary" className="bg-primary/10 text-primary border-primary/30 flex gap-1 items-center">
                                            {v}
                                            <button onClick={() => toggleValue(v)} className="hover:text-foreground ml-1">×</button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
                            Back
                        </Button>

                        {step < 3 ? (
                            <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !role}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleFinish} className="w-full sm:w-auto">
                                Initialize Dashboard
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
