
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Wrench, ShieldAlert, Info } from "lucide-react"

interface Product {
    id: string
    name: string
    price: number
    specs: Record<string, any>
    repairability_score: number
    tags: string[]
}

export function ProductCard({ product }: { product: Product }) {
    return (
        <Card className="bg-[#0A0A0A] border border-white/10 group overflow-hidden relative flex flex-col h-full hover:border-white/20 transition-colors">
            {/* Glow effect - more precise */}
            <div className="absolute top-0 right-0 p-3 opacity-50">
                <div className={`h-1.5 w-1.5 rounded-full ${product.repairability_score > 7 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-700'}`}></div>
            </div>

            {/* Image Placeholder */}
            <div className="relative h-48 w-full bg-black border-b border-white/5 overflow-hidden">
                <img
                    src={`https://placehold.co/600x400/050505/333?text=${encodeURIComponent(product.name)}&font=roboto`}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 saturate-0 group-hover:saturate-100"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-12"></div>
            </div>

            <CardHeader className="relative z-10 pb-2 pt-4 px-4">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-md font-bold text-gray-100 leading-tight">
                        {product.name}
                    </CardTitle>
                    <span className="text-lg font-mono text-white border border-white/10 px-2 bg-white/5">
                        ${product.price}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {product.tags.map(tag => (
                        <span key={tag} className="text-[9px] uppercase tracking-widest text-gray-500 border border-white/5 px-1.5 py-0.5 hover:text-white transition-colors cursor-default">
                            {tag}
                        </span>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10 px-4 flex-grow">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col border-l border-white/10 pl-2">
                            <span className="uppercase text-[8px] text-gray-600 font-bold tracking-wider mb-0.5">{key}</span>
                            <span className="text-gray-300 font-mono truncate">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t border-white/5 p-4 relative z-10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500" title="Repairability Score">
                        <Wrench className="h-3 w-3" />
                        <span className="font-mono">{product.repairability_score}/10</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        title="More Details"
                        className="h-8 w-8 flex items-center justify-center border border-white/10 hover:bg-white text-gray-500 hover:text-black transition-all"
                        onClick={() => alert(`Detailed Specs for ${product.name}:\n\n${JSON.stringify(product.specs, null, 2)}`)}
                    >
                        <Info className="h-4 w-4" />
                    </button>
                    <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(product.name)}&tbm=shop`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 h-8 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-blue-400 transition-colors"
                    >
                        Buy <Zap className="h-3 w-3 fill-current" />
                    </a>
                </div>
            </CardFooter>
        </Card>
    )
}
