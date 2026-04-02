import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Columna 1: Logo y descripción */}
          <div className="space-y-4">
            <img src="/logo.png" alt="Micro1475 Logo" className="h-16 w-auto object-contain mb-2" />
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza para equipos informáticos, componentes y servicio técnico especializado.
            </p>
            <div className="text-xs text-muted-foreground pt-2 space-y-1">
              <p className="font-bold">Sede Central:</p>
              <p>Calle Arcas del Agua, 2 (Sector 3)</p>
              <p>28905 Getafe (Madrid)</p>
            </div>
          </div>

          {/* Columna 2: Tienda */}
          <div className="space-y-4">
            <h4 className="font-medium">Tienda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tienda" className="hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/tienda?destacado=true" className="hover:text-primary transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link href="/tienda?enOferta=true" className="hover:text-primary transition-colors">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Servicios */}
          <div className="space-y-4">
            <h4 className="font-medium">Servicios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/sat" className="hover:text-primary transition-colors">
                  Servicio Técnico (SAT)
                </Link>
              </li>
              <li>
                <Link href="/admin/conocimiento" className="hover:text-primary transition-colors">
                  Base de Conocimiento
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="hover:text-primary transition-colors">
                  Soporte
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legal */}
          <div className="space-y-4">
            <h4 className="font-medium">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/legal/aviso-legal" className="hover:text-primary transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/legal/privacidad" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-primary transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/terminos" className="hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Micro1475. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
