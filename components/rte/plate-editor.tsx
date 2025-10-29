"use client";

import { useRef, useEffect, useState } from "react";
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

// Validate editor value structure
function validateEditorValue(value: any[]): boolean {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return false;
  
  return value.every(node => 
    node && 
    typeof node === 'object' && 
    typeof node.type === 'string' && 
    Array.isArray(node.children)
  );
}

export function PlateEditor({
  value,
  onChange,
  placeholder = "Tulis konten artikel di sini...",
  readOnly = false,
}: PlateEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // Ensure we have a valid value
  const validValue = value && validateEditorValue(value) 
    ? value 
    : [{ type: "p", children: [{ text: "" }] }];
  
  const editor = useCreateEditor({ value: validValue });

  // Wait for editor to be properly initialized
  useEffect(() => {
    if (editor) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsEditorReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editor]);

  // Handle onChange by monitoring editor.children
  useEffect(() => {
    if (!editor || !onChange || !isEditorReady) return;

    // Call onChange whenever editor content changes
    const handleChange = () => {
      try {
        onChange(editor.children);
      } catch (error) {
        console.error("Error in onChange handler:", error);
      }
    };

    // Listen to selection changes which indicate content changes
    const interval = setInterval(() => {
      try {
        if (JSON.stringify(editor.children) !== JSON.stringify(validValue)) {
          handleChange();
        }
      } catch (error) {
        console.error("Error comparing editor content:", error);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [editor, onChange, validValue, isEditorReady]);

  // Don't render until editor is ready
  if (!editor || !isEditorReady) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Plate 
        key={`editor-${readOnly ? 'readonly' : 'editable'}`}
        editor={editor}
      >
        {!readOnly && (
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>
        )}

        <Editor
          variant="default"
          placeholder={placeholder}
          readOnly={readOnly}
          className="min-h-[500px]"
        />

        {!readOnly && (
          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
        )}
      </Plate>
    </div>
  );
}
