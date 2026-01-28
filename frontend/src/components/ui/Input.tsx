import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ error, label, className, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="input-wrapper">
                {label && (
                    <label htmlFor={inputId} className="input-label">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={clsx('input', error && 'input--error', className)}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';
