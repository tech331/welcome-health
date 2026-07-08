export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
        {label}
      </div>
      <div className="mt-1 text-sm text-[#2A2A2A]">{children}</div>
    </div>
  );
}

export function DetailValue({ value }: { value: string }) {
  return <>{value && value !== "—" ? value : "—"}</>;
}
