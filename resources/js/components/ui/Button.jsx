import React from 'react';
import Icon from './Icon';

const VARIANTS = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
    dark: 'bg-ink text-white hover:bg-ink-soft active:bg-black shadow-sm',
    secondary: 'bg-white text-ink border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    soft: 'bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100 active:bg-brand-200',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    dangerSoft: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:bg-red-200',
};

const SIZES = {
    sm: 'h-9 px-3 text-sm gap-1.5 rounded-[10px]',
    md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
    lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
};

export function Spinner({ className = 'w-4 h-4' }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    className = '',
    disabled,
    children,
    type = 'button',
    title,
    ...rest
}) {
    const base =
        'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap';
    return (
        <button
            type={type}
            disabled={disabled || loading}
            title={title}
            className={`${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
            {...rest}
        >
            {loading ? <Spinner /> : icon ? <Icon name={icon} className="w-4 h-4" /> : null}
            {loading && loadingText ? loadingText : children}
        </button>
    );
}
