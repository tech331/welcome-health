import { Header } from "./Header";
import { RelatedRecordProvider } from "./related-records/RelatedRecordProvider";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-[#faf8f5]">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <RelatedRecordProvider>{children}</RelatedRecordProvider>
        </main>
      </div>
    </div>
  );
}
