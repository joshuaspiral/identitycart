"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Bot, ShieldCheck, Search, FileText, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <Navbar />

            <div className="container mx-auto p-6 max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-primary">
                        Mission Control Guide
                    </h1>
                    <p className="text-muted-foreground">Understand how the IdentityCart Intelligence Platform serves you.</p>
                </div>

                <div className="space-y-6">
                    <Card className="industrial-panel">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <Bot className="h-5 w-5 text-primary" /> Agent Swarm
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">Meet the AI team working for you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                                    <Search className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Scout Agent</h3>
                                    <p className="text-sm text-muted-foreground">Scours global databases to find products matching your identity.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                                    <ShieldCheck className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Critic Agent</h3>
                                    <p className="text-sm text-muted-foreground">Analyzes pricing trends and build quality to prevent bad buys.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">Guardian Agent</h3>
                                    <p className="text-sm text-muted-foreground">Ensures products align with your ethical values (Repairability, Privacy).</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="industrial-panel">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <HelpCircle className="h-5 w-5 text-primary" /> FAQ
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-border">
                                    <AccordionTrigger className="hover:text-primary text-muted-foreground">How is my data used?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Your identity profile is stored locally in your browser. Agents only use it during active search sessions to filter results.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-border">
                                    <AccordionTrigger className="hover:text-primary text-muted-foreground">Are these real products?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        Currently, the system simulates a market based on real-world tech specifications from our database.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-border">
                                    <AccordionTrigger className="hover:text-primary text-muted-foreground">What is Repairability?</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
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
