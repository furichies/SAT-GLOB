import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    id: string
    nombre: string
    precio: number
    imagen: string
    cantidad: number
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, cantidad: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === newItem.id)

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === newItem.id
                                ? { ...item, cantidad: item.cantidad + newItem.cantidad }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...currentItems, newItem] })
                }
            },
            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) })
            },
            updateQuantity: (id, cantidad) => {
                if (cantidad <= 0) {
                    get().removeItem(id)
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === id ? { ...item, cantidad } : item
                        ),
                    })
                }
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((total, item) => total + item.cantidad, 0),
            totalPrice: () => get().items.reduce((total, item) => total + item.precio * item.cantidad, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
