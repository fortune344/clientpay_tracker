export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  notes?: string;
  createdAt: string;
  logoUrl?: string; // Pour l'image générée
  webSummary?: string; // Pour le search grounding
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: string; // ISO Date string
  dueDate: string; // ISO Date string
  currency: string;
  status: PaymentStatus;
  description: string;
  videoUrl?: string; // Pour la vidéo Veo
}

export interface AppState {
  clients: Client[];
  payments: Payment[];
  isPremium: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  subscriptionType?: 'monthly' | 'yearly';
}


export type View = 'DASHBOARD' | 'CLIENTS' | 'PAYMENTS' | 'UPGRADE';