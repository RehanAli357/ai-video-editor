'use client';
import { Film, Trash2, Plus } from 'lucide-react';
import type { Slide, SlideElement } from './types/slide';
import { addSlide, removeElement, removeSlide, updateBackground, updateSlideElement } from './actions/slide-actions';
import { addTextElement } from './actions/text-actions';
import SlideElementEditor from './slide-element-editor';

interface SlidesPanelProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSlidesChange: (slides: Slide[]) => void;
  onSelectSlide: (id: string) => void;
}

const SlidesPanel = ({
  slides,
  selectedSlideId,
  onSlidesChange,
  onSelectSlide,
}: SlidesPanelProps) => {
  const handleAddSlide = () => {
    const result = addSlide(slides);
    onSlidesChange(result.slides);
    onSelectSlide(result.slide.id);
  };

  const handleRemoveSlide = (id: string) => {
    const next = removeSlide(slides, id);
    onSlidesChange(next);
    if (selectedSlideId === id) {
      onSelectSlide(next[0]?.id ?? '');
    }
  };

  const handleAddText = (slideId: string) => {
    onSlidesChange(
      slides.map((slide) => (slide.id === slideId ? addTextElement(slide) : slide))
    );
  };

  const handleUpdateElement = (slideId: string, updated: SlideElement) => {
    onSlidesChange(
      slides.map((slide) => (slide.id === slideId ? updateSlideElement(slide, updated) : slide))
    );
  };

  const handleRemoveElement = (slideId: string, elementId: string) => {
    onSlidesChange(
      slides.map((slide) => (slide.id === slideId ? removeElement(slide, elementId) : slide))
    );
  };

  const handleUpdateBackground = (slideId: string, backgroundColor: string) => {
    onSlidesChange(
      slides.map((slide) =>
        slide.id === slideId ? updateBackground(slide, backgroundColor) : slide
      )
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-line bg-gray-950/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-ink">
          <Film className="h-4 w-4" />
          Slides
        </h3>
        <button
          type="button"
          onClick={handleAddSlide}
          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-surface hover:opacity-90"
        >
          + Add slide
        </button>
      </div>

      {slides.length === 0 && (
        <p className="text-xs text-ink-muted">No slides yet. Add one to get started.</p>
      )}

      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(slide.id)}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              selectedSlideId === slide.id
                ? 'border-ink bg-surface'
                : 'border-line bg-surface/40 hover:bg-surface/70'
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                {index + 1}. {slide.name}
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1">
                  <label className="text-[10px] font-medium text-ink-muted">BG</label>
                  <input
                    type="color"
                    value={slide.backgroundColor}
                    onChange={(e) => handleUpdateBackground(slide.id, e.target.value)}
                    className="h-5 w-8 cursor-pointer rounded border border-line bg-transparent p-0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddText(slide.id)}
                  className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-900"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add text
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveSlide(slide.id)}
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-gray-900 hover:text-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {slide.elements.length > 0 && (
              <div className="space-y-2">
                {slide.elements.map((el) => (
                  <SlideElementEditor
                    key={el.id}
                    element={el}
                    onUpdate={(updated) => handleUpdateElement(slide.id, updated)}
                    onRemove={() => handleRemoveElement(slide.id, el.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidesPanel;
