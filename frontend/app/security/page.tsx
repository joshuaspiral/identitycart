import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, Lock, CheckCircle } from "lucide-react"

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto p-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Security Center</h1>

                <div className="grid gap-6">
                    <Card className="glass-panel bg-green-500/10 border-green-500/20">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-green-400">1Password Passage Active</CardTitle>
                                <p className="text-sm text-green-300/60">Biometric authentication enabled</p>
                            </div>
                            <CheckCircle className="ml-auto h-6 w-6 text-green-400" />
                        </CardHeader>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="glass-panel border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5 text-blue-400" />
                                    Passkeys
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 text-sm">2 devices enrolled with secure passkeys.</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-2 py-1 bg-white/10 rounded text-xs">Chrome on Linux</span>
                                    <span className="px-2 py-1 bg-white/10 rounded text-xs">iPhone 14</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-panel border-white/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-purple-400" />
                                    Identity Vault
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-400 text-sm">Profile data encrypted at rest.</p>
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 font-mono">ID: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
