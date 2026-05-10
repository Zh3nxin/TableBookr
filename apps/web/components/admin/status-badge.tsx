import { AdminBookingStatus } from "@/lib/types/admin";
import { formatAdminStatusLabel } from "@/lib/admin/format";

const STATUS_CLASSES: Record<AdminBookingStatus, string> = {
  confirmed:
    "border border-[#b7d8c3] bg-[#eef8f1] text-[#184d34]",
  pending:
    "border border-[#e3cf9d] bg-[#fff8e8] text-[#76591d]",
  rejected:
    "border border-[#efc2bc] bg-[#fff0ee] text-[#8a241f]",
  canceled:
    "border border-[#d3d7d4] bg-[#f4f5f4] text-[#5a625d]"
};

export function StatusBadge({ status }: { status: AdminBookingStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-[0.08em] uppercase ${STATUS_CLASSES[status]}`}
    >
      {formatAdminStatusLabel(status)}
    </span>
  );
}
