import type { Slide, SlideElement } from '../types/slide';
import { createEmptySlide } from '../types/slide';

export const addSlide = (slides: Slide[]): { slides: Slide[]; slide: Slide } => {
  const slide = createEmptySlide(slides.length + 1);
  return { slides: [...slides, slide], slide };
};

export const updateSlide = (slides: Slide[], updated: Slide): Slide[] =>
  slides.map((slide) => (slide.id === updated.id ? updated : slide));

export const removeSlide = (slides: Slide[], slideId: string): Slide[] =>
  slides.filter((slide) => slide.id !== slideId);

export const updateSlideElement = (slide: Slide, updated: SlideElement): Slide => ({
  ...slide,
  elements: slide.elements.map((element) => (element.id === updated.id ? updated : element)),
});

export const updateElementLabel = (slide: Slide, elementId: string, label: string): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId ? { ...element, label: label.trim() || undefined } : element
  ),
});

export const moveElementLayer = (
  slide: Slide,
  elementId: string,
  direction: 'up' | 'down'
): Slide => {
  const index = slide.elements.findIndex((element) => element.id === elementId);
  const targetIndex = direction === 'up' ? index + 1 : index - 1;

  if (index < 0 || targetIndex < 0 || targetIndex >= slide.elements.length) {
    return slide;
  }

  const elements = [...slide.elements];
  [elements[index], elements[targetIndex]] = [elements[targetIndex], elements[index]];

  return { ...slide, elements };
};

export const removeElement = (slide: Slide, elementId: string): Slide => ({
  ...slide,
  elements: slide.elements.filter((element) => element.id !== elementId),
});

export const updateBackground = (slide: Slide, backgroundColor: string): Slide => ({
  ...slide,
  backgroundColor,
});
