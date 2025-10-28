This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Multi-Step Form Component

Reusable multi-step form with stepper, progress, validation, and navigation.

### Usage

1. Sediakan konfigurasi dalam TypeScript (JSON-like) dari `config/form-config.ts`:

```tsx
import formConfig from "@/config/form-config"
import { MultiStepForm } from "@/components/multi-step-form"

export default function Example() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <MultiStepForm
        config={formConfig}
        onSubmit={(values) => console.log("submitted", values)}
      />
    </div>
  )
}
```

### Config Schema

Konfigurasi menggunakan TypeScript dan berbentuk array `StepConfig[]`:

- `step_number`: urutan step (angka)
- `title`: judul step
- `description`: deskripsi step (opsional)
- `field`: array `FieldConfig` berisi:
  - `label`: nama field yang ditampilkan
  - `type`: `text`, `email`, `number`, `textarea`, `select`, `radio`, `checkbox`, `switch`, `date`
  - `placeholder`: petunjuk input (opsional)
  - `required`: wajib diisi (opsional)
  - `options`: untuk `select`/`radio` berupa `{ label, value }[]`
  - `error_message`: pesan error khusus (opsional)
  - `validation`: aturan validasi (opsional)
    - `min`/`max` untuk angka
    - `minLength`/`maxLength` untuk teks
    - `pattern` (regex) untuk teks
    - `dateMin`/`dateMax` untuk tanggal

### Props

- `config: StepConfig[]` — required
- `initialValues?: Record<string, unknown>` — optional prefill
- `onSubmit?: (values) => void | Promise<void>` — called after last step
- `className?: string` — wrapper styles
  

### Validation

- Validasi menggunakan Zod resolver berdasarkan konfigurasi TypeScript.
- Tiap step divalidasi saat Next; tidak bisa lanjut jika step belum valid.
- `error_message` akan dipakai untuk pesan error khusus jika tersedia.
- Untuk field opsional, aturan validasi hanya diterapkan jika nilai diisi.

### Notes

- Field names are auto-generated from labels, ensuring uniqueness.
- State persists across step navigation.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
