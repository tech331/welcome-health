import {
  filterSuppliersForPayers,
  type NewRequestPayload,
  type RequestFormData,
  type SupplierOption,
} from "@/lib/requestForm";

export type ClientMode = "existing" | "new";

export type NewClientDraft = {
  clientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  fundingType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  caseManagerId: string;
};

export type ItemDraft = {
  uid: string;
  name: string;
  url: string;
  category: string;
  quantity: string;
  notes: string;
};

export type FormState = {
  requestorId: string;
  clientMode: ClientMode;
  existingClientId: string;
  newClient: NewClientDraft;
  items: ItemDraft[];
  supplierIds: string[];
  followUpBusinessDays: number | null;
  notes: string;
};

export const STEPS = ["Client", "Items", "Suppliers", "Review"] as const;
export type StepIndex = 0 | 1 | 2 | 3;

let uidCounter = 0;
export function nextUid(): string {
  uidCounter += 1;
  return `item-${uidCounter}-${Date.now()}`;
}

export function createEmptyClient(): NewClientDraft {
  return {
    clientId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    fundingType: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    caseManagerId: "",
  };
}

export function createEmptyItem(): ItemDraft {
  return {
    uid: nextUid(),
    name: "",
    url: "",
    category: "",
    quantity: "1",
    notes: "",
  };
}

export function createInitialState(): FormState {
  return {
    requestorId: "",
    clientMode: "existing",
    existingClientId: "",
    newClient: createEmptyClient(),
    items: [createEmptyItem()],
    supplierIds: [],
    followUpBusinessDays: null,
    notes: "",
  };
}

/** Payer ids driving the supplier list, based on the chosen/created client. */
export function resolvePayerIds(
  state: FormState,
  data: RequestFormData,
): string[] {
  if (state.clientMode === "existing") {
    const client = data.clients.find((c) => c.id === state.existingClientId);
    return client?.payerIds ?? [];
  }
  const caseManager = data.caseManagers.find(
    (cm) => cm.id === state.newClient.caseManagerId,
  );
  return caseManager?.payerIds ?? [];
}

export function availableSuppliers(
  state: FormState,
  data: RequestFormData,
  showAll: boolean,
): SupplierOption[] {
  if (showAll) return data.suppliers;
  return filterSuppliersForPayers(data.suppliers, resolvePayerIds(state, data));
}

export type StepErrors = Record<string, string>;

export function validateClientStep(state: FormState): StepErrors {
  const errors: StepErrors = {};

  if (state.clientMode === "existing") {
    if (!state.existingClientId) {
      errors.existingClientId = "Please select a client.";
    }
    return errors;
  }

  const c = state.newClient;
  if (!c.firstName.trim()) errors.firstName = "First name is required.";
  if (!c.lastName.trim()) errors.lastName = "Last name is required.";
  if (!c.dateOfBirth.trim()) errors.dateOfBirth = "Date of birth is required.";
  if (!c.phone.trim()) errors.phone = "Phone is required.";
  if (!c.fundingType) errors.fundingType = "Funding type is required.";
  if (!c.addressLine1.trim())
    errors.addressLine1 = "Address line 1 is required.";
  if (!c.city.trim()) errors.city = "City is required.";
  if (!c.state) errors.state = "State is required.";
  if (!c.postcode.trim()) errors.postcode = "Postcode is required.";
  if (!c.caseManagerId) errors.caseManagerId = "Case manager is required.";

  return errors;
}

export function validateItemsStep(state: FormState): StepErrors {
  const errors: StepErrors = {};
  state.items.forEach((item, index) => {
    if (!item.name.trim()) errors[`item-${index}-name`] = "Item name is required.";
    if (!item.category) errors[`item-${index}-category`] = "Category is required.";
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      errors[`item-${index}-quantity`] = "Quantity must be at least 1.";
    }
  });
  return errors;
}

export function validateSuppliersStep(state: FormState): StepErrors {
  const errors: StepErrors = {};
  if (state.supplierIds.length === 0) {
    errors.suppliers = "Select at least one supplier.";
  }
  if (state.followUpBusinessDays == null) {
    errors.followUp = "Choose a follow-up frequency.";
  }
  return errors;
}

export function validateStep(step: StepIndex, state: FormState): StepErrors {
  if (step === 0) return validateClientStep(state);
  if (step === 1) return validateItemsStep(state);
  if (step === 2) return validateSuppliersStep(state);
  return {};
}

export function buildPayload(state: FormState): NewRequestPayload {
  const items = state.items.map((item) => ({
    name: item.name.trim(),
    url: item.url.trim() || undefined,
    category: item.category,
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    notes: item.notes.trim() || undefined,
  }));

  const client: NewRequestPayload["client"] =
    state.clientMode === "existing"
      ? { mode: "existing", id: state.existingClientId }
      : {
          mode: "new",
          data: {
            clientId: state.newClient.clientId.trim() || undefined,
            firstName: state.newClient.firstName.trim(),
            lastName: state.newClient.lastName.trim(),
            dateOfBirth: state.newClient.dateOfBirth,
            phone: state.newClient.phone.trim(),
            fundingType: state.newClient.fundingType,
            addressLine1: state.newClient.addressLine1.trim(),
            addressLine2: state.newClient.addressLine2.trim() || undefined,
            city: state.newClient.city.trim(),
            state: state.newClient.state,
            postcode: state.newClient.postcode.trim(),
            caseManagerId: state.newClient.caseManagerId,
          },
        };

  return {
    requestorId: state.requestorId || undefined,
    client,
    items,
    supplierIds: state.supplierIds,
    followUpBusinessDays: state.followUpBusinessDays ?? 0,
    notes: state.notes.trim() || undefined,
  };
}

export function isFormDirty(state: FormState): boolean {
  const initial = createInitialState();
  // Compare ignoring the auto-generated item uid.
  const normalize = (s: FormState) => ({
    ...s,
    items: s.items.map(({ uid: _uid, ...rest }) => rest),
  });
  return (
    JSON.stringify(normalize(state)) !== JSON.stringify(normalize(initial))
  );
}
