"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"
import { ScanSearch, ShieldCheck, Scale, Microscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogEntry {
    agent: string
    message: string
    color: string
}

interface AgentLogProps {
    logs: LogEntry[]
}

const AgentIcon = ({ agent }: { agent: string }) => {
    switch (agent) {
        case "Scout":
            return <ScanSearch className="h-4 w-4" />
        case "Critic":
            return <Scale className="h-4 w-4" />
        case "Guardian":
            return <ShieldCheck className="h-4 w-4" />
        case "Mentor":
            return <Microscope className="h-4 w-4" />
        default:
            return <ScanSearch className="h-4 w-4" />
    }
}

export function AgentLog({ logs }: AgentLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Scroll to bottom when logs update
        if (scrollRef.current) {
            // Find the viewport element inside ScrollArea
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight
            }
        }
    }, [logs])

    if (logs.length === 0) {
        return (
            <div className="glass-panel h-full rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <ScanSearch className="h-12 w-12 mb-2" />
                <p>Waiting for mission...</p>
            </div>
        )
    }

    return (
        <div className="glass-panel h-full rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h3 className="font-semibold flex items-center gap-2">
                    <ScanSearch className="h-5 w-5 text-blue-400" />
                    Agent Activity
                </h3>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div
                                className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/10 shadow-sm",
                                    log.color === "blue" && "bg-blue-500/20 text-blue-400",
                                    log.color === "red" && "bg-red-500/20 text-red-400",
                                    log.color === "green" && "bg-green-500/20 text-green-400",
                                    log.color === "purple" && "bg-purple-500/20 text-purple-400"
                                )}
                            >
                                <AgentIcon agent={log.agent} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider",
                                        log.color === "blue" && "text-blue-400",
                                        log.color === "red" && "text-red-400",
                                        log.color === "green" && "text-green-400",
                                        log.color === "purple" && "text-purple-400"
                                    )}>
                                        {log.agent}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{log.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
