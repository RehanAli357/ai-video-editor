'use client';

import { Rnd } from 'react-rnd';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { useEffect, type CSSProperties } from 'react';
import { FontSize } from './lib/font-size-extension';
import type {
  AnimationType,
  EasingType,
  EmphasisType,
  Slide,
  SlideElement,
} from './types/slide';

/* ------------------------------------------------------------------ */
/* Options for your dropdowns                                          */
/* ------------------------------------------------------------------ */

export const ANIMATION_OPTIONS: { value: AnimationType; label: string; group: string }[] = [
  { value: 'none', label: 'None', group: 'Basic' },
  { value: 'fade', label: 'Fade', group: 'Basic' },
  { value: 'slide-left', label: 'Slide from left', group: 'Slide' },
  { value: 'slide-right', label: 'Slide from right', group: 'Slide' },
  { value: 'slide-up', label: 'Slide from bottom', group: 'Slide' },
  { value: 'slide-down', label: 'Slide from top', group: 'Slide' },
  { value: 'zoom-in', label: 'Zoom in', group: 'Scale' },
  { value: 'zoom-out', label: 'Zoom out', group: 'Scale' },
  { value: 'pop', label: 'Pop', group: 'Scale' },
  { value: 'drop', label: 'Drop', group: 'Scale' },
  { value: 'rotate', label: 'Rotate in', group: 'Creative' },
  { value: 'blur', label: 'Blur in', group: 'Creative' },
  { value: 'flip-x', label: 'Flip vertical', group: 'Creative' },
  { value: 'flip-y', label: 'Flip horizontal', group: 'Creative' },
  { value: 'wipe-left', label: 'Wipe from left', group: 'Reveal' },
  { value: 'wipe-right', label: 'Wipe from right', group: 'Reveal' },
  { value: 'typewriter', label: 'Typewriter', group: 'Reveal' },
];

export const EMPHASIS_OPTIONS: { value: EmphasisType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'float', label: 'Float' },
  { value: 'shake', label: 'Shake' },
  { value: 'wiggle', label: 'Wiggle' },
  { value: 'spin', label: 'Spin' },
];

export const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease-in', label: 'Ease in' },
  { value: 'ease-out', label: 'Ease out' },
  { value: 'ease-in-out', label: 'Ease in-out' },
  { value: 'back', label: 'Overshoot' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'elastic', label: 'Elastic' },
];

/* ------------------------------------------------------------------ */
/* Easing                                                              */
/* ------------------------------------------------------------------ */

const easeOutBounce = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

const EASINGS: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t * t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  bounce: easeOutBounce,
  elastic: (t) =>
    t === 0 || t === 1
      ? t
      : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * (2 * Math.PI)) / 3) + 1,
};

// Sensible default easing per animation, so presets feel right out of the box
const DEFAULT_EASING: Partial<Record<AnimationType, EasingType>> = {
  pop: 'back',
  drop: 'bounce',
  rotate: 'back',
  'zoom-in': 'ease-out',
  'zoom-out': 'ease-out',
  'flip-x': 'ease-out',
  'flip-y': 'ease-out',
  typewriter: 'linear',
};

/* ------------------------------------------------------------------ */
/* Visual state                                                        */
/* ------------------------------------------------------------------ */

export interface AnimationState {
  opacity: number;
  x: number; // % of the element's own width
  y: number; // % of the element's own height
  scaleX: number;
  scaleY: number;
  rotate: number; // degrees
  rotateX: number;
  rotateY: number;
  blur: number; // px
  clip?: string; // CSS clip-path
}

