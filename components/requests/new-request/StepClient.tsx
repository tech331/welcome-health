"use client";

import { type Dispatch, type SetStateAction } from "react";
import { AU_STATES, FUNDING_TYPES, type RequestFormData } from "@/lib/requestForm";
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

  const requestorOptions = data.requestors.map((requestor) => ({
    value: requestor.id,
    label: requestor.name,
  }));

  const isNew = state.clientMode === "new";

  return (
    <div className="space-y-6">
      <Combobox
        id="requestor"
        label="Requestor"
        optional
        value={state.requestorId}
        onChange={(value) =>
          setState((prev) => ({ ...prev, requestorId: value }))
        }
        options={requestorOptions}
        placeholder="Who is submitting this request?"
        emptyMessage="No clinicians found"
      />

      <div className="border-t border-gray-100 pt-6">
        <Combobox
          id="existing-client"
          label="Client"
          required={!isNew}
          value={state.existingClientId}
          onChange={(value) =>
            setState((prev) => ({ ...prev, existingClientId: value }))
          }
          options={clientOptions}
          placeholder="Search clients by name…"
          emptyMessage="No clients found"
          error={isNew ? undefined : errors.existingClientId}
        />

        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[#2A2A2A]">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(event) => setMode(event.target.checked ? "new" : "existing")}
            className="h-4 w-4 rounded border-gray-300 text-[#2d6a4f] focus:ring-[#2d6a4f]"
          />
          Create new client
        </label>
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

          <div className="space-y-4 rounded-lg bg-[#faf8f5] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/50">
              Address
            </p>
            <TextField
              id="addressLine1"
              label="Address line 1"
              required
              value={state.newClient.addressLine1}
              onChange={(value) => setClientField("addressLine1", value)}
              error={errors.addressLine1}
            />
            <TextField
              id="addressLine2"
              label="Address line 2"
              optional
              value={state.newClient.addressLine2}
              onChange={(value) => setClientField("addressLine2", value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                id="city"
                label="City"
                required
                value={state.newClient.city}
                onChange={(value) => setClientField("city", value)}
                error={errors.city}
              />
              <SelectField
                id="state"
                label="State"
                required
                value={state.newClient.state}
                onChange={(value) => setClientField("state", value)}
                options={AU_STATES.map((s) => ({ value: s, label: s }))}
                error={errors.state}
              />
              <TextField
                id="postcode"
                label="Postcode"
                required
                value={state.newClient.postcode}
                onChange={(value) => setClientField("postcode", value)}
                error={errors.postcode}
              />
            </div>
          </div>

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
