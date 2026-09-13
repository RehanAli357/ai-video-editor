'use client';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  setTextAlignment,
  setTextColor,
  setTextFontFamily,
  setTextFontSize,
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from './actions/text-actions';

interface ElementStyleToolbarProps {
  editor: Editor | null;
}

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Times New Roman'];
const FONT_SIZES = ['12', '16', '20', '24', '28', '32', '40', '48'];

const ElementStyleToolbar = ({ editor }: ElementStyleToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => toggleBold(editor)}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive('bold')
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toggleItalic(editor)}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive('italic')
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => toggleUnderline(editor)}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive('underline')
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTextAlignment(editor, 'left')}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive({ textAlign: 'left' })
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTextAlignment(editor, 'center')}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive({ textAlign: 'center' })
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setTextAlignment(editor, 'right')}
          className={`rounded border px-2 py-1 text-xs ${
            editor.isActive({ textAlign: 'right' })
              ? 'border-ink bg-ink text-surface'
              : 'border-line bg-gray-950/60 text-ink'
          }`}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-medium text-ink-muted">Color</label>
        <input
          type="color"
          onChange={(e) => setTextColor(editor, e.target.value)}
          className="h-6 w-8 cursor-pointer rounded border border-line bg-transparent p-0"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-medium text-ink-muted">Font</label>
        <select
          onChange={(e) => setTextFontFamily(editor, e.target.value)}
          className="rounded border border-line bg-gray-950/60 px-1.5 py-1 text-xs text-ink"
          defaultValue=""
        >
          <option value="" disabled>
            Select
          </option>
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-[10px] font-medium text-ink-muted">Size</label>
        <select
          onChange={(e) => {
            const size = e.target.value;
            if (!size) return;
            setTextFontSize(editor, size);
          }}
          className="rounded border border-line bg-gray-950/60 px-1.5 py-1 text-xs text-ink"
          defaultValue=""
        >
          <option value="" disabled>
            Select
          </option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ElementStyleToolbar;
