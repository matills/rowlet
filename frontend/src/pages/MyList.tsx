import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, CheckCircle, Clock, Pause, XCircle, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ContentGrid, StatCard } from '@/components/content'
import { useUserContent, useUpdateUserContent, useRemoveFromList, useAuth } from '@/hooks'
import type { WatchStatus } from '@/types'

const statusTabs: Array<{ value: WatchStatus | 'all'; label: string; icon: typeof Eye }> = [
  { value: 'all', label: 'Todos', icon: List },
  { value: 'watching', label: 'Viendo', icon: Eye },
  { value: 'completed', label: 'Completados', icon: CheckCircle },
  { value: 'plan_to_watch', label: 'Planeados', icon: Clock },
  { value: 'on_hold', label: 'En Pausa', icon: Pause },
  { value: 'dropped', label: 'Abandonados', icon: XCircle },
]

export function MyListPage() {
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all')
  const { isAuthenticated } = useAuth()

  // Fetch ALL user content (no filter) so we can calculate counts correctly
  const { data: allUserContent, isLoading } = useUserContent()

  const updateContent = useUpdateUserContent()
  const removeFromList = useRemoveFromList()

  // Filter content based on active tab (client-side filtering)
  const userContent = activeTab === 'all'
    ? allUserContent
    : allUserContent?.filter(uc => uc.status === activeTab)

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <List className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-3 text-2xl font-bold">Mi Lista</h1>
          <p className="mb-6 text-muted-foreground">
            Inicia sesión para ver y administrar tu lista de contenido.
            Lleva un seguimiento de todo lo que estás viendo.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Crear Cuenta</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Map user content to content items, filtering out any with missing required data
  const content = userContent
    ?.filter((uc) => {
      // Ensure all required fields are present
      // Backend returns snake_case, so we check both formats
      const content = uc.content as any
      return uc.content && content.id && (content.externalId || content.external_id) && content.type
    })
    .map((uc) => {
      // Transform snake_case to camelCase for consistency
      const dbContent = uc.content as any
      return {
        id: dbContent.id,
        externalId: dbContent.external_id || dbContent.externalId,
        type: dbContent.type,
        title: dbContent.title,
        originalTitle: dbContent.original_title || dbContent.originalTitle,
        posterPath: dbContent.poster_path || dbContent.posterPath,
        backdropPath: dbContent.backdrop_path || dbContent.backdropPath,
        overview: dbContent.overview,
        releaseDate: dbContent.release_date || dbContent.releaseDate,
        genres: dbContent.genres || [],
        rating: dbContent.rating,
        voteCount: dbContent.vote_count || dbContent.voteCount,
        runtime: dbContent.runtime,
        episodeCount: dbContent.episode_count || dbContent.episodeCount,
        seasonCount: dbContent.season_count || dbContent.seasonCount,
        status: dbContent.status,
        userContentId: uc.id,
      }
    }) || []

  const userContentStatus = allUserContent?.reduce((acc, uc) => {
    acc[uc.content.id] = uc.status
    return acc
  }, {} as Record<string, WatchStatus>) || {}

  const watchingCount = allUserContent?.filter((c) => c.status === 'watching').length || 0
  const completedCount = allUserContent?.filter((c) => c.status === 'completed').length || 0
  const plannedCount = allUserContent?.filter((c) => c.status === 'plan_to_watch').length || 0
  const totalCount = allUserContent?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Mi Lista</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Administra y organiza todo tu contenido
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Crear Lista Personalizada</span>
          <span className="xs:hidden">Nueva Lista</span>
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Viendo"
          value={watchingCount}
          variant="primary"
        />
        <StatCard
          icon={CheckCircle}
          label="Completados"
          value={completedCount}
          variant="secondary"
        />
        <StatCard
          icon={Clock}
          label="Planeados"
          value={plannedCount}
          variant="accent"
        />
        <StatCard
          icon={List}
          label="Total"
          value={totalCount}
          variant="primary"
        />
      </div>

      {/* Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as WatchStatus | 'all')}
      >
        <TabsList className="flex-wrap justify-start gap-1.5 bg-transparent p-0">
          {statusTabs.map((tab) => {
            const Icon = tab.icon
            const count = tab.value === 'all'
              ? totalCount
              : allUserContent?.filter((c) => c.status === tab.value).length || 0

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 rounded-full px-3 py-2 text-sm sm:gap-2 sm:px-4"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground sm:px-2">
                  {count}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="mt-8">
          {statusTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {content.length === 0 && !isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <tab.icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {tab.value === 'all'
                      ? 'Tu lista está vacía'
                      : `No tienes contenido en "${tab.label}"`}
                  </h3>
                  <p className="mb-6 max-w-sm text-muted-foreground">
                    {tab.value === 'all'
                      ? '¡Empieza a agregar películas, series y anime a tu lista!'
                      : 'Explora y agrega contenido para empezar a trackear.'}
                  </p>
                  <Button asChild>
                    <Link to="/browse">Explorar Contenido</Link>
                  </Button>
                </motion.div>
              ) : (
                <ContentGrid
                  content={content}
                  isLoading={isLoading}
                  userContentStatus={userContentStatus}
                  onAddToList={(content, status) => {
                    const userContentItem = allUserContent?.find(
                      (uc) => uc.content.id === content.id
                    )
                    if (userContentItem) {
                      updateContent.mutate({
                        userContentId: userContentItem.id,
                        updates: { status },
                      })
                    }
                  }}
                  onRemoveFromList={(content) => {
                    const userContentItem = allUserContent?.find(
                      (uc) => uc.content.id === content.id
                    )
                    if (userContentItem) {
                      removeFromList.mutate(userContentItem.id)
                    }
                  }}
                />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
