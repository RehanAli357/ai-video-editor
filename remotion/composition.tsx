'use client';
import {
  AbsoluteFill,
  Sequence,
  // Img,
  // Video,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import type { Slide } from '../components/page/editor/types/slide';

const FRAMES_PER_SLIDE = 90;

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

export const MyComposition = ({ slides = [] }: MyCompositionProps) => {
  if (slides.length === 0) {
    return (
      <AbsoluteFill className="items-center justify-center bg-black">
        <h1 style={{ color: 'white', fontSize: 60 }}>Hello, Remotion!</h1>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
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
              }}
              dangerouslySetInnerHTML={{ __html: decodeHtmlContent(el.content) }}
            />
          );
        }

        // if (el.type === 'image' && el.src) {
        //   return (
        //     <Img key={el.id} src={el.src} className="absolute inset-0 h-full w-full object-cover" />
        //   );
        // }

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
