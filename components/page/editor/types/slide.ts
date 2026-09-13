export type ShapeType = 'rectangle' | 'circle' | 'triangle';
export type AnimationType = 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom';
export type SlideElementType = 'text' | 'image' | 'shape';

export interface TextElement {
  id: string;
  type: 'text';
  label?: string;
  animation?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
  content: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  label?: string;
  animation?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
  src: string;
  mimeType?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  label?: string;
  animation?: AnimationType;
  animationDuration?: number;
  animationDelay?: number;
  shape: ShapeType;
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SlideElement = TextElement | ImageElement | ShapeElement;

export interface Slide {
  id: string;
  name: string;
  duration?: number;
  backgroundColor: string;
  elements: SlideElement[];
}

export const createEmptySlide = (index: number): Slide => ({
  id: crypto.randomUUID(),
  name: `Slide ${index}`,
  duration: 3,
  backgroundColor: '#000000',
  elements: [],
});

export const createTextElement = (): SlideElement => ({
  id: crypto.randomUUID(),
  type: 'text',
  content: '<p style="font-size: 32px;">New text</p>',
  x: 80,
  y: 80,
  width: 480,
  height: 160,
});

export const createImageElement = (src: string, mimeType?: string): ImageElement => ({
  id: crypto.randomUUID(),
  type: 'image',
  src,
  mimeType,
  x: 80,
  y: 80,
  width: 640,
  height: 360,
});

export const createShapeElement = (shape: ShapeType): ShapeElement => ({
  id: crypto.randomUUID(),
  type: 'shape',
  shape,
  fill: '#4f46e5',
  x: 120,
  y: 120,
  width: 320,
  height: 220,
});