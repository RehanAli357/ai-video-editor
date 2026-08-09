'use client';

import { MyComposition } from '@/remotion/composition';
import { Player } from '@remotion/player';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import type { Slide } from './types/slide';
import { createEmptySlide, createTextElement } from './types/slide';
import SlideCanvas from './slide-canvas';

const dimensions = [
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: 'Square', width: 1080, height: 1080 },
];

const FPS = 30;
const FRAMES_PER_SLIDE = 90;

const RemotionPlayer = () => {
  const [selectedDimension, setSelectedDimension] = useState(dimensions[1]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const totalDuration = Math.max(slides.length * FRAMES_PER_SLIDE, FRAMES_PER_SLIDE);

  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  const handleAddSlide = () => {
    const newSlide = createEmptySlide(slides.length + 1);

    setSlides([...slides, newSlide]);
    setSelectedSlideId(newSlide.id);
  };

  const handleUpdateSlide = (updated: Slide) => {
    setSlides((current) => current.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleAddText = () => {
    if (!selectedSlide) return;

    handleUpdateSlide({
      ...selectedSlide,
      elements: [...selectedSlide.elements, createTextElement()],
    });
  };

  const handleRemoveSlide = (id: string) => {
    const next = slides.filter((s) => s.id !== id);

    setSlides(next);

    if (selectedSlideId === id) {
      setSelectedSlideId(next[0]?.id ?? null);
    }
  };

  const handleDownloadJson = () => {
    if (slides.length === 0) return;

    const payload = {
      slides,
      selectedDimension,
      totalDuration,
    };

    const exportUrl = `data:application/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(payload, null, 2)
    )}`;

    const a = document.createElement('a');

    a.href = exportUrl;
    a.download = 'video-project.json';

    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDownloadVideo = async () => {
    if (slides.length === 0 || isRendering) {
      return;
    }

    try {
      setIsRendering(true);
      setRenderProgress(0);

      console.log('Starting video render...');

      const { getBlob } = await renderMediaOnWeb({
        composition: {
          id: 'MyComposition',
          component: MyComposition,
          width: selectedDimension.width,
          height: selectedDimension.height,
          fps: FPS,
          durationInFrames: totalDuration,
          defaultProps: {
            slides: [],
          },
        },

        inputProps: {
          slides,
        },

        videoCodec: 'h264',

        onProgress: ({ progress }) => {
          setRenderProgress(progress);
        },
      });

      const blob = await getBlob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'video.mp4';

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      console.log('Video rendering completed.');
    } catch (error) {
      console.error('Video rendering failed:', error);

      alert(error instanceof Error ? error.message : 'Video rendering failed.');
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Video Editor</h1>

        <p className="text-sm text-ink-muted">
          Click, drag, resize, and style text directly on the canvas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelectedSlideId(s.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
              selectedSlideId === s.id
                ? 'border-ink bg-ink text-surface'
                : 'border-line bg-gray-950/60 text-ink'
            }`}
          >
            {i + 1}. {s.name}
          </button>
        ))}

        <button
          onClick={handleAddSlide}
          className="flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-surface hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add slide
        </button>
      </div>

      <div className="rounded-xl bg-gray-950 p-4">
        <SlideCanvas
          slide={selectedSlide}
          width={selectedDimension.width}
          height={selectedDimension.height}
          onUpdateSlide={handleUpdateSlide}
        />

        {selectedSlide && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1">
              <label className="text-[10px] font-medium text-ink-muted">Background</label>

              <input
                type="color"
                value={selectedSlide.backgroundColor}
                onChange={(e) =>
                  handleUpdateSlide({
                    ...selectedSlide,
                    backgroundColor: e.target.value,
                  })
                }
                className="h-5 w-8 cursor-pointer rounded border border-line bg-transparent p-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddText}
                className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Add text
              </button>

              <button
                onClick={() => handleRemoveSlide(selectedSlide.id)}
                className="rounded-lg p-1.5 text-ink-muted hover:bg-gray-900 hover:text-ink"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Dimension</label>

        <select
          value={selectedDimension.label}
          onChange={(e) => {
            const next = dimensions.find((d) => d.label === e.target.value);

            if (next) {
              setSelectedDimension(next);
            }
          }}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink md:w-64"
        >
          {dimensions.map((d) => (
            <option key={d.label} value={d.label}>
              {d.label} ({d.width}x{d.height})
            </option>
          ))}
        </select>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleDownloadVideo}
            disabled={isRendering || slides.length === 0}
            className="flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />

            {isRendering ? `Rendering ${Math.round(renderProgress * 100)}%` : 'Download Video'}
          </button>

          <button
            onClick={handleDownloadJson}
            disabled={isRendering}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-gray-900 disabled:opacity-50"
          >
            Download JSON
          </button>
        </div>
      </div>

      {isRendering && (
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-ink-muted">Rendering video...</span>

            <span className="font-medium text-ink">{Math.round(renderProgress * 100)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-ink transition-all"
              style={{
                width: `${renderProgress * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-center rounded-xl bg-gray-950 p-4">
        <Player
          component={MyComposition}
          durationInFrames={totalDuration}
          compositionWidth={selectedDimension.width}
          compositionHeight={selectedDimension.height}
          fps={FPS}
          controls
          inputProps={{
            slides,
          }}
        />
      </div>
    </div>
  );
};

export default RemotionPlayer;
