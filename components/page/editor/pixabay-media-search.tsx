'use client';

import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Music2, Search, Video } from 'lucide-react';

type SearchMode = 'image' | 'gif' | 'video' | 'audio';

interface PixabayResult {
  id: string;
  type: 'image' | 'gif' | 'video';
  description: string;
  previewUrl: string;
  mediaUrl: string;
  mimeType: string;
  creator: string;
  pageUrl: string;
}

interface PixabayMediaSearchProps {
  disabled?: boolean;
  onAddImage: (result: PixabayResult) => void;
  onSetImageBackground: (result: PixabayResult) => void;
  onSetVideoBackground: (result: PixabayResult) => void;
  onAddVideoLayer: (result: PixabayResult) => void;
}

const modes: { value: SearchMode; label: string }[] = [
  { value: 'image', label: 'Images' },
  { value: 'gif', label: 'GIFs' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
];

const PixabayMediaSearch = ({
  disabled,
  onAddImage,
  onSetImageBackground,
  onSetVideoBackground,
  onAddVideoLayer,
}: PixabayMediaSearchProps) => {
  const [mode, setMode] = useState<SearchMode>('image');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState<PixabayResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const loadPage = async (term: string, searchMode: SearchMode, targetPage: number) => {
    if (searchMode === 'audio') return;

    setIsSearching(true);
    setError('');

    try {
      const params = new URLSearchParams({ query: term, type: searchMode, page: String(targetPage) });
      const response = await fetch(`/api/pixabay/search?${params}`);
      const data = (await response.json()) as {
        results?: PixabayResult[];
        totalPages?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Pixabay search failed.');

      setResults(data.results ?? []);
      setActiveQuery(term);
      setPage(targetPage);
      setTotalPages(data.totalPages ?? 1);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Pixabay search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term && mode !== 'audio') void loadPage(term, mode, 1);
  };

  const changeMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    setResults([]);
    setPage(1);
    setTotalPages(1);
    setError('');
  };

  return (
    <section className="mt-3 border-t border-line pt-3" aria-label="Pixabay media search">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1" role="tablist" aria-label="Pixabay media type">
          {modes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => changeMode(value)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${mode === value ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-ink-muted">Search via Pixabay</span>
      </div>

      {mode === 'audio' ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface/60 p-3">
          <Music2 className="h-4 w-4 shrink-0 text-ink-muted" />
          <p className="min-w-0 flex-1 text-xs text-ink-muted">
            Pixabay&apos;s public API supports image and video search, but not audio search. Find a track on Pixabay Music, then add its URL using the audio controls above.
          </p>
          <a
            href={`https://pixabay.com/music/search/${encodeURIComponent(query.trim())}/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-gray-900"
          >
            <Search className="h-3.5 w-3.5" />
            Search music
          </a>
        </div>
      ) : (
        <>
          <form onSubmit={search} className="mt-2 flex max-w-xl items-center gap-2">
            <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-gray-950/60 px-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <input
                type="search"
                value={query}
                disabled={disabled || isSearching}
                placeholder={`Search Pixabay ${mode === 'gif' ? 'GIFs' : `${mode}s`}`}
                aria-label={`Search Pixabay ${mode === 'gif' ? 'GIFs' : `${mode}s`}`}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
            <button
              type="submit"
              disabled={disabled || isSearching || !query.trim()}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              Search
            </button>
          </form>

          {error && <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>}
          {results.length > 0 && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((result) => (
                  <article key={result.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                    {result.type === 'video' ? (
                      result.previewUrl ? (
                        <img src={result.previewUrl} alt={result.description} className="h-24 w-full object-cover" loading="lazy" />
                      ) : (
                        <video src={result.mediaUrl} muted playsInline className="h-24 w-full object-cover" />
                      )
                    ) : (
                      <img src={result.previewUrl} alt={result.description} className="h-24 w-full object-cover" loading="lazy" />
                    )}
                    <div className="space-y-2 p-2">
                      <a href={result.pageUrl} target="_blank" rel="noreferrer" className="block truncate text-[10px] text-ink-muted hover:text-ink">
                        {result.creator} / Pixabay
                      </a>
                      {result.type === 'video' ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAddVideoLayer(result)}
                            className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                          >
                            <Video className="h-3 w-3" />
                            Add layer
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetVideoBackground(result)}
                            className="min-w-0 flex-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                          >
                            Background
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAddImage(result)}
                            className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                          >
                            <ImagePlus className="h-3 w-3 shrink-0" />
                            Add layer
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetImageBackground(result)}
                            className="min-w-0 flex-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                          >
                            Background
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <nav className="mt-3 flex items-center justify-center gap-3" aria-label="Pixabay search pages">
                <button
                  type="button"
                  onClick={() => void loadPage(activeQuery, mode, page - 1)}
                  disabled={isSearching || page <= 1}
                  className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <span className="text-xs text-ink-muted" aria-live="polite">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => void loadPage(activeQuery, mode, page + 1)}
                  disabled={isSearching || page >= totalPages}
                  className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </nav>
            </>
          )}
          {!isSearching && query && results.length === 0 && !error && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span>No results on this page.</span>
              {mode === 'gif' && (
                <a
                  href={`https://pixabay.com/gifs/search/${encodeURIComponent(query.trim())}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-ink underline underline-offset-2 hover:text-signal"
                >
                  Browse Pixabay GIFs
                </a>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default PixabayMediaSearch;