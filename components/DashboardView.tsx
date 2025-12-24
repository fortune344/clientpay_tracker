import React, { useMemo, useState } from 'react';
import { Client, Payment, PaymentStatus } from '../types';
import { ArrowUpRight, AlertCircle, Clock, CheckCircle2, TrendingUp, Lock, Crown, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Tooltip
} from 'recharts';
import { convertCurrency, formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  clients: Client[];
  payments: Payment[];
}

/* Old format removed */

/* AI Audio Logic Removed - Superfluous */


export const DashboardView: React.FC<DashboardViewProps> = ({ clients, payments }) => {
  const { isPremium, upgradeToPremium } = useAuth();
  const [displayCurrency, setDisplayCurrency] = useState('EUR');

  // Cleaned up stats using normalized currency
  const stats = useMemo(() => {
    const calculateTotal = (filteredPayments: Payment[]) => {
      return filteredPayments.reduce((sum, p) => {
        return sum + convertCurrency(p.amount, p.currency || 'EUR', displayCurrency);
      }, 0);
    };

    const paidTotal = calculateTotal(payments.filter(p => p.status === PaymentStatus.PAID));
    const pendingTotal = calculateTotal(payments.filter(p => p.status === PaymentStatus.PENDING));
    const overdueTotal = calculateTotal(payments.filter(p => p.status === PaymentStatus.OVERDUE));
    const overdueCount = payments.filter(p => p.status === PaymentStatus.OVERDUE).length;

    return { paidTotal, pendingTotal, overdueTotal, overdueCount };
  }, [payments, displayCurrency]);

  const availableCurrencies = ['EUR', 'USD', 'XOF', 'CAD', 'CHF', 'GBP']; // Simplified list for UI

  const chartData = useMemo(() => {
    const today = new Date();
    const data: { name: string; revenu: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      const year = d.getFullYear();
      const monthIndex = d.getMonth();

      const monthlyAmount = payments
        .filter(p => {
          if (p.status !== PaymentStatus.PAID) return false;
          const pDate = new Date(p.date);
          return pDate.getMonth() === monthIndex && pDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + convertCurrency(p.amount, p.currency || 'EUR', displayCurrency), 0);

      data.push({
        name: monthName,
        revenu: monthlyAmount
      });
    }
    return data;
  }, [payments, displayCurrency]);

  const criticalPayments = payments
    .filter(p => p.status === PaymentStatus.OVERDUE)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const mostCriticalPayment = criticalPayments[0];
  const mostCriticalClient = mostCriticalPayment ? clients.find(c => c.id === mostCriticalPayment.clientId) : null;

  // Premium: Top Clients Calculation
  const topClients = useMemo(() => {
    const clientRevenue: { [key: string]: number } = {};
    payments.forEach(p => {
      if (p.status === PaymentStatus.PAID) {
        const amountInDisplay = convertCurrency(p.amount, p.currency || 'EUR', displayCurrency);
        clientRevenue[p.clientId] = (clientRevenue[p.clientId] || 0) + amountInDisplay;
      }
    });
    return Object.entries(clientRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([clientId, amount]) => ({
        client: clients.find(c => c.id === clientId),
        amount
      }));
  }, [clients, payments, displayCurrency]);

  // Premium: Forecast Calculation
  const forecastData = useMemo(() => {
    const today = new Date();
    const nextMonths = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });

      let pending = 0;
      payments.forEach(p => {
        if (p.status === PaymentStatus.PENDING) {
          const pDate = new Date(p.dueDate);
          if (pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear()) {
            pending += convertCurrency(p.amount, p.currency || 'EUR', displayCurrency);
          }
        }
      });
      nextMonths.push({ name: monthName, pending });
    }
    return nextMonths;
  }, [payments, displayCurrency]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>
        <h2 className="text-xl font-bold text-slate-800 md:hidden">Dashboard</h2>

      </div>

      {mostCriticalPayment && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start sm:items-center justify-between shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5 sm:mt-0" size={24} />
            <div>
              <h3 className="font-bold text-red-800">Overdue Invoice</h3>
              <p className="text-sm text-red-700 font-medium">
                {mostCriticalClient?.name || 'Unknown Client'} – {formatCurrency(mostCriticalPayment.amount, mostCriticalPayment.currency || 'EUR')}
              </p>
            </div>
          </div>
          <button className="text-sm font-semibold bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors shadow-sm">
            Remind
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overdue Card - FIRST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-1 ring-red-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-500 mb-1">Overdue ({stats.overdueCount})</p>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.overdueTotal, displayCurrency)}</h3>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertCircle size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600 font-medium cursor-pointer hover:underline">
            View {stats.overdueCount} overdue
            <ArrowUpRight size={16} className="ml-1" />
          </div>
        </div>

        {/* Paid Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Collected</p>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.paidTotal, displayCurrency)}</h3>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp size={16} className="mr-1" />
            <span>+12% vs last month</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.pendingTotal, displayCurrency)}</h3>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-400">
            Invoices sent, not yet due
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Monthly Revenue</h3>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              className="text-sm border-slate-200 rounded-lg p-1 bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {availableCurrencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}k ${displayCurrency === 'EUR' ? '€' : displayCurrency === 'USD' ? '$' : displayCurrency}`}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value, displayCurrency), 'Revenue']}
                />
                <Bar dataKey="revenu" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#4f46e5" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Payments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Priority Reminders</h3>
          <div className="space-y-4">
            {criticalPayments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                <p>No overdue payments!</p>
              </div>
            ) : (
              criticalPayments.map(payment => {
                const client = clients.find(c => c.id === payment.clientId);
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <p className="font-semibold text-slate-800">{client?.name || 'Unknown'}</p>
                      <p className="text-xs text-red-600 font-medium">Due on {new Date(payment.dueDate).toLocaleDateString('en-US')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(payment.amount, payment.currency || 'EUR')}</p>
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Remind</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Premium Section: Top Clients & Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

        {/* Top Clients */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${!isPremium ? 'blur-sm select-none opacity-60' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
              <Star size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Top Clients</h3>
          </div>

          <div className="space-y-3">
            {topClients.map(({ client, amount }, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-slate-700">{client?.name || 'Deleted Client'}</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(amount, displayCurrency)}</span>
              </div>
            ))}
            {topClients.length === 0 && <p className="text-slate-400 text-center py-4">No data available</p>}
          </div>
        </div>

        {/* Cashflow Forecast */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ${!isPremium ? 'blur-sm select-none opacity-60' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Forecast (3 months)</h3>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="pending" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50 max-w-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg shadow-orange-200">
                <Crown size={24} fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Débloquez les Statistiques Pro</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Accédez au classement de vos meilleurs clients et anticipez votre trésorerie sur 3 mois.
              </p>
              <button
                onClick={upgradeToPremium}
                className="w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Passer Premium
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};