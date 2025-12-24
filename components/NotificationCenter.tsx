import React, { useState, useMemo } from 'react';
import { Bell, AlertCircle, Send, Check, X, Crown } from 'lucide-react';
import { Payment, PaymentStatus, Client } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NotificationCenterProps {
    payments: Payment[];
    clients: Client[];
    onNavigateToUpgrade: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ payments, clients, onNavigateToUpgrade }) => {
    const { isPremium, upgradeToPremium } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [sentReminders, setSentReminders] = useState<string[]>([]);

    const overduePayments = useMemo(() => {
        return payments.filter(p => p.status === PaymentStatus.OVERDUE);
    }, [payments]);

    const handleSendReminder = (paymentId: string, clientEmail?: string, amount?: number, currency?: string) => {
        if (!isPremium) return;

        // Simulate sending email (in a real app, this would call an API)
        // For now, we open mailto
        if (clientEmail) {
            const subject = encodeURIComponent(`Reminder: Overdue Invoice`);
            const body = encodeURIComponent(`Hello,\n\nWe noticed that the invoice for ${amount} ${currency} is still pending.\n\nPlease proceed with the payment at your earliest convenience.\n\nBest regards.`);
            window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`);
        }

        setSentReminders(prev => [...prev, paymentId]);

        // Auto-close after action? Optional.
        // setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50"
            >
                <Bell size={24} />
                {overduePayments.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {overduePayments.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Notifications
                                {overduePayments.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{overduePayments.length} overdue</span>}
                            </h3>
                            {isPremium && (
                                <button onClick={() => setSentReminders([...overduePayments.map(p => p.id)])} className="text-xs text-indigo-600 font-medium hover:underline">
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {!isPremium ? (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Crown size={24} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-1">Automate your reminders</h4>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Upgrade to Premium to send automatic reminders and track unpaid invoices effortlessly.
                                    </p>
                                    <button
                                        onClick={() => { setIsOpen(false); onNavigateToUpgrade(); }}
                                        className="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        Discover Premium
                                    </button>
                                </div>
                            ) : overduePayments.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Check size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Everything is up to date! 🎉</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {overduePayments.map(payment => {
                                        const client = clients.find(c => c.id === payment.clientId);
                                        const isSent = sentReminders.includes(payment.id);

                                        return (
                                            <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{client?.name || 'Unknown Client'}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {payment.description} • <span className="text-red-500 font-medium">Due on {new Date(payment.dueDate).toLocaleDateString()}</span>
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-slate-900 text-sm">{payment.amount} {payment.currency}</p>
                                                </div>

                                                {isSent ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-2 bg-green-50 px-2 py-1 rounded w-fit">
                                                        <Check size={12} />
                                                        Reminder sent
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendReminder(payment.id, client?.email, payment.amount, payment.currency)}
                                                        className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium mt-2 w-full justify-center group"
                                                    >
                                                        <Send size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                                        Send a reminder
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
