import React, { useState } from 'react';
import { Client, Payment, PaymentStatus } from '../types';
import { Search, Plus, Filter, CheckCircle2, Clock, AlertCircle, Trash2, Video, Loader2, PlayCircle, Download, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentsViewProps {
  payments: Payment[];
  clients: Client[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
  onUpdatePayment: (id: string, updates: Partial<Payment>) => void;
  onDeletePayment: (id: string) => void;
}

const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'Dollar US' },
  { code: 'GBP', symbol: '£', label: 'Livre Sterling' },
  { code: 'CAD', symbol: 'C$', label: 'Dollar Canadien' },
  { code: 'XOF', symbol: 'CFA', label: 'Franc CFA' },
  { code: 'CHF', symbol: 'CHF', label: 'Franc Suisse' },
  { code: 'JPY', symbol: '¥', label: 'Yen Japonais' },
  { code: 'AUD', symbol: 'A$', label: 'Dollar Australien' },
  { code: 'CNY', symbol: '¥', label: 'Yuan Renminbi' },
  { code: 'INR', symbol: '₹', label: 'Roupie Indienne' },
  { code: 'BRL', symbol: 'R$', label: 'Réal Brésilien' },
  { code: 'ZAR', symbol: 'R', label: 'Rand Sud-Africain' },
];

const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currencyCode }).format(amount);
  } catch (e) {
    return `${amount} ${currencyCode}`;
  }
};


export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  clients,
  onAddPayment,
  onUpdateStatus,
  onUpdatePayment,
  onDeletePayment
}) => {
  const { isPremium } = useAuth();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingVideoId, setGeneratingVideoId] = useState<string | null>(null);

  // New Payment Form State
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PENDING);

  const filteredPayments = payments.filter(p => filter === 'ALL' || p.status === filter);




  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 size={12} className="mr-1" /> Paid</span>;
      case PaymentStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1" /> Pending</span>;
      case PaymentStatus.OVERDUE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1" /> Overdue</span>;
    }
  };

  const generateThankYouVideo = async (payment: Payment) => {
    if (generatingVideoId) return;

    try {
      // Check Billing
      if (!window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio?.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio?.openSelectKey();
        }
      }

      setGeneratingVideoId(payment.id);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const clientName = clients.find(c => c.id === payment.clientId)?.name || "Client";

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A professional 5 second motion graphic video saying 'Thank You ${clientName}' in elegant corporate typography with abstract geometric background. Smooth animation.`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        onUpdatePayment(payment.id, { videoUrl });
      }

    } catch (error) {
      console.error("Veo Error:", error);
      alert("Error generating video. Check your billing account.");
    } finally {
      setGeneratingVideoId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId && amount && dueDate) {
      onAddPayment({
        clientId,
        amount: parseFloat(amount),
        currency,
        description: description || 'Prestation de service',
        date: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        status: status
      });
      setIsModalOpen(false);
      // Reset form
      setClientId('');
      setAmount('');
      setCurrency('EUR');
      setDescription('');
      setDueDate('');
      setStatus(PaymentStatus.PENDING);
    }
  };

  const handleExportCSV = () => {
    if (!isPremium) {
      showToast("Premium Feature 💎. Export your data with the Pro version.", "error");
      return;
    }
    const headers = ['Description', 'Client', 'Montant', 'Devise', 'Date', 'Statut'];
    const rows = filteredPayments.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      return [
        p.description,
        client?.name || 'Inconnu',
        p.amount,
        p.currency,
        new Date(p.date).toLocaleDateString(),
        p.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(";") + "\n"
      + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `paiements_clientpay_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!isPremium) {
      showToast("Premium Feature 💎. Generate PDF reports with the Pro version.", "error");
      return;
    }
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Payments Report - ClientPay", 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const rows = filteredPayments.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      return [
        new Date(p.date).toLocaleDateString(),
        client?.name || '-',
        p.description,
        `${p.amount} ${p.currency}`,
        p.status
      ];
    });

    autoTable(doc, {
      head: [['Date', 'Client', 'Description', 'Montant', 'Statut']],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`rapport_clientpay_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.PAID)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === PaymentStatus.PAID ? 'bg-green-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.PENDING)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === PaymentStatus.PENDING ? 'bg-yellow-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter(PaymentStatus.OVERDUE)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === PaymentStatus.OVERDUE ? 'bg-red-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
          >
            Overdue
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-medium">
              <Download size={20} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-1 hidden group-hover:block z-20">
              <button onClick={handleExportCSV} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                <FileText size={16} /> CSV (Excel)
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                <FileText size={16} className="text-red-500" /> PDF (Report)
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Invoice</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Description</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Client</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Due Date</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => {
                const client = clients.find(c => c.id === payment.clientId);
                return (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{payment.description}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                            {client.logoUrl ? <img src={client.logoUrl} className="w-full h-full object-cover" /> : client.name.substring(0, 2).toUpperCase()}
                          </div>
                          {client.name}
                        </div>
                      ) : 'Client deleted'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(payment.dueDate).toLocaleDateString('en-US')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.videoUrl && (
                          <a href={payment.videoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
                            <PlayCircle size={16} />
                          </a>
                        )}
                        {payment.status === PaymentStatus.PAID && !payment.videoUrl && (
                          <button
                            onClick={() => generateThankYouVideo(payment)}
                            disabled={generatingVideoId === payment.id}
                            className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-1 rounded border border-purple-100"
                            title="Generate thank you video (Veo)"
                          >
                            {generatingVideoId === payment.id ? <Loader2 size={12} className="animate-spin" /> : <Video size={12} />}
                            Thank You
                          </button>
                        )}
                        {payment.status !== PaymentStatus.PAID && (
                          <button
                            onClick={() => onUpdateStatus(payment.id, PaymentStatus.PAID)}
                            className="text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePayment(payment.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    {payments.length === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-lg font-medium text-slate-600">No invoices yet.</p>
                        <p className="text-sm text-slate-500">Create your first invoice to start tracking your collections.</p>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Create Invoice
                        </button>
                      </div>
                    ) : (
                      "No payments found for this filter"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">New Invoice</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                >
                  <option value="">Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ex: Website Redesign"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="px-2 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {status === PaymentStatus.PAID ? "Payment Date" : "Due Date"}
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex gap-2">
                  {[PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.OVERDUE].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${status === s
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {s === PaymentStatus.PENDING && 'Pending'}
                      {s === PaymentStatus.PAID && 'Paid'}
                      {s === PaymentStatus.OVERDUE && 'Overdue'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};