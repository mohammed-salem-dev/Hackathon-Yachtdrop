"use client";

import { Search, X } from "lucide-react";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  collapsed?: boolean;
  onExpandRequest?: () => void;
};

export default function SearchBar({
  value,
  onChange,
  collapsed,
  onExpandRequest,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Collapsed state — just a search icon button
  if (collapsed) {
    return (
      <button
        onClick={onExpandRequest}
        className="w-9 h-9 rounded-xl bg-white border border-slate-200
          flex items-center justify-center shadow-sm
          hover:border-brand-teal hover:text-brand-teal
          text-slate-400 transition-all duration-200"
        aria-label="Open search"
      >
        <Search size={17} />
      </button>
    );
  }

  return (
    <div
      className="flex items-center bg-white border border-slate-200
      rounded-2xl px-3 h-12 gap-2 shadow-sm"
    >
      <Search size={17} className="text-slate-400 shrink-0" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search parts, gear, supplies..."
        autoFocus
        className="flex-1 bg-transparent text-sm text-slate-800
          placeholder:text-slate-400 outline-none"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="text-slate-400 active:text-slate-700
            min-h-[48px] min-w-[32px] flex items-center justify-center"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
