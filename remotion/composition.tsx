'use client';
import {
  AbsoluteFill,
  Img,
  Sequence,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { Gif } from '@remotion/gif';
import { Audio, Video } from '@remotion/media';
import { getAvailableFonts } from '@remotion/google-fonts';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { useEffect, useState } from 'react';
import type {
  AudioTrack,
  Slide,
  SlideTransitionType,
} from '../components/page/editor/types/slide';
import { getElementAnimationStyle } from '../components/page/editor/actions/animation-actions';

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 3;
const SLIDE_TRANSITION_DURATION_IN_FRAMES = Math.round(FPS * 0.3);
const { fontFamily: interFontFamily } = loadInter();
const availableFonts = getAvailableFonts();

interface MyCompositionProps {
  slides?: Slide[];
  audio?: AudioTrack;
}

const getSlideDurationInFrames = (slide: Slide) =>
  Math.max(1, Math.round(Math.max(0.5, slide.duration ?? DEFAULT_SLIDE_DURATION) * FPS));

const getTransitionType = (transition: SlideTransitionType | undefined) => transition ?? 'fade';

const getTransitionDurationInFrames = (
  transition: SlideTransitionType | undefined,
  fromSlide?: Slide,
  toSlide?: Slide
) => {
  if (getTransitionType(transition) === 'none') return 0;

  return Math.min(
    SLIDE_TRANSITION_DURATION_IN_FRAMES,
    fromSlide ? Math.floor(getSlideDurationInFrames(fromSlide) / 2) : Infinity,
    toSlide ? Math.floor(getSlideDurationInFrames(toSlide) / 2) : Infinity
  );
};

export const getTotalDurationInFrames = (slides: Slide[]) => {
  const totalFrames = slides.reduce(
    (total, slide) => total + getSlideDurationInFrames(slide),
    0
  );
  const transitionFrames = slides.slice(1).reduce(
    (total, slide, index) =>
      total + getTransitionDurationInFrames(slide.transition, slides[index], slide),
    0
  );

  return slides.length === 0 ? FPS : Math.max(1, totalFrames - transitionFrames);
};

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

export const MyComposition = ({ slides = [], audio }: MyCompositionProps) => {
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
      {audio?.src && <Audio src={audio.src} />}
      {slides.map((slide, index) => {
        const durationInFrames = getSlideDurationInFrames(slide);
        const from = currentFrame;
        const nextSlide = slides[index + 1];
        const exitTransition = nextSlide?.transition;
        const exitDuration = getTransitionDurationInFrames(exitTransition, slide, nextSlide);
        currentFrame += durationInFrames - exitDuration;

        return (
          <Sequence key={slide.id} from={from} durationInFrames={durationInFrames}>
            <SlideView
              slide={slide}
              transition={slide.transition}
              exitTransition={exitTransition}
              enterDuration={getTransitionDurationInFrames(
                slide.transition,
                slides[index - 1],
                slide
              )}
              exitDuration={exitDuration}
              durationInFrames={durationInFrames}
              isFirst={index === 0}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const getTransitionStyles = (
  transition: SlideTransitionType | undefined,
  progress: number,
  width: number,
  height: number,
  exiting = false
) => {
  switch (getTransitionType(transition)) {
    case 'fade':
      return { opacity: exiting ? 1 - progress : progress };
    case 'slide-left':
      return {
        transform: `translateX(${(exiting ? -progress : 1 - progress) * width}px)`,
      };
    case 'slide-right':
      return {
        transform: `translateX(${(exiting ? progress : progress - 1) * width}px)`,
      };
    case 'slide-up':
      return {
        transform: `translateY(${(exiting ? -progress : 1 - progress) * height}px)`,
      };
    case 'slide-down':
      return {
        transform: `translateY(${(exiting ? progress : progress - 1) * height}px)`,
      };
    case 'zoom':
      return {
        opacity: exiting ? 1 - progress : progress,
        transform: `scale(${exiting ? 1 + progress * 0.2 : 0.8 + progress * 0.2})`,
      };
    case 'wipe-left':
      return exiting ? {} : { clipPath: `inset(0 0 0 ${(1 - progress) * 100}%)` };
    case 'wipe-right':
      return exiting ? {} : { clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` };
    default:
      return {};
  }
};

const SlideView = ({
  slide,
  transition,
  exitTransition,
  enterDuration,
  exitDuration,
  durationInFrames,
  isFirst,
}: {
  slide: Slide;
  transition?: SlideTransitionType;
  exitTransition?: SlideTransitionType;
  enterDuration: number;
  exitDuration: number;
  durationInFrames: number;
  isFirst: boolean;
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const slideDuration = durationInFrames / fps;
  const isGradientBackground = slide.backgroundColor.startsWith('linear-gradient(');
  const enterProgress =
    enterDuration > 0
      ? interpolate(frame, [0, enterDuration - 1], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;
  const exitProgress =
    exitDuration > 0
      ? interpolate(
          frame,
          [durationInFrames - exitDuration, durationInFrames - 1],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;
  const transitionStyle = isFirst
    ? { opacity: interpolate(frame, [0, SLIDE_TRANSITION_DURATION_IN_FRAMES - 1], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }) }
    : getTransitionStyles(transition, enterProgress, width, height);
  const exitStyle = getTransitionStyles(exitTransition, exitProgress, width, height, true);

  return (
    <AbsoluteFill
      style={{
        ...transitionStyle,
        ...exitStyle,
        backgroundColor: isGradientBackground ? '#000000' : slide.backgroundColor || '#000000',
        backgroundImage:
          !slide.backgroundImage && isGradientBackground ? slide.backgroundColor : undefined,
      }}
    >
      {slide.audio?.src && <Audio src={slide.audio.src} />}
      {slide.backgroundImage && (
        <Img
          src={slide.backgroundImage}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
      {slide.backgroundVideo && (
        <Video
          src={slide.backgroundVideo}
          muted
          loop
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
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
                ...getElementAnimationStyle(el, frame / fps, slideDuration),
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
                ...getElementAnimationStyle(el, frame / fps, slideDuration),
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
                ...getElementAnimationStyle(el, frame / fps, slideDuration),
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
                ...getElementAnimationStyle(el, frame / fps, slideDuration),
              }}
            >
              <ShapeGraphic shape={el.shape} fill={el.fill} />
            </div>
          );
        }

        if (el.type === 'video' && el.src) {
          return (
            <Video
              key={el.id}
              src={el.src}
              muted
              loop
              style={{
                position: 'absolute',
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                objectFit: 'cover',
                ...getElementAnimationStyle(el, frame / fps, slideDuration),
              }}
            />
          );
        }

        return null;
      })}
    </AbsoluteFill>
  );
};
