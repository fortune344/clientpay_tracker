import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { PaymentsView } from './components/PaymentsView';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { UpgradeView } from './components/UpgradeView';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { View, Client, Payment, PaymentStatus } from './types';
import { MAX_FREE_CLIENTS, MAX_FREE_PAYMENTS } from './constants';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { LandingPage } from './components/LandingPage';


// Adapters for DB <-> Frontend types
const mapClientFromDB = (row: any): Client => ({
  id: row.id,
  name: row.name,
  email: row.email,
  notes: row.notes,
  createdAt: row.created_at,
  logoUrl: row.logo_url,
  webSummary: row.web_summary
});

const mapPaymentFromDB = (row: any): Payment => ({
  id: row.id,
  clientId: row.client_id,
  amount: row.amount,
  status: row.status as PaymentStatus,
  description: row.description,
  date: row.date,
  dueDate: row.due_date,
  currency: row.currency || 'EUR', // Fallback for old data
  videoUrl: row.video_url
});

const AppContent: React.FC = () => {
  const { user, isPremium, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('cp_has_started') === 'true';
  });

  // App State
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state

  const { showToast } = useToast();

  // Modal State for confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const handleStart = () => {
    setHasStarted(true);
    localStorage.setItem('cp_has_started', 'true');
  };

  // Fetch Data on User Login
  useEffect(() => {
    if (!user) {
      setClients([]);
      setPayments([]);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const { data: clientsData, error: clientsError } = await supabase.from('clients').select('*');
        if (clientsError) throw clientsError;
        setClients(clientsData.map(mapClientFromDB));

        const { data: paymentsData, error: paymentsError } = await supabase.from('payments').select('*');
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData.map(mapPaymentFromDB));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  // Client Actions
  const handleAddClient = async (newClient: Omit<Client, 'id' | 'createdAt'>) => {
    if (!isPremium && clients.length >= MAX_FREE_CLIENTS) {
      showToast(`Limit reached (${MAX_FREE_CLIENTS} clients). Upgrade to Premium!`, "error");
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.from('clients').insert([{
        user_id: user.id,
        name: newClient.name,
        email: newClient.email,
        notes: newClient.notes,
        logo_url: newClient.logoUrl,
        web_summary: newClient.webSummary
      }]).select();

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }
      setClients([...clients, mapClientFromDB(data[0])]);
      setCurrentView('CLIENTS');
      showToast("Client added successfully", "success");
    } catch (e: any) {
      console.error(e);
      showToast(`Error adding client: ${e.message || e.error_description || 'Unknown'}`, "error");
    } finally { setLoading(false); }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.logoUrl) dbUpdates.logo_url = updates.logoUrl;
      if (updates.webSummary) dbUpdates.web_summary = updates.webSummary;

      const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Client?',
      message: 'All associated invoices will also be deleted. This action is irreversible.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          const { error } = await supabase.from('clients').delete().eq('id', clientId);
          if (error) throw error;
          setClients(clients.filter(c => c.id !== clientId));
          setPayments(payments.filter(p => p.clientId !== clientId));
          showToast("Client deleted", "success");
        } catch (e) { console.error(e); showToast("Deletion error", "error"); } finally { setLoading(false); setConfirmModal(prev => ({ ...prev, isOpen: false })); }
      }
    });
  };

  // Payment Actions
  const handleAddPayment = async (newPayment: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!isPremium && payments.length >= MAX_FREE_PAYMENTS) {
      showToast("Limit reached (5 invoices). Upgrade to Premium!", "error");
      return;
    }

    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.from('payments').insert([{
        user_id: user.id,
        client_id: newPayment.clientId,
        amount: newPayment.amount,
        currency: newPayment.currency,
        description: newPayment.description,
        date: newPayment.date,
        due_date: newPayment.dueDate,
        status: newPayment.status,
        video_url: newPayment.videoUrl
      }]).select();

      if (error) throw error;
      setPayments([...payments, { ...mapPaymentFromDB(data[0]), status: PaymentStatus.PENDING }]); // Optimistic update
      setCurrentView('PAYMENTS');
      showToast("Invoice created successfully", "success");
    } catch (e) {
      console.error(e);
      showToast("Error creating invoice", "error");
    } finally { setLoading(false); }
  };

  const handleUpdatePaymentStatus = async (id: string, status: PaymentStatus) => {
    try {
      const { error } = await supabase.from('payments').update({ status }).eq('id', id);
      if (error) throw error;
      setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.videoUrl) dbUpdates.video_url = updates.videoUrl;

      const { error } = await supabase.from('payments').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setPayments(payments.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Invoice?',
      message: 'This action is irreversible.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setLoading(true);
          const { error } = await supabase.from('payments').delete().eq('id', paymentId);
          if (error) throw error;
          setPayments(payments.filter(p => p.id !== paymentId));
          showToast("Invoice deleted", "success");
        } catch (e) { console.error(e); showToast("Deletion error", "error"); } finally { setLoading(false); setConfirmModal(prev => ({ ...prev, isOpen: false })); }
      }
    });
  };

  const [showLanding, setShowLanding] = useState(!user);

  useEffect(() => {
    if (user) setShowLanding(false);
  }, [user]);

  const renderContent = () => {
    if (loadingData || loading) { // Added general loading state
      return <div className="flex h-full items-center justify-center"><div className="animate-spin text-indigo-600">⌛</div></div>;
    }

    if (!user) {
      if (showLanding) {
        return <LandingPage onLogin={() => setShowLanding(false)} onSignup={() => setShowLanding(false)} />;
      }
      return <AuthView />;
    }

    switch (currentView) {
      case 'DASHBOARD':
        return <DashboardView clients={clients} payments={payments} />;
      case 'CLIENTS':
        return <ClientsView clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} />;
      case 'PAYMENTS':
        return <PaymentsView payments={payments} clients={clients} onAddPayment={handleAddPayment} onUpdateStatus={handleUpdatePaymentStatus} onUpdatePayment={handleUpdatePayment} onDeletePayment={handleDeletePayment} />;
      case 'UPGRADE':
        return <UpgradeView />;
      default:
        return <DashboardView clients={clients} payments={payments} />;
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Flow: Landing -> Auth -> App
  if (!hasStarted) {
    return <LandingView onStart={handleStart} />;
  }

  const overdueCount = payments.filter(p => p.status === PaymentStatus.OVERDUE).length;

  if (showLanding && !user) {
    return <LandingPage onLogin={() => setShowLanding(false)} onSignup={() => setShowLanding(false)} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => setShowLanding(true)} className="text-slate-500 hover:text-indigo-600 font-medium text-sm">
            ← Back to Home
          </button>
        </div>
        <AuthView />
      </div>
    );
  }

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      payments={payments}
      clients={clients}
    >
      {renderContent()}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDestructive={confirmModal.isDestructive}
      />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;