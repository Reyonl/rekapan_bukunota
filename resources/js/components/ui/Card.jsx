import React from 'react';
import Icon from './Icon';

export function Card({ className = '', children, ...rest }) {
    return (
        <div
            className={`bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgb(16_19_24/0.05)] ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
}

export function SectionTitle({ children, className = '' }) {
    return (
        <h2 className={`text-sm font-semibold text-gray-900 tracking-wide ${className}`}>
            {children}
        </h2>
    );
}

export function PageHeader({ title, subtitle, actions, back }) {
    return (
        <div className="mb-6">
            {back}
            <div className="flex flex-wrap items-start justify-between gap-3 mt-1">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight break-words">
                        {title}
                    </h1>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}

export function BackLink({ children = 'Kembali', to }) {
    // dipasangkan oleh halaman dengan <Link component={BackLink}> pola sederhana
    return null;
}

const STATUS_MAP = {
    paid: { label: 'Lunas', icon: 'check', cls: 'bg-green-50 text-green-700 border-green-200' },
    unpaid: { label: 'Hutang', icon: 'clock', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Selesai', icon: 'checkCircle', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
    draft: { label: 'Draft', icon: 'edit', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export function StatusBadge({ status, paidLabel = 'Lunas', unpaidLabel = 'Hutang', className = '' }) {
    const cfg = STATUS_MAP[status] || { label: status, icon: 'info', cls: 'bg-gray-100 text-gray-600 border-gray-200' };
    const label = status === 'paid' ? paidLabel : status === 'unpaid' ? unpaidLabel : cfg.label;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold leading-5 ${cfg.cls} ${className}`}
        >
            <Icon name={cfg.icon} className="w-3 h-3" strokeWidth={2.5} />
            {label}
        </span>
    );
}

export function Badge({ children, tone = 'gray', className = '' }) {
    const tones = {
        gray: 'bg-gray-100 text-gray-700',
        brand: 'bg-brand-50 text-brand-700',
        green: 'bg-green-50 text-green-700',
        amber: 'bg-amber-50 text-amber-700',
        red: 'bg-red-50 text-red-700',
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone]} ${className}`}>
            {children}
        </span>
    );
}
