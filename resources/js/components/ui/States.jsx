import Icon from './Icon';

/** Skeleton — satu warna netral, shimmer halus. */
export function Skeleton({ className = '' }) {
    return <div className={`animate-shimmer rounded-md bg-[#E8EAEE] ${className}`} />;
}

export function SkeletonRows({ rows = 5, className = '' }) {
    return (
        <div className={`space-y-3 p-4 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-2/5" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    );
}

/** Baris skeleton untuk dalam Panel (dipakai list management). */
export function SkeletonRow() {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0">
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
        </div>
    );
}

export function SkeletonCard() {
    return <SkeletonRow />;
}

/** Empty state natural: `icon` prop lama diterima tapi tidak dipakai — memang tidak perlu. */
export function EmptyState({ title = 'Belum ada data', description, hint, action }) {
    return (
        <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-text-main">{title}</p>
            {description || hint ? (
                <p className="mx-auto mt-1 max-w-xs text-[13px] text-text-muted">{description || hint}</p>
            ) : null}
            {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
        </div>
    );
}

export function ErrorState({ message = 'Terjadi kesalahan', onRetry }) {
    return (
        <div className="px-4 py-10 text-center">
            <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-danger">
                <Icon name="alertTriangle" size={15} />
                {message}
            </p>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D4D7DC] bg-white px-3 text-[13px] font-medium text-text-main transition-colors hover:bg-[#F7F8FA]"
                >
                    <Icon name="refresh" size={14} />
                    Coba lagi
                </button>
            ) : null}
        </div>
    );
}
