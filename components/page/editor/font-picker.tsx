'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getAvailableFonts } from '@remotion/google-fonts';

interface FontEntry {
  fontFamily: string;
  isSystem: boolean;
  load?: () => Promise<{ loadFont: (...args: never[]) => unknown }>;
}

const SYSTEM_FONTS: FontEntry[] = ['Arial', 'Georgia', 'Courier New', 'Times New Roman'].map(
  (fontFamily) => ({ fontFamily, isSystem: true })
);

const GOOGLE_FONTS: FontEntry[] = getAvailableFonts().map((font) => ({
  fontFamily: font.fontFamily,
  isSystem: false,
  load: font.load,
}));

const ALL_FONTS: FontEntry[] = [...SYSTEM_FONTS, ...GOOGLE_FONTS].filter(
  (font, index, fonts) => fonts.findIndex((f) => f.fontFamily === font.fontFamily) === index
);

// How many fonts to reveal (and start loading) per batch, and up front.
const BATCH_SIZE = 20;

interface FontPickerProps {
  value?: string;
  onChange: (fontFamily: string) => void;
}

const FontPicker = ({ value, onChange }: FontPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loadedFamilies, setLoadedFamilies] = useState<Set<string>>(
    () => new Set(SYSTEM_FONTS.map((f) => f.fontFamily))
  );
  const loadingRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const matchedFonts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) return ALL_FONTS;

    return ALL_FONTS.filter((font) => font.fontFamily.toLowerCase().includes(trimmed));
  }, [query]);

  // Reset how many rows are revealed whenever the search term changes.
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [query]);

  const filteredFonts = useMemo(
    () => matchedFonts.slice(0, visibleCount),
    [matchedFonts, visibleCount]
  );

  const hasMore = visibleCount < matchedFonts.length;

  // Load the actual webfont for every row currently revealed.
  useEffect(() => {
    if (!open) return;

    filteredFonts.forEach((font) => {
      if (font.isSystem || !font.load) return;
      if (loadingRef.current.has(font.fontFamily) || loadedFamilies.has(font.fontFamily)) return;

      loadingRef.current.add(font.fontFamily);

      font
        .load()
        .then((loaded) => {
          loaded.loadFont();
          setLoadedFamilies((prev) => new Set(prev).add(font.fontFamily));
        })
        .catch(() => {
          loadingRef.current.delete(font.fontFamily);
        });
    });
  }, [filteredFonts, open, loadedFamilies]);

  // Reveal the next batch when the sentinel row scrolls into view.
  useEffect(() => {
    if (!open || !hasMore) return;

    const sentinel = sentinelRef.current;
    const root = listRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + BATCH_SIZE, matchedFonts.length));
        }
      },
      { root, rootMargin: '100px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, matchedFonts.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayFont = value && loadedFamilies.has(value) ? value : undefined;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-1.5 rounded border border-line bg-gray-950/60 px-2 py-1 text-xs text-ink"
        style={{ fontFamily: displayFont }}
      >
        <span className="max-w-[110px] truncate">{value || 'Select font'}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-ink-muted" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-scrim">
          <div className="flex items-center gap-1.5 border-b border-line px-2 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fonts…"
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
            />
          </div>

          <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
            {filteredFonts.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-ink-muted">No fonts found.</p>
            ) : (
              <>
                {filteredFonts.map((font) => {
                  const ready = font.isSystem || loadedFamilies.has(font.fontFamily);

                  return (
                    <button
                      key={font.fontFamily}
                      type="button"
                      onClick={() => {
                        onChange(font.fontFamily);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-gray-900 ${
                        value === font.fontFamily ? 'bg-gray-900 text-ink' : 'text-ink'
                      }`}
                    >
                      <span
                        className="truncate"
                        style={{ fontFamily: ready ? font.fontFamily : undefined }}
                      >
                        {font.fontFamily}
                      </span>
                      {!ready && (
                        <span className="ml-2 shrink-0 text-[10px] text-ink-muted">loading…</span>
                      )}
                    </button>
                  );
                })}

                {hasMore && (
                  <div ref={sentinelRef} className="px-3 py-2 text-center text-[10px] text-ink-muted">
                    Loading more fonts…
                  </div>
                )}
              </>
            )}
          </div>

          <p className="border-t border-line px-3 py-1.5 text-[10px] text-ink-muted">
            {Math.min(visibleCount, matchedFonts.length)} of {matchedFonts.length} fonts
          </p>
        </div>
      )}
    </div>
  );
};

export default FontPicker;