"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { FieldError, FieldLabel } from "./fields";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type ComboboxProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyMessage?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
};

export function Combobox({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Start typing to search…",
  emptyMessage = "No matches found",
  required,
  optional,
  error,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value) ?? null;

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options;
    return options.filter((option) =>
      `${option.label} ${option.description ?? ""}`
        .toLowerCase()
        .includes(trimmed),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function openMenu() {
    setOpen(true);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function selectOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, filteredOptions.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) selectOption(option.value);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>

      {open ? (
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A2A2A]/40"
            strokeWidth={1.75}
          />
          <input
            id={id}
            ref={inputRef}
            value={query}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-[#2d6a4f] bg-white py-2 pl-9 pr-3 text-sm text-[#2A2A2A] outline-none ring-1 ring-[#2d6a4f] placeholder:text-[#2A2A2A]/40"
            autoComplete="off"
          />
        </div>
      ) : (
        <button
          type="button"
          id={id}
          onClick={openMenu}
          className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none transition-colors hover:border-gray-400 ${
            error ? "border-[#b3261e]" : "border-gray-300"
          } ${selectedOption ? "text-[#2A2A2A]" : "text-[#2A2A2A]/40"}`}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="flex items-center gap-1">
            {selectedOption && (
              <X
                className="h-4 w-4 text-[#2A2A2A]/40 transition-colors hover:text-[#2A2A2A]"
                strokeWidth={1.75}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                }}
              />
            )}
            <ChevronDown
              className="h-4 w-4 text-[#2A2A2A]/40"
              strokeWidth={1.75}
            />
          </span>
        </button>
      )}

      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[#2A2A2A]/50">
              {emptyMessage}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => selectOption(option.value)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? "bg-[#e8f0eb]" : "bg-white"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[#2A2A2A]">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-xs text-[#2A2A2A]/50">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <Check
                        className="h-4 w-4 shrink-0 text-[#2d6a4f]"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}

      <FieldError message={error} />
    </div>
  );
}
