import Swal from 'sweetalert2';

/**
 * Pusat feedback UI — SweetAlert2 dengan skin Warung Lupi (lihat app.css).
 * Aturan: keputusan user (hapus/destructive/error fatal) = SweetAlert;
 * action ringan = toast bawah auto-dismiss. Wording Indonesia natural.
 */

const popupClasses = {
    popup: 'wl-popup',
    title: 'wl-title',
    htmlContainer: 'wl-text',
    actions: 'wl-actions',
    icon: 'wl-icon',
    confirmButton: 'wl-btn wl-btn-primary',
    cancelButton: 'wl-btn wl-btn-secondary',
    denyButton: 'wl-btn wl-btn-danger',
};

const toastClasses = {
    popup: 'wl-toast',
    title: 'swal2-title',
};

const noAnimation = {
    hideClass: { popup: 'animate__animated animate__fadeOut', backdrop: 'swal2-backdrop-show' },
};

export function confirmDanger({
    title = 'Yakin?',
    text,
    confirmButtonText = 'Ya, Hapus',
    cancelButtonText = 'Batal',
    icon = 'warning',
} = {}) {
    return Swal.fire({
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        // aksi destruktif → tombol confirm MERAH, bukan primary
        customClass: {
            ...popupClasses,
            confirmButton: 'wl-btn wl-btn-danger',
        },
    }).then((r) => r.isConfirmed);
}

export function alertError(text, title = 'Gagal') {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        buttonsStyling: false,
        confirmButtonText: 'Tutup',
        customClass: popupClasses,
    });
}

function pushToast(icon, message, timer = 2600) {
    return Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon,
        title: message,
        timer,
        timerProgressBar: false,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: { popup: 'wl-toast', title: 'swal2-title' },
    });
}

export const toast = {
    success: (msg) => pushToast('success', msg),
    error: (msg) => pushToast('error', msg, 3800),
    info: (msg) => pushToast('info', msg),
};