const IDENTITY: AnimationState = {
  opacity: 1,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  blur: 0,
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

const combine = (a: AnimationState, b: Partial<AnimationState>): AnimationState => ({
  opacity: a.opacity * (b.opacity ?? 1),
  x: a.x + (b.x ?? 0),
  y: a.y + (b.y ?? 0),
  scaleX: a.scaleX * (b.scaleX ?? 1),
  scaleY: a.scaleY * (b.scaleY ?? 1),
  rotate: a.rotate + (b.rotate ?? 0),
  rotateX: a.rotateX + (b.rotateX ?? 0),
  rotateY: a.rotateY + (b.rotateY ?? 0),
  blur: a.blur + (b.blur ?? 0),
  clip: b.clip ?? a.clip,
});

/**
 * e = eased progress, 0 (hidden) -> 1 (fully shown).
 * Exit animations reuse this with (1 - e), so every entrance has a matching exit.
 */
const progressState = (type: AnimationType, e: number): Partial<AnimationState> => {
  const inv = 1 - e;
  switch (type) {
    case 'fade':
      return { opacity: e };
    case 'slide-left':
      return { opacity: clamp(e * 2), x: -60 * inv };
    case 'slide-right':
      return { opacity: clamp(e * 2), x: 60 * inv };
    case 'slide-up':
      return { opacity: clamp(e * 2), y: 60 * inv };
    case 'slide-down':
      return { opacity: clamp(e * 2), y: -60 * inv };
    case 'zoom':
    case 'zoom-in':
      return { opacity: clamp(e * 2), scaleX: 0.3 + 0.7 * e, scaleY: 0.3 + 0.7 * e };
    case 'zoom-out':
      return { opacity: clamp(e * 2), scaleX: 1.6 - 0.6 * e, scaleY: 1.6 - 0.6 * e };
    case 'pop':
      return { opacity: clamp(e * 4), scaleX: e, scaleY: e };
    case 'drop':
      return { opacity: clamp(e * 4), y: -150 * inv };
    case 'rotate':
      return { opacity: clamp(e * 2), rotate: -120 * inv, scaleX: 0.4 + 0.6 * e, scaleY: 0.4 + 0.6 * e };
    case 'blur':
      return { opacity: e, blur: 24 * inv, scaleX: 1 + 0.08 * inv, scaleY: 1 + 0.08 * inv };
    case 'flip-x':
      return { opacity: clamp(e * 3), rotateX: 90 * inv };
    case 'flip-y':
      return { opacity: clamp(e * 3), rotateY: 90 * inv };
    case 'wipe-left':
      return { clip: `inset(0 ${100 * inv}% 0 0)` };
    case 'wipe-right':
      return { clip: `inset(0 0 0 ${100 * inv}%)` };
    case 'typewriter': {
      const steps = 24; // stepped reveal looks like typing
      const stepped = Math.min(1, Math.ceil(e * steps) / steps);
      return { clip: `inset(0 ${100 * (1 - stepped)}% 0 0)` };
    }
    default:
      return {};
  }
};

const emphasisState = (type: EmphasisType, t: number): Partial<AnimationState> => {
  const TAU = Math.PI * 2;
  switch (type) {
    case 'pulse':
      return { scaleX: 1 + 0.06 * Math.sin(TAU * t * 1.2), scaleY: 1 + 0.06 * Math.sin(TAU * t * 1.2) };
    case 'float':
      return { y: 4 * Math.sin(TAU * t * 0.5) };
    case 'shake':
      return { x: 1.5 * Math.sin(TAU * t * 8) };
    case 'wiggle':
      return { rotate: 4 * Math.sin(TAU * t * 2) };
    case 'spin':
      return { rotate: t * 90 }; // 90 degrees per second
    default:
      return {};
  }
};

/* ------------------------------------------------------------------ */
/* Main function: element + time -> CSS                                */
/* ------------------------------------------------------------------ */

const DEFAULT_ENTRANCE = 0.6;
const DEFAULT_EXIT = 0.5;

export const getElementAnimationState = (
  element: SlideElement,
  time: number, // seconds since the slide started
  slideDuration: number
): AnimationState => {
  let state = IDENTITY;

  // Entrance
  const entrance = element.animation ?? 'none';
  const delay = element.animationDelay ?? 0;
  const duration = Math.max(0.01, element.animationDuration ?? DEFAULT_ENTRANCE);
  const entranceEnd = delay + (entrance === 'none' ? 0 : duration);

  if (entrance !== 'none') {
    const easing = EASINGS[element.animationEasing ?? DEFAULT_EASING[entrance] ?? 'ease-out'];
    const raw = clamp((time - delay) / duration);
    state = combine(IDENTITY, progressState(entrance, easing(raw)));
  }

  // Emphasis loop (only between entrance end and exit start)
  const exit = element.exitAnimation ?? 'none';
  const exitDuration = Math.max(0.01, element.exitDuration ?? DEFAULT_EXIT);
  const exitStart = slideDuration - exitDuration;

  if (element.emphasis && element.emphasis !== 'none' && time >= entranceEnd) {
    const emphasisTime = time - entranceEnd;
    if (exit === 'none' || time < exitStart) {
      state = combine(state, emphasisState(element.emphasis, emphasisTime));
    }
  }

  // Exit
  if (exit !== 'none' && time > exitStart) {
    const easing = EASINGS[element.animationEasing ?? 'ease-in'];
    const raw = clamp((time - exitStart) / exitDuration);
    state = combine(state, progressState(exit, 1 - easing(raw)));
  }

  return { ...state, opacity: clamp(state.opacity) };
};

export const getElementAnimationStyle = (
  element: SlideElement,
  time: number,
  slideDuration: number
): CSSProperties => {
  const s = getElementAnimationState(element, time, slideDuration);

  return {
    opacity: s.opacity,
    transform: [
      'perspective(1000px)',
      `translate(${s.x}%, ${s.y}%)`,
      `rotate(${s.rotate}deg)`,
      `rotateX(${s.rotateX}deg)`,
      `rotateY(${s.rotateY}deg)`,
      `scale(${s.scaleX}, ${s.scaleY})`,
    ].join(' '),
    filter: s.blur > 0.01 ? `blur(${s.blur}px)` : undefined,
    clipPath: s.clip,
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
  };
};

/* ------------------------------------------------------------------ */
/* Slide update helpers (generalized)                                  */
/* ------------------------------------------------------------------ */

type AnimationPatch = Partial<
  Pick<
    SlideElement,
    | 'animation'
    | 'animationDuration'
    | 'animationDelay'
    | 'animationEasing'
    | 'exitAnimation'
    | 'exitDuration'
    | 'emphasis'
  >
>;

export const updateElementAnimationSettings = (
  slide: Slide,
  elementId: string,
  patch: AnimationPatch
): Slide => ({
  ...slide,
  elements: slide.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
});

// Your existing helpers still work
export const updateElementAnimation = (slide: Slide, elementId: string, animation: AnimationType) =>
  updateElementAnimationSettings(slide, elementId, { animation });

export const updateElementAnimationTiming = (
  slide: Slide,
  elementId: string,
  timing: { animationDuration?: number; animationDelay?: number }
) => updateElementAnimationSettings(slide, elementId, timing);

// Stagger animations across all elements: great for "build in" effects
export const staggerSlideAnimations = (
  slide: Slide,
  animation: AnimationType,
  step = 0.25
): Slide => ({
  ...slide,
  elements: slide.elements.map((el, i) => ({
    ...el,
    animation,
    animationDelay: i * step,
  })),
});

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

  useEffect(() => {
    if (element.type === 'text' && editor && editor.getHTML() !== element.content) {
      editor.commands.setContent(element.content, { emitUpdate: false });
    }
    // Keep editor content synchronized when the selected slide changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      scale={scale}
      bounds="parent"
      onDragStop={(_, position) => onUpdate({ ...element, x: position.x, y: position.y })}
      onResizeStop={(_, __, ref, ___, position) =>
        onUpdate({
          ...element,
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...position,
        })
      }
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect(element.type === 'text' ? editor ?? null : null);
      }}
      className={`box-border flex items-center overflow-hidden border-2 ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-blue-500/40'
      }`}
    >
      {element.type === 'image' ? (
        <img
          src={element.src}
          alt={element.label ?? 'Slide image'}
          onClick={(event) => event.stopPropagation()}
          className="block h-full w-full object-cover"
        />
      ) : element.type === 'video' ? (
        <video
          src={element.src}
          muted
          loop
          playsInline
          onClick={(event) => event.stopPropagation()}
          className="block h-full w-full object-cover"
        />
      ) : element.type === 'shape' ? (
        <div
          aria-label={element.label ?? `${element.shape} shape`}
          onClick={(event) => event.stopPropagation()}
          className="h-full w-full"
          style={{
            backgroundColor: element.fill,
            borderRadius: element.shape === 'circle' ? '50%' : undefined,
            clipPath:
              element.shape === 'triangle'
                ? 'polygon(50% 0%, 100% 100%, 0% 100%)'
                : undefined,
          }}
        />
      ) : (
        <div
          onClick={(event) => event.stopPropagation()}
          className="tiptap-canvas-text h-full w-full overflow-hidden"
          style={{
            padding: 8,
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
            color: element.color || '#ffffff',
            fontSize: element.fontSize ? `${element.fontSize}px` : '32px',
            fontWeight: element.fontWeight || 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            lineHeight: 1.2,
            letterSpacing: 0,
          }}
        >
          <EditorContent editor={editor} className="h-full w-full" />
        </div>
      )}
    </Rnd>
  );
};

export default CanvasElement;