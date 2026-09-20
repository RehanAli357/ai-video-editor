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
import { getAvailableFonts } from '@remotion/google-fonts';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { useEffect, useState } from 'react';
import type { AnimationType, Slide } from '../components/page/editor/types/slide';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 3;
const { fontFamily: interFontFamily } = loadInter();
const availableFonts = getAvailableFonts();

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
  <div
    style={{
      width: '100%',
      height: '100%',
      backgroundColor: fill,
      borderRadius: shape === 'circle' ? '50%' : undefined,
      clipPath: shape === 'triangle' ? 'polygon(50% 0%, 100% 100%, 0% 100%)' : undefined,
    }}
  />
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

const getFontFamilyFromHtml = (value: string) => {
  const match = value.match(/font-family:\s*(?:&quot;|["']|)?([^;"'&]+)(?:&quot;|["']|)?\s*[;"']/i);

  if (!match?.[1]) return interFontFamily;

  const font = match[1].trim();
  return font === 'Inter' ? interFontFamily : font;
};

const getFontFamiliesFromSlides = (slides: Slide[]) => {
  const families = new Set<string>();

  for (const slide of slides) {
    for (const element of slide.elements) {
      if (element.type !== 'text') continue;

      const match = element.content.match(
        /font-family:\s*(?:&quot;|["']|)?([^;"'&]+)(?:&quot;|["']|)?\s*[;"']/i
      );

      if (match?.[1]) families.add(match[1].trim());
    }
  }

  return [...families];
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
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const fontsToLoad = getFontFamiliesFromSlides(slides)
      .map((family) => availableFonts.find((font) => font.fontFamily === family))
      .filter((font): font is (typeof availableFonts)[number] => Boolean(font));

    if (fontsToLoad.length === 0) {
      setFontsReady(true);
      return;
    }

    setFontsReady(false);
    let cancelled = false;

    Promise.all(
      fontsToLoad.map(async (font) => {
        const loadedFont = await font.load();
        const fontLoad = loadedFont.loadFont();
        await fontLoad.waitUntilDone();
      })
    )
      .catch((error) => {
        console.error('Unable to load Google font:', error);
      })
      .finally(() => {
        if (!cancelled) setFontsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slides]);

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
  const isGradientBackground = slide.backgroundColor.startsWith('linear-gradient(');

  // simple fade-in for the slide
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: isGradientBackground ? '#000000' : slide.backgroundColor || '#000000',
        backgroundImage: slide.backgroundImage
          ? `url("${slide.backgroundImage}")`
          : isGradientBackground
            ? slide.backgroundColor
            : undefined,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
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
                overflow: 'hidden',
                lineHeight: 1.2,
                letterSpacing: 0,
                fontFamily: getFontFamilyFromHtml(el.content),
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
                boxSizing: 'border-box',
                overflow: 'hidden',
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
