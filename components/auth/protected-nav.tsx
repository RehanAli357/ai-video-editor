'use client';

import { signOut } from 'next-auth/react';

export function ProtectedNav({ userName }: { userName?: string | null }) {
  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4 text-white">
      <span className="text-sm">Signed in as {userName || 'user'}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="rounded bg-synth px-4 py-2 text-white hover:bg-synth-dim"
      >
        Sign Out
      </button>
    </nav>
  );
}
