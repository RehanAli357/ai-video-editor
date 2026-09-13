'use client';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  continueRender,
  delayRender,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { useEffect, useState } from 'react';
import type { AnimationType, Slide } from './types/slide';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 3;

const { fontFamily: interFontFamily } = loadInter();

interface MyCompositionProps {
  slides?: Slide[];
}

const decodeHtmlContent = (value: string) => {
  if (!value) return '';
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
};

const getFontFamilyFromHtml = (value: string) => {
  if (!value) return interFontFamily;

  const match = value.match(/font-family:\s*([^;"'>]+)[;"']/i);
  if (match?.[1]) {
    const font = match[1].trim();
    return font === 'Inter' ? interFontFamily : font;
  }

  return interFontFamily;
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
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
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

const ShapeGraphic = ({ shape, fill }: { shape: 'rectangle' | 'circle' | 'triangle'; fill: string }) => (
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

export const MyComposition = ({ slides = [] }: MyCompositionProps) => {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    console.log('Video composition slides:', slides);
  }, [slides]);
  const [handle] = useState(() => delayRender('Loading fonts'));

  useEffect(() => {
    // fonts are already requested via loadInter() above; just wait a tick
    // for the browser to register them, then continue render
    document.fonts.ready.then(() => {
      setFontsReady(true);
      continueRender(handle);
    });
  }, [handle]);

  if (!fontsReady) return null;

  if (slides.length === 0) {
    return (
      <AbsoluteFill className="items-center justify-center bg-black">
        <h1 style={{ color: 'white', fontSize: 60 }}>Hello, Remotion!</h1>
      </AbsoluteFill>
    );
  }

  let currentFrame = 0;

  return (
    <AbsoluteFill>
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

  const opacity = interpolate(frame, [0, fps * 0.3], [1, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: slide.backgroundColor }}>
      {slide.elements.map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            boxSizing: 'border-box',
            zIndex: 1,
            ...getAnimationStyle(
              el.animation,
              frame,
              fps,
              el.animationDuration,
              el.animationDelay
            ),
            ...(el.type === 'text'
              ? {
                  whiteSpace: 'pre-wrap' as const,
                  padding: 8,
                  boxSizing: 'border-box' as const,
                  fontSize: '24px',
                  lineHeight: 1.3,
                  fontFamily: getFontFamilyFromHtml(el.content),
                }
              : {}),
          }}
          className={el.type === 'text' ? 'tiptap-render-text' : undefined}
        >
          {el.type === 'image' ? (
            <img src={el.src} alt="Uploaded slide asset" className="h-full w-full object-cover" />
          ) : el.type === 'text' ? (
            <div
              dangerouslySetInnerHTML={{
                __html: decodeHtmlContent(el.content),
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'block' }}>
              <ShapeGraphic shape={el.shape} fill={el.fill} />
            </div>
          )}
        </div>
      ))}
    </AbsoluteFill>
  );
};
