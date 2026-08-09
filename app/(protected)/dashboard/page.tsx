'use client';
import {
  Search,
  Plus,
  Film,
  Clapperboard,
  LayoutGrid,
  Sparkles,
  Users,
  Settings,
  HardDrive,
  Clock,
  Play,
  MoreHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ---- mock data -------------------------------------------------------

type ProjectStatus = 'ready' | 'rendering' | 'failed';

interface Project {
  id: string;
  title: string;
  duration: string; // HH:MM:SS:FF
  updated: string;
  status: ProjectStatus;
  progress?: number; // 0-100, only for 'rendering'
  accent: 'synth' | 'signal';
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Rooftop teaser — director cut',
    duration: '00:02:14:08',
    updated: '2h ago',
    status: 'rendering',
    progress: 64,
    accent: 'synth',
  },
  {
    id: '2',
    title: 'Product launch // 30s',
    duration: '00:00:31:02',
    updated: '5h ago',
    status: 'ready',
    accent: 'signal',
  },
  {
    id: '3',
    title: 'Interview — raw assembly',
    duration: '00:18:42:19',
    updated: '1d ago',
    status: 'ready',
    accent: 'synth',
  },
  {
    id: '4',
    title: 'Vertical reel v3',
    duration: '00:01:05:11',
    updated: '1d ago',
    status: 'failed',
    accent: 'signal',
  },
  {
    id: '5',
    title: 'Conference recap',
    duration: '00:04:57:00',
    updated: '3d ago',
    status: 'ready',
    accent: 'synth',
  },
  {
    id: '6',
    title: 'B-roll compile — coastal',
    duration: '00:07:23:14',
    updated: '4d ago',
    status: 'rendering',
    progress: 22,
    accent: 'signal',
  },
];

const stats = [
  { label: 'Active renders', value: '2', icon: Clapperboard },
  { label: 'Hours edited', value: '128.4', icon: Clock },
  { label: 'Storage used', value: '340GB', icon: HardDrive },
  { label: 'Clips captured', value: '1,902', icon: Film },
];

const navItems = [
  { label: 'Projects', icon: LayoutGrid, active: true },
  { label: 'Generate', icon: Sparkles, active: false },
  { label: 'Team', icon: Users, active: false },
  { label: 'Settings', icon: Settings, active: false },
];

// ---- signature element: timeline ruler --------------------------------

function TimelineRuler({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="shrink-0 font-mono text-[11px] tracking-timecode text-ink-faint uppercase">
        {label}
      </span>
      <div
        className="h-3 flex-1 opacity-70"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, var(--color-line) 0, var(--color-line) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(to right, var(--color-line) 0, var(--color-line) 1px, transparent 1px, transparent 40px)',
          backgroundSize: '8px 6px, 40px 12px',
          backgroundPosition: 'left bottom, left top',
          backgroundRepeat: 'repeat-x',
        }}
      />
    </div>
  );
}

// ---- status chip --------------------------------------------------------

function StatusChip({ status, progress }: { status: ProjectStatus; progress?: number }) {
  const config = {
    ready: { color: 'var(--color-render-ok)', label: 'Ready', pulse: false },
    rendering: {
      color: 'var(--color-render-wait)',
      label: `Rendering ${progress ?? 0}%`,
      pulse: true,
    },
    failed: { color: 'var(--color-render-err)', label: 'Failed', pulse: false },
  }[status];

  return (
    <div className="inline-flex items-center gap-1.5 rounded-chip border border-line bg-surface-2/80 px-2.5 py-1 backdrop-blur-sm">
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.pulse ? 'animate-pulse-rec' : ''}`}
        style={{ backgroundColor: config.color }}
      />
      <span className="font-mono text-[11px] tracking-timecode text-ink-muted">{config.label}</span>
    </div>
  );
}

// ---- frame-strip thumbnail (signature motif on cards) -------------------

function FilmThumb({ accent }: { accent: 'synth' | 'signal' }) {
  const glow = accent === 'synth' ? 'var(--color-synth-dim)' : 'var(--color-signal-dim)';
  const line = accent === 'synth' ? 'var(--color-synth)' : 'var(--color-signal)';

  return (
    <div
      className="relative h-36 w-full overflow-hidden rounded-thumb border border-line"
      style={{
        background: `radial-gradient(120% 140% at 20% 0%, ${glow} 0%, var(--color-surface-2) 55%)`,
      }}
    >
      {/* sprocket rail, top and bottom — reads as filmstrip, not decoration */}
      {[0, 1].map((row) => (
        <div
          key={row}
          className={`absolute left-0 right-0 flex justify-between px-2 ${row === 0 ? 'top-1.5' : 'bottom-1.5'}`}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="h-1 w-1.5 rounded-[1px] bg-void/60" />
          ))}
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform group-hover:scale-110"
          style={{
            borderColor: line,
            backgroundColor: 'color-mix(in oklab, var(--color-void) 55%, transparent)',
          }}
        >
          <Play size={14} style={{ color: line }} fill={line} />
        </div>
      </div>
    </div>
  );
}

// ---- project card ---------------------------------------------------

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex flex-col gap-3 rounded-deck border border-line bg-surface-2 p-3 transition-colors hover:border-ink-faint">
      <FilmThumb accent={project.accent} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-medium text-ink">{project.title}</h3>
          <p className="mt-0.5 font-mono text-[11px] tracking-timecode text-ink-faint">
            {project.duration}{' '}
            <span className="text-ink-faint/60">· updated {project.updated}</span>
          </p>
        </div>
        <button className="shrink-0 rounded-md p-1 text-ink-faint hover:bg-surface-3 hover:text-ink">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <StatusChip status={project.status} progress={project.progress} />
      </div>

      {project.status === 'rendering' && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${project.progress}%`, backgroundColor: 'var(--color-render-wait)' }}
          />
        </div>
      )}
    </div>
  );
}

// ---- dashboard page ---------------------------------------------------

const DashboardPage = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen bg-void text-ink">
      {/* sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-synth">
            <Clapperboard size={14} className="text-ink" />
          </div>
          <span className="font-display text-base font-semibold tracking-tight">Cutaway</span>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-surface-3 text-ink'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 rounded-deck border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between font-mono text-[11px] tracking-timecode text-ink-muted">
            <span>Storage</span>
            <span>340GB / 500GB</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full w-[68%] rounded-full bg-synth" />
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 px-8 py-6">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Projects</h1>
            <p className="text-sm text-ink-muted">6 projects · 2 rendering</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-deck border border-line bg-surface-2 px-3 py-2">
              <Search size={14} className="text-ink-faint" />
              <input
                placeholder="Search projects"
                className="w-48 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                router.push('/editor');
              }}
              className="flex items-center gap-2 rounded-deck bg-signal px-4 py-2 text-sm font-medium text-void shadow-glow-signal transition-transform hover:scale-[1.02]"
            >
              <Plus size={15} />
              New project
            </button>
          </div>
        </div>

        {/* stats strip */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-deck border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.14em] text-ink-faint">{label}</span>
                <Icon size={14} className="text-ink-faint" />
              </div>
              <p className="mt-2 font-mono text-2xl tracking-timecode text-ink">{value}</p>
            </div>
          ))}
        </div>

        <TimelineRuler label="00:00:00:00" />

        {/* project grid */}
        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
