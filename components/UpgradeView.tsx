import React, { useState } from 'react';
import { Check, Star, Shield, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UpgradeView: React.FC = () => {
    const { user, isPremium, upgradeToPremium } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        await upgradeToPremium();
        setLoading(false);
    };

    if (isPremium) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-indigo-50 p-6 rounded-full mb-6">
                    <Star size={48} className="text-indigo-600 fill-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">You are Premium!</h2>
                <p className="text-slate-600 max-w-md mb-8">
                    Thank you for supporting ClientPay Tracker. You have access to all advanced features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <Check className="text-green-500 shrink-0" /> <span>Unlimited Clients & Payments</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <Check className="text-green-500 shrink-0" /> <span>PDF & CSV Exports</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <Check className="text-green-500 shrink-0" /> <span>Automatic Reminders</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Upgrade to Pro</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Automate reminders, analyze revenue, and track every payment effortlessly.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-slate-100 p-1 rounded-xl flex items-center relative">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                    >
                        Yearly <span className="text-green-600 text-xs ml-1 font-bold">-20%</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Free Tier */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
                    <p className="text-slate-500 mb-6">Perfect for getting started.</p>
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-slate-900">$0</span>
                        <span className="text-slate-500"> / month</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-600">
                            <Check size={18} className="text-slate-400" /> 5 Clients max
                        </li>
                        <li className="flex items-center gap-3 text-slate-600">
                            <Check size={18} className="text-slate-400" /> 5 Invoices max
                        </li>
                        <li className="flex items-center gap-3 text-slate-600">
                            <Check size={18} className="text-slate-400" /> Basic Dashboard
                        </li>
                    </ul>
                    <button disabled className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 font-medium cursor-not-allowed">
                        Current Plan
                    </button>
                </div>

                {/* Premium Tier */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                        RECOMMENDED
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        Premium <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    </h3>
                    <p className="text-slate-400 mb-6">For ambitious freelancers.</p>
                    <div className="mb-6">
                        <span className="text-4xl font-bold text-white">{billingCycle === 'monthly' ? '$5' : '$50'}</span>
                        <span className="text-slate-400"> / {billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-slate-300">
                            <Check size={18} className="text-green-400" /> <strong>Unlimited</strong> Clients
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Check size={18} className="text-green-400" /> <strong>Unlimited</strong> Invoices
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Zap size={18} className="text-yellow-400" /> <strong>Automatic Reminders</strong>
                        </li>
                        <li className="flex items-center gap-3 text-slate-300">
                            <Shield size={18} className="text-indigo-400" /> PDF & CSV Exports
                        </li>
                    </ul>
                    <div className="bg-indigo-800/50 rounded-xl p-4 text-center border border-indigo-700/50">
                        <p className="font-bold text-white mb-1">Coming Soon</p>
                        <p className="text-xs text-indigo-200">
                            Premium features are currently in development. Stay tuned for the release!
                        </p>
                    </div>

                    <button
                        disabled
                        className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold mt-4 cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Activate Now (Unavailable)
                    </button>
                </div>
            </div>
        </div>
    );
};
