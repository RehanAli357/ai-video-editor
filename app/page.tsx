import Link from 'next/link';
import { Wand2, Layers, Clock3, Gauge, ArrowRight, Play, Check } from 'lucide-react';

// A track segment in the hero timeline. `kind` decides the color language:
// "captured" footage reads in signal (amber), "generated" clips read in synth (violet).
type Segment = { kind: 'captured' | 'generated'; width: string; label: string };

const track: Segment[] = [
  { kind: 'captured', width: '18%', label: 'cam_a.mov' },
  { kind: 'generated', width: '26%', label: 'gen: city at dusk' },
  { kind: 'captured', width: '12%', label: 'cam_b.mov' },
  { kind: 'generated', width: '20%', label: 'gen: crowd b-roll' },
  { kind: 'captured', width: '24%', label: 'cam_a.mov' },
];

const features = [
  {
    icon: Wand2,
    title: 'Generate straight into the timeline',
    body: 'Describe a shot and it lands on the track as a clip, ready to trim, reorder, and grade like anything you filmed.',
    accent: 'synth' as const,
  },
  {
    icon: Layers,
    title: 'Unlimited tracks, one timeline',
    body: 'Stack footage, generated clips, voiceover, and captions without leaving the main cut.',
    accent: 'signal' as const,
  },
  {
    icon: Clock3,
    title: 'Frame-accurate, always',
    body: 'Every clip carries real timecode, so edits stay in sync from rough cut to final render.',
    accent: 'synth' as const,
  },
  {
    icon: Gauge,
    title: "Render queue that doesn't block you",
    body: 'Kick off a render and keep cutting. Jobs process in the background with live status.',
    accent: 'signal' as const,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* ---------- Nav ---------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-signal animate-pulse-rec" />
          <span className="font-display text-lg font-semibold text-ink">Cutaway</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#product" className="hover:text-ink transition-colors">
            Product
          </a>
          <a href="#workflow" className="hover:text-ink transition-colors">
            Workflow
          </a>
          <a href="#pricing" className="hover:text-ink transition-colors">
            Pricing
          </a>
        </nav>
        <Link
          href="/dashboard"
          className="rounded-chip bg-surface-3 border border-line px-4 py-2 text-sm text-ink hover:border-synth transition-colors"
        >
          Open dashboard
        </Link>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-chip border border-line bg-surface px-3 py-1 text-xs text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-synth" />
              Now generating in 4K
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
              Cut real footage and
              <span className="text-synth"> generated clips </span>
              on the same timeline.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ink-muted">
              Cutaway is a video editor that treats AI generation as another track — not a separate
              app. Write a shot, drop it in, keep cutting.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-chip bg-synth px-5 py-3 font-display text-sm font-semibold text-void shadow-glow-synth transition-transform hover:-translate-y-0.5"
              >
                Start editing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-chip border border-line px-5 py-3 text-sm text-ink hover:border-signal transition-colors">
                <Play className="h-4 w-4 text-signal" />
                Watch a 90s demo
              </button>
            </div>
          </div>

          {/* Signature element: a miniature timeline mixing captured + generated clips */}
          <div className="rounded-deck border border-line bg-surface p-5 shadow-scrim">
            <div className="flex items-center justify-between">
              <span className="font-mono text-timecode tracking-timecode text-ink-muted">
                00:00:42:18
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal" /> captured
                </span>
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-synth" /> generated
                </span>
              </div>
            </div>

            <div className="mt-4 flex h-16 gap-[2px] overflow-hidden rounded-thumb">
              {track.map((seg, i) => (
                <div
                  key={i}
                  style={{ width: seg.width }}
                  className={`group relative flex items-end p-1.5 ${
                    seg.kind === 'captured' ? 'bg-signal-dim' : 'bg-synth-dim'
                  }`}
                >
                  <span
                    className={`h-full w-full rounded-[2px] ${
                      seg.kind === 'captured' ? 'bg-signal/40' : 'bg-synth/40'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-ink-faint">
              <span>cam_a.mov</span>
              <span>gen: city at dusk</span>
              <span>cam_b.mov</span>
              <span>gen: crowd b-roll</span>
              <span>cam_a.mov</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
              {[
                ['Render', 'queued'],
                ['FPS', '24.00'],
                ['Length', '1:42'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</div>
                  <div className="font-mono text-sm text-ink">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="product" className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-lg font-display text-3xl font-semibold text-ink">
            One timeline. Two kinds of footage.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, body, accent }) => (
              <div key={title} className="rounded-deck border border-line bg-surface p-6">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-thumb ${
                    accent === 'synth'
                      ? 'bg-synth-dim text-synth-glow'
                      : 'bg-signal-dim text-signal-glow'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Workflow strip ---------- */}
      <section id="workflow" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            'Drop in raw footage or write a prompt for a shot',
            'Trim, reorder, and grade both kinds side by side',
            'Send to the render queue and keep cutting the next scene',
          ].map((step, i) => (
            <div key={step} className="relative pl-10">
              <span className="absolute left-0 top-0 font-mono text-sm text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-ink-muted">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pricing teaser ---------- */}
      <section id="pricing" className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Free while you&apos;re cutting your first project.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Generation minutes and render exports are metered after that — no seat fees, no surprise
            renewals.
          </p>
          <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-2 text-left text-sm text-ink-muted">
            {[
              'Unlimited tracks and timelines',
              '1080p exports included',
              'Pay only for generation minutes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-render-ok" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard"
            className="mt-9 inline-flex items-center gap-2 rounded-chip bg-signal px-5 py-3 font-display text-sm font-semibold text-void shadow-glow-signal"
          >
            Create your first project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-ink-faint">
          <span>© {new Date().getFullYear()} Cutaway</span>
          <span className="font-mono">build 00:24:11:03</span>
        </div>
      </footer>
    </div>
  );
}
