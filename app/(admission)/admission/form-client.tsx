"use client";
import { MultiStepForm } from "@/components/multi-step-form";
import formConfig from "@/config/form-config";

export function AdmissionFormClient() {
  return (
    <MultiStepForm
      config={formConfig}
      onSubmit={async (values) => {
        // Handle client-side submission safely
        console.log("Admission form submitted", values);
      }}
    />
  );
}
