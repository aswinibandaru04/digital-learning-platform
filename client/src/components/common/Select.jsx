export default function Select({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder,
  ...rest
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
          error ? 'border-rose-400' : 'border-slate-300'
        }`}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
