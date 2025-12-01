import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui'
import { getGenresForType } from '@/constants/genres'
import type { ContentType } from '@/types'
import { cn } from '@/lib/utils'

export interface FilterOptions {
  genres: number[]
  year?: number
  minRating?: number
  sortBy?: 'popularity' | 'rating' | 'year' | 'title'
  sortOrder?: 'asc' | 'desc'
}

interface SearchFiltersProps {
  contentType?: ContentType
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

export function SearchFilters({
  contentType,
  filters,
  onFiltersChange,
}: SearchFiltersProps) {
  const [open, setOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters)

  const genres = getGenresForType(contentType)

  useEffect(() => {
    setTempFilters(filters)
  }, [filters, open])

  const handleOpen = () => {
    setTempFilters(filters)
    setOpen(true)
  }

  const handleApply = () => {
    onFiltersChange(tempFilters)
    setOpen(false)
  }

  const handleReset = () => {
    setTempFilters({
      genres: [],
      year: undefined,
      minRating: undefined,
      sortBy: undefined,
      sortOrder: undefined,
    })
  }

  const handleGenreToggle = (genreId: number) => {
    setTempFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }))
  }

  const activeFiltersCount =
    filters.genres.length +
    (filters.year ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.sortBy ? 1 : 0)

  const hasActiveFilters = activeFiltersCount > 0

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
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader onClose={() => setOpen(false)}>
            <DialogTitle>Filtros de búsqueda</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Géneros */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium">Géneros</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleGenreToggle(genre.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm transition-colors',
                      tempFilters.genres.includes(genre.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-accent'
                    )}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Año */}
            <div>
              <Label htmlFor="year" className="mb-2 block text-sm font-medium">
                Año de lanzamiento
              </Label>
              <Select
                value={tempFilters.year?.toString() || 'all'}
                onValueChange={(value) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    year: value === 'all' ? undefined : parseInt(value),
                  }))
                }
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Todos los años" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating mínimo */}
            <div>
              <Label className="mb-3 block text-sm font-medium">
                Calificación mínima: {tempFilters.minRating || 0}/10
              </Label>
              <Slider
                value={[tempFilters.minRating || 0]}
                onValueChange={([value]) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    minRating: value === 0 ? undefined : value,
                  }))
                }
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Ordenar por */}
            <div>
              <Label htmlFor="sortBy" className="mb-2 block text-sm font-medium">
                Ordenar por
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={tempFilters.sortBy || 'none'}
                  onValueChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      sortBy: value === 'none' ? undefined : (value as any),
                    }))
                  }
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="Sin ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin ordenar</SelectItem>
                    <SelectItem value="popularity">Popularidad</SelectItem>
                    <SelectItem value="rating">Calificación</SelectItem>
                    <SelectItem value="year">Año</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={tempFilters.sortOrder || 'desc'}
                  onValueChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      sortOrder: value as 'asc' | 'desc',
                    }))
                  }
                  disabled={!tempFilters.sortBy}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descendente</SelectItem>
                    <SelectItem value="asc">Ascendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleReset}>
              Limpiar todo
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply}>
              Aplicar filtros
              {hasActiveFilters && ` (${activeFiltersCount})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
