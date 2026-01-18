"use client"

import { Shield, Key, Lock, Activity, CheckCircle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function SecurityDashboard() {
    const [identity, setIdentity] = useState<any>(null)

    useEffect(() => {
        const saved = localStorage.getItem("identity_profile")
        if (saved) setIdentity(JSON.parse(saved))
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground p-8 font-mono">
            <header className="mb-12 border-b border-border pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-green-500" />
                        Identity Vault Status
                    </h1>
                    <p className="text-muted-foreground mt-2">1Password Secure Environment</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="ghost">← Back to Dashboard</Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Vault Status */}
                <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-start justify-between mb-4">
                        <Database className="w-6 h-6 text-green-500" />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                            Active
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Primary Vault</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between border-b border-border/50 pb-2">
                            <span>Encryption</span>
                            <span className="text-foreground">AES-256-GCM</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                            <span>Last Sync</span>
                            <span className="text-foreground">Just now</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Items</span>
                            <span className="text-foreground">1 Identity Profile</span>
                        </div>
                    </div>
                </div>

                {/* Authentication Method */}
                <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-start justify-between mb-4">
                        <Key className="w-6 h-6 text-blue-500" />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                            Verified
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Authentication</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex justify-between border-b border-border/50 pb-2">
                            <span>Method</span>
                            <span className="text-foreground">Passkey (Biometric)</span>
                        </div>
                        <div className="flex justify-between border-b border-border/50 pb-2">
                            <span>Session ID</span>
                            <span className="text-foreground font-mono text-xs">8f72-1b9a-4c3d</span>
                        </div>
                    </div>
                </div>

                {/* Agent Access Control */}
                <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-start justify-between mb-4">
                        <Activity className="w-6 h-6 text-red-500" />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            Monitoring
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Agent Permissions</h3>
                    <div className="space-y-3">
                        {['Scout', 'Critic', 'Guardian'].map(agent => (
                            <div key={agent} className="flex items-center justify-between p-2 rounded bg-background/50 text-sm">
                                <span className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" /> {agent}
                                </span>
                                <span className="text-xs text-muted-foreground">Read Only</span>
                            </div>
                        ))}
                    </div>
                    <Button variant="destructive" size="sm" className="w-full mt-4">
                        Revoke All Access
                    </Button>
                </div>

            </div>

            {/* Raw Data View */}
            <div className="mt-8 p-6 rounded-xl border border-border bg-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Decrypted Identity Object
                </h3>
                <pre className="p-4 rounded-lg bg-black/50 overflow-x-auto text-xs text-green-400 font-mono">
                    {identity ? JSON.stringify(identity, null, 2) : "// No identity data found in vault"}
                </pre>
            </div>
        </div>
    )
}
