# Komponen Multi-Step Form

Dokumentasi lengkap untuk komponen `MultiStepForm` yang membangun form bertahap (multi-step) berdasarkan konfigurasi. Komponen ini menggunakan `react-hook-form` dan `zod` untuk validasi, serta komponen UI berbasis Tailwind.

## Ringkasan

- Konfigurasi form disediakan melalui array `StepConfig[]` (lihat `config/form-config.ts`).
- Validasi otomatis dibangun dari konfigurasi menggunakan `zod` (min/max, pola, tanggal, ukuran file, dll.).
- Stepper UI sekarang berupa bar tersegmentasi penuh lebar (segmen gelap untuk langkah aktif/selesai, abu-abu untuk belum).
- Layout per-step mendukung grid dinamis (`columns: 1 | 2 | 3`) dan `colSpan` per field.
- Mendukung input `file` termasuk filter `accept` dan batas ukuran `fileMaxSizeMB`.

## Import dan Penggunaan

```tsx
import { MultiStepForm } from "@/components/multi-step-form";
import formConfig from "@/config/form-config";

export default function AdmissionPage() {
  async function handleSubmit(values: Record<string, unknown>) {
    // Kirim nilai ke server/API di sini
    console.log("submit", values);
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <MultiStepForm config={formConfig} onSubmit={handleSubmit} />
    </div>
  );
}
```

## Props

```ts
interface MultiStepFormProps {
  config: StepConfig[];                      // Konfigurasi langkah-langkah
  initialValues?: Record<string, unknown>;   // Nilai awal opsional (per name field)
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  className?: string;                        // Kelas tambahan untuk wrapper
}
```

## Struktur Konfigurasi

```ts
type Option = { label: string; value: string };

export type FieldConfig = {
  label: string;
  type:
    | "text" | "date" | "select" | "textarea" | "number" | "email"
    | "radio" | "checkbox" | "switch" | "file";
  placeholder?: string;
  required?: boolean;
  error_message?: string; // Pesan untuk required (fallback otomatis)
  options?: Option[];     // Untuk select/radio
  name?: string;          // Override nama field (default slug dari label)
  colSpan?: 1 | 2 | 3;    // Lebar kolom relatif terhadap layout step
  accept?: string;        // MIME types untuk file input
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;     // RegExp pattern untuk text/nomor
    dateMin?: string | Date; // Batas tanggal minimum
    dateMax?: string | Date; // Batas tanggal maksimum
    fileMaxSizeMB?: number;  // Batas ukuran file (MB)
  };
};

export type StepConfig = {
  step_number: number;           // Urutan langkah (diurutkan ascending)
  title: string;                 // Judul langkah
  description?: string;          // Deskripsi opsional
  field: FieldConfig[];          // Daftar field
  layout?: { columns?: 1 | 2 | 3 }; // Grid per-step (default 1)
};
```

### Contoh Konfigurasi

File `config/form-config.ts`:

```ts
import type { StepConfig } from "@/components/multi-step-form";

export const formConfig: StepConfig[] = [
  {
    step_number: 1,
    title: "Data Pribadi",
    description: "Isi identitas diri Anda",
    layout: { columns: 2 },
    field: [
      {
        label: "Nama Lengkap",
        type: "text",
        placeholder: "Masukkan nama lengkap",
        required: true,
        colSpan: 2,
        validation: { minLength: 3 },
      },
      {
        label: "Email",
        type: "email",
        placeholder: "nama@domain.com",
        required: true,
      },
      {
        label: "Tanggal Lahir",
        type: "date",
        placeholder: "Pilih tanggal",
        required: true,
        validation: { dateMin: "1900-01-01" },
      },
      {
        label: "Nomor Telepon",
        type: "text",
        placeholder: "08xxxxxxxxxx",
        validation: { pattern: "^0[0-9]{9,}$" },
      },
    ],
  },
  {
    step_number: 2,
    title: "Alamat",
    description: "Informasi alamat domisili",
    layout: { columns: 2 },
    field: [
      {
        label: "Provinsi",
        type: "select",
        placeholder: "Pilih provinsi",
        required: true,
        options: [
          { label: "DKI Jakarta", value: "jakarta" },
          { label: "Jawa Barat", value: "jabar" },
          { label: "Jawa Tengah", value: "jateng" },
        ],
      },
      {
        label: "Kota/Kabupaten",
        type: "text",
        placeholder: "Masukkan kota/kabupaten",
        required: true,
      },
      {
        label: "Kode Pos",
        type: "number",
        placeholder: "Contoh: 12345",
        validation: { min: 10000, max: 99999 },
      },
      {
        label: "Alamat Lengkap",
        type: "textarea",
        placeholder: "Nama jalan, RT/RW, dsb.",
        colSpan: 2,
        validation: { minLength: 10 },
      },
    ],
  },
  {
    step_number: 3,
    title: "Pertanyaan",
    description: "Beberapa pertanyaan tambahan",
    layout: { columns: 2 },
    field: [
      {
        label: "Status Pekerjaan",
        type: "radio",
        required: true,
        options: [
          { label: "Pelajar", value: "student" },
          { label: "Mahasiswa", value: "college" },
          { label: "Pekerja", value: "worker" },
        ],
      },
      {
        label: "Bersedia dihubungi?",
        type: "switch",
        placeholder: "Aktifkan jika bersedia",
      },
      {
        label: "Setuju Syarat & Ketentuan",
        type: "checkbox",
        required: true,
        placeholder: "Saya setuju",
      },
      {
        label: "Unggah KTP",
        type: "file",
        placeholder: "Pilih file KTP (PDF atau gambar)",
        required: true,
        accept: "image/*,application/pdf",
        validation: { fileMaxSizeMB: 10 },
      },
    ],
  },
];

export default formConfig;
```

