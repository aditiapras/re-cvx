"use client";

import { useRouter } from "next/navigation";
import { CreateInformasiForm } from "@/components/informasi/create-informasi-form";
import { PlateEditor } from "@/components/rte/plate-editor";

export default function CreateInformasi() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/portal/informasi");
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 pt-0 relative">
      <p className="font-semibold mb-4">Buat Postingan</p>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-6">
          <PlateEditor />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <p className="font-semibold">Informasi Postingan</p>
          <CreateInformasiForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
