"use client";

import { type Dispatch, type SetStateAction } from "react";
import { FUNDING_TYPES, type RequestFormData } from "@/lib/requestForm";
import type { ParsedAddress } from "@/lib/googleMaps";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Combobox } from "./Combobox";
import { SelectField, TextField } from "./fields";
import {
  createEmptyClient,
  type FormState,
  type NewClientDraft,
  type StepErrors,
} from "./formState";

type StepClientProps = {
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
  errors: StepErrors;
  data: RequestFormData;
};

export function StepClient({ state, setState, errors, data }: StepClientProps) {
  function setClientField<K extends keyof NewClientDraft>(
    key: K,
    value: NewClientDraft[K],
  ) {
    setState((prev) => ({
      ...prev,
      newClient: { ...prev.newClient, [key]: value },
    }));
  }

  function populateAddress(parsed: ParsedAddress) {
    setState((prev) => ({
      ...prev,
      newClient: {
        ...prev.newClient,
        addressLine1: parsed.addressLine1,
        addressLine2: parsed.addressLine2,
        city: parsed.city,
        state: parsed.state,
        postcode: parsed.postcode,
      },
    }));
  }

  function setMode(mode: "existing" | "new") {
    setState((prev) => ({
      ...prev,
      clientMode: mode,
      // Reset the opposing selection so supplier filtering stays consistent.
      existingClientId: mode === "existing" ? prev.existingClientId : "",
      newClient: mode === "new" ? prev.newClient : createEmptyClient(),
    }));
  }

  const clientOptions = data.clients.map((client) => ({
    value: client.id,
    label: client.name,
    description: [
      client.clientId ? `ID ${client.clientId}` : null,
      client.caseManagerName ? `CM: ${client.caseManagerName}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const caseManagerOptions = data.caseManagers.map((cm) => ({
    value: cm.id,
    label: cm.name,
  }));

  const isNew = state.clientMode === "new";

  return (
    <div className="space-y-6">
      <div>
        <Combobox
          id="existing-client"
          label="Client"
          required={!isNew}
          value={state.existingClientId}
          onChange={(value) =>
            setState((prev) => ({
              ...prev,
              existingClientId: value,
              // Selecting an existing client cancels new-client creation.
              clientMode: value ? "existing" : prev.clientMode,
              newClient: value ? createEmptyClient() : prev.newClient,
            }))
          }
          options={clientOptions}
          placeholder="Search clients by name…"
          emptyMessage="No clients found"
          error={isNew ? undefined : errors.existingClientId}
          createLabel="Create new client"
          onCreate={() => setMode("new")}
        />

        {isNew && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#e8f0eb]/60 px-3 py-2 text-sm text-[#2d6a4f]">
            <span className="font-medium">Creating a new client</span>
            <button
              type="button"
              onClick={() => setMode("existing")}
              className="text-xs font-medium text-[#2d6a4f] underline-offset-2 hover:underline"
            >
              Search instead
            </button>
          </div>
        )}
      </div>

      {isNew && (
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              id="firstName"
              label="First name"
              required
              value={state.newClient.firstName}
              onChange={(value) => setClientField("firstName", value)}
              error={errors.firstName}
            />
            <TextField
              id="lastName"
              label="Last name"
              required
              value={state.newClient.lastName}
              onChange={(value) => setClientField("lastName", value)}
              error={errors.lastName}
            />
            <TextField
              id="dateOfBirth"
              label="Date of birth"
              type="date"
              required
              value={state.newClient.dateOfBirth}
              onChange={(value) => setClientField("dateOfBirth", value)}
              error={errors.dateOfBirth}
            />
            <TextField
              id="clientId"
              label="Client ID"
              optional
              value={state.newClient.clientId}
              onChange={(value) => setClientField("clientId", value)}
            />
            <TextField
              id="phone"
              label="Phone"
              type="tel"
              required
              value={state.newClient.phone}
              onChange={(value) => setClientField("phone", value)}
              error={errors.phone}
            />
          </div>

          <SelectField
            id="fundingType"
            label="Funding type"
            required
            value={state.newClient.fundingType}
            onChange={(value) => setClientField("fundingType", value)}
            options={FUNDING_TYPES.map((type) => ({ value: type, label: type }))}
            error={errors.fundingType}
          />

          <AddressAutocomplete
            value={{
              addressLine1: state.newClient.addressLine1,
              addressLine2: state.newClient.addressLine2,
              city: state.newClient.city,
              state: state.newClient.state,
              postcode: state.newClient.postcode,
            }}
            onFieldChange={(key, value) => setClientField(key, value)}
            onPopulate={populateAddress}
            errors={errors}
          />

          <Combobox
            id="caseManager"
            label="Case manager"
            required
            value={state.newClient.caseManagerId}
            onChange={(value) => setClientField("caseManagerId", value)}
            options={caseManagerOptions}
            placeholder="Search case managers…"
            emptyMessage="No case managers found"
            error={errors.caseManagerId}
          />
        </div>
      )}
    </div>
  );
}
