import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  initialValue?: string
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Buscar películas, series, anime...',
  className,
  autoFocus,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        if (onSearch) {
          onSearch(query.trim())
        } else {
          navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        }
      }
    },
    [query, onSearch, navigate]
  )

  const handleClear = useCallback(() => {
    setQuery('')
  }, [])

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
