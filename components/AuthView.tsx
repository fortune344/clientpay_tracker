import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, ArrowRight, User } from 'lucide-react';

export const AuthView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage('Account created! Please sign in.');
                setIsLogin(true); // Auto twitch to login
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 text-center bg-indigo-600">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-2xl">
                        C
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {isLogin ? 'Welcome back!' : 'Create an account'}
                    </h2>
                    <p className="text-indigo-100 mt-2 text-sm">
                        {isLogin ? 'Sign in to manage your payments' : 'Join ClientPay for free'}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleAuth} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                ⚠️ {error === 'Invalid login credentials' ? 'Invalid email or password' : error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                                ✅ {message}
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Your Name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="vous@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {isLogin ? 'Sign In' : "Sign Up"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                        >
                            {isLogin ? "No account yet? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};
