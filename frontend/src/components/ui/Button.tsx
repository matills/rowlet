import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(
                'btn',
                `btn--${variant}`,
                size !== 'md' && `btn--${size}`,
                fullWidth && 'btn--full-width',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
