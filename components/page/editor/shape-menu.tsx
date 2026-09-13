'use client';

import { Circle, Diamond, RectangleHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ShapeType } from './types/slide';

interface ShapeMenuProps {
  onAdd: (shape: ShapeType) => void;
  disabled?: boolean;
}

const OPTIONS: { shape: ShapeType; label: string; icon: typeof Circle }[] = [
  { shape: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { shape: 'circle', label: 'Circle', icon: Circle },
  { shape: 'triangle', label: 'Triangle', icon: Diamond },
];

const ShapeMenu = ({ onAdd, disabled }: ShapeMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RectangleHorizontal className="h-3.5 w-3.5" />
        Add shape
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-lg border border-line bg-surface shadow-scrim">
          {OPTIONS.map(({ shape, label, icon: Icon }) => (
            <button
              key={shape}
              type="button"
              onClick={() => {
                onAdd(shape);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink hover:bg-gray-900"
            >
              <Icon className="h-4 w-4 text-ink-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShapeMenu;
