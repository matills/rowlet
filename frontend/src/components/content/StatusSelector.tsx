import { Eye, Check, Clock, Pause, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { WatchStatus } from '@/types'

interface StatusSelectorProps {
  currentStatus?: WatchStatus
  onSelect: (status: WatchStatus) => void
  className?: string
}

const statusOptions: Array<{
  status: WatchStatus
  label: string
  icon: typeof Eye
  color: string
}> = [
  { status: 'watching', label: 'Viendo', icon: Eye, color: 'bg-blue-500 hover:bg-blue-600' },
  { status: 'completed', label: 'Visto', icon: Check, color: 'bg-green-500 hover:bg-green-600' },
  { status: 'plan_to_watch', label: 'Por Ver', icon: Clock, color: 'bg-yellow-500 hover:bg-yellow-600' },
  { status: 'on_hold', label: 'En Pausa', icon: Pause, color: 'bg-orange-500 hover:bg-orange-600' },
  { status: 'dropped', label: 'Abandonado', icon: X, color: 'bg-red-500 hover:bg-red-600' },
]

export function StatusSelector({ currentStatus, onSelect, className }: StatusSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statusOptions.map(({ status, label, icon: Icon, color }) => {
        const isSelected = currentStatus === status
        return (
          <Button
            key={status}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex items-center gap-2',
              isSelected && color
            )}
            onClick={() => onSelect(status)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        )
      })}
    </div>
  )
}
