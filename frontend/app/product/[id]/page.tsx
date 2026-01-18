"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Brain, Gavel, ArrowLeft, ShoppingBag, BrainCircuit, TrendingDown, ShieldCheck, Loader2, Sparkles, Terminal } from "lucide-react"

export default function ProductPage() {
    const params = useParams()
    const id = params?.id as string

    const router = useRouter()
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true) // Initial fetch
    const [analyzing, setAnalyzing] = useState(false) // AI Animation
    const [analysisStep, setAnalysisStep] = useState(0)
    const [identity, setIdentity] = useState<any>(null)

    // Analysis Steps Configuration
    const steps = [
        { agent: "System", message: "Initializing secure connection...", color: "text-zinc-500" },
        { agent: "Scout", message: "Verifying live availability & specs...", color: "text-blue-500" },
        { agent: "Critic", message: "Analyzing price-to-performance ratio...", color: "text-red-500" },
        { agent: "Guardian", message: "Scanning for planned obsolescence...", color: "text-emerald-500" },
        { agent: "Mentor", message: "Synthesizing final verdict...", color: "text-purple-500" },
    ]

    useEffect(() => {
        // Load identity
        const saved = localStorage.getItem("identity_profile")
        if (saved) setIdentity(JSON.parse(saved))

        // Fetch Logic
        const fetchProduct = async () => {
            // 1. Try Cache
            let foundProduct = null
            try {
                const cached = sessionStorage.getItem("identity_cart_products")
                if (cached) {
                    const products = JSON.parse(cached)
                    foundProduct = products.find((p: any) => p.id === id)
                }
            } catch (e) {
                console.error("Cache Error", e)
            }

            // 2. Try API
            if (!foundProduct && id) {
                try {
                    const res = await fetch(`http://localhost:8000/products/${id}`)
                    if (res.ok) foundProduct = await res.json()
                } catch (err) {
                    console.error("Fetch Error", err)
                }
            }

            if (foundProduct) {
                setProduct(foundProduct)
                setLoading(false)
                startAnalysis() // Trigger animation
            } else {
                setLoading(false) // Data not found
            }
        }

        fetchProduct()
    }, [id])

    const startAnalysis = () => {
        setAnalyzing(true)
        setAnalysisStep(0)

        // Sequence generator
        let step = 0
        const interval = setInterval(() => {
            step++
            setAnalysisStep(step)
            if (step >= steps.length) {
                clearInterval(interval)
                setTimeout(() => setAnalyzing(false), 800) // Slight pause at end
            }
        }, 600) // 600ms per step
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        )
    }

    if (!product) return <div className="p-8 text-center">Product not found.</div>

    // SHOW ANALYSIS OVERLAY
    if (analyzing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-mono p-4">
                <div className="w-full max-w-md space-y-4">
                    <div className="flex items-center gap-2 mb-8 justify-center opacity-50">
                        <Terminal className="w-5 h-5" />
                        <span className="text-sm tracking-widest uppercase">IdentityCart AI Swarm</span>
                    </div>

                    <div className="space-y-3">
                        {steps.map((s, i) => (
                            <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i <= analysisStep ? 'opacity-100' : 'opacity-0'}`}>
                                <div className={`w-2 h-2 rounded-full ${i === analysisStep ? 'bg-black animate-pulse' : 'bg-black/20'}`} />
                                <span className={`text-xs font-bold uppercase w-20 ${s.color}`}>{s.agent}</span>
                                <span className="text-sm text-zinc-600">{s.message}</span>
                            </div>
                        ))}
                    </div>

                    <div className="h-1 w-full bg-zinc-100 rounded-full mt-8 overflow-hidden">
                        <div
                            className="h-full bg-black/80 transition-all duration-300 ease-out"
                            style={{ width: `${Math.min((analysisStep / (steps.length - 1)) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        )
    }

    // MAIN CONTENT (Existing UI with Tweaks)
    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <header className="p-6 border-b border-black/5 flex justify-between items-center sticky top-0 bg-[#FAFAFA]/80 backdrop-blur-md z-10">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 hover:bg-black/5">
                    <ArrowLeft className="w-4 h-4" /> Back to Mission
                </Button>
            </header>

            <main className="container mx-auto max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left: Product Visuals & Core Specs */}
                <div className="space-y-8">
                    <div className="aspect-[4/3] bg-white rounded-2xl flex items-center justify-center border border-black/5 relative overflow-hidden group shadow-sm">
                        {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt={product.name} className="w-3/4 h-3/4 object-contain mix-blend-multiply" />
                        ) : (
                            <div className="text-zinc-300 font-mono">NO IMAGE</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-xl bg-white border border-black/5 shadow-sm">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Price</div>
                            <div className="text-3xl font-mono font-bold tracking-tight">${product.price}</div>
                        </div>
                        <div className="p-5 rounded-xl bg-white border border-black/5 shadow-sm">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Category</div>
                            <div className="text-lg capitalize font-medium">{product.category}</div>
                        </div>
                        <div className="col-span-2 p-5 rounded-xl bg-white border border-black/5 shadow-sm">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Specifications</div>
                            {product.specs && Object.keys(product.specs).length > 0 ? (
                                <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600">
                                    {Object.entries(product.specs).map(([key, value]: any) => (
                                        <li key={key}>
                                            <span className="font-medium text-zinc-900 capitalize">{key.replace('_', ' ')}</span>: {value}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-sm text-zinc-400 italic py-2">
                                    Detailed specifications not available via API. Please verify on retailer site.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: The Tribunal (Agent Analysis) */}
                <div className="flex flex-col h-full">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Analysis for <span className="font-bold text-black border-b border-black/20">{identity?.role || "Shopper"}</span>
                        </div>
                    </div>

                    <Tabs defaultValue="mentor" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-zinc-100/50 p-1 rounded-lg">
                            <TabsTrigger value="mentor" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                <Brain className="w-4 h-4" /> Mentor
                            </TabsTrigger>
                            <TabsTrigger value="critic" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm rounded-md transition-all">
                                <Gavel className="w-4 h-4" /> Critic
                            </TabsTrigger>
                            <TabsTrigger value="guardian" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm rounded-md transition-all">
                                <Shield className="w-4 h-4" /> Guardian
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 bg-white border border-black/5 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-bl-full -mr-16 -mt-16 -z-10" />

                            <TabsContent value="mentor" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                        <Brain className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Mentor's Perspective</h3>
                                        <p className="text-sm text-zinc-500">Contextual Fit analysis</p>
                                    </div>
                                </div>
                                <div className="prose prose-sm prose-zinc">
                                    <p className="text-base leading-relaxed text-zinc-700">
                                        "As a <strong>{identity?.role || "Shopper"}</strong> focused on <strong>{identity?.values?.[0] || "Quality"}</strong>,
                                        the <strong>{product.name}</strong> is a strategic match.
                                        {product.specs?.Processor ? <span> The presence of the <strong>{product.specs.Processor}</strong> aligns with your need for performance.</span> : ""}
                                        {product.price > 2000 ? " While a premium investment, " : " Offering excellent value, "}
                                        it directly supports your interest in <strong>{identity?.interests?.[0] || "Efficiency"}</strong>."
                                    </p>
                                </div>

                                <div className="p-6 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-900 mt-4">
                                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-4 opacity-70">
                                        <BrainCircuit className="h-4 w-4" />
                                        Cognitive Load
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-2xl font-bold">{product.cognitive_load || "Medium"}</div>
                                            <div className="text-sm opacity-70 mt-1">Learning Curve</div>
                                        </div>
                                        <div className="text-right max-w-[200px] text-xs leading-relaxed opacity-80">
                                            {product.cognitive_load === 'High'
                                                ? "Best for power users. May require setup time."
                                                : "Intuitive and easy to adopt immediately."}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="critic" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                                        <Gavel className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Critic's Verdict</h3>
                                        <p className="text-sm text-zinc-500">Price & Value Analysis</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-red-50/50 border border-red-100 text-red-900">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest opacity-70">
                                            <TrendingDown className="h-4 w-4" />
                                            Value Score
                                        </div>
                                        <div className="text-3xl font-bold tracking-tight">{product.value_score || "?"}/100</div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-red-200/50 pb-3">
                                            <span>Price-to-Performance</span>
                                            <span className="font-bold">
                                                {product.price < 1000 ? "Excellent" : "Premium Tax"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-red-200/50 pb-3">
                                            <span>Hidden Cost Risk</span>
                                            <span className={`font-bold ${product.hidden_cost_risk === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {product.hidden_cost_risk || "Low"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-1">
                                            <span>Deal Timing</span>
                                            <Badge variant="outline" className="font-mono uppercase bg-white border-red-200 text-red-700">
                                                {product.deal_timing || "Buy Now"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="guardian" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                        <Shield className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Guardian's Assessment</h3>
                                        <p className="text-sm text-zinc-500">Ethics & Sustainability</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-900">
                                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-6 opacity-70">
                                        <ShieldCheck className="h-4 w-4" />
                                        Repairability DNA
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2 font-medium">
                                                <span>Repair Score</span>
                                                <span className="font-mono">{product.repairability_score}/10</span>
                                            </div>
                                            <Progress value={product.repairability_score * 10} className="h-2 bg-emerald-200" indicatorClassName="bg-emerald-500" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-emerald-100/50 text-center border border-emerald-200/50">
                                                <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Fixability</div>
                                                <div className="font-bold text-lg">{product.repairability_confidence || "Medium"}</div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-emerald-100/50 text-center border border-emerald-200/50">
                                                <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Est. Lifespan</div>
                                                <div className="font-bold text-lg">{product.longevity_score || "3-4 Years"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    {/* Action Bar */}
                    <div className="mt-8">
                        <Button className="w-full h-14 text-lg font-bold gap-3 shadow-lg shadow-black/5 hover:shadow-xl transition-all" size="lg" onClick={() => window.open(product.link || "#", "_blank")}>
                            Acquire Item <ShoppingBag className="w-5 h-5" />
                        </Button>
                        <p className="text-center text-xs text-zinc-400 mt-4">
                            Proceeding will redirect you to a verified vendor.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
