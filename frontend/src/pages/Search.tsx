import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter } from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { SearchBar, ContentGrid, SearchFilters } from '@/components/content'
import { useContentSearch, useAuth, useAddToList } from '@/hooks'
import type { ContentType } from '@/types'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || 'all'
  const initialGenres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean) || []

  const [query, setQuery] = useState(initialQuery)
  const [contentType, setContentType] = useState<ContentType | undefined>(
    initialType === 'all' ? undefined : (initialType as ContentType)
  )
  const [selectedGenres, setSelectedGenres] = useState<number[]>(initialGenres)

  const { isAuthenticated } = useAuth()
  const addToList = useAddToList()

  const { data, isLoading, isFetching } = useContentSearch({
    query,
    type: contentType,
    genre: selectedGenres.length > 0 ? selectedGenres[0] : undefined, // Backend only supports one genre
    page: 1,
  })

  useEffect(() => {
    const q = searchParams.get('q')
    const type = searchParams.get('type')
    const genres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean) || []

    if (q) {
      setQuery(q)
    }
    if (type) {
      setContentType(type === 'all' ? undefined : (type as ContentType))
    }
    if (genres.length > 0) {
      setSelectedGenres(genres)
    }
  }, [searchParams])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    updateSearchParams(newQuery, contentType, selectedGenres)
  }

  const handleTypeChange = (value: string) => {
    const newType = value === 'all' ? undefined : (value as ContentType)
    setContentType(newType)
    if (query) {
      updateSearchParams(query, newType, selectedGenres)
    }
  }

  const handleGenresChange = (genres: number[]) => {
    setSelectedGenres(genres)
    if (query) {
      updateSearchParams(query, contentType, genres)
    }
  }

  const updateSearchParams = (
    q: string,
    type?: ContentType,
    genres?: number[]
  ) => {
    const params: Record<string, string> = { q }
    if (type) {
      params.type = type
    }
    if (genres && genres.length > 0) {
      params.genres = genres.join(',')
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
            selectedGenres={selectedGenres}
            onGenresChange={handleGenresChange}
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
