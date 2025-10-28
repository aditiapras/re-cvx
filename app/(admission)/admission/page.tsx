import { AdmissionFormClient } from "./form-client";

export default function PortalPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-7xl w-full mx-auto">
      <div className="">
        <AdmissionFormClient />
      </div>
    </div>
  );
}
