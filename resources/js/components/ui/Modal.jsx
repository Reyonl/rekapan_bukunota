import React, { useEffect, useRef } from 'react';
import Button from './Button';
import Icon from './Icon';

/**
 * Modal dialog reusable — menutup dengan Esc + backdrop click,
 * fokus awal ke dialog. Menggantikan window.confirm() tanpa
 * mengubah logic panggilan.
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        // cegah scroll background
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialogRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="presentation"
        >
            <div
                className="absolute inset-0 bg-black/40 animate-[fade-up_.15s_ease-out]"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={`relative w-full ${widths[size]} max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl animate-toast-in overflow-y-auto focus:outline-none`}
            >
                {title && (
                    <div className="flex items-center justify-between px-5 pt-4 pb-1">
                        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            aria-label="Tutup"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Icon name="x" className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className={title ? 'px-5 pb-5' : ''}>{children}</div>
            </div>
        </div>
    );
}

/** Konfirmasi destructive action — pengganti window.confirm/alert. */
export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title = 'Yakin?',
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    loading = false,
    tone = 'danger',
}) {
    return (
        <Modal open={open} onClose={loading ? undefined : onClose} size="sm">
            <div className="pt-5">
                <div className="flex items-start gap-3">
                    <span
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                    >
                        <Icon name="alert" className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                        {message && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>}
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} loadingText="Memproses...">
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
