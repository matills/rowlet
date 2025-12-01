import { useState } from 'react'
import { MoreVertical, Star, Plus, List as ListIcon, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

interface ContentCardMenuProps {
  onAddToList?: () => void
  onAddToWatchlist?: () => void
  onShowInLists?: () => void
  onWhereToWatch?: () => void
  onReview?: () => void
  onShowActivity?: () => void
}

export function ContentCardMenu({
  onAddToList,
  onAddToWatchlist,
  onShowInLists,
  onWhereToWatch,
  onReview,
  onShowActivity,
}: ContentCardMenuProps) {
  const [open, setOpen] = useState(false)

  const handleAction = (action: () => void) => {
    action()
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
        {onShowActivity && (
          <DropdownMenuItem onClick={() => handleAction(onShowActivity)}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Show your activity</span>
          </DropdownMenuItem>
        )}
        {onReview && (
          <DropdownMenuItem onClick={() => handleAction(onReview)}>
            <Star className="mr-2 h-4 w-4" />
            <span>Review or log film...</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onAddToWatchlist && (
          <DropdownMenuItem onClick={() => handleAction(onAddToWatchlist)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Add to watchlist</span>
          </DropdownMenuItem>
        )}
        {onAddToList && (
          <DropdownMenuItem onClick={() => handleAction(onAddToList)}>
            <ListIcon className="mr-2 h-4 w-4" />
            <span>Add to lists...</span>
          </DropdownMenuItem>
        )}
        {onShowInLists && (
          <DropdownMenuItem onClick={() => handleAction(onShowInLists)}>
            <ListIcon className="mr-2 h-4 w-4" />
            <span>Show in lists</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onWhereToWatch && (
          <DropdownMenuItem onClick={() => handleAction(onWhereToWatch)}>
            <span>Where to watch</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
