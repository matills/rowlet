import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { SearchBar, ContentGrid, SearchFilters, type FilterOptions } from '@/components/content'
import { useContentSearch, useAuth, useAddToList, useToggleLike } from '@/hooks'
import type { ContentType } from '@/types'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'
  const initialGenres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean) || []
  const initialYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
  const initialMinRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
  const initialSortBy = searchParams.get('sortBy') as FilterOptions['sortBy']
  const initialSortOrder = searchParams.get('sortOrder') as FilterOptions['sortOrder']

  const [query, setQuery] = useState(initialQuery)
  const [contentType, setContentType] = useState<ContentType | undefined>(
    initialType === 'all' ? undefined : (initialType as ContentType)
  )
  const [filters, setFilters] = useState<FilterOptions>({
    genres: initialGenres,
    year: initialYear,
    minRating: initialMinRating,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  })

  const { isAuthenticated } = useAuth()
  const addToList = useAddToList()
  const toggleLike = useToggleLike()

  // Handler para marcar como visto
  const handleMarkAsWatched = (content: any) => {
    if (isAuthenticated) {
      addToList.mutate({ content, status: 'completed' })
    }
  }

  // Handler para me gusta
  const handleToggleLike = (content: any) => {
    if (isAuthenticated) {
      toggleLike.mutate({
        externalId: content.externalId,
        type: content.type,
        title: content.title,
        posterPath: content.posterPath,
      })
    }
  }

  const { data, isLoading, isFetching } = useContentSearch({
    query,
    type: contentType,
    genre: filters.genres.length > 0 ? filters.genres[0] : undefined, // Backend only supports one genre
    year: filters.year,
    minRating: filters.minRating,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: 1,
  })

  useEffect(() => {
    const q = searchParams.get('q')
    const type = searchParams.get('type')
    const genres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean) || []
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const sortBy = searchParams.get('sortBy') as FilterOptions['sortBy']
    const sortOrder = searchParams.get('sortOrder') as FilterOptions['sortOrder']

    if (q) {
      setQuery(q)
    }
    if (type) {
      setContentType(type === 'all' ? undefined : (type as ContentType))
    }
    setFilters({
      genres,
      year,
      minRating,
      sortBy,
      sortOrder,
    })
  }, [searchParams])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    updateSearchParams(newQuery, contentType, filters)
  }

  const handleTypeChange = (value: string) => {
    const newType = value === 'all' ? undefined : (value as ContentType)
    setContentType(newType)
    if (query) {
      updateSearchParams(query, newType, filters)
    }
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    if (query) {
      updateSearchParams(query, contentType, newFilters)
    }
  }

  const updateSearchParams = (
    q: string,
    type?: ContentType,
    filterOptions?: FilterOptions
  ) => {
    const params: Record<string, string> = { q }
    if (type) {
      params.type = type
    }
    if (filterOptions) {
      if (filterOptions.genres.length > 0) {
        params.genres = filterOptions.genres.join(',')
      }
      if (filterOptions.year) {
        params.year = filterOptions.year.toString()
      }
      if (filterOptions.minRating) {
        params.minRating = filterOptions.minRating.toString()
      }
      if (filterOptions.sortBy) {
        params.sortBy = filterOptions.sortBy
      }
      if (filterOptions.sortOrder) {
        params.sortOrder = filterOptions.sortOrder
      }
    }
    setSearchParams(params)
  }

  return (
    <div className="space-y-6">
      {/* Main search bar - prominent and centered */}
      <div className="flex flex-col items-center gap-4 py-4">
        <h1 className="text-3xl font-bold">Buscar Contenido</h1>
        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          className="w-full max-w-2xl"
          autoFocus={!query}
        />
      </div>

      {/* Filters and Results */}
      <Tabs
        value={contentType || 'all'}
        onValueChange={handleTypeChange}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="movie">Películas</TabsTrigger>
            <TabsTrigger value="tv">Series</TabsTrigger>
            <TabsTrigger value="anime">Anime</TabsTrigger>
          </TabsList>
          <SearchFilters
            contentType={contentType}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <TabsContent value="all" className="mt-6">
          {query ? (
            <>
              <p className="mb-4 text-muted-foreground">
                {data?.totalResults
                  ? `${data.totalResults} resultados para "${query}"`
                  : isLoading
                  ? 'Buscando...'
                  : `No se encontraron resultados para "${query}"`}
              </p>
              <ContentGrid
                content={data?.data || []}
                isLoading={isLoading || isFetching}
                onAddToList={
                  isAuthenticated
                    ? (content, status) => addToList.mutate({ content, status })
                    : undefined
                }
                onMarkAsWatched={isAuthenticated ? handleMarkAsWatched : undefined}
                onToggleLike={isAuthenticated ? handleToggleLike : undefined}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg text-muted-foreground">
                Escribe algo para comenzar a buscar
              </p>
            </div>
          )}
        </TabsContent>

        {['movie', 'tv', 'anime'].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            {query ? (
              <>
                <p className="mb-4 text-muted-foreground">
                  {data?.totalResults
                    ? `${data.totalResults} resultados para "${query}" en ${type === 'movie' ? 'películas' : type === 'tv' ? 'series' : 'anime'}`
                    : isLoading
                    ? 'Buscando...'
                    : `No se encontraron resultados para "${query}"`}
                </p>
                <ContentGrid
                  content={data?.data || []}
                  isLoading={isLoading || isFetching}
                  onAddToList={
                    isAuthenticated
                      ? (content, status) => addToList.mutate({ content, status })
                      : undefined
                  }
                  onMarkAsWatched={isAuthenticated ? handleMarkAsWatched : undefined}
                  onToggleLike={isAuthenticated ? handleToggleLike : undefined}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Escribe algo para comenzar a buscar
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
