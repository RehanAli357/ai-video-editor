'use client';

import dynamic from 'next/dynamic';

function EditorLoader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-void text-ink-muted">
      <div className="flex items-center gap-3 text-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-signal" />
        Loading editor...
      </div>
    </div>
  );
}

const RemotionPlayer = dynamic(() => import('@/components/page/editor/player'), {
  ssr: false,
  loading: () => <EditorLoader />,
});

const EditorPage = () => {
  return <RemotionPlayer />;
};

export default EditorPage;
