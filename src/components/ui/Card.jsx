export function Card({ children, className = "", ...props }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}
export function CardHeader({ children, className = "", ...props }) {
  return <div className={`px-6 pt-6 ${className}`} {...props}>{children}</div>;
}
export function CardTitle({ children, className = "", ...props }) {
  return <h3 className={`text-lg font-semibold text-slate-900 ${className}`} {...props}>{children}</h3>;
}
export function CardContent({ children, className = "", ...props }) {
  return <div className={`px-6 pb-6 ${className}`} {...props}>{children}</div>;
}
