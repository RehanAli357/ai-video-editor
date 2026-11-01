'use client';

import { useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Search } from 'lucide-react';

interface UnsplashPhoto {
  id: string;
  description: string;
  smallUrl: string;
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
}

interface UnsplashImageSearchProps {
  disabled?: boolean;
  onAddAsElement: (photo: UnsplashPhoto) => void;
  onSetAsBackground: (photo: UnsplashPhoto) => void;
}

const addAttributionParams = (value: string) => {
  const url = new URL(value);
  url.searchParams.set('utm_source', 'cutaway');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
};

const UnsplashImageSearch = ({
  disabled,
  onAddAsElement,
  onSetAsBackground,
}: UnsplashImageSearchProps) => {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const loadPage = async (term: string, targetPage: number) => {
    setIsSearching(true);
    setError('');

    try {
      const params = new URLSearchParams({ query: term, page: String(targetPage) });
      const response = await fetch(`/api/images/search?${params}`);
      const data = (await response.json()) as {
        photos?: UnsplashPhoto[];
        totalPages?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Image search failed.');
      setPhotos(data.photos ?? []);
      setActiveQuery(term);
      setPage(targetPage);
      setTotalPages(data.totalPages ?? 1);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Image search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term) void loadPage(term, 1);
  };

  return (
    <section className="mt-3 border-t border-line pt-3" aria-label="Unsplash image search">
      <form onSubmit={search} className="flex max-w-xl items-center gap-2">
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-gray-950/60 px-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <input
            type="search"
            value={query}
            disabled={disabled || isSearching}
            placeholder="Search Unsplash images"
            aria-label="Search Unsplash images"
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
      {photos.length > 0 && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                <img
                  src={photo.smallUrl}
                  alt={photo.description}
                  className="h-24 w-full object-cover"
                  loading="lazy"
                />
                <div className="space-y-2 p-2">
                  <div className="flex min-w-0 items-center gap-1 truncate text-[10px] text-ink-muted">
                    <a
                      href={addAttributionParams(photo.photographerUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:text-ink"
                    >
                      {photo.photographer}
                    </a>
                    <span>/</span>
                    <a
                      href={addAttributionParams(photo.photoUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 hover:text-ink"
                    >
                      Unsplash
                    </a>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddAsElement(photo)}
                      className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                    >
                      <ImagePlus className="h-3 w-3 shrink-0" />
                      Add image
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetAsBackground(photo)}
                      className="min-w-0 flex-1 rounded border border-line px-1.5 py-1 text-[10px] font-medium text-ink hover:bg-gray-900"
                    >
                      Background
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <nav className="mt-3 flex items-center justify-center gap-3" aria-label="Image search pages">
            <button
              type="button"
              onClick={() => void loadPage(activeQuery, page - 1)}
              disabled={isSearching || page <= 1}
              className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs text-ink-muted" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => void loadPage(activeQuery, page + 1)}
              disabled={isSearching || page >= totalPages}
              className="flex h-8 items-center gap-1 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-ink hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </nav>
        </>
      )}
      {!isSearching && query && photos.length === 0 && !error && (
        <p className="mt-2 text-xs text-ink-muted">No images found.</p>
      )}
    </section>
  );
};

export default UnsplashImageSearch;