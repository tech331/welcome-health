"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { type CreateRequestResult, type RequestFormData } from "@/lib/requestForm";
import { ProgressIndicator } from "./ProgressIndicator";
import { StepClient } from "./StepClient";
import { StepItems } from "./StepItems";
import { StepSuppliers } from "./StepSuppliers";
import { StepReview } from "./StepReview";
import {
  buildPayload,
  createInitialState,
  isFormDirty,
  STEPS,
  validateStep,
  type FormState,
  type StepIndex,
} from "./formState";

type NewRequestModalProps = {
  onClose: () => void;
};

export function NewRequestModal({ onClose }: NewRequestModalProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<RequestFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [state, setState] = useState<FormState>(createInitialState);
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [maxReachedStep, setMaxReachedStep] = useState<StepIndex>(0);
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateRequestResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/request-form-data")
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load form data");
        }
        return response.json() as Promise<RequestFormData>;
      })
      .then((data) => {
        if (!cancelled) setFormData(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load form data",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const errors = useMemo(
    () => (attempted[currentStep] ? validateStep(currentStep, state) : {}),
    [attempted, currentStep, state],
  );

  const attemptClose = useCallback(() => {
    if (result) {
      onClose();
      return;
    }
    if (isFormDirty(state)) {
      const confirmed = window.confirm(
        "Discard this request? Your progress will be lost.",
      );
      if (!confirmed) return;
    }
    onClose();
  }, [onClose, result, state]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") attemptClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [attemptClose]);

  function goToStep(step: StepIndex) {
    if (step <= maxReachedStep) setCurrentStep(step);
  }

  function handleNext() {
    setAttempted((prev) => ({ ...prev, [currentStep]: true }));
    const stepErrors = validateStep(currentStep, state);
    if (Object.keys(stepErrors).length > 0) return;

    const next = Math.min(currentStep + 1, STEPS.length - 1) as StepIndex;
    setCurrentStep(next);
    setMaxReachedStep((prev) => (next > prev ? next : prev));
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0) as StepIndex);
  }

  async function handleSubmit() {
    const allAttempted: Record<number, boolean> = {};
    let firstInvalid: StepIndex | null = null;
    ([0, 1, 2] as StepIndex[]).forEach((step) => {
      allAttempted[step] = true;
      if (
        firstInvalid === null &&
        Object.keys(validateStep(step, state)).length > 0
      ) {
        firstInvalid = step;
      }
    });
    setAttempted(allAttempted);

    if (firstInvalid !== null) {
      setCurrentStep(firstInvalid);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(state)),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to create request");
      }
      setResult(body as CreateRequestResult);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isReviewStep = currentStep === 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="New Request"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={attemptClose}
        aria-hidden="true"
      />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#2A2A2A]">New Request</h2>
          <button
            type="button"
            onClick={attemptClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-black/[0.04] hover:text-[#2A2A2A]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {!result && (
          <div className="border-b border-gray-100 px-6 py-4">
            <ProgressIndicator
              currentStep={currentStep}
              onStepClick={goToStep}
              maxReachedStep={maxReachedStep}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {result ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f0eb]">
                <Check className="h-7 w-7 text-[#2d6a4f]" strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#2A2A2A]">
                Request {result.requestId} created
              </h3>
              <p className="mt-1 max-w-sm text-sm text-[#2A2A2A]/60">
                The request has been saved to Airtable with the selected
                suppliers and items.
              </p>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-8 w-8 text-[#b3261e]" strokeWidth={1.75} />
              <p className="mt-3 text-sm text-[#2A2A2A]">{loadError}</p>
            </div>
          ) : !formData ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#2d6a4f]" />
            </div>
          ) : (
            <>
              {currentStep === 0 && (
                <StepClient
                  state={state}
                  setState={setState}
                  errors={errors}
                  data={formData}
                />
              )}
              {currentStep === 1 && (
                <StepItems state={state} setState={setState} errors={errors} />
              )}
              {currentStep === 2 && (
                <StepSuppliers
                  state={state}
                  setState={setState}
                  errors={errors}
                  data={formData}
                />
              )}
              {currentStep === 3 && (
                <StepReview state={state} data={formData} />
              )}
            </>
          )}
        </div>

        {!result && formData && !loadError && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#2A2A2A] transition-colors hover:bg-black/[0.04] disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {submitError && (
                <span className="mr-2 text-xs text-[#b3261e]">{submitError}</span>
              )}
              <button
                type="button"
                onClick={attemptClose}
                disabled={submitting}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#2A2A2A]/70 transition-colors hover:bg-black/[0.04] disabled:opacity-50"
              >
                Cancel
              </button>
              {isReviewStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245a42] disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  )}
                  Submit Request
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245a42]"
                >
                  Next
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="flex justify-end border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#2d6a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245a42]"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
