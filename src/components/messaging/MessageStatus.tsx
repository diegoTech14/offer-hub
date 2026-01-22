"use client";
export type MsgStatus = "sent" | "delivered" | "read";

interface MessageStatusProps {
  status: MsgStatus;
}

export default function MessageStatus({ status }: MessageStatusProps) {
  const label = status === "read" ? "✓✓" : status === "delivered" ? "✓✓" : "✓";
  const cls   = status === "read" ? "text-blue-500" : "text-gray-400";
  return <span className={`text-[10px] ${cls}`} aria-label={`status: ${status[0].toUpperCase()}${status.slice(1)}`}>{label}</span>;
}
