"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    image?: string
    specs?: any
}

export function ShoppingCartComponent() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Load cart from localStorage
        const saved = localStorage.getItem("shopping_cart")
        if (saved) {
            setCartItems(JSON.parse(saved))
        }
    }, [])

    useEffect(() => {
        // Save cart to localStorage whenever it changes
        localStorage.setItem("shopping_cart", JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product: any) => {
        console.log("Adding to cart:", product)
        setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                specs: product.specs
            }]
        })
        setIsOpen(true)  // Auto-open cart when item added
    }

    // Expose globally
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).addToCart = addToCart
        }
    }, [])

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        )
    }

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id))
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <>
            {/* Cart Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-muted rounded-sm transition-colors"
            >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                    </span>
                )}
            </button>

            {/* Cart Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="ml-auto relative bg-background border-l border-border w-full max-w-md flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                Shopping Cart ({itemCount})
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        <Separator />

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p>Your cart is empty</p>
                                    <p className="text-sm">Add products from the dashboard</p>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <Card key={item.id} className="industrial-panel">
                                        <CardContent className="p-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{item.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        ${item.price} each
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm font-mono w-6 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-right">
                                                <span className="font-bold">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cartItems.length > 0 && (
                            <>
                                <Separator />
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Products link to external sellers. IdentityCart helps you find the right products, you buy from trusted vendors.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
