import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ContentGrid } from '@/components/content'
import { useUserContent, useUpdateUserContent, useRemoveFromList, useAuth } from '@/hooks'
import type { WatchStatus } from '@/types'

const statusTabs: Array<{ value: WatchStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'watching', label: 'Viendo' },
  { value: 'completed', label: 'Vistos' },
  { value: 'plan_to_watch', label: 'Por Ver' },
  { value: 'on_hold', label: 'En Pausa' },
  { value: 'dropped', label: 'Abandonados' },
]

export function MyListPage() {
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all')
  const { isAuthenticated } = useAuth()

  const { data: userContent, isLoading } = useUserContent(
    activeTab === 'all' ? undefined : activeTab
  )

  const updateContent = useUpdateUserContent()
  const removeContent = useRemoveFromList()

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h1 className="mb-2 text-2xl font-bold">Mi Lista</h1>
        <p className="mb-4 text-muted-foreground">
          Inicia sesión para ver y administrar tu lista de contenido
        </p>
        <Button asChild>
          <a href="/login">Iniciar Sesión</a>
        </Button>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi Lista</h1>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Crear Lista
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as WatchStatus | 'all')}
      >
        <TabsList className="flex-wrap">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {statusTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {content.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    {tab.value === 'all'
                      ? 'Tu lista está vacía. ¡Empieza a agregar contenido!'
                      : `No tienes contenido en "${tab.label}"`}
                  </p>
                  <Button className="mt-4" asChild>
                    <a href="/browse">Explorar Contenido</a>
                  </Button>
                </div>
              ) : (
                <ContentGrid
                  content={content}
                  isLoading={isLoading}
                  userContentStatus={userContentStatus}
                  onAddToList={(contentId, status) => {
                    const userContentItem = userContent?.find(
                      (uc) => uc.content.id === contentId
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

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Viendo</p>
          <p className="text-2xl font-bold">
            {userContent?.filter((c) => c.status === 'watching').length || 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Vistos</p>
          <p className="text-2xl font-bold">
            {userContent?.filter((c) => c.status === 'completed').length || 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Por Ver</p>
          <p className="text-2xl font-bold">
            {userContent?.filter((c) => c.status === 'plan_to_watch').length || 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{userContent?.length || 0}</p>
        </div>
      </div>
    </div>
  )
}
