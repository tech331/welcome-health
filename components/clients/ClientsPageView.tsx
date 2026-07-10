"use client";

import { useEffect } from "react";
import type { ClientRecord } from "@/lib/clients";
import { useQuerySelection } from "@/lib/useQuerySelection";
import { useRelatedRecords } from "@/components/related-records/RelatedRecordProvider";
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
  const [selectedId, setSelectedId] = useQuerySelection();
  const { openClient, close, activeRecord } = useRelatedRecords();

  useEffect(() => {
    if (!selectedId) return;
    const selectedClient = clients.find((client) => client.id === selectedId);
    openClient(selectedId, selectedClient);
  }, [clients, openClient, selectedId]);

  const activeClientId =
    activeRecord?.type === "client" ? activeRecord.id : null;

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Clients
      </h1>
      <ClientsTable
        clients={clients}
        isConfigured={isConfigured}
        fetchError={fetchError}
        selectedClientId={activeClientId}
        onSelectClient={(id) => {
          setSelectedId(id);
          if (!id) {
            close();
            return;
          }
          const selectedClient = clients.find((client) => client.id === id);
          openClient(id, selectedClient);
        }}
      />
    </div>
  );
}
