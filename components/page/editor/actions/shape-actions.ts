import type { ShapeElement, ShapeType, Slide } from '../types/slide';
import { createShapeElement } from '../types/slide';

export const addShapeElement = (slide: Slide, shape: ShapeType): Slide => ({
  ...slide,
  elements: [...slide.elements, createShapeElement(shape)],
});

export const updateShapeElement = (
  slide: Slide,
  elementId: string,
  changes: Partial<Omit<ShapeElement, 'id' | 'type'>>
): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId && element.type === 'shape' ? { ...element, ...changes } : element
  ),
});

export const removeShapeElement = (slide: Slide, elementId: string): Slide => ({
  ...slide,
  elements: slide.elements.filter((element) => element.id !== elementId || element.type !== 'shape'),
});
