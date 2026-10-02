import React from 'react';

/**
 * Input & select yang konsisten — satu tinggi, satu focus state,
 * label + error di dekat field.
 */
export const inputClass = (error) =>
    `w-full h-10 px-3 text-sm bg-white border rounded-[10px] transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-gray-50 disabled:text-gray-400 ${
        error ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
    }`;

export default function Field({ label, htmlFor, error, hint, required, children, className = '' }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-800 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
                    {hint && <span className="ml-1.5 text-xs font-normal text-gray-400">{hint}</span>}
                </label>
            )}
            {children}
            {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export function TextInput({ error, className = '', ...rest }) {
    return <input className={`${inputClass(error)} ${className}`} {...rest} />;
}

export function SelectInput({ error, className = '', children, ...rest }) {
    return (
        <select className={`${inputClass(error)} ${className}`} {...rest}>
            {children}
        </select>
    );
}

/** Gaya terpusat untuk react-select agar seragam dengan TextInput. */
export const reactSelectStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#0284c7' : state.selectProps.menuIsOpen ? '#0284c7' : '#d1d5db',
        boxShadow: state.isFocused ? '0 0 0 3px rgb(14 165 233 / 0.2)' : base.boxShadow,
        borderRadius: '10px',
        minHeight: '40px',
        backgroundColor: state.isDisabled ? '#f9fafb' : '#fff',
        '&:hover': { borderColor: state.isFocused ? '#0284c7' : '#9ca3af' },
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
    input: (base) => ({ ...base, padding: 0, margin: 0, color: '#101318' }),
    placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '14px' }),
    singleValue: (base) => ({ ...base, color: '#101318', fontSize: '14px' }),
    menu: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgb(16 19 24 / 0.12)', zIndex: 30 }),
    menuOption: (base) => ({ ...base, fontSize: '14px', padding: '8px 12px' }),
    option: (base, state) => ({
        ...base,
        fontSize: '14px',
        padding: '9px 12px',
        cursor: 'pointer',
        backgroundColor: state.isDisabled
            ? '#fff'
            : state.isSelected
            ? '#e0f2fe'
            : state.isFocused
            ? '#f0f9ff'
            : '#fff',
        color: state.isDisabled ? '#9ca3af' : state.isSelected ? '#0369a1' : '#101318',
        ':active': { backgroundColor: '#bae6fd' },
    }),
    noOptionsMessage: (base) => ({ ...base, fontSize: '13px', color: '#6b7280', padding: '12px' }),
};
