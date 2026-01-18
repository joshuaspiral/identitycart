"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, Sparkles, User, ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
    role: "assistant" | "user"
    content: string
    timestamp: Date
}

export default function OnboardingChatPage() {
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "👋 Hi! I'm your shopping assistant. Let's find products that match your values.\n\nTo start, what brings you here today?",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [conversationComplete, setConversationComplete] = useState(false)
    const [identity, setIdentity] = useState<any>(null)
    const [partialData, setPartialData] = useState<any>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, loading])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const response = await fetch("http://localhost:8000/onboarding/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_history: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    user_message: input
                })
            })

            const data = await response.json()

            if (data.partial_data) {
                setPartialData(data.partial_data)
            }

            const aiMessage: Message = {
                role: "assistant",
                content: data.message,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])

            if (data.complete) {
                setConversationComplete(true)
                setIdentity(data.identity_profile)
            }

        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having trouble connecting. Please check if the backend is running.",
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = () => {
        localStorage.setItem("identity_profile", JSON.stringify(identity))
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans selection:bg-black selection:text-white">
            {/* Header */}
            <div className="p-6 bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-black/5 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-base font-bold text-zinc-900">Conversation</h1>
                    <p className="text-xs text-zinc-500">Building your profile</p>
                </div>
            </div>

            <div className="flex-1 flex max-w-6xl mx-auto w-full h-[calc(100vh-80px)]">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                        <Sparkles className="w-3 h-3 text-black" />
                                    </div>
                                )}

                                <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm border ${msg.role === "user"
                                    ? "bg-black text-white border-transparent rounded-tr-sm"
                                    : "bg-white text-zinc-700 border-black/5 rounded-tl-sm"
                                    }`}>
                                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm">
                                    <Sparkles className="w-3 h-3 text-black animate-pulse" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm rounded-tl-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce delay-150" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce delay-300" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-transparent">
                        <div className="max-w-2xl mx-auto relative">
                            {!conversationComplete ? (
                                <div className="flex gap-3 bg-white p-2 rounded-full border border-black/10 shadow-lg shadow-black/5 focus-within:ring-2 focus-within:ring-black/5 transition-all">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="Type your response..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm text-zinc-900 placeholder:text-zinc-400"
                                        disabled={loading}
                                        autoFocus
                                    />
                                    <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="w-10 h-10 rounded-full bg-black text-white hover:bg-zinc-800">
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button onClick={handleFinish} size="lg" className="w-full h-14 bg-black text-white hover:bg-zinc-800 rounded-full shadow-xl shadow-black/10 text-lg font-bold">
                                    Generate Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Optional) */}
                <div className="w-80 border-l border-black/5 bg-white p-6 hidden lg:block overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6 sticky top-0">Live Context</h3>
                    {partialData ? (
                        <div className="space-y-4">
                            {partialData.use_case && partialData.use_case !== "general shopping" && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-black/5">
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Goal</div>
                                    <div className="text-sm font-medium">{partialData.use_case}</div>
                                </div>
                            )}
                            {partialData.budget_preferred > 0 && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-black/5">
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Budget</div>
                                    <div className="text-sm font-medium">${partialData.budget_preferred}</div>
                                </div>
                            )}
                            {partialData.interests && partialData.interests.length > 0 && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-black/5">
                                    <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Interests</div>
                                    <div className="flex flex-wrap gap-1">
                                        {partialData.interests.map((tag: string, i: number) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-white border border-black/5 rounded-md text-zinc-600">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-400 italic">Context loading...</div>
                    )}
                </div>
            </div>
        </div>
    )
}
