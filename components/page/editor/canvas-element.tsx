'use client';
import { Rnd } from 'react-rnd';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontSize } from './lib/font-size-extension';
import { useEffect } from 'react';
import type { SlideElement } from './types/slide';

interface CanvasElementProps {
  element: SlideElement;
  isSelected: boolean;
  scale: number;
  onSelect: (editor: Editor | null) => void;
  onUpdate: (updated: SlideElement) => void;
}

const CanvasElement = ({ element, isSelected, scale, onSelect, onUpdate }: CanvasElementProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Underline,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: element.type === 'text' ? element.content : '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (element.type === 'text') {
        onUpdate({ ...element, content: editor.getHTML() });
      }
    },
  });

  const shapeGraphic =
    element.type === 'shape' ? (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {element.shape === 'circle' ? (
          <ellipse cx="50" cy="50" rx="50" ry="50" fill={element.fill} />
        ) : element.shape === 'triangle' ? (
          <polygon points="50,0 100,100 0,100" fill={element.fill} />
        ) : (
          <rect width="100" height="100" fill={element.fill} />
        )}
      </svg>
    ) : null;

  useEffect(() => {
    if (element.type === 'text' && editor && editor.getHTML() !== element.content) {
      editor.commands.setContent(element.content, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      scale={scale}
      bounds="parent"
      onDragStop={(_, d) => onUpdate({ ...element, x: d.x, y: d.y })}
      onResizeStop={(_, __, ref, ___, position) =>
        onUpdate({
          ...element,
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...position,
        })
      }
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(element.type === 'text' ? editor ?? null : null);
      }}
      className={`flex items-center border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-500/40'
      }`}
    >
      {element.type === 'image' ? (
        <img
          src={element.src}
          alt="Uploaded slide asset"
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full object-cover"
        />
      ) : element.type === 'shape' ? (
        <div
          aria-label={element.label ?? `${element.shape} shape`}
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full"
        >
          {shapeGraphic}
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className="tiptap-canvas-text h-full w-full overflow-hidden"
          style={{ padding: 8, boxSizing: 'border-box', whiteSpace: 'pre-wrap' }}
        >
          <EditorContent editor={editor} className="h-full w-full" />
        </div>
      )}
    </Rnd>
  );
};

export default CanvasElement;
