"use client";

import { Check } from "lucide-react";
import { STEPS, type StepIndex } from "./formState";

type ProgressIndicatorProps = {
  currentStep: StepIndex;
  onStepClick: (step: StepIndex) => void;
  maxReachedStep: StepIndex;
};

export function ProgressIndicator({
  currentStep,
  onStepClick,
  maxReachedStep,
}: ProgressIndicatorProps) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, index) => {
        const step = index as StepIndex;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;
        const isReachable = step <= maxReachedStep;

        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(step)}
              className={`flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
                isReachable ? "cursor-pointer hover:bg-black/[0.03]" : "cursor-default"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isComplete
                    ? "bg-[#2d6a4f] text-white"
                    : isCurrent
                      ? "bg-[#2d6a4f] text-white"
                      : "bg-[#ede8e3] text-[#2A2A2A]/50"
                }`}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`hidden text-sm font-medium sm:block ${
                  isCurrent
                    ? "text-[#2A2A2A]"
                    : isComplete
                      ? "text-[#2A2A2A]/70"
                      : "text-[#2A2A2A]/40"
                }`}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${
                  step < currentStep ? "bg-[#2d6a4f]" : "bg-[#e0d9d1]"
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
