export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-void text-ink-muted">
      <div className="flex items-center gap-3 text-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-signal" />
        Loading editor...
      </div>
    </div>
  );
}