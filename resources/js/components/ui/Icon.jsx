import React from 'react';

/**
 * Konsisten satu gaya: stroke 2, rounded caps (pola sama dengan SVG inline
 * yang sudah ada di Layout lama). Tanpa dependency icon baru.
 */
const PATHS = {
    home: 'M3 10.5L12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5',
    receipt: 'M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3zm3 5h8M8 12h8M8 15h5',
    users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
    box: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
    tag: 'M7 7h.01M20.5 13.5L13.5 20.5a2 2 0 01-2.83 0l-7-7A2 2 0 013 12V5a2 2 0 012-2h7a2 2 0 011.6.8l6.9 7.2a2 2 0 010 2.5z',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7.5 7.5 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2-1.2L14 3h-4l-.4 2.4a7.6 7.6 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7.5 7.5 0 005 12c0 .4.04.8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.4-2.4c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z',
    plus: 'M12 5v14M5 12h14',
    search: 'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
    x: 'M18 6L6 18M6 6l12 12',
    trash: 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6M10 11v6M14 11v6',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    check: 'M20 6L9 17l-5-5',
    checkCircle: 'M12 22a10 10 0 100-20 10 10 0 000 20zm-3-11l2.5 2.5L17 9',
    alert: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
    chevronLeft: 'M15 18l-6-6 6-6',
    chevronRight: 'M9 6l6 6-6 6',
    arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
    printer: 'M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z',
    bluetooth: 'M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11',
    wallet: 'M20 12V8H6a2 2 0 010-4h12v4M4 6v12a2 2 0 002 2h14v-4M20 12a2 2 0 00-2 2v4a2 2 0 002 2h2v-8h-2z',
    clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
    menu: 'M4 6h16M4 12h16M4 18h16',
    phone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.13.96.36 1.9.7 2.8a2 2 0 01-.45 2.1L8.1 9.9a16 16 0 006 6l1.3-1.27a2 2 0 012.1-.45c.9.34 1.84.57 2.8.7a2 2 0 011.7 2z',
    empty: 'M3 8l9-5 9 5v8l-9 5-9-5V8zm9 5l9-5M12 13L3 8m9 5v8',
};

export default function Icon({ name, className = 'w-5 h-5', strokeWidth = 2, ...rest }) {
    const d = PATHS[name];
    if (!d) return null;
    return (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            aria-hidden="true"
            {...rest}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d={d} />
        </svg>
    );
}
