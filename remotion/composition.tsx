'use client';
import {
  AbsoluteFill,
  Img,
  Sequence,
  // Video,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { Gif } from '@remotion/gif';
import type { AnimationType, Slide } from '../components/page/editor/types/slide';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 3;

interface MyCompositionProps {
  slides?: Slide[];
}

const ShapeGraphic = ({
  shape,
  fill,
}: {
  shape: 'rectangle' | 'circle' | 'triangle';
  fill: string;
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ display: 'block' }}
  >
    {shape === 'circle' ? (
      <ellipse cx="50" cy="50" rx="50" ry="50" fill={fill} />
    ) : shape === 'triangle' ? (
      <polygon points="50,0 100,100 0,100" fill={fill} />
    ) : (
      <rect width="100" height="100" fill={fill} />
    )}
  </svg>
);

const decodeHtmlContent = (value: string) => {
  if (!value) return '';

  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
};

const getAnimationStyle = (
  animation: AnimationType | undefined,
  frame: number,
  fps: number,
  duration = 0.5,
  delay = 0
) => {
  const progress = interpolate(
    frame,
    [delay * fps, delay * fps + Math.max(1, duration * fps)],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  switch (animation ?? 'none') {
    case 'fade':
      return { opacity: progress };
    case 'slide-left':
      return { opacity: progress, transform: `translateX(${(1 - progress) * -120}px)` };
    case 'slide-up':
      return { opacity: progress, transform: `translateY(${(1 - progress) * 120}px)` };
    case 'zoom':
      return { opacity: progress, transform: `scale(${0.7 + progress * 0.3})` };
    default:
      return {};
  }
};

export const MyComposition = ({ slides = [] }: MyCompositionProps) => {
  if (slides.length === 0) {
    return (
      <AbsoluteFill className="items-center justify-center bg-black">
        <h1 style={{ color: 'white', fontSize: 60 }}>Hello, Remotion!</h1>
      </AbsoluteFill>
    );
  }

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {slides.map((slide) => {
        const durationInFrames = Math.max(
          1,
          Math.round(Math.max(0.5, slide.duration ?? DEFAULT_SLIDE_DURATION) * FPS)
        );
        const from = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence key={slide.id} from={from} durationInFrames={durationInFrames}>
            <SlideView slide={slide} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const SlideView = ({ slide }: { slide: Slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // simple fade-in for the slide
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: slide.backgroundColor || '#000000' }}>
      {slide.elements.map((el) => {
        if (el.type === 'text') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                color: el.color || '#ffffff',
                fontSize: el.fontSize ? `${el.fontSize}px` : '32px',
                fontWeight: el.fontWeight || 'normal',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                whiteSpace: 'pre-wrap',
                padding: 8,
                boxSizing: 'border-box',
                lineHeight: 1.2,
                letterSpacing: 0,
                ...getAnimationStyle(
                  el.animation,
                  frame,
                  fps,
                  el.animationDuration,
                  el.animationDelay
                ),
              }}
              dangerouslySetInnerHTML={{ __html: decodeHtmlContent(el.content) }}
            />
          );
        }

        if (el.type === 'image' && el.src && (el.mimeType === 'image/gif' || /^data:image\/gif/i.test(el.src))) {
          return (
            <Gif
              key={el.id}
              src={el.src}
              width={el.width}
              height={el.height}
              fit="cover"
              loopBehavior="loop"
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                ...getAnimationStyle(
                  el.animation,
                  frame,
                  fps,
                  el.animationDuration,
                  el.animationDelay
                ),
              }}
            />
          );
        }

        if (el.type === 'image' && el.src) {
          return (
            <Img
              key={el.id}
              src={el.src}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                objectFit: 'cover',
                ...getAnimationStyle(
                  el.animation,
                  frame,
                  fps,
                  el.animationDuration,
                  el.animationDelay
                ),
              }}
            />
          );
        }

        if (el.type === 'shape') {
          return (
            <div
              key={el.id}
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                display: 'block',
                ...getAnimationStyle(
                  el.animation,
                  frame,
                  fps,
                  el.animationDuration,
                  el.animationDelay
                ),
              }}
            >
              <ShapeGraphic shape={el.shape} fill={el.fill} />
            </div>
          );
        }

        // if (el.type === 'video' && el.src) {
        //   return (
        //     <Video
        //       key={el.id}
        //       src={el.src}
        //       className="absolute inset-0 h-full w-full object-cover"
        //     />
        //   );
        // }

        return null;
      })}
    </AbsoluteFill>
  );
};
