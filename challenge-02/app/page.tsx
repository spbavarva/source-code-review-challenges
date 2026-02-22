'use client'

import { useState } from 'react';
import { loginAction } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginAction(username, password);
            if (result.success) {
                router.push('/dashboard');
                return;
            }

            setError(result.message || 'Login failed');
        } catch {
            setError('Unexpected error while authenticating.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <section className="ledger-shell w-full max-w-md rounded-3xl p-8 shadow-[0_22px_50px_-24px_rgba(15,118,110,0.65)]">
                <header className="mb-8 text-center">
                    <p className="text-xs tracking-[0.25em] text-teal-700 uppercase">Training Lab</p>
                    <h1 className="text-3xl font-bold text-slate-900 mt-2">Northport Ledger</h1>
                    <p className="text-sm text-slate-600 mt-2 text-balance">
                        Safe server-action demo for deserialization review drills.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            placeholder="ops_admin"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="vault2026"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            required
                        />
                    </label>

                    {error && (
                        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Access Control Room'}
                    </button>
                </form>

                <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">Demo credentials</p>
                    <p className="text-xs text-amber-800 mt-1">ops_admin / vault2026</p>
                </aside>
            </section>
        </main>
    );
}
