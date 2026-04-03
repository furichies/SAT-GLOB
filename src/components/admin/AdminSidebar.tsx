'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ShoppingBag,
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    Users,
    Settings,
    FileText,
    Slack,
    Printer,
} from 'lucide-react'

// Define the menu items directly in the component so it's easy to manage
const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/productos', icon: Package, label: 'Productos' },
    { href: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/admin/clientes', icon: Users, label: 'Clientes' },
    { href: '/admin/tickets', icon: MessageSquare, label: 'Tickets SAT' },
    { href: '/admin/tecnicos', icon: Users, label: 'Técnicos' },
    { href: '/admin/documentos', icon: FileText, label: 'Seguimiento y Documentación' },
    { href: '/admin/plantillas', icon: Printer, label: 'Plantillas' },
    { href: '/admin/conocimiento', icon: Settings, label: 'Base de Conocimiento' },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-0 z-10 hidden lg:block">
            <div className="flex items-center gap-2 mb-8">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MicroInfo Admin</span>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isActive
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto pt-8 border-t">
                <a
                    href="https://microinfo.slack.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-[#4A154B] transition-colors"
                >
                    <Slack className="h-5 w-5" />
                    Slack Corporativo
                </a>
            </div>
        </aside>
    )
}
