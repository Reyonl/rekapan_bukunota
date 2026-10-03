/* Ikon stroke — dipakai seperlunya: navigasi, status, aksi. Bukan hiasan heading. */
const PATHS = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    users: 'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8 .5a3 3 0 1 0-2-5.25M3 20c.5-3.5 2.5-5.5 5-5.5s4.5 2 5 5.5m2-5.25c1.7.6 2.8 2.1 3.2 4.25',
    box: 'M12 3l8 4v10l-8 4-8-4V7l8-4zm0 0v18M4 7l8 4 8-4',
    sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6',
    plus: 'M12 5v14M5 12h14',
    search: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm7 0 4 4',
    check: 'M4.5 12.5l5 5 10-11',
    checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-3.5-9.5 2.5 2.5 5-5.5',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v5l3.5 2',
    x: 'M6 6l12 12M18 6L6 18',
    arrowLeft: 'M19 12H5m6-6-6 6 6 6',
    chevronDown: 'M6 9l6 6 6-6',
    chevronRight: 'M9 6l6 6-6 6',
    alert: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5v5M12 16v.5',
    alertTriangle: 'M12 3 2.5 20h19L12 3zM12 10v4M12 17.5v.5',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-9v5M12 8v.5',
    printer: 'M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2M7 14h10v7H7z',
    download: 'M12 3v11m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    copy: 'M9 9V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4M5 9h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z',
    refresh: 'M20 12a8 8 0 1 1-2.5-5.8M20 4v4h-4',
    image: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5',
    bluetooth: 'M7 7l10 10-5 4V3l5 4L7 17',
    trash: 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6M14 11v6',
    edit: 'M4 20h4L20 8l-4-4L4 16v4zM13 7l4 4',
    tag: 'M3 3h8l10 10-8 8L3 11V3zm4 4v.5',
    notes: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
    name: 'M4 6h16M4 12h10M4 18h7',
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.7, ...rest }) {
    const d = PATHS[name];
    if (!d) return null;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
            {...rest}
        >
            <path d={d} />
        </svg>
    );
}
