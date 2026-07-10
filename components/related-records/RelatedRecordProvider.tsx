"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CaseManagerDetail } from "@/lib/caseManagers";
import type { ClientRecord } from "@/lib/clients";
import {
  RELATED_RECORD_LIST_LABELS,
  RELATED_RECORD_LIST_PATHS,
  type RelatedRecordType,
} from "@/lib/relatedRecords";
import type { SupplierRecord } from "@/lib/suppliers";
import { ClientSideSheet } from "@/components/clients/ClientSideSheet";
import { CaseManagerSideSheet } from "@/components/case-managers/CaseManagerSideSheet";
import { SupplierSideSheet } from "@/components/suppliers/SupplierSideSheet";

type RelatedRecordData = ClientRecord | CaseManagerDetail | SupplierRecord;

type ActiveRecord = {
  type: RelatedRecordType;
  id: string;
};

type RelatedRecordContextValue = {
  activeRecord: ActiveRecord | null;
  openClient: (id: string, record?: ClientRecord) => void;
  openCaseManager: (id: string, record?: CaseManagerDetail) => void;
  openSupplier: (id: string, record?: SupplierRecord) => void;
  close: () => void;
  isOpen: (type: RelatedRecordType, id: string) => boolean;
};

const RelatedRecordContext = createContext<RelatedRecordContextValue | null>(
  null,
);

export function useRelatedRecords() {
  const context = useContext(RelatedRecordContext);
  if (!context) {
    throw new Error("useRelatedRecords must be used within RelatedRecordProvider");
  }
  return context;
}

export function RelatedRecordProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeRecord, setActiveRecord] = useState<ActiveRecord | null>(null);
  const [recordData, setRecordData] = useState<RelatedRecordData | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map<string, RelatedRecordData>());

  const openRecord = useCallback(
    (type: RelatedRecordType, id: string, record?: RelatedRecordData) => {
      const cacheKey = `${type}:${id}`;
      if (record) {
        cacheRef.current.set(cacheKey, record);
        setRecordData(record);
      }
      setActiveRecord((prev) => {
        if (prev?.type === type && prev.id === id) {
          return prev;
        }
        return { type, id };
      });
    },
    [],
  );

  const openClient = useCallback(
    (id: string, record?: ClientRecord) => openRecord("client", id, record),
    [openRecord],
  );
  const openCaseManager = useCallback(
    (id: string, record?: CaseManagerDetail) =>
      openRecord("caseManager", id, record),
    [openRecord],
  );
  const openSupplier = useCallback(
    (id: string, record?: SupplierRecord) =>
      openRecord("supplier", id, record),
    [openRecord],
  );

  const close = useCallback(() => {
    setActiveRecord(null);
  }, []);

  useEffect(() => {
    if (!activeRecord) {
      setRecordData(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${activeRecord.type}:${activeRecord.id}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setRecordData(cached);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/related-records/${activeRecord.type}/${activeRecord.id}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load record");
        }
        return response.json() as Promise<RelatedRecordData>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        cacheRef.current.set(cacheKey, data);
        setRecordData(data);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRecordData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [activeRecord]);

  const contextValue = useMemo<RelatedRecordContextValue>(
    () => ({
      activeRecord,
      openClient,
      openCaseManager,
      openSupplier,
      close,
      isOpen: (type, id) =>
        activeRecord?.type === type && activeRecord.id === id,
    }),
    [activeRecord, openClient, openCaseManager, openSupplier, close],
  );

  const client =
    activeRecord?.type === "client" && recordData
      ? (recordData as ClientRecord)
      : null;
  const caseManager =
    activeRecord?.type === "caseManager" && recordData
      ? (recordData as CaseManagerDetail)
      : null;
  const supplier =
    activeRecord?.type === "supplier" && recordData
      ? (recordData as SupplierRecord)
      : null;

  const listPath = activeRecord
    ? RELATED_RECORD_LIST_PATHS[activeRecord.type]
    : undefined;
  const listLabel = activeRecord
    ? RELATED_RECORD_LIST_LABELS[activeRecord.type]
    : undefined;

  return (
    <RelatedRecordContext.Provider value={contextValue}>
      <div className="flex h-full w-full min-h-0 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
        {loading && activeRecord ? (
          <aside className="flex h-full w-96 shrink-0 flex-col border-l border-gray-200 bg-white shadow-[-2px_0_6px_-1px_rgba(0,0,0,0.08)]">
            <div className="border-b border-gray-100 px-4 py-2.5">
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="space-y-5 p-5">
              <div className="skeleton h-6 w-40 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-16 w-full rounded-xl" />
            </div>
          </aside>
        ) : activeRecord?.type === "client" ? (
          <ClientSideSheet
            client={client}
            onClose={close}
            listHref={listPath}
            listLabel={listLabel}
          />
        ) : activeRecord?.type === "caseManager" ? (
          <CaseManagerSideSheet
            caseManager={caseManager}
            onClose={close}
            listHref={listPath}
            listLabel={listLabel}
          />
        ) : activeRecord?.type === "supplier" ? (
          <SupplierSideSheet
            supplier={supplier}
            onClose={close}
            listHref={listPath}
            listLabel={listLabel}
          />
        ) : null}
      </div>
    </RelatedRecordContext.Provider>
  );
}
