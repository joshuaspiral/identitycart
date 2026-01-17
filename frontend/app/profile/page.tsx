"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, Save } from "lucide-react"

export default function ProfilePage() {
    const [identity, setIdentity] = useState<any>({ role: "", budget: 1000, values: [] })
    const [message, setMessage] = useState("")

    useEffect(() => {
        const saved = localStorage.getItem("identity_profile")
        if (saved) {
            setIdentity(JSON.parse(saved))
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem("identity_profile", JSON.stringify(identity))
        setMessage("Profile updated successfully.")
        setTimeout(() => setMessage(""), 3000)
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <Navbar identity={identity} />

            <div className="container mx-auto p-6 max-w-xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <UserCircle className="h-8 w-8 text-primary" />
                    Identity Profile
                </h1>

                <Card className="industrial-panel">
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Primary Role</Label>
                            <Input
                                value={identity.role}
                                onChange={(e) => setIdentity({ ...identity, role: e.target.value })}
                                className="bg-background border-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Default Budget ($)</Label>
                            <Input
                                type="number"
                                value={identity.budget}
                                onChange={(e) => setIdentity({ ...identity, budget: parseInt(e.target.value) })}
                                className="bg-background border-input"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button onClick={handleSave} className="w-full">
                            <Save className="h-4 w-4 mr-2" /> Save Changes
                        </Button>
                        {message && <p className="text-green-500 text-sm text-center">{message}</p>}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
