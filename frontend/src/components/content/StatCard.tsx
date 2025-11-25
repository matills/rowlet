import { motion } from 'framer-motion'
import type { LucideProps } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ComponentType<LucideProps>
  label: string
  value: string | number
  description?: string
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
}

const variantStyles = {
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  secondary: {
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  accent: {
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
}

export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  variant = 'primary',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('card-hover', className)}>
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              styles.iconBg
            )}
          >
            <Icon className={cn('h-6 w-6', styles.iconColor)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
