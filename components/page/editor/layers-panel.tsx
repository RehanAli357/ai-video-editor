'use client';

import { ChevronDown, ChevronUp, Circle, Image, Trash2, Type } from 'lucide-react';
import type { Slide } from './types/slide';
import { moveElementLayer, removeElement, updateElementLabel } from './actions/slide-actions';
import { updateShapeElement } from './actions/shape-actions';
import {
  ANIMATION_OPTIONS,
  updateElementAnimation,
  updateElementAnimationTiming,
} from './actions/animation-actions';

interface LayersPanelProps {
  slide: Slide | undefined;
  onUpdateSlide: (updated: Slide) => void;
}

const getElementLabel = (element: Slide['elements'][number]): string => {
  if (element.label?.trim()) return element.label.trim();
  if (element.type === 'image') return 'Image';
  if (element.type === 'shape') return `${element.shape} shape`;

  const text = element.content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.slice(0, 28) || 'Text';
};

const LayersPanel = ({ slide, onUpdateSlide }: LayersPanelProps) => {
  if (!slide) {
    return (
      <aside className="rounded-xl border border-line bg-surface/40 p-3 text-xs text-ink-muted">
        Add a slide to see its layers.
      </aside>
    );
  }

  const layers = [...slide.elements].reverse();

  const handleMove = (elementId: string, direction: 'up' | 'down') => {
    onUpdateSlide(moveElementLayer(slide, elementId, direction));
  };

  const handleRemove = (elementId: string) => {
    onUpdateSlide(removeElement(slide, elementId));
  };

  return (
    <aside className="flex h-[420px] min-h-0 flex-col rounded-xl border border-line bg-surface/40 p-3">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Layers</h2>
          <p className="text-[10px] text-ink-muted">Top layer renders in front</p>
        </div>
        <span className="rounded-md bg-gray-950/60 px-2 py-1 text-[10px] text-ink-muted">
          {layers.length}
        </span>
      </div>

      {layers.length === 0 ? (
        <p className="py-5 text-center text-xs text-ink-muted">No elements in this slide.</p>
      ) : (
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {layers.map((element, index) => {
            const Icon = element.type === 'text' ? Type : element.type === 'image' ? Image : Circle;
            const label = getElementLabel(element);

            return (
              <div
                key={element.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2 gap-y-1.5 rounded-lg border border-line bg-surface px-2 py-2"
              >
                <Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={element.label ?? label}
                    placeholder={label}
                    aria-label={`Layer label for ${label}`}
                    onChange={(event) =>
                      onUpdateSlide(updateElementLabel(slide, element.id, event.target.value))
                    }
                    className="w-full truncate bg-transparent text-xs font-medium text-ink outline-none placeholder:text-ink"
                  />
                  <p className="text-[10px] text-ink-muted">Level {layers.length - index}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${label} layer`}
                  title="Delete layer"
                  onClick={() => handleRemove(element.id)}
                  className="rounded p-1 text-ink-muted hover:bg-red-950/40 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="col-span-3 flex min-w-0 flex-wrap items-center justify-end gap-1.5">
                  {element.type === 'shape' && (
                    <input
                      type="color"
                      value={element.fill}
                      aria-label={`Color for ${label}`}
                      title="Shape color"
                      onChange={(event) =>
                        onUpdateSlide(updateShapeElement(slide, element.id, { fill: event.target.value }))
                      }
                      className="h-5 w-7 shrink-0 cursor-pointer rounded border border-line bg-transparent p-0"
                    />
                  )}
                  <select
                    value={element.animation ?? 'none'}
                    aria-label={`Animation for ${label}`}
                    title="Element animation"
                    onChange={(event) =>
                      onUpdateSlide(
                        updateElementAnimation(
                          slide,
                          element.id,
                          event.target.value as NonNullable<typeof element.animation>
                        )
                      )
                    }
                    className="min-w-0 max-w-full rounded border border-line bg-gray-950/60 px-1 py-1 text-[10px] text-ink"
                  >
                    {ANIMATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-[10px] text-ink-muted">
                    <span>Dur</span>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={element.animationDuration ?? 0.5}
                      aria-label={`Animation duration for ${label}`}
                      title="Animation duration in seconds"
                      onChange={(event) =>
                        onUpdateSlide(
                          updateElementAnimationTiming(slide, element.id, {
                            animationDuration: Math.max(0.1, Number(event.target.value) || 0.1),
                          })
                        )
                      }
                      className="w-12 rounded border border-line bg-gray-950/60 px-1 py-1 text-[10px] text-ink"
                    />
                    <span>s</span>
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-ink-muted">
                    <span>Delay</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={element.animationDelay ?? 0}
                      aria-label={`Animation delay for ${label}`}
                      title="Animation delay in seconds"
                      onChange={(event) =>
                        onUpdateSlide(
                          updateElementAnimationTiming(slide, element.id, {
                            animationDelay: Math.max(0, Number(event.target.value) || 0),
                          })
                        )
                      }
                      className="w-12 rounded border border-line bg-gray-950/60 px-1 py-1 text-[10px] text-ink"
                    />
                    <span>s</span>
                  </label>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      aria-label={`Move ${label} up one layer`}
                      title="Move up one layer"
                      disabled={index === 0}
                      onClick={() => handleMove(element.id, 'up')}
                      className="rounded p-0.5 text-ink-muted hover:bg-gray-900 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${label} down one layer`}
                      title="Move down one layer"
                      disabled={index === layers.length - 1}
                      onClick={() => handleMove(element.id, 'down')}
                      className="rounded p-0.5 text-ink-muted hover:bg-gray-900 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default LayersPanel;
