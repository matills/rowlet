import { useState } from 'react'
import { MoreVertical, CheckCircle, Eye, Clock, Pause, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import type { Content, WatchStatus } from '@/types'

interface ContentCardMenuProps {
  content: Content
  onAddToList?: (status: WatchStatus) => void
  onMarkAsWatched?: (e: React.MouseEvent) => void
}

export function ContentCardMenu({
  content,
  onAddToList,
  onMarkAsWatched,
}: ContentCardMenuProps) {
  const [open, setOpen] = useState(false)

  const handleAddToList = (e: React.MouseEvent, status: WatchStatus) => {
    e.preventDefault()
    e.stopPropagation()
    onAddToList?.(status)
    setOpen(false)
  }

  const handleMarkWatched = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onMarkAsWatched?.(e)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/90"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Agregar a mi lista</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onAddToList && (
          <>
            <DropdownMenuItem onClick={(e) => handleAddToList(e, 'watching')}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Viendo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAddToList(e, 'completed')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>Completado</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAddToList(e, 'plan_to_watch')}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Planeado</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAddToList(e, 'on_hold')}>
              <Pause className="mr-2 h-4 w-4" />
              <span>En espera</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAddToList(e, 'dropped')}>
              <XCircle className="mr-2 h-4 w-4" />
              <span>Abandonado</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
