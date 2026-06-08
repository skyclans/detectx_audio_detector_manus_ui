/**
 * RichTextEditor
 *
 * TipTap-based WYSIWYG editor used by the admin email composer.
 * Mimics the toolbar of Gmail / Outlook compose: format, headings, lists,
 * alignment, font family / size, color, link, and a "variables" dropdown
 * for marketing template variables ({{name}} etc.).
 *
 * onChange returns BOTH html and plain text so the parent can keep a
 * text/plain fallback in sync without ever showing `[object Object]`.
 */

import { useCallback, useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Palette,
  Type,
  Variable,
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  minHeight?: string;
  compact?: boolean;
}

const PRESET_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#0f172a" },
  { label: "Slate", value: "#64748b" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Blue", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Pink", value: "#db2777" },
];

const FONT_FAMILIES = [
  { label: "Sans", value: "" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  { label: "System", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
];

const FONT_SIZES: { label: string; htmlSize?: 1 | 2 | 3 | 4 | 5; tag?: "p" | "h1" | "h2" | "h3" }[] = [
  { label: "Small", tag: "p" },
  { label: "Normal", tag: "p" },
  { label: "Large", tag: "h3" },
  { label: "XL", tag: "h2" },
];

const VARIABLES = [
  { label: "Recipient name", value: "{{name}}" },
  { label: "Recipient email", value: "{{email}}" },
  { label: "Plan", value: "{{plan}}" },
  { label: "Unsubscribe URL", value: "{{unsubscribe_url}}" },
  { label: "Admin message", value: "{{admin_message}}" },
];

interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}

function ToolButton({ active, disabled, onClick, title, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded text-sm transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-primary/15 text-primary",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function ToolSeparator() {
  return <div className="h-5 w-px bg-border mx-1" />;
}

interface ToolbarProps {
  editor: Editor;
  compact?: boolean;
}

function Toolbar({ editor, compact }: ToolbarProps) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    let normalized = url.trim();
    if (
      normalized &&
      !/^(https?:\/\/|mailto:|tel:)/i.test(normalized)
    ) {
      normalized = `https://${normalized}`;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalized })
      .run();
  }, [editor]);

  const insertVariable = useCallback(
    (value: string) => {
      editor.chain().focus().insertContent(value).run();
    },
    [editor],
  );

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-card/95 backdrop-blur px-2 py-1.5",
        compact && "px-1.5 py-1",
      )}
    >
      {/* Undo / Redo */}
      <ToolButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Format */}
      <ToolButton
        title="Bold (⌘B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Italic (⌘I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Underline (⌘U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Heading */}
      <ToolButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading1 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Paragraph"
        active={editor.isActive("paragraph") && !editor.isActive("heading")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Lists */}
      <ToolButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Align */}
      <ToolButton
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Font family */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Font family"
            className="h-8 px-2 inline-flex items-center gap-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Type className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuLabel>Font family</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FONT_FAMILIES.map((f) => (
            <DropdownMenuItem
              key={f.label}
              onSelect={() => {
                if (!f.value) {
                  editor.chain().focus().unsetFontFamily().run();
                } else {
                  editor.chain().focus().setFontFamily(f.value).run();
                }
              }}
              style={f.value ? { fontFamily: f.value } : undefined}
            >
              {f.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font size (mapped to heading levels for email-safe HTML) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Text size"
            className="h-8 px-2 inline-flex items-center gap-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span className="font-semibold">Aa</span>
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          <DropdownMenuLabel>Size</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FONT_SIZES.map((s) => (
            <DropdownMenuItem
              key={s.label}
              onSelect={() => {
                const chain = editor.chain().focus();
                if (s.tag === "h2") chain.setHeading({ level: 2 }).run();
                else if (s.tag === "h3") chain.setHeading({ level: 3 }).run();
                else chain.setParagraph().run();
              }}
            >
              <span
                className={cn(
                  s.label === "Small" && "text-xs",
                  s.label === "Normal" && "text-sm",
                  s.label === "Large" && "text-base font-semibold",
                  s.label === "XL" && "text-lg font-bold",
                )}
              >
                {s.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Text color"
            className="h-8 px-2 inline-flex items-center gap-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Palette className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuLabel>Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-6 gap-1 p-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onClick={() => {
                  if (!c.value) editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(c.value).run();
                }}
                className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                style={{
                  backgroundColor: c.value || "transparent",
                  backgroundImage: c.value
                    ? undefined
                    : "linear-gradient(135deg, #fff 0 50%, #999 50% 100%)",
                }}
              />
            ))}
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <label className="block text-xs text-muted-foreground mb-1">
              Custom
            </label>
            <input
              type="color"
              onChange={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
              className="h-8 w-full rounded border border-border bg-transparent cursor-pointer"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolSeparator />

      {/* Link */}
      <ToolButton
        title="Insert/edit link"
        active={editor.isActive("link")}
        onClick={setLink}
      >
        <LinkIcon className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Remove link"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Unlink className="h-4 w-4" />
      </ToolButton>

      <ToolSeparator />

      {/* Variables */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Insert variable"
            className="h-8 px-2 inline-flex items-center gap-1 rounded text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Variable className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          <DropdownMenuLabel>Insert variable</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {VARIABLES.map((v) => (
            <DropdownMenuItem
              key={v.value}
              onSelect={() => insertVariable(v.value)}
            >
              <div className="flex flex-col">
                <span className="text-sm">{v.label}</span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {v.value}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message…",
  minHeight = "240px",
  compact = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Keep all defaults (Underline + Link are now bundled in v3)
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
            class: "text-primary underline",
          },
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "max-w-none focus:outline-none px-4 py-3 text-sm leading-relaxed",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3",
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-2.5",
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-2",
          "[&_p]:my-2",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2",
          "[&_li]:my-1",
          "[&_a]:text-primary [&_a]:underline",
          "[&_strong]:font-semibold",
          "[&_em]:italic",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-xs",
          "[&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-xs [&_pre]:overflow-auto",
          "[&_hr]:border-border [&_hr]:my-3",
          "[&>*:first-child]:mt-0",
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  // Keep editor content in sync when parent value changes (e.g. template load)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    // Avoid reset loop while user is typing
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background overflow-hidden",
        "focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/60",
      )}
    >
      {editor && <Toolbar editor={editor} compact={compact} />}
      <div
        className="bg-card overflow-auto"
        style={{ minHeight, maxHeight: compact ? "360px" : "60vh" }}
      >
        <EditorContent
          editor={editor}
          className="min-h-full [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
