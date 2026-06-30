export default function Field({
  label,
  htmlFor,
  error,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block mb-2 text-[13px] font-medium text-content-muted"
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
