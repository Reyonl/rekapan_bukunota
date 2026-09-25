/**
 * Format angka sebagai Rupiah
 * @param {number} value
 * @returns {string}
 */
export function formatRupiah(value) {
    if (value === null || value === undefined || isNaN(value)) return 'Rp0';
    return 'Rp' + Number(value).toLocaleString('id-ID');
}

/**
 * Format angka tanpa prefix Rp, dengan titik pemisah ribuan
 */
export function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toLocaleString('id-ID');
}

/**
 * Parse string angka Indonesia (dengan titik) ke integer
 */
export function parseRupiah(str) {
    if (!str) return 0;
    return parseInt(String(str).replace(/\./g, '').replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Format tanggal ke dd Mon yyyy (23 Sep 2026)
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format tanggal ke dd/MM/yyyy
 */
export function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format tanggal ke yyyy-MM-dd untuk input[type=date]
 */
export function toInputDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Tanggal hari ini dalam format yyyy-MM-dd
 */
export function today() {
    return toInputDate(new Date().toISOString());
}
