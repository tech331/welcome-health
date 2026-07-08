"use client";

import { type ReactNode } from "react";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#2A2A2A] outline-none transition-colors placeholder:text-[#2A2A2A]/40 focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] disabled:cursor-not-allowed disabled:bg-[#f5f2ee]";

export function FieldLabel({
  htmlFor,
  children,
  required,
  optional,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/60"
    >
      {children}
      {required && <span className="ml-0.5 text-[#b3261e]">*</span>}
      {optional && (
        <span className="ml-1 font-normal normal-case tracking-normal text-[#2A2A2A]/40">
          (optional)
        </span>
      )}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[#b3261e]">{message}</p>;
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "date";
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  autoFocus?: boolean;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  optional,
  error,
  autoFocus,
}: TextFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  required,
  optional,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} ${value ? "" : "text-[#2A2A2A]/40"}`}
        aria-invalid={Boolean(error)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-[#2A2A2A]">
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  optional?: boolean;
  error?: string;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  optional,
  error,
}: TextAreaFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required} optional={optional}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_CLASS} resize-none`}
        aria-invalid={Boolean(error)}
      />
      <FieldError message={error} />
    </div>
  );
}
