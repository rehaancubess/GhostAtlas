import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon-red';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ghost-green focus-visible:ring-offset-2 focus-visible:ring-offset-ghost-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-ghost-green text-ghost-black hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] hover:scale-105 active:scale-95',
    secondary: 'bg-ghost-dark-gray text-ghost-green border border-ghost-green hover:bg-ghost-medium-gray hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] active:scale-95',
    ghost: 'bg-transparent text-ghost-green border border-ghost-green hover:bg-ghost-green hover:text-ghost-black hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95',
    'neon-red': 'bg-ghost-red text-ghost-black hover:shadow-red-glow-lg hover:scale-105 active:scale-95 font-bold',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
