import type { ImageElement, Slide } from '../types/slide';
import { createImageElement } from '../types/slide';

export const isImageFile = (file: File): boolean => file.type.startsWith('image/');

export const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image file.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

export const addImageElement = (slide: Slide, src: string, mimeType?: string): Slide => ({
  ...slide,
  elements: [...slide.elements, createImageElement(src, mimeType)],
});

export const updateImageElement = (
  slide: Slide,
  elementId: string,
  changes: Partial<Omit<ImageElement, 'id' | 'type'>>
): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId && element.type === 'image' ? { ...element, ...changes } : element
  ),
});

export const removeImageElement = (slide: Slide, elementId: string): Slide => ({
  ...slide,
  elements: slide.elements.filter((element) => element.id !== elementId || element.type !== 'image'),
});
