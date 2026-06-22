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
import { formatBytes } from "@/lib/format";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "datetime"
  | "boolean"
  | "file";

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
  /** For `file` fields: the `accept` attribute passed to the input. */
  accept?: string;
  /** For `file` fields: form key that stores the original file name. */
  fileNameKey?: string;
  /** For `file` fields: form key that stores the file size in bytes. */
  fileSizeKey?: string;
  /** For `file` fields: form key that stores the file MIME type. */
  mimeTypeKey?: string;
  /** For `file` fields: maximum allowed size in MB (defaults to 4). */
  maxSizeMB?: number;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
  storageCheck,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FieldDef[];
  initial: Partial<T>;
  /** Return `false` to keep the dialog open (e.g. when the save failed). */
  onSubmit: (values: Partial<T>) => unknown;
  /**
   * For `file` fields: validate a newly selected file's data URL length against
   * the storage budget. Return a warning message to block the attachment, or
   * `null` to allow it.
   */
  storageCheck?: (dataUrlLength: number) => string | null;
}) {
  const buildDefaults = useMemo(() => {
    return () => {
      const v: FormValues = {};
      const src = initial as Record<string, unknown>;
      for (const f of fields) {
        const raw = src[f.key];
        if (f.type === "boolean") {
          v[f.key] = Boolean(raw);
        } else if (f.type === "datetime") {
          v[f.key] = raw ? toDatetimeLocal(String(raw)) : "";
        } else {
          v[f.key] = raw === undefined || raw === null ? "" : String(raw);
        }
        if (f.type === "file") {
          for (const auxKey of [f.fileNameKey, f.fileSizeKey, f.mimeTypeKey]) {
            if (auxKey) {
              const auxRaw = src[auxKey];
              v[auxKey] = auxRaw === undefined || auxRaw === null ? "" : String(auxRaw);
            }
          }
        }
      }
      return v;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, initial, open]);

  const [values, setValues] = useState<FormValues>(buildDefaults);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(buildDefaults());
      setErrors({});
      setFileErrors({});
    }
  }, [open, buildDefaults]);

  const setField = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleFileChange = async (f: FieldDef, file: File | null) => {
    if (!file) return;
    const maxMB = f.maxSizeMB ?? 4;
    if (file.size > maxMB * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        [f.key]: `File is too large (${formatBytes(file.size)}). Maximum is ${maxMB} MB.`,
      }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (storageCheck) {
        const warning = storageCheck(dataUrl.length);
        if (warning) {
          setFileErrors((prev) => ({ ...prev, [f.key]: warning }));
          return;
        }
      }
      setValues((prev) => ({
        ...prev,
        [f.key]: dataUrl,
        ...(f.fileNameKey ? { [f.fileNameKey]: file.name } : {}),
        ...(f.fileSizeKey ? { [f.fileSizeKey]: String(file.size) } : {}),
        ...(f.mimeTypeKey ? { [f.mimeTypeKey]: file.type } : {}),
      }));
      setErrors((prev) => ({ ...prev, [f.key]: false }));
      setFileErrors((prev) => ({ ...prev, [f.key]: "" }));
    } catch {
      setFileErrors((prev) => ({
        ...prev,
        [f.key]: "Could not read that file. Please try again.",
      }));
    }
  };

  const clearFile = (f: FieldDef) => {
    setValues((prev) => ({
      ...prev,
      [f.key]: "",
      ...(f.fileNameKey ? { [f.fileNameKey]: "" } : {}),
      ...(f.fileSizeKey ? { [f.fileSizeKey]: "" } : {}),
      ...(f.mimeTypeKey ? { [f.mimeTypeKey]: "" } : {}),
    }));
    setFileErrors((prev) => ({ ...prev, [f.key]: "" }));
  };

  const handleSubmit = async () => {
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
      if (f.type === "file") {
        if (f.fileNameKey) out[f.fileNameKey] = values[f.fileNameKey] ?? "";
        if (f.fileSizeKey) {
          const sizeVal = values[f.fileSizeKey];
          out[f.fileSizeKey] = sizeVal ? Number(sizeVal) : 0;
        }
        if (f.mimeTypeKey) out[f.mimeTypeKey] = values[f.mimeTypeKey] ?? "";
      }
    }
    const result = await onSubmit(out as Partial<T>);
    if (result === false) return;
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

                {f.type === "file" ? (
                  <div className="space-y-2">
                    {values[f.key] && f.fileNameKey && values[f.fileNameKey] ? (
                      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {String(values[f.fileNameKey])}
                          </p>
                          {f.fileSizeKey && values[f.fileSizeKey] ? (
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(Number(values[f.fileSizeKey]))}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => clearFile(f)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null}
                    <Input
                      type="file"
                      accept={f.accept}
                      onChange={(e) =>
                        handleFileChange(f, e.target.files?.[0] ?? null)
                      }
                      aria-invalid={errors[f.key] || undefined}
                      className={
                        errors[f.key]
                          ? "cursor-pointer border-destructive file:mr-3 file:cursor-pointer"
                          : "cursor-pointer file:mr-3 file:cursor-pointer"
                      }
                    />
                    {fileErrors[f.key] ? (
                      <p className="text-xs text-destructive">{fileErrors[f.key]}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {values[f.key]
                          ? "Choose a new file to replace the current attachment."
                          : "Optional — attach the actual file (max " +
                            (f.maxSizeMB ?? 4) +
                            " MB)."}
                      </p>
                    )}
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
