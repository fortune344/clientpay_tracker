import React, { useState } from 'react';
import { View, Client, Payment } from '../types';
import { LayoutDashboard, Users, CreditCard, LogOut, CheckCircle2, User, Menu, X, Crown, ArrowUpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onChangeView: (view: View) => void;
  payments: Payment[];
  clients: Client[];
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentView,
  onChangeView,
  payments,
  clients
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isPremium, signOut } = useAuth();

  const navItems = [
    { id: 'DASHBOARD' as View, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'CLIENTS' as View, label: 'Clients', icon: Users },
    { id: 'PAYMENTS' as View, label: 'Paiements', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <h1 className="text-xl font-bold text-indigo-600">ClientPay</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <span className="text-xl font-bold text-slate-800 block leading-none">ClientPay</span>
            <span className="text-[10px] text-slate-500 font-medium">Track clients. Get paid.</span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${currentView === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-4 mt-auto">
          {isPremium ? (
            <div className="bg-indigo-900/5 p-3 rounded-lg border border-indigo-100 flex items-center gap-2">
              <div className="bg-indigo-600 rounded-full p-1 text-white">
                <Sparkles size={12} fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-800">Premium Active</p>
                <p className="text-[10px] text-slate-500">Unlimited Clients</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onChangeView('UPGRADE'); setIsMobileMenuOpen(false); }}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Sparkles size={16} />
              Go Premium
            </button>
          )}
        </div>



        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 border border-indigo-100 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs overflow-hidden">
              {user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 px-2 py-1 text-sm transition-colors"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {navItems.find(n => n.id === currentView)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <NotificationCenter payments={payments} clients={clients} onNavigateToUpgrade={() => onChangeView('UPGRADE')} />
          </div>
        </header>
        <div className="p-4 md:p-8 pb-20">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};