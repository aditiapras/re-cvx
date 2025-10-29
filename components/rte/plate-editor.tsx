"use client";

import { useRef, useEffect } from "react";
import { Plate } from "platejs/react";
import { Editor } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "@/components/ui/floating-toolbar";
import { FloatingToolbarButtons } from "@/components/ui/floating-toolbar-buttons";
import { useCreateEditor } from "./use-create-editor";

interface PlateEditorProps {
  value?: any[];
  onChange?: (value: any[]) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function PlateEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel di sini...",
  readOnly = false,
}: PlateEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editor = useCreateEditor({ value });

  // Handle onChange by monitoring editor.children
  useEffect(() => {
    if (!editor || !onChange) return;

    // Call onChange whenever editor content changes
    const handleChange = () => {
      onChange(editor.children);
    };

    // Listen to selection changes which indicate content changes
    const interval = setInterval(() => {
      if (JSON.stringify(editor.children) !== JSON.stringify(value)) {
        handleChange();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [editor, onChange, value]);

  return (
    <div ref={containerRef} className="relative">
      <Plate editor={editor}>
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>

        <Editor
          variant="default"
          placeholder={placeholder}
          readOnly={readOnly}
          className="min-h-[500px]"
        />

        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      </Plate>
    </div>
  );
}
