"use client";

import { useState } from "react";
import type { ClientRecord } from "@/lib/clients";
import { ClientSideSheet } from "./ClientSideSheet";
import { ClientsTable } from "./ClientsTable";

type ClientsPageViewProps = {
  clients: ClientRecord[];
  isConfigured: boolean;
  fetchError?: string | null;
};

export function ClientsPageView({
  clients,
  isConfigured,
  fetchError,
}: ClientsPageViewProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ?? null;

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-y-auto px-8 pb-8 pt-8">
        <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
          Clients
        </h1>
        <ClientsTable
          clients={clients}
          isConfigured={isConfigured}
          fetchError={fetchError}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
        />
      </div>
      <ClientSideSheet
        client={selectedClient}
        onClose={() => setSelectedClientId(null)}
      />
    </div>
  );
}
