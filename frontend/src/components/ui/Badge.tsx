import { clsx } from 'clsx';

type BadgeTier = 'default' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface BadgeProps {
    tier?: BadgeTier;
    className?: string;
    children: React.ReactNode;
}

export function Badge({ tier = 'default', className, children }: BadgeProps) {
    return (
        <span
            className={clsx(
                'badge',
                tier !== 'default' && `badge--${tier}`,
                className
            )}
        >
            {children}
        </span>
    );
}
