import Link from 'next/link';
import { Film, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-signal animate-pulse-rec" />
        <span className="font-display text-lg font-semibold text-ink">Tally</span>
      </div>

      {/* Signature element: a "missing frame" clip on the timeline */}
      <div className="mt-10 flex h-20 w-72 items-center justify-center rounded-thumb border border-dashed border-line bg-surface">
        <Film className="h-6 w-6 text-ink-faint" />
      </div>
      <div className="mt-3 font-mono text-timecode tracking-timecode text-ink-faint">
        --:--:--:--
      </div>

      <h1 className="mt-8 font-display text-4xl font-semibold text-ink">
        404 — <span className="text-synth">frame</span> not found
      </h1>
      <p className="mt-3 max-w-sm text-ink-muted">
        This clip isn&lsquo;t on the timeline. It may have been moved, renamed, or never rendered.
      </p>

      <Link
        href="/"
        className="mt-9 inline-flex items-center gap-2 rounded-chip bg-synth px-5 py-3 font-display text-sm font-semibold text-void shadow-glow-synth transition-transform hover:-translate-y-0.5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to start
      </Link>

      <Link href="/dashboard" className="mt-4 text-sm text-ink-faint hover:text-ink-muted">
        Or go to your dashboard
      </Link>
    </div>
  );
}
