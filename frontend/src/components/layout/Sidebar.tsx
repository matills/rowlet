import { Link, useLocation } from 'react-router-dom'
import { Home, Search, List, BarChart3, User, Film, Tv, Clapperboard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const publicLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/movies', label: 'Películas', icon: Film },
  { to: '/tv', label: 'Series', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Clapperboard },
]

const privateLinks = [
  { to: '/my-list', label: 'Mi Lista', icon: List },
  { to: '/stats', label: 'Estadísticas', icon: BarChart3 },
  { to: '/profile', label: 'Perfil', icon: User },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r transition-transform duration-300 md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <span className="text-xl font-bold text-primary">Rowlet</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1 p-4">
          <div className="mb-4">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              Explorar
            </h3>
            {publicLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {isAuthenticated && (
            <div>
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                Mi Cuenta
              </h3>
              {privateLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
