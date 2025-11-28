import { useState } from 'react'
import { Filter } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
} from '@/components/ui'
import { getGenresForType } from '@/constants/genres'
import type { ContentType, Genre } from '@/types'
import { cn } from '@/lib/utils'

interface SearchFiltersProps {
  contentType?: ContentType
  selectedGenres: number[]
  onGenresChange: (genres: number[]) => void
}

export function SearchFilters({
  contentType,
  selectedGenres,
  onGenresChange,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false)
  const [tempSelectedGenres, setTempSelectedGenres] = useState<number[]>(selectedGenres)

  const genres = getGenresForType(contentType)

  const handleOpen = () => {
    setTempSelectedGenres(selectedGenres)
    setOpen(true)
  }

  const handleApply = () => {
    onGenresChange(tempSelectedGenres)
    setOpen(false)
  }

  const handleReset = () => {
    setTempSelectedGenres([])
  }

  const handleGenreToggle = (genreId: number) => {
    setTempSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
  }

  const hasActiveFilters = selectedGenres.length > 0

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className={cn(hasActiveFilters && 'border-primary')}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtros
        {hasActiveFilters && (
          <Badge variant="default" className="ml-2 h-5 px-1.5 text-xs">
            {selectedGenres.length}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader onClose={() => setOpen(false)}>
            <DialogTitle>Filtros de búsqueda</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">Géneros</h3>
                {tempSelectedGenres.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      tempSelectedGenres.includes(genre.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-accent'
                    )}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply}>
              Aplicar filtros
              {tempSelectedGenres.length > 0 && ` (${tempSelectedGenres.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
