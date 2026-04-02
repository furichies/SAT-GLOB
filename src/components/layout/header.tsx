'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { ShoppingCart, User, LogOut, Settings, Ticket, Package } from 'lucide-react'
import { UserRole } from '@prisma/client'
import { useState, useEffect } from 'react'
import { Notification } from '@/components/ui/notification'
import { useCartStore } from '@/store/use-cart-store'

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)

  // Solución para error de hidratación:
  // El store persiste en localStorage, lo que causa un desajuste entre el renderizado del servidor (0 items)
  // y el del cliente (n items). Usamos isMounted para renderizar el badge solo en el cliente.
  const [isMounted, setIsMounted] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCarritoClick = () => {
    console.log('Botón del carrito pulsado')
    // Redirigir al carrito
    router.push('/carrito')
  }

  const closeNotification = () => {
    setNotification(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
          duration={3000}
        />
      )}

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="relative flex items-center z-50">
              <img
                src="/logo.png"
                alt="Micro1475 Logo"
                className="h-20 w-auto object-contain drop-shadow-2xl transition-transform hover:scale-110 duration-500"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/tienda" className="text-sm font-medium transition-colors hover:text-primary">
                Tienda
              </Link>
              <Link href="/sat" className="text-sm font-medium transition-colors hover:text-primary">
                SAT
              </Link>
              <Link href="/quienes-somos" className="text-sm font-medium transition-colors hover:text-primary underline decoration-primary/30 underline-offset-4">
                ¿Quiénes somos?
              </Link>
              <Link href="/configurador" className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all border border-primary/20">
                Configurador
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Carrito - Con Link funcional */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCarritoClick}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ''} alt={user.name || 'Usuario'} />
                      <AvatarFallback>
                        {getInitials(user.name || user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/mi-cuenta" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Cuenta</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mis-pedidos" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mis Pedidos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sat" className="cursor-pointer">
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>Mis Tickets</span>
                    </Link>
                  </DropdownMenuItem>


                  {(user.role === UserRole.tecnico || user.role === UserRole.admin || user.role === UserRole.superadmin) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Panel de Administración</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={async () => {
                      await signOut({ redirect: false })
                      router.push('/')
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
