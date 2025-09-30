export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
}

