'use client';
import { useEffect, useRef, useState } from 'react';
import { Type, Plus } from 'lucide-react';
import type { SlideElementType } from './types/slide';

interface AddElementMenuProps {
  onAdd: (type: SlideElementType) => void;
  disabled?: boolean;
}

const OPTIONS: { type: SlideElementType; label: string; icon: typeof Type }[] = [
  { type: 'text', label: 'Text', icon: Type },
];

const AddElementMenu = ({ onAdd, disabled }: AddElementMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add element
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-line bg-surface shadow-scrim">
          {OPTIONS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-gray-900"
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

export default AddElementMenu;
