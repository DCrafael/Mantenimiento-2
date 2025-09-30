import { useState } from "react";

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  // children es una función (render prop)
  return typeof children === "function" ? children({ value, setValue }) : null;
}

export function TabsList({ children, className = "" }) {
  return <div className={`inline-flex gap-2 rounded-xl border bg-white p-1 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, selected, onSelect, children }) {
  return (
    <button
      className={`px-3 h-9 rounded-lg text-sm ${selected ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-gray-100"}`}
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, current, children }) {
  if (value !== current) return null;
  return <div>{children}</div>;
}
