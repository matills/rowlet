import { cn } from '@/lib/utils'

interface OwlLogoProps {
  className?: string
  size?: number
}

export function OwlLogo({ className, size = 32 }: OwlLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-primary', className)}
    >
      {/* Main body outline */}
      <path
        d="M 30 20 Q 25 15 20 20 L 25 35 Q 22 55 30 75 Q 40 85 50 85 Q 60 85 70 75 Q 78 55 75 35 L 80 20 Q 75 15 70 20 Q 65 15 50 15 Q 35 15 30 20 Z"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Left eye */}
      <circle
        cx="38"
        cy="42"
        r="8"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
      />
      <circle
        cx="38"
        cy="42"
        r="3"
        fill="currentColor"
      />

      {/* Right eye */}
      <circle
        cx="62"
        cy="42"
        r="8"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
      />
      <circle
        cx="62"
        cy="42"
        r="3"
        fill="currentColor"
      />

      {/* Beak */}
      <path
        d="M 50 52 L 48 58"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 50 52 L 52 58"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Left foot */}
      <line
        x1="40"
        y1="78"
        x2="40"
        y2="88"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Right foot */}
      <line
        x1="60"
        y1="78"
        x2="60"
        y2="88"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
