import React from 'react';
import Icon from './Icon';

/** Skeleton blok — shimmer halus, tanpa berlebihan. */
export function Skeleton({ className = '' }) {
    return <div className={`animate-shimmer bg-gray-200/70 rounded-lg ${className}`} />;
}

/** Skeleton baris list (nama + sub + angka kanan). */
export function SkeletonRow() {
    return (
        <div className="flex items-center justify-between py-3.5 gap-4">
            <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-40 max-w-[60%]" />
                <Skeleton className="h-3 w-24 max-w-[40%]" />
            </div>
            <Skeleton className="h-5 w-20 shrink-0" />
        </div>
    );
}

/** Skeleton kartu statistik. */
export function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
        </div>
    );
}

/** Empty state informatif dengan CTA opsional. */
export function EmptyState({ icon = 'empty', title, description, action, className = '' }) {
    return (
        <div className={`py-12 px-6 text-center ${className}`}>
            <span className="inline-flex w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 items-center justify-center mb-3">
                <Icon name={icon} className="w-6 h-6" />
            </span>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {description && <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{description}</p>}
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </div>
    );
}

/** Error state dengan retry — wording natural, bukan "something went wrong". */
export function ErrorState({ message = 'Gagal memuat data.', onRetry, className = '' }) {
    return (
        <div className={`py-12 px-6 text-center ${className}`}>
            <span className="inline-flex w-12 h-12 rounded-2xl bg-red-50 text-red-500 items-center justify-center mb-3">
                <Icon name="alert" className="w-6 h-6" />
            </span>
            <p className="text-sm font-semibold text-gray-900">{message}</p>
            <p className="text-sm text-gray-500 mt-1">Periksa koneksi lalu coba lagi.</p>
            {onRetry && (
                <div className="mt-4">
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-[10px] border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                    >
                        Coba lagi
                    </button>
                </div>
            )}
        </div>
    );
}
