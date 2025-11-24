import { Link } from 'react-router-dom'
import { Search, Bell, User, Menu, Sun, Moon } from 'lucide-react'
import { Button, Avatar, AvatarImage, AvatarFallback } from '@/components/ui'
import { useAuth } from '@/hooks'
import { useThemeStore } from '@/stores'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isAuthenticated } = useAuth()
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Rowlet</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/browse"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Explorar
            </Link>
            <Link
              to="/my-list"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Mi Lista
            </Link>
            {isAuthenticated && (
              <Link
                to="/stats"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Estadísticas
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link to="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
