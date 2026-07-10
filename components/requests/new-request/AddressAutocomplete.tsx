"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Pencil, Search } from "lucide-react";
import { AU_STATES } from "@/lib/requestForm";
import {
  getGoogleMapsApiKey,
  loadGoogleMapsPlaces,
  parseAddressComponents,
  type ParsedAddress,
  type PlacePrediction,
} from "@/lib/googleMaps";
import { FieldLabel, SelectField, TextField } from "./fields";
import type { StepErrors } from "./formState";

export type AddressValue = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
};

type AddressAutocompleteProps = {
  value: AddressValue;
  onFieldChange: (key: keyof AddressValue, value: string) => void;
  onPopulate: (parsed: ParsedAddress) => void;
  errors: StepErrors;
};

type GoogleServices = {
  autocomplete: {
    getPlacePredictions: (
      request: {
        input: string;
        componentRestrictions?: { country: string | string[] };
        types?: string[];
      },
      callback: (
        predictions: { place_id: string; description: string }[] | null,
        status: string,
      ) => void,
    ) => void;
  };
  places: {
    getDetails: (
      request: { placeId: string; fields: string[] },
      callback: (
        result: { address_components?: unknown } | null,
        status: string,
      ) => void,
    ) => void;
  };
  okStatus: string;
};

export function AddressAutocomplete({
  value,
  onFieldChange,
  onPopulate,
  errors,
}: AddressAutocompleteProps) {
  const apiKey = getGoogleMapsApiKey();
  const hasKey = Boolean(apiKey);

  const [manualMode, setManualMode] = useState(
    () => !hasKey || Boolean(value.addressLine1),
  );
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const servicesRef = useRef<GoogleServices | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (manualMode || !hasKey || servicesRef.current) return;
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then((places) => {
        if (cancelled) return;
        servicesRef.current = {
          autocomplete: new places.AutocompleteService(),
          places: new places.PlacesService(document.createElement("div")),
          okStatus: places.PlacesServiceStatus.OK,
        };
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(
          "Address search is unavailable. Please enter the address manually.",
        );
        setManualMode(true);
      });

    return () => {
      cancelled = true;
    };
  }, [manualMode, hasKey]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const services = servicesRef.current;
    const trimmed = query.trim();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!services || trimmed.length < 3) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      services.autocomplete.getPlacePredictions(
        {
          input: trimmed,
          componentRestrictions: { country: "au" },
          types: ["address"],
        },
        (results, status) => {
          setLoading(false);
          if (status !== services.okStatus || !results) {
            setPredictions([]);
            return;
          }
          setPredictions(
            results.map((result) => ({
              placeId: result.place_id,
              description: result.description,
            })),
          );
        },
      );
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelectPrediction(prediction: PlacePrediction) {
    const services = servicesRef.current;
    setOpen(false);
    setQuery(prediction.description);
    if (!services) return;

    services.places.getDetails(
      { placeId: prediction.placeId, fields: ["address_components"] },
      (result, status) => {
        if (status !== services.okStatus || !result) return;
        const parsed = parseAddressComponents(
          result as { address_components?: never },
        );
        onPopulate(parsed);
        setManualMode(true);
      },
    );
  }

  function enterManually() {
    setOpen(false);
    setManualMode(true);
  }

  const showManual = manualMode || !hasKey;

  const dropdown = useMemo(() => {
    if (!open) return null;
    return (
      <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
        {loading && (
          <li className="flex items-center gap-2 px-3 py-2 text-sm text-[#2A2A2A]/50">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            Searching…
          </li>
        )}
        {!loading &&
          predictions.map((prediction) => (
            <li key={prediction.placeId}>
              <button
                type="button"
                onClick={() => handleSelectPrediction(prediction)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-[#2A2A2A] transition-colors hover:bg-[#e8f0eb]"
              >
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#6f9a85]"
                  strokeWidth={1.75}
                />
                <span>{prediction.description}</span>
              </button>
            </li>
          ))}
        {!loading && query.trim().length >= 3 && predictions.length === 0 && (
          <li className="px-3 py-2 text-sm text-[#2A2A2A]/50">
            No addresses found
          </li>
        )}
        <li className="mt-1 border-t border-gray-100 pt-1">
          <button
            type="button"
            onClick={enterManually}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-[#2d6a4f] transition-colors hover:bg-[#e8f0eb]"
          >
            <Pencil className="h-4 w-4 shrink-0" strokeWidth={2} />
            Enter address manually
          </button>
        </li>
      </ul>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, predictions, query]);

  return (
    <div className="space-y-4 rounded-lg bg-[#faf8f5] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
          Address
        </p>
        {showManual && hasKey && (
          <button
            type="button"
            onClick={() => {
              setManualMode(false);
              setQuery("");
              setPredictions([]);
            }}
            className="flex items-center gap-1 text-xs font-medium text-[#2d6a4f] underline-offset-2 hover:underline"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={2} />
            Search for an address
          </button>
        )}
      </div>

      {loadError && (
        <p className="text-xs text-[#b3261e]">{loadError}</p>
      )}

      {!showManual ? (
        <div ref={containerRef} className="relative">
          <FieldLabel htmlFor="address-search">Search address</FieldLabel>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2A2A2A]/40"
              strokeWidth={1.75}
            />
            <input
              id="address-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Start typing an Australian address…"
              autoComplete="off"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-[#2A2A2A] outline-none transition-colors focus:border-[#2d6a4f] focus:ring-1 focus:ring-[#2d6a4f] placeholder:text-[#2A2A2A]/40"
            />
          </div>
          {dropdown}
        </div>
      ) : (
        <>
          <TextField
            id="addressLine1"
            label="Address line 1"
            required
            value={value.addressLine1}
            onChange={(next) => onFieldChange("addressLine1", next)}
            error={errors.addressLine1}
          />
          <TextField
            id="addressLine2"
            label="Address line 2"
            optional
            value={value.addressLine2}
            onChange={(next) => onFieldChange("addressLine2", next)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField
              id="city"
              label="City"
              required
              value={value.city}
              onChange={(next) => onFieldChange("city", next)}
              error={errors.city}
            />
            <SelectField
              id="state"
              label="State"
              required
              value={value.state}
              onChange={(next) => onFieldChange("state", next)}
              options={AU_STATES.map((s) => ({ value: s, label: s }))}
              error={errors.state}
            />
            <TextField
              id="postcode"
              label="Postcode"
              required
              value={value.postcode}
              onChange={(next) => onFieldChange("postcode", next)}
              error={errors.postcode}
            />
          </div>
        </>
      )}
    </div>
  );
}
