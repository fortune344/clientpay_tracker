import React, { useState } from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Bell, Shield, Globe, ArrowRight, Menu, X, ChevronDown } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
    onSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: <Globe className="text-indigo-600" size={24} />,
            title: "Smart Multi-Currency",
            desc: "Work with clients in USA, Europe or Africa. The dashboard converts and unifies everything automatically (EUR, USD, XOF...)."
        },
        {
            icon: <Bell className="text-indigo-600" size={24} />,
            title: "Automated Reminders",
            desc: "Get paid faster. ClientPay detects late payments and prepares your reminder emails in one click."
        },
        {
            icon: <TrendingUp className="text-indigo-600" size={24} />,
            title: "Cashflow Forecasting",
            desc: "Forecast your revenue for the next 3 months. Visualize your future cashflow to invest better."
        },
        {
            icon: <Shield className="text-indigo-600" size={24} />,
            title: "Exports & Security",
            desc: "Generate professional PDF reports and Excel exports for your accountant. Your data is secure."
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">ClientPay</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
                            <div className="flex items-center gap-4">
                                <button onClick={onLogin} className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                                    Sign In
                                </button>
                                <button onClick={onSignup} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                                    Get Started Free
                                </button>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 p-4 space-y-4">
                        <a href="#features" className="block text-sm font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <a href="#pricing" className="block text-sm font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <button onClick={() => { onLogin(); setIsMobileMenuOpen(false); }} className="w-full py-2 text-center text-sm font-semibold text-slate-900 border border-slate-200 rounded-lg">
                                Sign In
                            </button>
                            <button onClick={() => { onSignup(); setIsMobileMenuOpen(false); }} className="w-full py-2 text-center bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                                Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles size={12} fill="currentColor" />
                    New: Multi-Currency Support & PDF Exports
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
                    Stop chasing <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">your payments.</span>
                </h1>
                <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The all-in-one solution for freelancers who want to secure their cashflow. Track invoices, send one-click reminders, and sleep easy.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <button onClick={onSignup} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                        Create Free Account
                        <ArrowRight size={20} />
                    </button>
                    <button onClick={onLogin} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors">
                        Sign In
                    </button>
                </div>

                {/* Hero Visual/Mockup Placeholder */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 mx-auto max-w-5xl aspect-video group cursor-default">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="mx-auto w-1/3 h-5 bg-slate-100 rounded-md text-[10px] text-slate-400 flex items-center justify-center">clientpay.app/dashboard</div>
                    </div>
                    {/* Abstract Representation of Dashboard */}
                    <div className="p-8 pt-16 grid grid-cols-3 gap-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-32 animate-pulse space-y-3">
                            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                            <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
                        </div>
                        <div className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-32 animate-pulse delay-75 space-y-3">
                            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                            <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
                        </div>
                        <div className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-32 animate-pulse delay-150 space-y-3">
                            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                            <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
                        </div>
                        <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm h-64 mt-4">
                            <div className="flex items-end justify-between h-full gap-2 px-4 pb-2">
                                <div className="w-full bg-indigo-100 rounded-t-lg h-[40%]"></div>
                                <div className="w-full bg-indigo-200 rounded-t-lg h-[60%]"></div>
                                <div className="w-full bg-indigo-500 rounded-t-lg h-[80%]"></div>
                                <div className="w-full bg-indigo-600 rounded-t-lg h-[50%]"></div>
                                <div className="w-full bg-indigo-400 rounded-t-lg h-[70%]"></div>
                            </div>
                        </div>
                        <div className="col-span-1 bg-white p-4 rounded-xl shadow-sm h-64 mt-4">
                            {/* List items */}
                            <div className="space-y-4">
                                <div className="h-10 w-full bg-red-50 rounded-lg border border-red-100"></div>
                                <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100"></div>
                                <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100"></div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={onSignup} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                            View Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything to manage your clients</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Powerful tools designed specifically for freelancers and small agencies.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Start small, grow big</h2>
                        <p className="text-slate-500">Start for free, upgrade when you scale.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="p-8 rounded-3xl border border-slate-200 hover:border-slate-300 transition-colors">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                            <div className="text-4xl font-extrabold text-slate-900 mb-6">Free</div>
                            <p className="text-slate-500 mb-8 border-b border-slate-100 pb-8">For freelancers just starting out.</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 size={20} className="text-green-500" /> 3 Clients
                                </li>
                                <li className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 size={20} className="text-green-500" /> 5 Active Invoices
                                </li>
                                <li className="flex items-center gap-3 text-slate-600">
                                    <CheckCircle2 size={20} className="text-green-500" /> Basic Dashboard
                                </li>
                            </ul>
                            <button onClick={onSignup} className="w-full py-4 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold transition-colors">
                                Create Account
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 rounded-3xl border-2 border-indigo-600 bg-indigo-50/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Premium</h3>
                            <div className="text-4xl font-extrabold text-slate-900 mb-6">5€<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                            <p className="text-slate-500 mb-8 border-b border-indigo-100 pb-8">For those who want to scale.</p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-slate-900 font-medium">
                                    <CheckCircle2 size={20} className="text-indigo-600" /> Unlimited Clients
                                </li>
                                <li className="flex items-center gap-3 text-slate-900 font-medium">
                                    <CheckCircle2 size={20} className="text-indigo-600" /> Unlimited Invoices
                                </li>
                                <li className="flex items-center gap-3 text-slate-900 font-medium">
                                    <CheckCircle2 size={20} className="text-indigo-600" /> PDF & CSV Reports
                                </li>
                                <li className="flex items-center gap-3 text-slate-900 font-medium">
                                    <CheckCircle2 size={20} className="text-indigo-600" /> Advanced Dashboard (Forecast)
                                </li>
                            </ul>
                            <button onClick={onSignup} className="w-full py-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
                                Try Premium
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                                <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center text-white text-xs font-bold">C</div>
                                <span className="text-white font-bold text-lg">ClientPay</span>
                            </div>
                            <p className="text-sm">Simplify your billing.</p>
                        </div>
                        <div className="flex gap-8 text-sm">
                            <a href="#" className="hover:text-white transition-colors">Legal</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-center">
                        © {new Date().getFullYear()} ClientPay Tracker. Made with ❤️ for freelancers.
                    </div>
                </div>
            </footer>
        </div>
    );
};
