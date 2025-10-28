"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// removed unused Progress import
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useForm, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type Option = { label: string; value: string };

export type FieldConfig = {
  label: string;
  type:
    | "text"
    | "date"
    | "select"
    | "textarea"
    | "number"
    | "email"
    | "radio"
    | "checkbox"
    | "switch"
    | "file";
  placeholder?: string;
  required?: boolean;
  error_message?: string;
  options?: Option[];
  name?: string;
  colSpan?: 1 | 2 | 3;
  accept?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    dateMin?: string | Date;
    dateMax?: string | Date;
    fileMaxSizeMB?: number;
  };
};

export type StepConfig = {
  step_number: number;
  title: string;
  description?: string;
  field: FieldConfig[];
  layout?: {
    columns?: 1 | 2 | 3;
  };
};

export interface MultiStepFormProps {
  config: StepConfig[];
  initialValues?: Record<string, unknown>;
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  className?: string;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getFieldName(field: FieldConfig, usedNames: Set<string>) {
  const base = field.name ?? slugify(field.label);
  let name = base;
  let i = 1;
  while (usedNames.has(name)) {
    name = `${base}_${i++}`;
  }
  usedNames.add(name);
  return name;
}

function schemaForField(field: FieldConfig) {
  const msg = field.error_message || `${field.label} tidak boleh kosong`;
  const v = field.validation || {};
  switch (field.type) {
    case "text":
    case "textarea": {
      // Build base string constraints first, then wrap optional via preprocess when not required
      let str = z.string();
      // If required, ensure non-empty first
      if (field.required) {
        str = str.min(1, msg);
      }
      if (v.minLength) {
        str = str.min(
          v.minLength,
          `${field.label} minimal ${v.minLength} karakter`,
        );
      }
      if (v.maxLength) {
        str = str.max(
          v.maxLength,
          `${field.label} maksimal ${v.maxLength} karakter`,
        );
      }
      if (v.pattern) {
        const regex = new RegExp(v.pattern);
        str = str.regex(regex, `${field.label} tidak sesuai pola`);
      }
      return field.required
        ? str
        : z.preprocess((val) => (val === "" ? undefined : val), str.optional());
    }
    case "email": {
      const emailBase = z
        .string()
        .email(`${field.label} harus berupa email yang valid`);
      return field.required
        ? z
            .string()
            .min(1, msg)
            .email(`${field.label} harus berupa email yang valid`)
        : z.preprocess(
            (val) => (val === "" ? undefined : val),
            emailBase.optional(),
          );
    }
    case "number": {
      // Use coercion to accept numeric strings; for optional, convert empty string to undefined
      let num = z.coerce.number();
      if (typeof v.min === "number") {
        num = num.min(v.min, `${field.label} minimal ${v.min}`);
      }
      if (typeof v.max === "number") {
        num = num.max(v.max, `${field.label} maksimal ${v.max}`);
      }
      return field.required
        ? num.refine((n) => !Number.isNaN(n), { message: msg })
        : z.preprocess((val) => (val === "" ? undefined : val), num.optional());
    }
    case "select":
    case "radio": {
      const sel = z.string();
      return field.required
        ? sel.min(1, msg)
        : z.preprocess((val) => (val === "" ? undefined : val), sel.optional());
    }
    case "checkbox":
    case "switch": {
      return field.required
        ? z.boolean().refine((v) => v === true, { message: msg })
        : z.boolean().optional();
    }
    case "date": {
      const min = v.dateMin
        ? v.dateMin instanceof Date
          ? v.dateMin
          : new Date(v.dateMin)
        : undefined;
      const max = v.dateMax
        ? v.dateMax instanceof Date
          ? v.dateMax
          : new Date(v.dateMax)
        : undefined;
      const dateBase = z.date();
      const toDate = (val: unknown) => {
        if (val instanceof Date) return val;
        if (typeof val === "string" || typeof val === "number") {
          const d = new Date(val);
          return Number.isNaN(d.getTime()) ? undefined : d;
        }
        return undefined;
      };
      let schema = field.required
        ? z.preprocess((val) => toDate(val), dateBase)
        : z.preprocess((val) => toDate(val), dateBase.optional());
      const minTime = min?.getTime();
      const maxTime = max?.getTime();
      const minLabel = min ? min.toLocaleDateString() : "";
      const maxLabel = max ? max.toLocaleDateString() : "";
      if (minTime !== undefined) {
        schema = field.required
          ? schema.refine((d) => d instanceof Date && d.getTime() >= minTime, {
              message: `${field.label} tidak boleh sebelum ${minLabel}`,
            })
          : schema.refine(
              (d) => (d instanceof Date ? d.getTime() >= minTime : true),
              {
                message: `${field.label} tidak boleh sebelum ${minLabel}`,
              },
            );
      }
      if (maxTime !== undefined) {
        schema = field.required
          ? schema.refine((d) => d instanceof Date && d.getTime() <= maxTime, {
              message: `${field.label} tidak boleh setelah ${maxLabel}`,
            })
          : schema.refine(
              (d) => (d instanceof Date ? d.getTime() <= maxTime : true),
              {
                message: `${field.label} tidak boleh setelah ${maxLabel}`,
              },
            );
      }
      return schema;
    }
    case "file": {
      const bytesLimit = v.fileMaxSizeMB
        ? v.fileMaxSizeMB * 1024 * 1024
        : undefined;
      let base = z.instanceof(File);
      if (typeof bytesLimit === "number") {
        base = base.refine((f) => f.size <= bytesLimit, {
          message: `${field.label} melebihi ukuran maksimum ${v.fileMaxSizeMB} MB`,
        });
      }
      return field.required ? base : z.union([base, z.undefined()]);
    }
    default:
      return z.any();
  }
}

export function MultiStepForm({
  config,
  initialValues,
  onSubmit,
  className,
}: MultiStepFormProps) {
  const [current, setCurrent] = React.useState(0);
  const usedNames = React.useMemo(() => new Set<string>(), []);

  const steps = React.useMemo(
    () => [...config].sort((a, b) => a.step_number - b.step_number),
    [config],
  );
  const total = steps.length;

  const nameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    usedNames.clear();
    for (const step of steps) {
      for (const field of step.field) {
        const name = getFieldName(field, usedNames);
        map[field.label] = name;
      }
    }
    return map;
  }, [steps, usedNames]);

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const step of steps) {
    for (const field of step.field) {
      const key = nameMap[field.label];
      shape[key] = schemaForField(field);
    }
  }
  const schema = z.object(shape);

  const defaultValues: Record<string, unknown> = {};
  for (const step of steps) {
    for (const field of step.field) {
      const key = nameMap[field.label];
      const provided = initialValues?.[key];
      switch (field.type) {
        case "checkbox":
        case "switch":
          defaultValues[key] = typeof provided === "boolean" ? provided : false;
          break;
        case "date":
          defaultValues[key] = provided instanceof Date ? provided : undefined;
          break;
        case "number":
          defaultValues[key] = typeof provided === "number" ? provided : "";
          break;
        case "file":
          defaultValues[key] = undefined;
          break;
        default:
          defaultValues[key] = provided ?? "";
      }
    }
  }

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const currentStep = steps[current];
  const fieldNamesByStep = React.useMemo(
    () => steps.map((s) => s.field.map((f) => nameMap[f.label])),
    [steps, nameMap],
  );

  async function handleNext() {
    const names = fieldNamesByStep[current];
    const ok = await form.trigger(names);
    if (!ok) return;
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    } else {
      if (onSubmit) {
        await form.handleSubmit(async (vals) => {
          await onSubmit(vals);
        })();
      }
    }
  }

  function handlePrev() {
    setCurrent((c) => Math.max(0, c - 1));
  }

  return (
    <Form {...form}>
      <div className={cn("flex w-full flex-col gap-6", className)}>
        {/* Stepper Header (Segmented Bar) */}
        <div className="flex items-center gap-3">
          {steps.map((s, idx) => {
            const isDoneOrActive = idx <= current;
            return (
              <div
                key={s.step_number}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  isDoneOrActive ? "bg-foreground" : "bg-muted",
                )}
                aria-hidden="true"
              />
            );
          })}
        </div>

        <Separator />

        {/* Step Content */}
        <div className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold">{currentStep.title}</h2>
            {currentStep.description && (
              <p className="text-muted-foreground text-sm">
                {currentStep.description}
              </p>
            )}
          </div>

          <div
            className={cn(
              "grid gap-4",
              currentStep.layout?.columns === 2
                ? "md:grid-cols-2"
                : currentStep.layout?.columns === 3
                  ? "md:grid-cols-3"
                  : undefined,
            )}
          >
            {currentStep.field.map((field) => {
              const name = nameMap[field.label];
              const placeholder = field.placeholder ?? undefined;
              const columns = currentStep.layout?.columns ?? 1;
              const span = field.colSpan ? Math.min(field.colSpan, columns) : 1;
              const spanClass =
                columns > 1 && span === 2
                  ? "md:col-span-2"
                  : columns > 2 && span === 3
                    ? "md:col-span-3"
                    : undefined;
              return (
                <div key={name} className={cn(spanClass)}>
                  <FormField
                    control={form.control}
                    name={name as FieldPath<z.infer<typeof schema>>}
                    render={({ field: rhfField }) => {
                      return (
                        <FormItem>
                          <FormLabel>
                            {field.label}
                            {field.required && (
                              <span className="text-destructive"> *</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            {field.type === "textarea" ? (
                              <Textarea
                                placeholder={placeholder}
                                name={rhfField.name}
                                value={
                                  typeof rhfField.value === "string"
                                    ? rhfField.value
                                    : ""
                                }
                                onChange={rhfField.onChange}
                                onBlur={rhfField.onBlur}
                                ref={rhfField.ref}
                              />
                            ) : field.type === "select" ? (
                              <Select
                                onValueChange={rhfField.onChange}
                                value={rhfField.value as string}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={placeholder ?? "Pilih opsi"}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : field.type === "date" ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "justify-start text-left font-normal",
                                      !rhfField.value &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 size-4" />
                                    {(() => {
                                      const v = rhfField.value as unknown;
                                      if (v instanceof Date) {
                                        return v.toLocaleDateString();
                                      }
                                      if (
                                        typeof v === "string" ||
                                        typeof v === "number"
                                      ) {
                                        const d = new Date(
                                          v as string | number,
                                        );
                                        return Number.isNaN(d.getTime())
                                          ? (placeholder ?? "Pilih tanggal")
                                          : d.toLocaleDateString();
                                      }
                                      return placeholder ?? "Pilih tanggal";
                                    })()}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={rhfField.value as Date}
                                    onSelect={rhfField.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : field.type === "checkbox" ? (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!rhfField.value}
                                  onCheckedChange={(v) =>
                                    rhfField.onChange(Boolean(v))
                                  }
                                />
                                <span className="text-sm text-muted-foreground">
                                  {placeholder}
                                </span>
                              </div>
                            ) : field.type === "switch" ? (
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={!!rhfField.value}
                                  onCheckedChange={(v) =>
                                    rhfField.onChange(Boolean(v))
                                  }
                                />
                                <span className="text-sm text-muted-foreground">
                                  {placeholder}
                                </span>
                              </div>
                            ) : field.type === "radio" ? (
                              <RadioGroup
                                onValueChange={rhfField.onChange}
                                value={rhfField.value as string}
                              >
                                <div className="grid gap-2">
                                  {field.options?.map((opt) => (
                                    <div
                                      key={opt.value}
                                      className="flex items-center gap-2"
                                    >
                                      <RadioGroupItem
                                        value={opt.value}
                                        id={`${name}_${opt.value}`}
                                      />
                                      <Label htmlFor={`${name}_${opt.value}`}>
                                        {opt.label}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>
                            ) : field.type === "file" ? (
                              <Input
                                type="file"
                                name={rhfField.name}
                                accept={field.accept}
                                onChange={(e) =>
                                  rhfField.onChange(
                                    (e.target as HTMLInputElement).files?.[0] ??
                                      undefined,
                                  )
                                }
                                onBlur={rhfField.onBlur}
                                ref={rhfField.ref}
                              />
                            ) : (
                              <Input
                                type={field.type}
                                placeholder={placeholder}
                                name={rhfField.name}
                                value={
                                  field.type === "number"
                                    ? typeof rhfField.value === "number"
                                      ? rhfField.value
                                      : typeof rhfField.value === "string"
                                        ? rhfField.value
                                        : ""
                                    : typeof rhfField.value === "string"
                                      ? rhfField.value
                                      : ""
                                }
                                onChange={rhfField.onChange}
                                onBlur={rhfField.onBlur}
                                ref={rhfField.ref}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={handlePrev}
            disabled={current === 0}
          >
            <ChevronLeft className="mr-2 size-4" /> Previous
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={form.formState.isSubmitting}
          >
            {current < total - 1 ? (
              <>
                Next <ChevronRight className="ml-2 size-4" />
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
