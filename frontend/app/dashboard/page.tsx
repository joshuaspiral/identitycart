"use client"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { AgentLog } from "@/components/agent-log"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Filter } from "lucide-react"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function DashboardPage() {
    const [identity, setIdentity] = useState<any>(null)
    const [query, setQuery] = useState("")
    const [logs, setLogs] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [mentorAdvice, setMentorAdvice] = useState("")
    const [minRepairScore, setMinRepairScore] = useState(0)
    const [maxPrice, setMaxPrice] = useState(10000)

    // Filter logic
    const filteredProducts = products.filter(p =>
        p.repairability_score >= minRepairScore &&
        p.price <= maxPrice
    )

    useEffect(() => {
        // Load identity
        const saved = localStorage.getItem("identity_profile")
        if (saved) {
            setIdentity(JSON.parse(saved))
        }
    }, [])

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setLogs([])             // Clear previous logs
        setProducts([])         // Clear previous products
        setMentorAdvice("")      // Clear previous advice

        // Optimistic log start and simulation
        setLogs([{ agent: "System", color: "blue", message: "Initiating Agent Swarm..." }])

        // Simulation: Stream "fake" progress logs while waiting for the slow LLM response
        // This makes the system feel alive and "scraping"
        const interval = setInterval(() => {
            setLogs(prev => {
                const last = prev[prev.length - 1]
                if (last.message === "Initiating Agent Swarm...") {
                    return [...prev, { agent: "Scout", color: "blue", message: "Connecting to external market databases (Amazon, BestBuy, Newegg)..." }]
                }
                if (last.message.includes("Connecting")) {
                    return [...prev, { agent: "Scout", color: "blue", message: `Scraping real-time pricing for "${query}"...` }]
                }
                if (last.message.includes("Scraping")) {
                    return [...prev, { agent: "Critic", color: "red", message: "Analyzing price-to-performance ratios..." }]
                }
                if (last.message.includes("Analyzing")) {
                    return [...prev, { agent: "Guardian", color: "green", message: "Checking repairability indices (iFixit)..." }]
                }
                return prev
            })
        }, 1500)

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: query,
                    identity: identity
                })
            })

            const data = await response.json()

            clearInterval(interval)

            // Merge simulated logs with real logs? 
            // Or just replace? The real logs have the specific results. 
            // Let's replace but keep the "scraping" feel by ensuring backend logs are detailed.
            setLogs(data.logs)
            setMentorAdvice(data.final_response)

            if (data.products) {
                // Apply current filters if any
                // But we need to update the base 'products' state
                setProducts(data.products)
            } else {
                setProducts([])
            }

        } catch (err) {
            clearInterval(interval)
            setLogs(prev => [...prev, { agent: "System", color: "red", message: "Connection to Agents failed." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <Navbar identity={identity} />

            <main className="grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[calc(100vh-70px)]">
                {/* Left: Chat & Filters (Agent Log) */}
                <div className="lg:col-span-3 border-r border-white/10 p-4 flex flex-col gap-4 bg-zinc-950/50 h-[500px] lg:h-full">
                    <div className="glass-panel p-4 rounded-xl space-y-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mission Control</h2>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search products..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="bg-black/40 border-white/10 focus-visible:ring-blue-500"
                            />
                            <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-500" disabled={loading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <AgentLog logs={logs} />
                    </div>
                </div>

                {/* Center: Product Grid */}
                <div className="lg:col-span-6 p-6 overflow-y-auto bg-gradient-to-b from-black to-zinc-900 min-h-screen lg:min-h-0">
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <h1 className="text-2xl font-bold">Marketplace</h1>
                            {filteredProducts.length > 0 && <span className="text-xs text-gray-400">{filteredProducts.length} Items Validated</span>}
                        </div>

                        {/* Filters Toolbar */}
                        <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Filter className="h-4 w-4" />
                                <span className="uppercase font-bold tracking-wider text-xs">Filters:</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Min Repairability:</label>
                                <select
                                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                    value={minRepairScore}
                                    onChange={(e) => setMinRepairScore(Number(e.target.value))}
                                >
                                    <option value="0">Any</option>
                                    <option value="3">3+</option>
                                    <option value="5">5+</option>
                                    <option value="7">7+ (Good)</option>
                                    <option value="9">9+ (Excellent)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500">Max Price:</label>
                                <select
                                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                >
                                    <option value="10000">Any</option>
                                    <option value="200">Under $200</option>
                                    <option value="500">Under $500</option>
                                    <option value="1000">Under $1000</option>
                                    <option value="2000">Under $2000</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {products.length === 0 && !loading && (
                        <div className="text-center py-20 opacity-30">
                            <Sparkles className="h-16 w-16 mx-auto mb-4" />
                            <p>Enter a search term to deploy agents.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>

                {/* Right: Mentor Advice / Details */}
                <div className="lg:col-span-3 border-l border-white/10 p-4 bg-zinc-950/30 overflow-y-auto min-h-[500px] lg:min-h-0">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Mentor's Briefing</h2>
                    <div className="glass-panel rounded-xl p-6 min-h-[200px]">
                        {mentorAdvice ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {mentorAdvice}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Analysis pending...</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
