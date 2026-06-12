import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface DetailRow {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  subtitle,
  rows,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: React.ReactNode;
  rows: DetailRow[];
  footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b bg-muted/30 p-6">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          {subtitle ? (
            <SheetDescription asChild>
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className={r.full ? "sm:col-span-2" : "sm:col-span-1"}
            >
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {r.label}
              </div>
              <div className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                {r.value || <span className="text-muted-foreground">—</span>}
              </div>
            </div>
          ))}
        </div>

        {footer ? (
          <div className="mt-auto flex justify-end gap-2 border-t bg-muted/30 p-4">
            {footer}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
