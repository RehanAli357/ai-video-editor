export type SlideElementType = 'text';

export interface TextElement {
  id: string;
  type: SlideElementType;
  content: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SlideElement = TextElement;

export interface Slide {
  id: string;
  name: string;
  backgroundColor: string;
  elements: SlideElement[];
}

export const createEmptySlide = (index: number): Slide => ({
  id: crypto.randomUUID(),
  name: `Slide ${index}`,
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