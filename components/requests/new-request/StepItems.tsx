"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ITEM_CATEGORIES } from "@/lib/requestForm";
import { SelectField, TextAreaField, TextField } from "./fields";
import {
  createEmptyItem,
  type FormState,
  type ItemDraft,
  type StepErrors,
} from "./formState";

type StepItemsProps = {
  state: FormState;
  setState: Dispatch<SetStateAction<FormState>>;
  errors: StepErrors;
};

export function StepItems({ state, setState, errors }: StepItemsProps) {
  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem() {
    setState((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  }

  function removeItem(index: number) {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#2A2A2A]/60">
        Add each item you would like quotes for.
      </p>

      {state.items.map((item, index) => (
        <div
          key={item.uid}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#2A2A2A]">
              Item {index + 1}
            </h3>
            {state.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="flex items-center gap-1 text-xs font-medium text-[#b3261e] transition-colors hover:text-[#8f1d18]"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Remove
              </button>
            )}
          </div>

          <TextField
            id={`item-${index}-name`}
            label="Item name"
            required
            value={item.name}
            onChange={(value) => updateItem(index, { name: value })}
            error={errors[`item-${index}-name`]}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id={`item-${index}-category`}
              label="Category"
              required
              value={item.category}
              onChange={(value) => updateItem(index, { category: value })}
              options={ITEM_CATEGORIES.map((c) => ({ value: c, label: c }))}
              error={errors[`item-${index}-category`]}
            />
            <TextField
              id={`item-${index}-quantity`}
              label="Quantity"
              required
              type="text"
              value={item.quantity}
              onChange={(value) =>
                updateItem(index, {
                  quantity: value.replace(/[^0-9]/g, ""),
                })
              }
              error={errors[`item-${index}-quantity`]}
            />
          </div>

          <TextField
            id={`item-${index}-url`}
            label="URL"
            optional
            type="url"
            placeholder="https://…"
            value={item.url}
            onChange={(value) => updateItem(index, { url: value })}
          />

          <TextAreaField
            id={`item-${index}-notes`}
            label="Notes"
            optional
            rows={2}
            value={item.notes}
            onChange={(value) => updateItem(index, { notes: value })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm font-medium text-[#2d6a4f] transition-colors hover:border-[#2d6a4f] hover:bg-[#e8f0eb]/40"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add another item
      </button>
    </div>
  );
}
