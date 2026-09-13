import type { AnimationType, Slide } from '../types/slide';

export const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide left' },
  { value: 'slide-up', label: 'Slide up' },
  { value: 'zoom', label: 'Zoom' },
];

export const updateElementAnimation = (
  slide: Slide,
  elementId: string,
  animation: AnimationType
): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId ? { ...element, animation } : element
  ),
});

export const updateElementAnimationTiming = (
  slide: Slide,
  elementId: string,
  timing: { animationDuration?: number; animationDelay?: number }
): Slide => ({
  ...slide,
  elements: slide.elements.map((element) =>
    element.id === elementId ? { ...element, ...timing } : element
  ),
});