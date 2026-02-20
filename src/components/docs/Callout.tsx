import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutVariant = "note" | "warning" | "tip" | "danger";

interface CalloutProps {
  variant?: CalloutVariant;
  children: React.ReactNode;
}

const VARIANTS: Record<
  CalloutVariant,
  { icon: React.ReactNode; borderColor: string; bgColor: string; iconColor: string; label: string }
> = {
  note: {
    icon: <Info size={16} />,
    borderColor: "#149A9B",
    bgColor: "rgba(20,154,155,0.07)",
    iconColor: "#149A9B",
    label: "Note",
  },
  tip: {
    icon: <Lightbulb size={16} />,
    borderColor: "#16a34a",
    bgColor: "rgba(22,163,74,0.07)",
    iconColor: "#16a34a",
    label: "Tip",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    borderColor: "#d97706",
    bgColor: "rgba(217,119,6,0.07)",
    iconColor: "#d97706",
    label: "Warning",
  },
  danger: {
    icon: <AlertOctagon size={16} />,
    borderColor: "#dc2626",
    bgColor: "rgba(220,38,38,0.07)",
    iconColor: "#dc2626",
    label: "Danger",
  },
};

export function Callout({ variant = "note", children }: CalloutProps) {
  const config = VARIANTS[variant];

  return (
    <div
      className={cn("rounded-xl px-4 py-3 my-5 border-l-4")}
      style={{
        borderLeftColor: config.borderColor,
        background: config.bgColor,
      }}
    >
      <div
        className="flex items-center gap-2 mb-1.5 text-sm font-semibold"
        style={{ color: config.iconColor }}
      >
        {config.icon}
        {config.label}
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "#19213D" }}>
        {children}
      </div>
    </div>
  );
}
