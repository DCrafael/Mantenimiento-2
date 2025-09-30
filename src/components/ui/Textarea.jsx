export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      rows={4}
      {...props}
    />
  );
}

