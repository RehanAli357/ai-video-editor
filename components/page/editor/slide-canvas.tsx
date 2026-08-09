'use client';
import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { Slide, SlideElement } from './types/slide';
import CanvasElement from './canvas-element';
import ElementStyleToolbar from './element-style-toolbar';

interface SlideCanvasProps {
  slide: Slide | undefined;
  width: number;
  height: number;
  onUpdateSlide: (updated: Slide) => void;
}

const MAX_CANVAS_DISPLAY_WIDTH = 720;
const MIN_CANVAS_DISPLAY_WIDTH = 320;

const SlideCanvas = ({ slide, width, height, onUpdateSlide }: SlideCanvasProps) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  if (!slide) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-gray-950 text-sm text-ink-muted">
        Select or add a slide to start editing
      </div>
    );
  }

  const aspectRatio = width / height;
  const displayWidth = Math.min(MAX_CANVAS_DISPLAY_WIDTH, Math.max(MIN_CANVAS_DISPLAY_WIDTH, width > height ? 640 : 480));
  const displayHeight = displayWidth / aspectRatio;
  const scale = displayWidth / width;

  const handleUpdateElement = (updated: SlideElement) => {
    onUpdateSlide({
      ...slide,
      elements: slide.elements.map((el) => (el.id === updated.id ? updated : el)),
    });
  };

  const handleSelect = (id: string, editor: Editor | null) => {
    setSelectedElementId(id);
    setActiveEditor(editor);
  };

  const handleDeselect = () => {
    setSelectedElementId(null);
    setActiveEditor(null);
  };

  return (
    <div className="space-y-2">
      {/* Outer viewport: fixed visible size, clips overflow */}
      <div
        className="relative mx-auto overflow-hidden rounded-xl border border-line bg-gray-950"
        style={{ width: displayWidth, height: displayHeight }}
      >
        
        <div
          onMouseDown={handleDeselect}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width,
            height,
            backgroundColor: slide.backgroundColor,
            transform: `scale(${scale})`,
          }}
        >
          {slide.elements.map((el) => (
            <CanvasElement
              key={el.id}
              element={el}
              isSelected={el.id === selectedElementId}
              scale={scale}
              onSelect={(editor) => handleSelect(el.id, editor)}
              onUpdate={handleUpdateElement}
            />
          ))}
        </div>
      </div>

      {selectedElementId && <ElementStyleToolbar editor={activeEditor} />}
    </div>
  );
};

export default SlideCanvas;
