import { useState } from 'react'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  value: number
  onChange: (rating: number) => void
  max?: number
  className?: string
  readOnly?: boolean
}

export function RatingInput({
  value,
  onChange,
  max = 10,
  className,
  readOnly = false,
}: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue !== null ? hoverValue : value

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
          <motion.button
            key={rating}
            type="button"
            disabled={readOnly}
            whileHover={readOnly ? undefined : { scale: 1.2 }}
            whileTap={readOnly ? undefined : { scale: 0.9 }}
            className={cn(
              'p-0.5 transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer'
            )}
            onMouseEnter={() => !readOnly && setHoverValue(rating)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            onClick={() => !readOnly && onChange(rating)}
          >
            <Star
              className={cn(
                'h-4 w-4 transition-colors',
                rating <= displayValue
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground hover:text-primary/50'
              )}
            />
          </motion.button>
        ))}
      </div>
      <span className="ml-2 text-sm font-medium text-muted-foreground">
        {value}/{max}
      </span>
    </div>
  )
}
