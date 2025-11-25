import { Link, useLocation } from 'react-router-dom'
import { Home, Search, List, BarChart3, User, Film, Tv, Clapperboard, X, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const mainLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/my-list', label: 'Mi Lista', icon: List },
  { to: '/stats', label: 'Estadísticas', icon: BarChart3 },
]

const exploreLinks = [
  { to: '/movies', label: 'Películas', icon: Film },
  { to: '/tv', label: 'Series', icon: Tv },
  { to: '/anime', label: 'Anime', icon: Clapperboard },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        onClick={onClose}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className={cn(
          'h-5 w-5 transition-transform duration-200',
          !isActive && 'group-hover:scale-110'
        )} />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform duration-300 md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <span className="text-xl font-bold gradient-text">owlist</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden h-16 items-center border-b px-6 md:flex">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">owlist</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-6 p-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Principal
            </h3>
            {mainLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>

          {/* Explore Section */}
          <div className="space-y-1">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explorar
            </h3>
            {exploreLinks.map((link) => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>

          {/* Profile Link - Only for authenticated users */}
          {isAuthenticated && (
            <div className="space-y-1">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cuenta
              </h3>
              <NavLink to="/profile" label="Mi Perfil" icon={User} />
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className="mt-auto rounded-xl bg-muted/50 p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Inicia sesión para guardar tu progreso y acceder a todas las funciones.
              </p>
              <Link to="/login" onClick={onClose}>
                <Button className="w-full gap-2" size="sm">
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
