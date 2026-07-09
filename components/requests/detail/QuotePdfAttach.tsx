"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Loader2, Paperclip } from "lucide-react";
import type { RequestAttachment } from "@/lib/requestDetail";

type QuotePdfAttachProps = {
  quoteId: string;
  attachments: RequestAttachment[];
  onAttached?: (attachments: RequestAttachment[]) => void;
};

export function QuotePdfAttach({
  quoteId,
  attachments,
  onAttached,
}: QuotePdfAttachProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please attach a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("PDF must be under 5 MB.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]!);
        }
        const base64 = btoa(binary);

        const response = await fetch(`/api/quotes/${quoteId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/pdf",
            base64,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error || "Failed to attach PDF");
        }

        const data = (await response.json()) as {
          attachments: RequestAttachment[];
        };
        onAttached?.(data.attachments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to attach PDF");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  const pdfs =
    attachments.length === 0
      ? []
      : attachments.filter(
          (attachment) =>
            !attachment.type ||
            attachment.type === "application/pdf" ||
            attachment.filename.toLowerCase().endsWith(".pdf"),
        );

  if (pdfs.length > 0) {
    return (
      <div className="space-y-1.5">
        {pdfs.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[#2d6a4f] underline-offset-2 transition-colors hover:text-[#245a42] hover:underline"
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
            {attachment.filename}
          </a>
        ))}
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-xs text-[#2A2A2A]/50 transition-colors hover:text-[#2d6a4f] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.75} />
            ) : (
              <Paperclip className="h-3 w-3" strokeWidth={1.75} />
            )}
            Attach another
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </div>
        {error && <p className="text-xs text-[#b3261e]">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-[#2A2A2A]/70 transition-colors hover:border-[#2d6a4f] hover:text-[#2d6a4f] disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <Paperclip className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        Attach PDF
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {error && <p className="mt-1 text-xs text-[#b3261e]">{error}</p>}
    </div>
  );
}
