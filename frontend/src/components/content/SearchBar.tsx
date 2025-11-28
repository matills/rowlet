import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useContentSearch } from '@/hooks'
import type { Content } from '@/types'

interface SearchBarProps {
  initialValue?: string
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  showSuggestions?: boolean
}

export function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Buscar películas, series, anime...',
  className,
  autoFocus,
  showSuggestions = true,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch suggestions
  const { data: suggestions } = useContentSearch({
    query: debouncedQuery,
    page: 1,
  })

  // Show dropdown when we have suggestions
  useEffect(() => {
    if (showSuggestions && suggestions?.data && suggestions.data.length > 0 && query.length > 2) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [suggestions, query, showSuggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        setShowDropdown(false)
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
    setShowDropdown(false)
    setSelectedIndex(-1)
  }, [])

  const handleSuggestionClick = useCallback(
    (content: Content) => {
      setShowDropdown(false)
      navigate(`/${content.type}/${content.externalId}`)
    },
    [navigate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || !suggestions?.data) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.data.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && suggestions.data[selectedIndex]) {
            handleSuggestionClick(suggestions.data[selectedIndex])
          } else {
            handleSubmit(e)
          }
          break
        case 'Escape':
          setShowDropdown(false)
          setSelectedIndex(-1)
          break
      }
    },
    [showDropdown, suggestions, selectedIndex, handleSuggestionClick, handleSubmit]
  )

  const getImageUrl = (posterPath?: string) => {
    if (!posterPath) return '/placeholder.jpg'
    return `https://image.tmdb.org/t/p/w92${posterPath}`
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
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

      {/* Suggestions dropdown */}
      {showDropdown && suggestions?.data && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <div className="max-h-[400px] overflow-y-auto">
            {suggestions.data.slice(0, 8).map((content, index) => (
              <button
                key={`${content.type}-${content.externalId}`}
                type="button"
                onClick={() => handleSuggestionClick(content)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent',
                  selectedIndex === index && 'bg-accent'
                )}
              >
                <img
                  src={getImageUrl(content.posterPath)}
                  alt={content.title}
                  className="h-12 w-8 rounded object-cover"
                  loading="lazy"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{content.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {content.type === 'movie' && 'Película'}
                    {content.type === 'tv' && 'Serie'}
                    {content.type === 'anime' && 'Anime'}
                    {content.releaseDate && ` • ${content.releaseDate.split('-')[0]}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {suggestions.totalResults > 8 && (
            <div className="border-t border-border bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              Presiona Enter para ver todos los {suggestions.totalResults} resultados
            </div>
          )}
        </div>
      )}
    </div>
  )
}
