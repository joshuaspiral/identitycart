import Link from "next/link"
import { UserCircle, ScanSearch, ShieldCheck } from "lucide-react"

import { ShoppingCartComponent } from "@/components/shopping-cart"

export function Navbar({ identity }: { identity?: { role: string; roleIcon?: string } }) {
    return (
        <nav className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                    <div className="flex items-center justify-center p-1.5 rounded-sm bg-primary text-primary-foreground">
                        <ScanSearch className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline-block">IdentityCart</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/help" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Help
                    </Link>
                    <Link href="/profile" className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Profile
                    </Link>
                    {identity && (
                        <Link href="/profile" className="flex items-center gap-2 pl-4 border-l border-border">
                            <span className="text-xs text-muted-foreground text-right hidden lg:block">
                                <div className="font-bold text-foreground">OPERATOR</div>
                                <div className="uppercase tracking-wider">{identity.role}</div>
                            </span>
                            <UserCircle className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
