import { cn } from '@/lib/utils'
import type { WatchStatus } from '@/types'

interface StatusBadgeProps {
  status: WatchStatus
  className?: string
}

const statusConfig: Record<WatchStatus, { label: string; className: string }> = {
  watching: {
    label: 'Viendo',
    className: 'status-watching',
  },
  completed: {
    label: 'Completado',
    className: 'status-completed',
  },
  plan_to_watch: {
    label: 'Planeado',
    className: 'status-plan-to-watch',
  },
  on_hold: {
    label: 'En espera',
    className: 'status-on-hold',
  },
  dropped: {
    label: 'Abandonado',
    className: 'status-dropped',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
