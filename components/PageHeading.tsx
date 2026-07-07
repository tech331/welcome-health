export function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="font-sans text-2xl font-semibold text-[#2A2A2A]">
        {children}
      </h1>
    </div>
  );
}
