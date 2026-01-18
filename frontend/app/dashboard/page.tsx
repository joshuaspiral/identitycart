"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, Filter, ArrowRight, Zap, ListFilter, Activity } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function DashboardPage() {
    const searchParams = useSearchParams()
    const [identity, setIdentity] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [input, setInput] = useState(searchParams?.get('q') || "")
    const [loading, setLoading] = useState(false)
    const [searchPerformed, setSearchPerformed] = useState(false)
    const [mentorAdvice, setMentorAdvice] = useState("")
    const [minRepairScore, setMinRepairScore] = useState(0)
    const [maxPrice, setMaxPrice] = useState(10000)
    const [sortBy, setSortBy] = useState("price_asc")

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Load / Save Session State
    useEffect(() => {
        const savedMessages = sessionStorage.getItem("dashboard_messages")
        const savedProducts = sessionStorage.getItem("dashboard_products")
        if (savedMessages) try { setMessages(JSON.parse(savedMessages)) } catch (e) { }
        if (savedProducts) try { setProducts(JSON.parse(savedProducts)) } catch (e) { }
    }, [])

    useEffect(() => {
        if (messages.length > 0) sessionStorage.setItem("dashboard_messages", JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        if (products.length > 0) sessionStorage.setItem("dashboard_products", JSON.stringify(products))
    }, [products])

    // Initial Search Logic
    useEffect(() => {
        const stored = localStorage.getItem("identity_profile")
        if (stored) {
            const parsedIdentity = JSON.parse(stored)

            // SELF-HEALING: Fix stuck 10k budget automatically
            if (parsedIdentity.budget && parsedIdentity.budget.maximum === 10000 && parsedIdentity.budget.preferred < 5000) {
                // If max is 10k but preferred is reasonable, clamp it down
                parsedIdentity.budget.maximum = Math.max(parsedIdentity.budget.preferred * 1.2, 1000)
                localStorage.setItem("identity_profile", JSON.stringify(parsedIdentity))
            }

            setIdentity(parsedIdentity)

            const hasPreservedState = sessionStorage.getItem("dashboard_messages")
            if (!hasPreservedState && !searchPerformed) {
                const searchParams = new URLSearchParams(window.location.search)
                const query = searchParams.get("q")
                if (query) {
                    handleSearchDirectly(query, parsedIdentity)
                    setSearchPerformed(true)
                } else if (parsedIdentity.use_case) {
                    handleSearchDirectly(parsedIdentity.use_case, parsedIdentity)
                    setSearchPerformed(true)
                }
            }
        }
    }, [searchPerformed])

    const filteredProducts = products
        .filter(p =>
            p.repairability_score >= minRepairScore &&
            p.price <= maxPrice
        )
        .sort((a, b) => {
            if (sortBy === "price_asc") return a.price - b.price
            if (sortBy === "price_desc") return b.price - a.price
            if (sortBy === "repairability") return b.repairability_score - a.repairability_score
            return 0
        })

    const handleSearchDirectly = async (query: string, currentIdentity = identity) => {
        if (!query.trim()) return
        setLoading(true)
        setInput(query)

        // Clear previous state for a new search
        setMessages([])
        setProducts([])
        setMentorAdvice("")
        sessionStorage.removeItem("dashboard_messages")
        sessionStorage.removeItem("dashboard_products")
        sessionStorage.removeItem("identity_cart_products") // Clear cache

        setMessages([{ agent: "System", message: `Initializing global search for "${query}"...`, color: "blue" }])

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: query,
                    identity: currentIdentity || {}
                })
            })

            if (!response.ok) throw new Error(`Server error: ${response.status}`)
            const data = await response.json()

            if (data.logs && Array.isArray(data.logs)) {
                setMessages(prev => [...prev, ...data.logs])
            }

            if (data.products) {
                setProducts(data.products)
                sessionStorage.setItem("identity_cart_products", JSON.stringify(data.products))
            } else {
                setMessages(prev => [...prev, { agent: "System", message: "No products returned.", color: "red" }])
            }

            if (data.final_response) setMentorAdvice(data.final_response)

        } catch (error) {
            setMessages(prev => [...prev, { agent: "System", message: "Connection failed.", color: "red" }])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        await handleSearchDirectly(input)
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white">
            <Navbar identity={identity} />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Sidebar: Mission Control */}
                <div className="w-80 border-r border-black/5 flex flex-col bg-white/50 backdrop-blur-xl">
                    <div className="p-4 border-b border-black/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                            <Activity className="w-3 h-3" /> Live Feed
                        </div>
                        <form onSubmit={handleSearch} className="flex gap-2 relative">
                            <Input
                                placeholder="Search products..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-white border-black/10 focus:border-black/20 focus:ring-0 pl-3 pr-10 text-sm h-10 transition-all shadow-sm"
                            />
                            <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-10 bg-transparent hover:bg-black/5 text-zinc-500" disabled={loading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    {/* Agent Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                        {messages.map((log, i) => (
                            <div key={i} className={`p-3 rounded-lg border animate-in slide-in-from-left-2 duration-300 shadow-sm ${log.color === 'red' ? 'bg-red-50 border-red-100 text-red-600' :
                                log.color === 'green' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                    log.color === 'blue' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                        'bg-white border-black/5 text-zinc-600'
                                }`}>
                                <div className="flex justify-between items-start mb-1.5 opacity-70">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                        <span className="font-bold text-xs uppercase tracking-wider">{log.agent}</span>
                                    </div>
                                    <span className="text-[10px] opacity-50 whitespace-nowrap ml-2 font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="opacity-90 leading-relaxed font-sans text-sm">{log.message}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Main Content: Product Grid */}
                <div className="flex-1 overflow-y-auto bg-[#FAFAFA] p-6 relative">

                    <div className="relative z-10 max-w-6xl mx-auto space-y-6">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center bg-white border border-black/5 p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-zinc-400">Sort & Filter:</span>
                                <select
                                    className="bg-zinc-50 border border-black/5 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-black/20"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="repairability">Most Repairable</option>
                                </select>
                                <span className="text-zinc-300">|</span>
                                <select
                                    className="bg-zinc-50 border border-black/5 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-black/20"
                                    value={minRepairScore}
                                    onChange={(e) => setMinRepairScore(Number(e.target.value))}
                                >
                                    <option value="0">Repairability: Any</option>
                                    <option value="7">Repairability: 7+</option>
                                </select>
                                <select
                                    className="bg-zinc-50 border border-black/5 rounded-md px-3 py-1 text-sm focus:outline-none focus:border-black/20"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                                >
                                    <option value="10000">Price: Any</option>
                                    <option value="500">Under $500</option>
                                    <option value="1000">Under $1000</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                                <div className="flex items-center gap-2 bg-zinc-100 rounded-md px-2 py-1">
                                    <span className="text-[10px] uppercase tracking-wider opacity-50">Budget:$</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-transparent border-none p-0 text-xs font-bold text-zinc-700 focus:ring-0 appearance-none"
                                        value={identity?.budget?.maximum || 0}
                                        onChange={(e) => {
                                            const newBudget = Number(e.target.value)
                                            const newIdentity = { ...identity, budget: { ...identity.budget, maximum: newBudget } }
                                            setIdentity(newIdentity)
                                            localStorage.setItem("identity_profile", JSON.stringify(newIdentity))
                                        }}
                                    />
                                </div>
                                <span>{filteredProducts.length} AVAILABLE</span>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((p) => (
                                <Link key={p.id} href={`/product/${p.id}`} className="group block h-full">
                                    <div className="h-full bg-white border border-black/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col relative">
                                        {/* Image */}
                                        <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden p-6 flex items-center justify-center">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                                            ) : (
                                                <div className="text-zinc-400 font-mono text-sm">NO IMAGE</div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-amber-600 transition-colors">{p.name}</h3>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500">
                                                    {p.category || "Item"}
                                                </span>
                                                {p.repairability_score >= 7 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        Repairable
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-black/5 flex justify-between items-center">
                                                <div className="font-mono text-xl font-bold tracking-tight">${p.price}</div>
                                                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && !loading && (
                            <div className="text-center py-32 opacity-30">
                                <Zap className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
                                <p className="font-medium text-sm text-zinc-400">Ready to search.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Mentor Briefing */}
                <div className="w-80 border-l border-black/5 bg-white/50 backdrop-blur-xl p-6 overflow-y-auto hidden xl:block">
                    <div className="sticky top-0">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-6">
                            <Sparkles className="w-3 h-3" /> Mentor Insight
                        </div>
                        {mentorAdvice ? (
                            <div className="prose prose-sm prose-zinc text-zinc-600">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {mentorAdvice}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-zinc-50 text-center border border-dashed border-black/5">
                                <p className="text-xs text-zinc-400 font-medium">Analysis will appear here...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
