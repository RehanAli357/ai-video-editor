'use client';

import { SignInButton, SignUpButton } from '@clerk/nextjs';

interface AuthModalProps {
  mode: 'login' | 'signup';
}

export function AuthModal({ mode }: AuthModalProps) {
  return (
    <div className="w-full rounded-2xl bg-void p-2 text-ink sm:p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-muted">Secure access</p>
          <h3 className="font-display text-xl font-semibold text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface/80 p-2">
        {mode === 'login' ? (
          <SignInButton>
            <button className="bg-synth w-full text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign In With Clerk
            </button>
          </SignInButton>
        ) : (
          <SignUpButton>
            <button className="bg-synth w-full text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up With Clerk
            </button>
          </SignUpButton>
        )}
      </div>
    </div>
  );
}
