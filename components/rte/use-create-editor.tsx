"use client";

import { usePlateEditor } from "platejs/react";
import { BasicMarksKit } from "@/components/basic-marks-kit";
import { BaseBasicBlocksKit } from "@/components/basic-blocks-base-kit";
import { BaseAlignKit } from "@/components/align-base-kit";
import { BaseFontKit } from "@/components/font-base-kit";
import { BaseLineHeightKit } from "@/components/line-height-base-kit";
import { BaseLinkKit } from "@/components/link-base-kit";
import { BaseListKit } from "@/components/list-base-kit";
import { BaseMediaKit } from "@/components/media-base-kit";
import { BaseTableKit } from "@/components/table-base-kit";
import { BaseCodeBlockKit } from "@/components/code-block-base-kit";

interface UseCreateEditorProps {
  value?: any[];
}

export function useCreateEditor({ value }: UseCreateEditorProps) {
  // Ensure we always have a valid initial value
  const defaultValue = [
    {
      type: "p",
      children: [{ text: "" }],
    },
  ];

  const editor = usePlateEditor(
    {
      id: "article-editor",
      plugins: [
        // Basic blocks (paragraph, headings, blockquote)
        ...BaseBasicBlocksKit,
        // Text formatting (bold, italic, underline, strikethrough, code, highlight)
        ...BasicMarksKit,
        // Alignment (left, center, right, justify)
        ...BaseAlignKit,
        // Font size and color
        ...BaseFontKit,
        // Line height
        ...BaseLineHeightKit,
        // Links
        ...BaseLinkKit,
        // Lists (ordered, unordered)
        ...BaseListKit,
        // Images and media
        ...BaseMediaKit,
        // Tables
        ...BaseTableKit,
        // Code blocks
        ...BaseCodeBlockKit,
      ],
      value: value || defaultValue,
      // Add override to prevent DOM conflicts
      override: {
        // Ensure proper DOM handling
        components: {},
      },
    },
    [value]
  );

  return editor;
}
