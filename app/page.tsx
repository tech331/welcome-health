import { getRequestStatusCounts } from "@/lib/airtable";
import {
  getStatusChartColor,
  STATUS_DISPLAY_ORDER,
} from "@/components/requests/StatusChip";
import { HomeBanner } from "@/components/home/HomeBanner";
import {
  RequestOverviewChart,
  type StatusSlice,
} from "@/components/home/RequestOverviewChart";
import { CreateRequestTile } from "@/components/home/CreateRequestTile";

export const revalidate = 30;

function statusSortIndex(label: string): number {
  const index = STATUS_DISPLAY_ORDER.indexOf(
    label as (typeof STATUS_DISPLAY_ORDER)[number],
  );
  return index === -1 ? STATUS_DISPLAY_ORDER.length : index;
}

function buildStatusSlices(
  counts: { status: string; count: number }[],
): StatusSlice[] {
  return counts
    .map(({ status, count }) => ({
      label: status,
      count,
      color: getStatusChartColor(status),
    }))
    .sort((a, b) => {
      const orderDiff = statusSortIndex(a.label) - statusSortIndex(b.label);
      if (orderDiff !== 0) return orderDiff;
      return a.label.localeCompare(b.label);
    });
}

export default async function Home() {
  let statusCounts: { status: string; count: number }[] = [];
  try {
    statusCounts = await getRequestStatusCounts();
  } catch (error) {
    console.error("Failed to fetch requests for home dashboard:", error);
  }

  const slices = buildStatusSlices(statusCounts);

  return (
    <div className="h-full overflow-y-auto px-8 pb-8 pt-8">
      <h1 className="mb-6 font-sans text-2xl font-semibold text-[#2A2A2A]">
        Home
      </h1>

      <div className="mb-6">
        <HomeBanner />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-base font-semibold text-[#2A2A2A]">
            Request Overview
          </h2>
          <RequestOverviewChart slices={slices} />
        </section>

        <CreateRequestTile />
      </div>
    </div>
  );
}
