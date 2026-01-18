"use client"

import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { useState } from "react"
import { useState } from "react"

export function OnePasswordSave({ identity }: { identity: any }) {
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        // Simulate 1Password CLI/SDK interaction
        // In a real app, this would trigger the 1Password 'Save Item' intent or use the CLI
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSaving(false)
        alert("Identity secured in 1Password Vault! 🔐")
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-400 transition-all font-mono text-xs"
            onClick={handleSave}
            disabled={saving}
        >
            <Lock className="w-3 h-3" />
            {saving ? "Encrypting..." : "Save Identity to 1Password"}
        </Button>
    )
}
