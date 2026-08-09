'use client';
import { X } from 'lucide-react';
import type { SlideElement } from './types/slide';

interface SlideElementEditorProps {
  element: SlideElement;
  onUpdate: (updated: SlideElement) => void;
  onRemove: () => void;
}

const SlideElementEditor = ({ element, onUpdate, onRemove }: SlideElementEditorProps) => {
  return (
    <div onClick={(e) => e.stopPropagation()} className="space-y-2 rounded-md bg-gray-950/60 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
          {element.type}
        </span>
        <button type="button" onClick={onRemove} className="text-ink-muted hover:text-ink">
          <X className="h-3 w-3" />
        </button>
      </div>

      <textarea
        value={element.content}
        onChange={(e) => onUpdate({ ...element, content: e.target.value })}
        rows={2}
        placeholder="Enter text..."
        className="w-full resize-none rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink"
      />

      <div className="flex items-center gap-2">
        <label className="text-[10px] font-medium text-ink-muted">Color</label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => onUpdate({ ...element, color: e.target.value })}
          className="h-6 w-10 cursor-pointer rounded border border-line bg-transparent p-0"
        />
        <span className="text-[10px] text-ink-muted">{element.color}</span>
      </div>
    </div>
  );
};

export default SlideElementEditor;
