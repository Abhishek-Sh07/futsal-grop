'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = identifier.trim();
    if (!value || !password) {
      toast.error('Please enter your email or phone and password');
      return;
    }
    setLoading(true);
    const supabase = createClient();

    let email = value;
    const isPhone = /^\d+$/.test(value.replace(/[\s\-+]/g, ''));

    if (isPhone) {
      const cleanPhone = value.replace(/[\s\-+]/g, '');
      // Look up the player's email from their phone number
      const { data: foundEmail } = await supabase.rpc('get_email_by_phone', { phone_input: cleanPhone });
      email = foundEmail || `${cleanPhone}@futsal.local`;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Wrong phone/email or password');
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-2xl overflow-hidden">
          <Image
            src="/logo.png"
            alt="Koteshwor Veteran Club"
            width={112}
            height={112}
            className="object-contain w-full h-full"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Futsal Hisab</h1>
        <p className="text-white/70 text-sm mb-12">Team fund management made simple</p>

        {/* Login card */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-5">Sign in to your account</h2>

            {/* Email or Phone */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="you@gmail.com or 98XXXXXXXX"
                  autoComplete="username"
                  className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-sm pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 px-6">
        <p className="text-white/50 text-xs">
          Contact your team admin to get access
        </p>
      </div>
    </div>
  );
}
