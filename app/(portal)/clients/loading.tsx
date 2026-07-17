import { TableSkeleton } from "@/components/TableSkeleton";

export default function Loading() {
  return <TableSkeleton title="Clients" columns={5} />;
}
