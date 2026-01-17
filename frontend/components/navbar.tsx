import Link from "next/link"
import { ShieldCheck, UserCircle } from "lucide-react"

export function Navbar({ identity }: { identity?: { role: string; roleIcon?: string } }) {
    return (
        <nav className="w-full glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50 bg-black/50 backdrop-blur-xl">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-1.5 shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 text-lg">
                        Identity Cart
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal tracking-widest uppercase">
                        Intelligence Platform
                    </span>
                </div>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/help" className="hidden md:block text-sm text-muted-foreground hover:text-white transition-colors">
                    Help
                </Link>
                <Link href="/profile" className="hidden md:block text-sm text-muted-foreground hover:text-white transition-colors">
                    Profile
                </Link>
                <Link href="/security" className="hidden md:block text-sm text-muted-foreground hover:text-white transition-colors">
                    Security Status
                </Link>
                {identity && (
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <UserCircle className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-mono text-gray-300 uppercase">{identity.role}</span>
                    </Link>
                )}
            </div>
        </nav>
    )
}
