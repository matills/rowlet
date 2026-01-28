import { clsx } from 'clsx';

interface CardProps {
    interactive?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface CardImageProps {
    src: string;
    alt: string;
    className?: string;
}

interface CardBodyProps {
    className?: string;
    children: React.ReactNode;
}

interface CardTitleProps {
    className?: string;
    children: React.ReactNode;
}

interface CardTextProps {
    className?: string;
    children: React.ReactNode;
}

export function Card({ interactive, className, children }: CardProps) {
    return (
        <div
            className={clsx(
                'card',
                interactive && 'card--interactive',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardImage({ src, alt, className }: CardImageProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={clsx('card__image', className)}
            loading="lazy"
        />
    );
}

export function CardBody({ className, children }: CardBodyProps) {
    return (
        <div className={clsx('card__body', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children }: CardTitleProps) {
    return (
        <h3 className={clsx('card__title', className)}>
            {children}
        </h3>
    );
}

export function CardText({ className, children }: CardTextProps) {
    return (
        <p className={clsx('card__text', className)}>
            {children}
        </p>
    );
}
