import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';

interface LandingViewProps {
    onStart: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900">ClientPay</span>
                </div>
                <button
                    onClick={onStart}
                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                    Se connecter
                </button>
            </nav>

            {/* Hero Section */}
            <header className="px-6 pt-16 pb-24 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Nouvelle Beta Disponible
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    Track clients. <span className="text-indigo-600">Track payments.</span><br />
                    Get paid faster.
                </h1>

                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Arrêtez de courir après vos paiements manuellement. Une solution simple et professionnelle pour les freelances qui veulent être payés à temps.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                        Join the beta
                        <ArrowRight size={20} />
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors">
                        Voir la démo
                    </button>
                </div>
            </header>

            {/* Problem/Solution Section */}
            <section className="bg-slate-50 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-slate-900">Pourquoi perdre du temps sur la compta ?</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">Fini les oublis de factures</h3>
                                        <p className="text-slate-600">Ne laissez plus jamais une facture impayée passer à travers les mailles du filet.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">Automatisation simple</h3>
                                        <p className="text-slate-600">Les statuts se mettent à jour automatiquement. Vos relances sont prêtes en un clic.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abstract Screenshot / UI Mockup */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-2xl"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="h-2 w-32 bg-slate-100 rounded-full ml-4"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">⚠️</div>
                                            <div>
                                                <div className="h-2 w-24 bg-red-200 rounded-full mb-2"></div>
                                                <div className="h-2 w-16 bg-red-100 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-20 bg-white rounded-lg"></div>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
                                            <div>
                                                <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                                                <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 opacity-40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full shadow-sm"></div>
                                            <div>
                                                <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                                                <div className="h-2 w-16 bg-slate-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA */}
            <footer className="py-12 text-center">
                <p className="text-slate-500 mb-4">Rejoignez les premiers utilisateurs beta</p>
                <button
                    onClick={onStart}
                    className="text-indigo-600 font-bold hover:text-indigo-800 underline decoration-2 underline-offset-4"
                >
                    Commencer maintenant
                </button>
            </footer>
        </div>
    );
};
