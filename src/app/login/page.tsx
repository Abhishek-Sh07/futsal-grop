'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!digits || !password) {
      toast.error('Please enter phone number and password');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const email = `${digits}@futsal.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Wrong phone number or password');
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
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center mb-6 shadow-2xl">
          <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M24 8 L28 18 L38 18 L30 25 L33 35 L24 28 L15 35 L18 25 L10 18 L20 18 Z" fill="white" opacity="0.9" />
            <path d="M24 8 L24 28 M15 35 L28 18 M33 35 L20 18 M10 18 L33 18 M18 25 L30 25" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">Futsal Hisab</h1>
        <p className="text-white/70 text-sm mb-12">Team fund management made simple</p>

        {/* Login card */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-5">Sign in to your account</h2>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  autoComplete="tel"
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
