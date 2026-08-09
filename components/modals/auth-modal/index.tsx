'use client';

import DynamicForm from '@/components/common/form-inputs';
import { authFormFields, loginFormFields } from './form-config/fields';
import {
  AuthFormSchemaType,
  authFormSchema,
  LoginFormSchemaType,
  loginFormSchema,
} from './form-config/schema';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

interface AuthModalProps {
  mode?: 'login' | 'signup';
}

export function AuthModal({ mode = 'signup' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState<'login' | 'signup'>(mode === 'login' ? 'login' : 'signup');
  const handleFormSubmit = async (data: AuthFormSchemaType | LoginFormSchemaType) => {
    try {
      if (isLogin === 'login') {
        const result = await signIn('credentials', {
          username: data.username,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          console.error(result.error);
          return;
        } else {
          toast.success('Logged in successfully');
        }
        return;
      }

      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: (data as AuthFormSchemaType).email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || result.error || 'An error occurred during signup');
        console.error(result.message || result.error);
        return;
      } else {
        toast.success(result.message || 'Account created successfully');
      }

      // Automatically log the user in after signup
      const loginResult = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        toast.error(loginResult.error || 'An error occurred during login');
        console.error(loginResult.error);
        return;
      } else {
        toast.success('Logged in successfully');
      }

      window.location.reload();
    } catch (error) {
      toast.error('An error occurred during authentication');
      console.error('Authentication failed:', error);
    }
  };

  const title = isLogin === 'signup' ? 'Create your account' : 'Sign in to Cutaway';
  const subtitle =
    isLogin === 'signup'
      ? 'Get started with AI-assisted editing and save your projects in one place.'
      : 'Sign in to continue editing your captured and generated clips in one timeline.';
  const buttonText = isLogin === 'signup' ? 'Create account' : 'Sign in';

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-scrim">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-synth">
            {isLogin === 'signup' ? 'Join the timeline' : 'Welcome back'}
          </p>
          <h2 className="text-3xl font-semibold text-ink">{title}</h2>
          <p className="max-w-xl text-sm leading-6 text-ink-muted">{subtitle}</p>
        </div>

        <div className="mt-8">
          <DynamicForm
            fields={isLogin === 'login' ? loginFormFields : authFormFields}
            schema={isLogin === 'login' ? loginFormSchema : authFormSchema}
            onSubmit={
              handleFormSubmit as (data: AuthFormSchemaType | LoginFormSchemaType) => Promise<void>
            }
            btnText={buttonText}
            buttonInline={false}
          />
          <p>
            {isLogin === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span
              onClick={() => setIsLogin(isLogin === 'login' ? 'signup' : 'login')}
              className="text-synth hover:text-synth/70 transition-colors cursor-pointer"
            >
              {isLogin === 'login' ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-gray-950/90 p-5 text-sm text-ink-muted">
        <p className="mb-3 font-semibold text-ink">Why sign up?</p>
        <ul className="space-y-3 text-sm leading-6">
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-synth" />
            Secure account access for saved edits and renders.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
            Keep generated clips, timelines, and drafts synced across devices.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-ink" />
            Start cutting faster with a workspace that remembers your settings.
          </li>
        </ul>
      </div>
    </div>
  );
}
