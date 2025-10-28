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
