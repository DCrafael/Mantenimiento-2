export default function Label({ children, className = "", ...props }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`} {...props}>
      {children}
    </label>
  );
}