## Penamaan Field

- Secara default, `name` untuk setiap field adalah hasil `slugify(label)`.
- Jika terdapat label yang sama, sistem menambahkan sufiks angka agar unik (`nama_lengkap`, `nama_lengkap_1`, dst.).
- Anda bisa mengoverride dengan `name: "custom_name"` di `FieldConfig` bila perlu.

## Validasi

Validasi dibangun otomatis menggunakan `zod` berdasarkan `type`, `required`, dan `validation`:

- Text/textarea: `minLength`, `maxLength`, `pattern` (RegExp).
- Email: validasi email bawaan zod.
- Number: `min`, `max` (menerima string numerik via `z.coerce.number`).
- Select/radio: wajib diisi jika `required`.
- Checkbox/switch: jika `required`, harus bernilai `true`.
- Date: mendukung `dateMin` dan `dateMax` (string atau `Date`).
- File: `accept` (melalui elemen input) dan `fileMaxSizeMB` (divalidasi di zod via `File.size`).

Catatan:
- Untuk field tidak `required`, banyak input mendukung `preprocess` agar string kosong diperlakukan sebagai `undefined` (menghindari false-positive error).
- Untuk `date`, nilai string/number akan diubah ke `Date` jika valid; jika tidak valid akan dianggap `undefined` atau error sesuai `required`.

## Default Values

- `checkbox`/`switch`: default `false`.
- `date`: default `undefined`.
- `number`: default `""` (string kosong, akan dikoersi saat validasi).
- `file`: default `undefined`.
- Lainnya: gunakan nilai dari `initialValues` bila tersedia, jika tidak `""`.

## Layout Grid

- Set `layout.columns` per step ke `2` atau `3` untuk grid kolom pada layar medium ke atas.
- Gunakan `field.colSpan` untuk memperlebar field (mis. `colSpan: 2` pada grid dua kolom).

Contoh:

```ts
layout: { columns: 2 }
// Field melebar dua kolom
{ label: "Nama Lengkap", type: "text", required: true, colSpan: 2 }
```

## Stepper UI

- Stepper berupa bar tersegmentasi penuh lebar.
- Status segmen: langkah aktif/selesai menggunakan `bg-foreground`, belum menggunakan `bg-muted`.
- Anda bisa menyesuaikan warna dengan theme Tailwind atau mengganti kelas sesuai palet.

## Navigasi dan Validasi

- Tombol `Next` memanggil `form.trigger(names)` untuk memvalidasi hanya field pada step aktif.
- Jika valid, pindah ke step berikutnya; jika tidak, tetap di step saat ini dan pesan error tampil.
- Tombol `Next` hanya disabled ketika `form.formState.isSubmitting` untuk mencegah klik ganda.
- Tombol `Previous` disabled pada step pertama.

## File Input

- Tambahkan `type: "file"` pada field.
- Batasi tipe file via `accept` (mis. `image/*,application/pdf`).
- Batasi ukuran via `validation.fileMaxSizeMB`, divalidasi dengan `File.size`.
- Nilai disimpan sebagai `File | undefined` pada form state.

Contoh:

```ts
{
  label: "Unggah KTP",
  type: "file",
  required: true,
  accept: "image/*,application/pdf",
  validation: { fileMaxSizeMB: 10 },
}
```

## Aksesibilitas

- Stepper segmented bar bersifat dekoratif; elemen segmen diberi `aria-hidden="true"`.
- Tambahkan teks bantuan untuk pengguna screen reader bila perlu, mis. `Langkah {current} dari {total}` menggunakan elemen `span.sr-only` di dekat header.

## Ekstensi

- Tambahkan tipe field baru: perluas union `FieldConfig.type` dan implementasikan case di render + zod schema.
- Kustom UI stepper: ganti kelas/elemen di header stepper pada `multi-step-form.tsx`.
- Integrasi backend: gunakan `onSubmit(values)` untuk kirim data.

## Troubleshooting

- Tidak bisa Next meski field terisi: pastikan format sesuai validasi (mis. email valid). Tombol Next tetap dapat diklik, tetapi tidak akan pindah step jika ada error.
- File ditolak: cek `accept` dan `fileMaxSizeMB`. Pastikan file memenuhi kedua syarat.
- Label duplikat menghasilkan nama field berubah: gunakan `name` untuk mengoverride.

## Lokasi File Utama

- Komponen: `components/multi-step-form.tsx`
- Konfigurasi: `config/form-config.ts`

## Lisensi

Tidak ada lisensi khusus ditambahkan. Gunakan sesuai kebutuhan proyek Anda.