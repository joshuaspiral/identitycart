"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Bot, ShieldCheck, Search, FileText, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <div className="container mx-auto p-6 max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Mission Control Guide
                    </h1>
                    <p className="text-gray-400">Understand how the IdentityCart Intelligence Platform serves you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="industrial-panel bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Bot className="h-5 w-5 text-blue-500" /> Agent Swarm
                            </CardTitle>
                            <CardDescription className="text-gray-400">Meet the AI team working for you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="h-10 w-10 border border-blue-500/20 bg-blue-500/5 flex items-center justify-center shrink-0">
                                    <Search className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-100 uppercase tracking-wider">Scout</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Scours the database to find products relevant to your query and budget.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-10 w-10 border border-red-500/20 bg-red-500/5 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-100 uppercase tracking-wider">Critic & Guardian</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Checks for value, repairability, and eco-friendliness. Flags bad deals.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-10 w-10 border border-purple-500/20 bg-purple-500/5 flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-100 uppercase tracking-wider">Mentor</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Synthesizes all data into a personalized recommendation for you.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="industrial-panel bg-zinc-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <HelpCircle className="h-5 w-5 text-green-500" /> FAQ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-white/5">
                                    <AccordionTrigger className="hover:text-blue-400 text-gray-200">How is my data used?</AccordionTrigger>
                                    <AccordionContent className="text-gray-400 text-sm">
                                        Your Identity Profile is stored locally on your device. It is only sent to the agents to tailor recommendations for the current session.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-white/5">
                                    <AccordionTrigger className="hover:text-blue-400 text-gray-200">Are the prices real?</AccordionTrigger>
                                    <AccordionContent className="text-gray-400 text-sm">
                                        Yes, prices are updated to reflect estimated market averages for Q1 2026.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-white/5">
                                    <AccordionTrigger className="hover:text-blue-400 text-gray-200">What is Repairability?</AccordionTrigger>
                                    <AccordionContent className="text-gray-400 text-sm">
                                        We score products 1-10 based on how easy they are to fix. Higher is better for you and the planet.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
