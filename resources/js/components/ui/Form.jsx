import Icon from './Icon';

/** Field: label → input rapat (8px), helper kecil muted. */
export default function Field({ label, htmlFor, error, helper, required, children, className = '' }) {
    return (
        <div className={className}>
            {label ? (
                <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-text-main">
                    {label}
                    {required ? <span className="ml-0.5 text-danger">*</span> : null}
                </label>
            ) : null}
            {children}
            {error ? (
                <p className="mt-1.5 flex items-start gap-1 text-[12.5px] text-danger">
                    <Icon name="alertTriangle" size={13} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            ) : helper ? (
                <p className="mt-1.5 text-[12.5px] text-text-muted">{helper}</p>
            ) : null}
        </div>
    );
}

export const inputClass = (invalid = false) =>
    `w-full h-10 rounded-lg border bg-white px-3 text-sm text-text-main placeholder:text-[#9AA1AC] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
        invalid ? 'border-danger' : 'border-[#D4D7DC]'
    }`;

export const inputSmClass = (invalid = false) =>
    `w-full h-9 rounded-lg border bg-white px-3 text-sm text-text-main placeholder:text-[#9AA1AC] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${
        invalid ? 'border-danger' : 'border-[#D4D7DC]'
    }`;

/** Tema react-select senada input (radius 8, border netral). */
export const reactSelectStyles = (invalid = false) => ({
    control: (base, state) => ({
        ...base,
        minHeight: 40,
        height: 40,
        borderRadius: 8,
        borderColor: invalid ? '#dc2626' : state.isFocused ? '#0ea5e9' : '#D4D7DC',
        boxShadow: state.isFocused ? '0 0 0 2px rgb(14 165 233 / 0.2)' : 'none',
        '&:hover': { borderColor: state.isFocused ? '#0ea5e9' : '#b6bbc3' },
        backgroundColor: state.isDisabled ? '#F4F5F6' : '#fff',
    }),
    valueContainer: (base) => ({ ...base, height: 38, padding: '0 6px 0 10px' }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    indicatorsContainer: (base) => ({ ...base, height: 38 }),
    placeholder: (base) => ({ ...base, color: '#9AA1AC', fontSize: 14 }),
    singleValue: (base, state) => ({
        ...base,
        color: state.isDisabled ? '#374151' : '#14171C',
        opacity: 1,
        fontSize: 14,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#E0F2FE' : state.isFocused ? '#F4F5F6' : '#fff',
        color: state.isSelected ? '#0369A1' : '#14171C',
        fontSize: 14,
        '&:active': { backgroundColor: '#E0F2FE' },
    }),
    menu: (base) => ({ ...base, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E4E8', boxShadow: '0 8px 20px rgb(20 23 28 / 0.12)' }),
});
