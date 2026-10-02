import { create } from 'zustand';

let seq = 0;

/**
 * Toast global sederhana (zustand sudah ada di dependencies).
 * Tidak mengubah business logic — hanya feedback UI.
 */
const useToastStore = create((set, get) => ({
    toasts: [],
    push: (message, type = 'success', duration = 3200) => {
        const id = ++seq;
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => {
            if (get().toasts.some((t) => t.id === id)) {
                set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
            }
        }, duration);
        return id;
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
    success: (msg) => useToastStore.getState().push(msg, 'success'),
    error: (msg) => useToastStore.getState().push(msg, 'error'),
    info: (msg) => useToastStore.getState().push(msg, 'info'),
};

export default useToastStore;
