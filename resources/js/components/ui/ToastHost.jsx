import React from 'react';
import useToastStore from '../../stores/toastStore';
import Icon from './Icon';

const MAP = {
    success: { icon: 'checkCircle', cls: 'text-green-600' },
    error: { icon: 'alert', cls: 'text-red-600' },
    info: { icon: 'info', cls: 'text-brand-600' },
};

export default function ToastHost() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    if (!toasts.length) return null;

    return (
        <div
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 px-4 w-full max-w-sm no-print"
            aria-live="polite"
            role="status"
        >
            {toasts.map((t) => {
                const cfg = MAP[t.type] || MAP.info;
                return (
                    <div
                        key={t.id}
                        className="animate-toast-in w-full flex items-start gap-2.5 bg-ink text-white rounded-xl px-4 py-3 shadow-lg text-sm"
                    >
                        <Icon name={cfg.icon} className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${cfg.cls}`} />
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            aria-label="Tutup notifikasi"
                            className="shrink-0 text-white/50 hover:text-white transition-colors"
                        >
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
