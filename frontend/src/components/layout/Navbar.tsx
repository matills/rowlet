import { Link } from 'react-router-dom'
import { Search, Bell, Menu, Sun, Moon, LogOut, User, Settings, BarChart3 } from 'lucide-react'
import { Button, Avatar, AvatarImage, AvatarFallback, OwlLogo } from '@/components/ui'
import { useAuth } from '@/hooks'
import { useThemeStore } from '@/stores'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useThemeStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Menu button (mobile) */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - hidden on desktop as it's in sidebar */}
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <OwlLogo size={28} />
            <span className="text-xl font-bold gradient-text">Owlist</span>
          </Link>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden flex-1 justify-center md:flex">
          <Link
            to="/search"
            className="flex w-full max-w-md items-center gap-2 rounded-full border bg-muted/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4" />
            <span>Buscar películas, series, anime...</span>
          </Link>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Search button (mobile) */}
          <Link to="/search" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-transform hover:scale-105"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted"
                >
                  <Avatar className="h-8 w-8 border-2 border-transparent transition-colors hover:border-primary">
                    <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border bg-card p-2 shadow-lg animate-scale-in">
                    {/* User Info */}
                    <div className="mb-2 border-b pb-2 px-2">
                      <p className="font-medium">{user?.displayName || user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <User className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/my-list"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Mi Lista
                    </Link>
                    <Link
                      to="/stats"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <Settings className="h-4 w-4" />
                      Estadísticas
                    </Link>

                    <div className="my-2 border-t" />

                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:block">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
