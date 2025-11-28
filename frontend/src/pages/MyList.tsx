import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, CheckCircle, Clock, Pause, XCircle, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Card, CardContent } from '@/components/ui'
import { ContentGrid, StatCard } from '@/components/content'
import { useUserContent, useUpdateUserContent, useAuth } from '@/hooks'
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

  const { data: userContent, isLoading } = useUserContent(
    activeTab === 'all' ? undefined : activeTab
  )

  const updateContent = useUpdateUserContent()

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

  const content = userContent?.map((uc) => ({
    ...uc.content,
    userContentId: uc.id,
  })) || []

  const userContentStatus = userContent?.reduce((acc, uc) => {
    acc[uc.content.id] = uc.status
    return acc
  }, {} as Record<string, WatchStatus>) || {}

  const watchingCount = userContent?.filter((c) => c.status === 'watching').length || 0
  const completedCount = userContent?.filter((c) => c.status === 'completed').length || 0
  const plannedCount = userContent?.filter((c) => c.status === 'plan_to_watch').length || 0
  const totalCount = userContent?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Mi Lista</h1>
          <p className="text-muted-foreground">
            Administra y organiza todo tu contenido
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Lista Personalizada
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
        <TabsList className="flex-wrap justify-start gap-1 bg-transparent p-0">
          {statusTabs.map((tab) => {
            const Icon = tab.icon
            const count = tab.value === 'all'
              ? totalCount
              : userContent?.filter((c) => c.status === tab.value).length || 0

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-full px-4"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
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
                    const userContentItem = userContent?.find(
                      (uc) => uc.content.id === content.id
                    )
                    if (userContentItem) {
                      updateContent.mutate({
                        userContentId: userContentItem.id,
                        updates: { status },
                      })
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
