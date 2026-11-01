import type { CSSProperties } from 'react';
import type {
  AnimationType,
  EasingType,
  EmphasisType,
  Slide,
  SlideElement,
} from '../types/slide';

export const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide-left', label: 'Slide from left' },
  { value: 'slide-right', label: 'Slide from right' },
  { value: 'slide-up', label: 'Slide from bottom' },
  { value: 'slide-down', label: 'Slide from top' },
  { value: 'zoom', label: 'Zoom (legacy)' },
  { value: 'zoom-in', label: 'Zoom in' },
  { value: 'zoom-out', label: 'Zoom out' },
  { value: 'pop', label: 'Pop' },
  { value: 'drop', label: 'Drop' },
  { value: 'rotate', label: 'Rotate in' },
  { value: 'blur', label: 'Blur in' },
  { value: 'flip-x', label: 'Flip vertical' },
  { value: 'flip-y', label: 'Flip horizontal' },
  { value: 'wipe-left', label: 'Wipe from left' },
  { value: 'wipe-right', label: 'Wipe from right' },
  { value: 'typewriter', label: 'Typewriter' },
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

interface AnimationState {
  opacity: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  blur: number;
  clip?: string;
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

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const combine = (base: AnimationState, effect: Partial<AnimationState>): AnimationState => ({
  opacity: base.opacity * (effect.opacity ?? 1),
  x: base.x + (effect.x ?? 0),
  y: base.y + (effect.y ?? 0),
  scaleX: base.scaleX * (effect.scaleX ?? 1),
  scaleY: base.scaleY * (effect.scaleY ?? 1),
  rotate: base.rotate + (effect.rotate ?? 0),
  rotateX: base.rotateX + (effect.rotateX ?? 0),
  rotateY: base.rotateY + (effect.rotateY ?? 0),
  blur: base.blur + (effect.blur ?? 0),
  clip: effect.clip ?? base.clip,
});

const getProgressState = (type: AnimationType, progress: number): Partial<AnimationState> => {
  const inverse = 1 - progress;

  switch (type) {
    case 'fade':
      return { opacity: progress };
    case 'slide-left':
      return { opacity: clamp(progress * 2), x: -60 * inverse };
    case 'slide-right':
      return { opacity: clamp(progress * 2), x: 60 * inverse };
    case 'slide-up':
      return { opacity: clamp(progress * 2), y: 60 * inverse };
    case 'slide-down':
      return { opacity: clamp(progress * 2), y: -60 * inverse };
    case 'zoom':
    case 'zoom-in':
      return {
        opacity: clamp(progress * 2),
        scaleX: 0.3 + 0.7 * progress,
        scaleY: 0.3 + 0.7 * progress,
      };
    case 'zoom-out':
      return {
        opacity: clamp(progress * 2),
        scaleX: 1.6 - 0.6 * progress,
        scaleY: 1.6 - 0.6 * progress,
      };
    case 'pop':
      return { opacity: clamp(progress * 4), scaleX: progress, scaleY: progress };
    case 'drop':
      return { opacity: clamp(progress * 4), y: -150 * inverse };
    case 'rotate':
      return {
        opacity: clamp(progress * 2),
        rotate: -120 * inverse,
        scaleX: 0.4 + 0.6 * progress,
        scaleY: 0.4 + 0.6 * progress,
      };
    case 'blur':
      return {
        opacity: progress,
        blur: 24 * inverse,
        scaleX: 1 + 0.08 * inverse,
        scaleY: 1 + 0.08 * inverse,
      };
    case 'flip-x':
      return { opacity: clamp(progress * 3), rotateX: 90 * inverse };
    case 'flip-y':
      return { opacity: clamp(progress * 3), rotateY: 90 * inverse };
    case 'wipe-left':
      return { clip: `inset(0 ${100 * inverse}% 0 0)` };
    case 'wipe-right':
      return { clip: `inset(0 0 0 ${100 * inverse}%)` };
    case 'typewriter': {
      const steps = 24;
      const steppedProgress = Math.min(1, Math.ceil(progress * steps) / steps);
      return { clip: `inset(0 ${100 * (1 - steppedProgress)}% 0 0)` };
    }
    default:
      return {};
  }
};

const getEmphasisState = (type: EmphasisType, time: number): Partial<AnimationState> => {
  const cycle = Math.PI * 2;

  switch (type) {
    case 'pulse':
      return {
        scaleX: 1 + 0.06 * Math.sin(cycle * time * 1.2),
        scaleY: 1 + 0.06 * Math.sin(cycle * time * 1.2),
      };
    case 'float':
      return { y: 4 * Math.sin(cycle * time * 0.5) };
    case 'shake':
      return { x: 1.5 * Math.sin(cycle * time * 8) };
    case 'wiggle':
      return { rotate: 4 * Math.sin(cycle * time * 2) };
    case 'spin':
      return { rotate: time * 90 };
    default:
      return {};
  }
};

export const getElementAnimationStyle = (
  element: SlideElement,
  time: number,
  slideDuration: number
): CSSProperties => {
  let state = IDENTITY;
  const entrance = element.animation ?? 'none';
  const delay = element.animationDelay ?? 0;
  const duration = Math.max(0.01, element.animationDuration ?? 0.6);
  const entranceEnd = delay + (entrance === 'none' ? 0 : duration);

  if (entrance !== 'none') {
    const easing =
      EASINGS[element.animationEasing ?? DEFAULT_EASING[entrance] ?? 'ease-out'];
    const progress = clamp((time - delay) / duration);
    state = combine(IDENTITY, getProgressState(entrance, easing(progress)));
  }

  const exit = element.exitAnimation ?? 'none';
  const exitDuration = Math.max(0.01, element.exitDuration ?? 0.5);
  const exitStart = slideDuration - exitDuration;

  if (element.emphasis && element.emphasis !== 'none' && time >= entranceEnd) {
    if (exit === 'none' || time < exitStart) {
      state = combine(state, getEmphasisState(element.emphasis, time - entranceEnd));
    }
  }

  if (exit !== 'none' && time > exitStart) {
    const easing = EASINGS[element.animationEasing ?? 'ease-in'];
    const progress = clamp((time - exitStart) / exitDuration);
    state = combine(state, getProgressState(exit, 1 - easing(progress)));
  }

  return {
    opacity: clamp(state.opacity),
    transform: [
      'perspective(1000px)',
      `translate(${state.x}%, ${state.y}%)`,
      `rotate(${state.rotate}deg)`,
      `rotateX(${state.rotateX}deg)`,
      `rotateY(${state.rotateY}deg)`,
      `scale(${state.scaleX}, ${state.scaleY})`,
    ].join(' '),
    filter: state.blur > 0.01 ? `blur(${state.blur}px)` : undefined,
    clipPath: state.clip,
    transformOrigin: 'center center',
    willChange: 'transform, opacity',
  };
};

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
  elements: slide.elements.map((element) =>
    element.id === elementId ? { ...element, ...patch } : element
  ),
});

export const updateElementAnimation = (slide: Slide, elementId: string, animation: AnimationType) =>
  updateElementAnimationSettings(slide, elementId, { animation });

export const updateElementAnimationTiming = (
  slide: Slide,
  elementId: string,
  timing: { animationDuration?: number; animationDelay?: number }
) => updateElementAnimationSettings(slide, elementId, timing);

export const staggerSlideAnimations = (
  slide: Slide,
  animation: AnimationType,
  step = 0.25
): Slide => ({
  ...slide,
  elements: slide.elements.map((element, index) => ({
    ...element,
    animation,
    animationDelay: index * step,
  })),
});
