"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Wrench, ShieldAlert, Info, ShoppingCart } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    specs: Record<string, any>
    repairability_score: number
    tags: string[]
}

export function ProductCard({ product }: { product: Product }) {
    const handleAddToCart = () => {
        // Access the global addToCart function
        if (typeof window !== 'undefined' && (window as any).addToCart) {
            (window as any).addToCart(product)
            // Optional: Show a toast notification
        }
    }

    return (
        <Card className="bg-card border-border hover:border-primary/50 group overflow-hidden relative flex flex-col h-full transition-all duration-300">
            {/* Glow effect - more precise */}
            <div className="absolute top-0 right-0 p-3 opacity-50 z-20">
                <div className={`h-1.5 w-1.5 rounded-full ${product.repairability_score > 7 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-muted-foreground'}`}></div>
            </div>

            {/* Image Placeholder */}
            <div className="relative h-48 w-full bg-muted border-b border-border overflow-hidden">
                <img
                    src={`https://placehold.co/600x400/050505/333?text=${encodeURIComponent(product.name)}&font=roboto`}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 saturate-0 group-hover:saturate-100 mix-blend-multiply dark:mix-blend-normal"
                />
            </div>

            <CardHeader className="relative z-10 pb-2 pt-4 px-4">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-md font-bold text-card-foreground leading-tight">
                        {product.name}
                    </CardTitle>
                    <span className="text-lg font-mono text-foreground border border-border px-2 bg-secondary/50">
                        ${product.price}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {product.tags.map(tag => (
                        <span key={tag} className="text-[9px] uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5 hover:text-foreground transition-colors cursor-default">
                            {tag}
                        </span>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10 px-4 flex-grow">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col border-l border-border pl-2">
                            <span className="uppercase text-[8px] text-muted-foreground font-bold tracking-wider mb-0.5">{key}</span>
                            <span className="text-foreground font-mono truncate">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t border-border p-4 relative z-10 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Repairability Score">
                        <Wrench className="h-3 w-3" />
                        <span className="font-mono">{product.repairability_score}/10</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        title="More Details"
                        className="h-8 w-8 flex items-center justify-center border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        onClick={() => alert(`Detailed Specs for ${product.name}:\n\n${JSON.stringify(product.specs, null, 2)}`)}
                    >
                        <Info className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleAddToCart}
                        title="Add to Cart"
                        className="h-8 w-8 flex items-center justify-center border border-border hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all"
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </button>
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}&tbm=shop`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 h-8 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                        Buy <Zap className="h-3 w-3 fill-current" />
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}
