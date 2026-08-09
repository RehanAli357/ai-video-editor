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
import type { Slide } from './types/slide';

const FRAMES_PER_SLIDE = 90;

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

  return (
    <AbsoluteFill>
      {slides.map((slide, index) => (
        <Sequence
          key={slide.id}
          from={index * FRAMES_PER_SLIDE}
          durationInFrames={FRAMES_PER_SLIDE}
        >
          <SlideView slide={slide} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const SlideView = ({ slide }: { slide: Slide }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: 'clamp' });
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
            whiteSpace: 'pre-wrap',
            padding: 8,
            boxSizing: 'border-box',
            fontSize: '24px',
            lineHeight: 1.3,
            fontFamily: getFontFamilyFromHtml(el.content),
          }}
          className="tiptap-render-text"
          dangerouslySetInnerHTML={{
            __html: decodeHtmlContent(el.content),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
