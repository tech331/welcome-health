import { Check } from "lucide-react";
import {
  REQUEST_STAGES,
  getRequestStageIndex,
} from "@/lib/requestDetail";

type RequestStageMetrolineProps = {
  status: string;
};

function StepIndicator({
  index,
  isComplete,
  isCurrent,
}: {
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
}) {
  if (isComplete) {
    return (
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a4f] text-white shadow-sm">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    );
  }

  if (isCurrent) {
    return (
      <span
        className="relative flex h-8 w-8 items-center justify-center"
        aria-hidden="true"
      >
        <span className="absolute inset-0 rounded-full bg-[#2d6a4f]/20 blur-md" />
        <span className="absolute inset-0 rounded-full bg-[#e8f0eb]/80" />
        <span className="absolute inset-[3px] rounded-full border-2 border-[#2d6a4f] bg-white" />
        <span className="relative h-2 w-2 rounded-full bg-[#2d6a4f]" />
      </span>
    );
  }

  return (
    <span className="relative flex h-7 w-7 items-center justify-center">
      <span className="absolute inset-[5px] rounded-full border border-[#b0aaa3] bg-white" />
      <span className="relative text-[10px] font-semibold text-[#595959]">
        {index + 1}
      </span>
    </span>
  );
}

export function RequestStageMetroline({ status }: RequestStageMetrolineProps) {
  const currentIndex = getRequestStageIndex(status);

  return (
    <ol className="flex w-full items-start">
      {REQUEST_STAGES.map((stage, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === REQUEST_STAGES.length - 1;

        return (
          <li
            key={stage}
            className={`flex items-start ${isLast ? "shrink-0" : "min-w-0 flex-1"}`}
          >
            <div className="flex shrink-0 flex-col items-center gap-2">
              <StepIndicator
                index={index}
                isComplete={isComplete}
                isCurrent={isCurrent}
              />
              <span
                className={`max-w-[5.5rem] text-center text-xs font-medium leading-tight sm:max-w-none sm:whitespace-nowrap ${
                  isCurrent
                    ? "text-[#2A2A2A]"
                    : isComplete
                      ? "text-[#2d6a4f]"
                      : "text-[#595959]"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {stage}
              </span>
            </div>
            {!isLast && (
              <div
                className="mx-2 mt-4 h-px min-w-[1.5rem] flex-1"
                aria-hidden="true"
              >
                <div
                  className={`h-full rounded-full ${
                    index < currentIndex
                      ? "bg-[#2d6a4f]"
                      : "bg-gradient-to-r from-[#cfc8c0] to-[#e8e4df]"
                  }`}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
