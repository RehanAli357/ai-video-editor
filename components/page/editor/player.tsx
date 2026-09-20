'use client';

import { MyComposition } from '@/remotion/composition';
import { Player } from '@remotion/player';
import { renderMediaOnWeb } from '@remotion/web-renderer';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Download, FileDown, FileUp, ImagePlus, Link, Plus, Trash2, Palette, Clock } from 'lucide-react';import type { Slide } from './types/slide';
import { addImageElement, isImageFile, readImageFile } from './actions/image-actions';
import { addSlide, removeSlide, updateSlide } from './actions/slide-actions';
import { addShapeElement } from './actions/shape-actions';
import { addTextElement } from './actions/text-actions';
import LayersPanel from './layers-panel';
import ShapeMenu from './shape-menu';
import SlideCanvas from './slide-canvas';
import type { ShapeType } from './types/slide';

const dimensions = [
  { label: '1080p', width: 1920, height: 1080 },
  { label: '720p', width: 1280, height: 720 },
  { label: 'Square', width: 1080, height: 1080 },
];

const FPS = 30;
const DEFAULT_SLIDE_DURATION = 3;
type BackgroundMode = 'solid' | 'gradient';

const getGradientSettings = (value: string) => {
  const match = value.match(
    /^linear-gradient\(\s*(\d+)deg\s*,\s*(#[\da-f]{6})\s*,\s*(#[\da-f]{6})\s*\)$/i
  );

  return match
    ? { angle: match[1], start: match[2], end: match[3] }
    : { angle: '135', start: '#101827', end: '#3dd6b0' };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSlide = (value: unknown): value is Slide => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return false;
  }

  if (typeof value.backgroundColor !== 'string' || !Array.isArray(value.elements)) {
    return false;
  }

  return value.elements.every((element) => {
    if (!isRecord(element) || typeof element.id !== 'string' || typeof element.type !== 'string') {
      return false;
    }

    if (element.type === 'text') return typeof element.content === 'string';
    if (element.type === 'image') return typeof element.src === 'string';
    if (element.type === 'shape') return typeof element.shape === 'string';

    return false;
  });
};

const RemotionPlayer = () => {
  const searchParams = useSearchParams();
  const [selectedDimension, setSelectedDimension] = useState(dimensions[1]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [videoName, setVideoName] = useState(
    () => searchParams.get('videoName')?.trim() || 'my-video'
  );

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBackgroundImage, setIsUploadingBackgroundImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [backgroundImageUrlError, setBackgroundImageUrlError] = useState('');
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('solid');
  const [gradientStart, setGradientStart] = useState('#101827');
  const [gradientEnd, setGradientEnd] = useState('#3dd6b0');
  const [gradientAngle, setGradientAngle] = useState('135');
  const [projectFileError, setProjectFileError] = useState('');

  const totalDuration = Math.max(
    Math.round(
      slides.reduce(
        (total, slide) => total + Math.max(0.5, slide.duration ?? DEFAULT_SLIDE_DURATION) * FPS,
        0
      )
    ),
    FPS
  );

  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  useEffect(() => {
    if (!selectedSlide) return;

    const gradient = getGradientSettings(selectedSlide.backgroundColor);
    const isGradient = selectedSlide.backgroundColor.startsWith('linear-gradient(');

    setBackgroundMode(isGradient ? 'gradient' : 'solid');
    setGradientStart(gradient.start);
    setGradientEnd(gradient.end);
    setGradientAngle(gradient.angle);
  }, [selectedSlide]);

  const updateGradientBackground = (start: string, end: string, angle: string) => {
    if (!selectedSlide) return;

    handleUpdateSlide({
      ...selectedSlide,
      backgroundColor: `linear-gradient(${angle}deg, ${start}, ${end})`,
    });
  };

  const handleAddSlide = () => {
    const result = addSlide(slides);

    setSlides(result.slides);
    setSelectedSlideId(result.slide.id);
  };

  const handleUpdateSlide = (updated: Slide) => {
    setSlides((current) => updateSlide(current, updated));
  };

  const handleAddText = () => {
    if (!selectedSlide) return;

    handleUpdateSlide(addTextElement(selectedSlide));
  };

  const handleAddShape = (shape: ShapeType) => {
    if (!selectedSlide) return;
    handleUpdateSlide(addShapeElement(selectedSlide, shape));
  };

  const handleUploadImage = async (file: File) => {
    if (!selectedSlide || !isImageFile(file)) return;

    setIsUploadingImage(true);

    try {
      const src = await readImageFile(file);
      handleUpdateSlide(
        addImageElement(selectedSlide, src, file.type, file.webkitRelativePath || file.name)
      );
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!selectedSlide) return;

    const src = imageUrl.trim();

    try {
      const parsedUrl = new URL(src);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid image URL');
      }

      handleUpdateSlide(addImageElement(selectedSlide, src, undefined, src));
      setImageUrl('');
      setImageUrlError('');
    } catch {
      setImageUrlError('Enter a valid image URL.');
    }
  };

  const handleUploadBackgroundImage = async (file: File) => {
    if (!selectedSlide || !isImageFile(file)) return;

    setIsUploadingBackgroundImage(true);

    try {
      const backgroundImage = await readImageFile(file);
      handleUpdateSlide({
        ...selectedSlide,
        backgroundImage,
        backgroundImagePath: file.webkitRelativePath || file.name,
      });
      setBackgroundImageUrlError('');
    } catch (error) {
      console.error('Background image upload failed:', error);
    } finally {
      setIsUploadingBackgroundImage(false);
    }
  };

  const handleAddBackgroundImageUrl = () => {
    if (!selectedSlide) return;

    const src = backgroundImageUrl.trim();

    try {
      const parsedUrl = new URL(src);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid background image URL');
      }

      handleUpdateSlide({
        ...selectedSlide,
        backgroundImage: src,
        backgroundImagePath: src,
      });
      setBackgroundImageUrl('');
      setBackgroundImageUrlError('');
    } catch {
      setBackgroundImageUrlError('Enter a valid image URL.');
    }
  };

  const handleRemoveSlide = (id: string) => {
    const next = removeSlide(slides, id);

    setSlides(next);

    if (selectedSlideId === id) {
      setSelectedSlideId(next[0]?.id ?? null);
    }
  };

  const handleDownloadJson = () => {
    if (slides.length === 0) return;

    const exportSlides = slides.map((slide) => {
      const { backgroundImagePath, ...exportSlide } = slide;

      return {
        ...exportSlide,
        backgroundImage: backgroundImagePath ||
          (slide.backgroundImage?.startsWith('data:') ? '' : slide.backgroundImage),
        elements: slide.elements.map((element) => {
          if (!('src' in element)) return element;

          const { srcPath, ...exportElement } = element;

          return {
            ...exportElement,
            src: srcPath || (element.src.startsWith('data:') ? '' : element.src),
          };
        }),
      };
    });

    const payload = {
      videoName: videoName.trim() || 'my-video',
      slides: exportSlides,
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

  const handleUploadJson = async (file: File) => {
    try {
      const project = JSON.parse(await file.text()) as unknown;

      if (!isRecord(project) || !Array.isArray(project.slides) || !project.slides.every(isSlide)) {
        throw new Error('Invalid project file');
      }

      const importedSlides = project.slides;
      const selectedDimensionData = project.selectedDimension;
      const importedDimension = isRecord(selectedDimensionData)
        ? dimensions.find(
          (dimension) =>
            dimension.label === selectedDimensionData.label &&
            dimension.width === selectedDimensionData.width &&
            dimension.height === selectedDimensionData.height
        )
        : undefined;

      setSlides(importedSlides);
      setSelectedSlideId(importedSlides[0]?.id ?? null);
      if (typeof project.videoName === 'string') setVideoName(project.videoName);
      if (importedDimension) setSelectedDimension(importedDimension);
      setProjectFileError('');
    } catch {
      setProjectFileError('Unable to load this project JSON.');
    }
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
      const safeVideoName = (videoName.trim() || 'video')
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
        .replace(/\.+$/g, '')
        .trim() || 'video';
      a.download = `${safeVideoName}.mp4`;

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
        <h1 className="text-xl font-semibold text-ink">{videoName} Video Editor</h1>

        <p className="text-sm text-ink-muted">
          Click, drag, resize, and style text directly on the canvas.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelectedSlideId(s.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${selectedSlideId === s.id
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

      <div className="grid gap-4 rounded-xl bg-gray-950 p-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <SlideCanvas
            slide={selectedSlide}
            width={selectedDimension.width}
            height={selectedDimension.height}
            onUpdateSlide={handleUpdateSlide}
          />

         {selectedSlide && (
  <div className="mt-3 rounded-xl border border-line bg-surface/60 p-2.5">
    {/* Row 1: Background + Duration */}
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-950/50 px-2.5 py-1.5">
        <Palette className="h-3.5 w-3.5 shrink-0 text-ink-muted" />

        <div className="flex items-center rounded-md border border-line p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setBackgroundMode('solid')}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              backgroundMode === 'solid'
                ? 'bg-ink text-surface'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => {
              setBackgroundMode('gradient');
              updateGradientBackground(gradientStart, gradientEnd, gradientAngle);
            }}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              backgroundMode === 'gradient'
                ? 'bg-ink text-surface'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Gradient
          </button>
        </div>

        <span className="h-5 w-px bg-line" />

        {backgroundMode === 'solid' ? (
          <input
            type="color"
            value={selectedSlide.backgroundColor.startsWith('#') ? selectedSlide.backgroundColor : '#000000'}
            onChange={(event) =>
              handleUpdateSlide({ ...selectedSlide, backgroundColor: event.target.value })
            }
            title="Background color"
            aria-label="Solid background color"
            className="h-7 w-7 cursor-pointer appearance-none rounded-md border border-line bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={gradientStart}
              onChange={(event) => {
                setGradientStart(event.target.value);
                updateGradientBackground(event.target.value, gradientEnd, gradientAngle);
              }}
              title="Gradient start"
              aria-label="Gradient start color"
              className="h-7 w-7 cursor-pointer appearance-none rounded-md border border-line bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
            />
            <span className="text-ink-muted">→</span>
            <input
              type="color"
              value={gradientEnd}
              onChange={(event) => {
                setGradientEnd(event.target.value);
                updateGradientBackground(gradientStart, event.target.value, gradientAngle);
              }}
              title="Gradient end"
              aria-label="Gradient end color"
              className="h-7 w-7 cursor-pointer appearance-none rounded-md border border-line bg-transparent p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
            />
            <div className="flex items-center gap-1 rounded-md border border-line bg-gray-950/60 pl-2 pr-1 py-0.5">
              <input
                type="number"
                min="0"
                max="360"
                value={gradientAngle}
                onChange={(event) => {
                  const angle = String(Math.min(360, Math.max(0, Number(event.target.value) || 0)));
                  setGradientAngle(angle);
                  updateGradientBackground(gradientStart, gradientEnd, angle);
                }}
                aria-label="Gradient angle in degrees"
                className="w-9 bg-transparent text-[11px] text-ink outline-none"
              />
              <span className="text-[10px] text-ink-muted">deg</span>
            </div>
          </div>
        )}

        <span className="h-5 w-px bg-line" />

        <label className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-line px-2 text-[11px] font-medium text-ink-muted hover:bg-gray-900 hover:text-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
          <ImagePlus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{isUploadingBackgroundImage ? 'Uploading…' : 'Image'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={isUploadingBackgroundImage}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUploadBackgroundImage(file);
              event.currentTarget.value = '';
            }}
            className="sr-only"
          />
        </label>

        <div className="flex h-7 items-center gap-1 rounded-md border border-line bg-gray-950/60 pl-2 pr-0.5">
          <input
            type="url"
            value={backgroundImageUrl}
            placeholder="Background image URL"
            aria-label="Background image URL"
            onChange={(event) => {
              setBackgroundImageUrl(event.target.value);
              setBackgroundImageUrlError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAddBackgroundImageUrl();
            }}
            className="w-24 min-w-0 flex-shrink bg-transparent text-[11px] text-ink outline-none placeholder:text-ink-muted sm:w-36"
          />
          <button
            type="button"
            onClick={handleAddBackgroundImageUrl}
            className="rounded px-1.5 py-1 text-[11px] font-medium text-ink hover:bg-gray-900"
          >
            Add
          </button>
        </div>
      </div>

      <label className="flex h-9 items-center gap-1.5 rounded-lg bg-gray-950/50 px-2.5 text-[11px] font-medium text-ink-muted">
        <Clock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Duration</span>
        <input
          type="number"
          min="0.5"
          max="60"
          step="0.5"
          value={selectedSlide.duration ?? DEFAULT_SLIDE_DURATION}
          aria-label="Slide duration in seconds"
          title="Slide duration in seconds"
          onChange={(event) =>
            handleUpdateSlide({
              ...selectedSlide,
              duration: Math.min(60, Math.max(0.5, Number(event.target.value) || 0.5)),
            })
          }
          className="w-10 rounded border border-line bg-gray-950/60 px-1 py-1 text-center text-[11px] text-ink"
        />
        <span>s</span>
      </label>
    </div>

    <div className="my-2.5 h-px bg-line" />

    {/* Row 2: Insert elements + slide actions */}
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg bg-gray-950/50 p-1">
        <button
          onClick={handleAddText}
          className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-ink hover:bg-gray-900"
        >
          <Plus className="h-3.5 w-3.5" />
          Text
        </button>

        <ShapeMenu onAdd={handleAddShape} disabled={!selectedSlide} />

        <label
          title="Upload image"
          className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-ink hover:bg-gray-900 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {isUploadingImage ? 'Uploading…' : 'Image'}
          <input
            type="file"
            accept="image/*"
            disabled={isUploadingImage}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUploadImage(file);
              e.currentTarget.value = '';
            }}
            className="sr-only"
          />
        </label>
      </div>

      <div className="flex h-9 items-center gap-1 rounded-lg bg-gray-950/50 pl-2 pr-1">
        <Link className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
        <input
          type="url"
          value={imageUrl}
          placeholder="Paste image URL"
          aria-label="Image URL"
          onChange={(event) => {
            setImageUrl(event.target.value);
            setImageUrlError('');
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAddImageUrl();
          }}
          className="w-24 min-w-0 flex-shrink bg-transparent px-1 text-xs text-ink outline-none placeholder:text-ink-muted sm:w-32"
        />
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="rounded-md px-2 py-1 text-xs font-medium text-ink hover:bg-gray-900"
        >
          Add
        </button>
      </div>

      <button
        onClick={() => handleRemoveSlide(selectedSlide.id)}
        title="Delete slide"
        className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-red-950/40 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>

    {(imageUrlError || backgroundImageUrlError) && (
      <p className="mt-2 text-xs text-red-400">{imageUrlError || backgroundImageUrlError}</p>
    )}
  </div>
)}
        </div>

        <LayersPanel slide={selectedSlide} onUpdateSlide={handleUpdateSlide} />
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

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-gray-900">
            <FileUp className="h-4 w-4" />
            Upload JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUploadJson(file);
                event.currentTarget.value = '';
              }}
              className="sr-only"
            />
          </label>

          <a
            href="/ai-video-project-example.json"
            download="ai-video-project-example.json"
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-gray-900"
          >
            <FileDown className="h-4 w-4" />
            Download AI example
          </a>
        </div>

        {projectFileError && <p className="mt-2 text-xs text-red-400">{projectFileError}</p>}
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
