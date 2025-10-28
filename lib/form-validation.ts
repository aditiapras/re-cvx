export type FieldConfig = {
  label: string
  type: "text" | "date" | "select" | "textarea" | "number" | "email"
  placeholder?: string
  required?: boolean
  error_message?: string
}

export type StepConfig = {
  step_number: number
  title: string
  description?: string
  field: FieldConfig[]
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export function validateField(field: FieldConfig, value: unknown): string | undefined {
  const required = field.required === true
  const msg = field.error_message || `${field.label} tidak boleh kosong`
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")

  if (required && isEmpty) return msg
  return undefined
}

export function validateStep(step: StepConfig, values: Record<string, unknown>, nameMap: Record<string, string>) {
  const errors: Record<string, string | undefined> = {}
  for (const field of step.field) {
    const key = nameMap[field.label] ?? slugify(field.label)
    const err = validateField(field, values[key])
    if (err) errors[key] = err
  }
  return errors
}