import { useEffect, useState } from "react";

export function useQuerySelection(param = "selected") {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get(param);
    if (value) {
      setSelectedId(value);
    }
  }, [param]);

  return [selectedId, setSelectedId] as const;
}
