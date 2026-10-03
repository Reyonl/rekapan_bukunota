/**
 * Primitif permukaan — v2: border 1px + tipografi yang bekerja, shadow hampir nol.
 */

/** Panel: surface putih, border, radius 12, TANPA shadow. */
export function Panel({ className = '', children }) {
    return <div className={`rounded-xl border border-border bg-surface ${className}`}>{children}</div>;
}

/** Alias lama — kini border-only. */
export function Card({ className = '', children, ...rest }) {
    return (
        <div className={`rounded-xl border border-border bg-surface ${className}`} {...rest}>
            {children}
        </div>
    );
}

export function SectionTitle({ children, className = '' }) {
    return <h2 className={`text-[13px] font-semibold tracking-tight text-text-main ${className}`}>{children}</h2>;
}

/** Badge status bon — radius kecil (pill khusus status). Map nilai API: paid/unpaid/draft. */
export function StatusBadge({ status }) {
    const s = String(status || '').toLowerCase();
    let cls = 'bg-[#F1F2F4] text-text-muted';
    let label = status;
    if (s === 'paid' || s === 'lunas') { cls = 'bg-success-soft text-success'; label = 'Lunas'; }
    else if (s === 'unpaid' || s === 'hutang') { cls = 'bg-warning-soft text-warning'; label = 'Hutang'; }
    else if (s === 'draft') { label = 'Draft'; }
    else if (s === 'completed') { cls = 'bg-[#F1F2F4] text-text-muted'; label = 'Selesai'; }
    return (
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>
            {label}
        </span>
    );
}

/** Badge generik. */
export function Badge({ children, tone = 'neutral', className = '' }) {
    const tones = {
        neutral: 'bg-[#F1F2F4] text-text-muted',
        gray: 'bg-[#F1F2F4] text-text-muted',
        sky: 'bg-brand-50 text-brand-700',
        brand: 'bg-brand-50 text-brand-700',
        success: 'bg-success-soft text-success',
        green: 'bg-success-soft text-success',
        warning: 'bg-warning-soft text-warning',
        amber: 'bg-warning-soft text-warning',
        danger: 'bg-danger-soft text-danger',
        red: 'bg-danger-soft text-danger',
    };
    return (
        <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tones[tone] || tones.neutral} ${className}`}>
            {children}
        </span>
    );
}

/** Heading halaman — tanpa ikon; hierarchy murni tipografi. Mendukung `actions` prop atau children. */
export function PageHeader({ title, subtitle, actions, back, children }) {
    const right = actions || children;
    return (
        <div className="mb-5">
            {back}
            <div className={`flex flex-wrap items-end justify-between gap-3 ${back ? 'mt-1' : ''}`}>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight text-text-main">{title}</h1>
                    {subtitle ? <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p> : null}
                </div>
                {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
            </div>
        </div>
    );
}
