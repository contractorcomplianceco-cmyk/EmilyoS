import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "boolean";

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[] | Option[];
  required?: boolean;
  placeholder?: string;
  full?: boolean;
}

type FormValues = Record<string, string | boolean>;

function normalizeOptions(options?: readonly string[] | Option[]): Option[] {
  if (!options) return [];
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

export function RecordFormDialog<T>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial: Partial<T>;
  onSubmit: (values: Partial<T>) => void;
}) {
  const buildDefaults = useMemo(() => {
    return () => {
      const v: FormValues = {};
      for (const f of fields) {
        const raw = (initial as Record<string, unknown>)[f.key];
        if (f.type === "boolean") {
          v[f.key] = Boolean(raw);
        } else if (f.type === "datetime") {
          v[f.key] = raw ? toDatetimeLocal(String(raw)) : "";
        } else {
          v[f.key] = raw === undefined || raw === null ? "" : String(raw);
        }
      }
      return v;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, initial, open]);

  const [values, setValues] = useState<FormValues>(buildDefaults);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setValues(buildDefaults());
      setErrors({});
    }
  }, [open, buildDefaults]);

  const setField = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, boolean> = {};
    for (const f of fields) {
      if (f.required && f.type !== "boolean") {
        const val = values[f.key];
        if (!val || (typeof val === "string" && val.trim() === "")) {
          nextErrors[f.key] = true;
        }
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const out: Record<string, unknown> = {};
    for (const f of fields) {
      const val = values[f.key];
      if (f.type === "datetime") {
        out[f.key] = val ? new Date(String(val)).toISOString() : "";
      } else {
        out[f.key] = val;
      }
    }
    onSubmit(out as Partial<T>);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          {fields.map((f) => {
            const isFull = f.full || f.type === "textarea";
            return (
              <div
                key={f.key}
                className={isFull ? "sm:col-span-2" : "sm:col-span-1"}
              >
                <Label className="mb-1.5 block text-xs font-medium text-foreground">
                  {f.label}
                  {f.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </Label>

                {f.type === "text" || f.type === "date" ? (
                  <Input
                    type={f.type === "date" ? "date" : "text"}
                    value={String(values[f.key] ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                    aria-invalid={errors[f.key] || undefined}
                    className={errors[f.key] ? "border-destructive" : ""}
                  />
                ) : null}

                {f.type === "datetime" ? (
                  <Input
                    type="datetime-local"
                    value={String(values[f.key] ?? "")}
                    onChange={(e) => setField(f.key, e.target.value)}
                    aria-invalid={errors[f.key] || undefined}
                    className={errors[f.key] ? "border-destructive" : ""}
                  />
                ) : null}

                {f.type === "textarea" ? (
                  <Textarea
                    rows={3}
                    value={String(values[f.key] ?? "")}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.key, e.target.value)}
                    aria-invalid={errors[f.key] || undefined}
                    className={errors[f.key] ? "border-destructive" : ""}
                  />
                ) : null}

                {f.type === "select" ? (
                  <Select
                    value={String(values[f.key] ?? "")}
                    onValueChange={(v) => setField(f.key, v)}
                  >
                    <SelectTrigger
                      className={errors[f.key] ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder={f.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {normalizeOptions(f.options).map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}

                {f.type === "boolean" ? (
                  <div className="flex h-9 items-center gap-2">
                    <Switch
                      checked={Boolean(values[f.key])}
                      onCheckedChange={(c) => setField(f.key, c)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {values[f.key] ? "Yes" : "No"}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
