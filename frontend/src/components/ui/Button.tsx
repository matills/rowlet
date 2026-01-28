import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
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
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
