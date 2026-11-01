export type AnimationType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom' // kept for backward compatibility (same as zoom-in)
  | 'zoom-in'
  | 'zoom-out'
  | 'pop'
  | 'drop'
  | 'rotate'
  | 'blur'
  | 'flip-x'
  | 'flip-y'
  | 'wipe-left'
  | 'wipe-right'
  | 'typewriter';

export type EmphasisType = 'none' | 'pulse' | 'float' | 'shake' | 'wiggle' | 'spin';

export type ShapeType = 'rectangle' | 'circle' | 'triangle';
export type SlideElementType = 'text' | 'image' | 'video' | 'shape';

export type SlideTransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom'
  | 'wipe-left'
  | 'wipe-right';

export type EasingType =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'back'
  | 'bounce'
  | 'elastic';

// Shared by every element type, so you stop repeating these fields
interface BaseElement {
  id: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;

  // Entrance
  animation?: AnimationType;
  animationDuration?: number; // seconds, default 0.6
  animationDelay?: number; // seconds, default 0
  animationEasing?: EasingType;

  // Exit (plays at the end of the slide)
  exitAnimation?: AnimationType;
  exitDuration?: number; // seconds, default 0.5

  // Looping effect after the entrance finishes
  emphasis?: EmphasisType;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  color?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  srcPath?: string;
  mimeType?: string;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  srcPath?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeType;
  fill: string;
}

export type SlideElement = TextElement | ImageElement | VideoElement | ShapeElement;

export interface AudioTrack {
  src: string;
  srcPath?: string;
  name?: string;
}

export interface Slide {
  id: string;
  name: string;
  duration?: number;
  transition?: SlideTransitionType;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundImagePath?: string;
  backgroundVideo?: string;
  backgroundVideoPath?: string;
  audio?: AudioTrack;
  elements: SlideElement[];
}

export const createEmptySlide = (index: number): Slide => ({
  id: crypto.randomUUID(),
  name: `Slide ${index}`,
  duration: 3,
  backgroundColor: '#000000',
  elements: [],
});

export const createTextElement = (): TextElement => ({
  id: crypto.randomUUID(),
  type: 'text',
  content: '<p style="font-size: 32px;">New text</p>',
  x: 80,
  y: 80,
  width: 480,
  height: 160,
});

export const createImageElement = (
  src: string,
  mimeType?: string,
  srcPath?: string
): ImageElement => ({
  id: crypto.randomUUID(),
  type: 'image',
  src,
  srcPath,
  mimeType,
  x: 80,
  y: 80,
  width: 640,
  height: 360,
});

export const createVideoElement = (src: string, srcPath?: string): VideoElement => ({
  id: crypto.randomUUID(),
  type: 'video',
  src,
  srcPath,
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