import {
  Mail,
  Phone,
  Globe,
  ArrowDownLeft,
  ArrowUpRight,
  MessagesSquare,
} from "lucide-react";
import type { RequestActivityDetail } from "@/lib/requestDetail";
import { formatDateTime } from "@/lib/format";
import { parseActivityContent } from "@/lib/email/activityContent";

type RequestActivityFeedProps = {
  activities: RequestActivityDetail[];
};

function ChannelIcon({ channel }: { channel: string }) {
  const normalized = channel.toLowerCase();
  if (normalized === "email") {
    return <Mail className="h-4 w-4" strokeWidth={1.75} />;
  }
  if (normalized === "phone") {
    return <Phone className="h-4 w-4" strokeWidth={1.75} />;
  }
  return <Globe className="h-4 w-4" strokeWidth={1.75} />;
}

export function RequestActivityFeed({ activities }: RequestActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#e4ded6] bg-[#faf8f5]/60 px-4 py-10 text-center">
        <MessagesSquare
          className="h-10 w-10 text-[#d8d2cb]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="max-w-[16rem] text-sm text-[#606060]">
          Email replies will appear here once they are received
        </p>
      </div>
    );
  }

  return (
    <ol className="relative ml-3 space-y-0 border-l border-[#e8e4df]">
      {activities.map((activity) => {
        const isInbound = activity.direction.toLowerCase() === "inbound";
        const { main, resendId } = parseActivityContent(activity.content);
        return (
          <li key={activity.id} className="relative pb-5 pl-5 last:pb-0">
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${
                isInbound
                  ? "bg-[#dbe7fb] text-[#274b8a]"
                  : "bg-[#e8f0eb] text-[#2d6a4f]"
              }`}
            >
              <ChannelIcon channel={activity.channel} />
            </span>
            <div className="rounded-xl bg-[#faf8f5] px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#606060]">
                <span className="inline-flex items-center gap-1 font-medium text-[#1a1a1a]">
                  {isInbound ? (
                    <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {activity.direction !== "—"
                    ? activity.direction
                    : "Activity"}
                </span>
                {activity.channel !== "—" && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{activity.channel}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{formatDateTime(activity.createdAt)}</span>
                {activity.activityId !== "—" && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>#{activity.activityId}</span>
                  </>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#1a1a1a]">
                {main}
              </p>
              {resendId && (
                <p className="mt-1 text-xs text-[#606060]">Resend: {resendId}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
