import type { Editor } from '@tiptap/react';
import type { Slide, TextElement } from '../types/slide';
import { createTextElement } from '../types/slide';

export type TextAlignment = 'left' | 'center' | 'right';

export const addTextElement = (slide: Slide): Slide => ({
  ...slide,
  elements: [...slide.elements, createTextElement()],
});

export const updateTextElement = (
  slide: Slide,
  elementId: string,
  changes: Partial<Omit<TextElement, 'id' | 'type'>>
): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId && element.type === 'text' ? { ...element, ...changes } : element
  ),
});

export const removeTextElement = (slide: Slide, elementId: string): Slide => ({
  ...slide,
  elements: slide.elements.filter((element) => element.id !== elementId || element.type !== 'text'),
});

export const toggleBold = (editor: Editor) => editor.chain().focus().toggleBold().run();

export const toggleItalic = (editor: Editor) => editor.chain().focus().toggleItalic().run();

export const toggleUnderline = (editor: Editor) => editor.chain().focus().toggleUnderline().run();

export const setTextAlignment = (editor: Editor, alignment: TextAlignment) =>
  editor.chain().focus().setTextAlign(alignment).run();

export const setTextColor = (editor: Editor, color: string) =>
  editor.chain().focus().setColor(color).run();

export const setTextFontFamily = (editor: Editor, fontFamily: string) =>
  editor.chain().focus().setFontFamily(fontFamily).run();

export const setTextFontSize = (editor: Editor, fontSize: string) =>
  editor.chain().focus().toggleMark('textStyle', { fontSize: `${fontSize}px` }).run();
