import { useEffect, useRef } from 'react';
import { confirmDanger } from '../../utils/feedback';

/**
 * Modal form — surface putih, border, radius 12; shadow hanya karena floating.
 */
export default function Modal({ open, onClose, title, children, footer, size = '', wide = false }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    const sizeCls = size === 'lg' || wide ? 'sm:max-w-lg' : 'sm:max-w-md';

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div className="absolute inset-0 bg-ink/40" onClick={() => onClose && onClose()} aria-hidden="true" />
            <div
                className={`relative w-full ${sizeCls} max-h-[92vh] overflow-y-auto rounded-t-xl border border-border bg-surface shadow-[0_12px_32px_rgb(20_23_28/0.16)] sm:rounded-xl animate-fade-up`}
            >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-[15px] font-semibold text-text-main">{title}</h3>
                    {onClose ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="-mr-1 rounded-md p-1.5 text-text-muted transition-colors hover:bg-[#F1F2F4] hover:text-text-main"
                            aria-label="Tutup"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                        </button>
                    ) : null}
                </div>
                <div className="px-4 py-4">{children}</div>
                {footer ? <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div> : null}
            </div>
        </div>
    );
}

/**
 * API lama halaman — kini didelegasikan ke SweetAlert2 (utils/feedback).
 * Tidak ada dialog custom lagi untuk konfirmasi; alert/confirm browser pun tidak dipakai.
 */
export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Yakin?',
    message,
    confirmText = 'Ya, Hapus',
    cancelText = 'Batal',
    loading = false,
}) {
    const busy = useRef(false);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        if (!open || busy.current) return;
        busy.current = true;
        confirmDanger({
            title,
            text: typeof message === 'string' ? message : undefined,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
        })
            .then(async (ok) => {
                busy.current = false;
                if (!ok) {
                    closeRef.current?.();
                    return;
                }
                await onConfirm?.();
                closeRef.current?.();
            })
            .catch(() => {
                busy.current = false;
                closeRef.current?.();
            });
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}
