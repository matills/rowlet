import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter } from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { SearchBar, ContentGrid } from '@/components/content'
import { useContentSearch, useAuth, useAddToList } from '@/hooks'
import type { ContentType } from '@/types'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [contentType, setContentType] = useState<ContentType | undefined>(undefined)

  const { isAuthenticated } = useAuth()
  const addToList = useAddToList()

  const { data, isLoading, isFetching } = useContentSearch({
    query,
    type: contentType,
    page: 1,
  })

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
    }
  }, [searchParams])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setSearchParams({ q: newQuery })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Buscar</h1>
        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          className="max-w-md"
          autoFocus
        />
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={(value) =>
          setContentType(value === 'all' ? undefined : (value as ContentType))
        }
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="movie">Películas</TabsTrigger>
            <TabsTrigger value="tv">Series</TabsTrigger>
            <TabsTrigger value="anime">Anime</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
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
            <ContentGrid
              content={data?.data || []}
              isLoading={isLoading || isFetching}
              onAddToList={
                isAuthenticated
                  ? (content, status) => addToList.mutate({ content, status })
                  : undefined
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
