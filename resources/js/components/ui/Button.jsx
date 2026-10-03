import Icon from './Icon';

/**
 * Button — hierarchy jelas, radius 8, tanpa shadow.
 * primary (sky) = aksi utama · secondary = netral · destructive = merah
 * · soft = merah muda · ghost = teks · dark = ink.
 */
export function Spinner({ className = 'h-4 w-4' }) {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    disabled,
    icon,
    children,
    className = '',
    type = 'button',
    ...rest
}) {
    const variants = {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
        dark: 'bg-ink text-white hover:bg-ink-soft disabled:opacity-50',
        secondary: 'bg-white text-text-main border border-[#D4D7DC] hover:bg-[#F7F8FA] disabled:text-text-muted',
        destructive: 'bg-danger text-white hover:bg-[#b91c1c] disabled:opacity-50',
        destructiveSoft: 'bg-danger-soft text-danger hover:bg-[#fecaca] disabled:opacity-50',
        soft: 'bg-danger-soft text-danger hover:bg-[#fecaca] disabled:opacity-50',
        ghost: 'text-text-muted hover:text-text-main hover:bg-[#F1F2F4] disabled:opacity-40',
    };
    const sizes = {
        sm: 'h-8 px-2.5 text-[13px] rounded-lg gap-1.5',
        md: 'h-9 px-3.5 text-sm rounded-lg gap-2',
        lg: 'h-10 px-4 text-sm rounded-lg gap-2',
    };
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`inline-flex shrink-0 items-center justify-center font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
            {...rest}
        >
            {loading ? (
                <Spinner className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            ) : icon ? (
                <Icon name={icon} size={size === 'sm' ? 14 : 16} />
            ) : null}
            {loading && loadingText ? loadingText : children}
        </button>
    );
}
