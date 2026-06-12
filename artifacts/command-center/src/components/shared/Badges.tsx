import { cn } from "@/lib/utils";
import {
  toneClass,
  riskTone,
  matterStatusTone,
  deficiencyStatusTone,
  escalationStatusTone,
  activeStatusTone,
  sopStatusTone,
  type BadgeTone,
} from "@/lib/format";

function Pill({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
        toneClass(tone),
      )}
    >
      {label}
    </span>
  );
}

export function RiskBadge({ value }: { value: string }) {
  return <Pill label={value} tone={riskTone(value)} />;
}

export function MatterStatusBadge({ value }: { value: string }) {
  return <Pill label={value} tone={matterStatusTone(value)} />;
}

export function DeficiencyStatusBadge({ value }: { value: string }) {
  return <Pill label={value} tone={deficiencyStatusTone(value)} />;
}

export function EscalationStatusBadge({ value }: { value: string }) {
  return <Pill label={value} tone={escalationStatusTone(value)} />;
}

export function ActiveBadge({ value }: { value: string }) {
  return <Pill label={value} tone={activeStatusTone(value)} />;
}

export function SopStatusBadge({ value }: { value: string }) {
  return <Pill label={value} tone={sopStatusTone(value)} />;
}

export function TonePill({ label, tone }: { label: string; tone: BadgeTone }) {
  return <Pill label={label} tone={tone} />;
}
