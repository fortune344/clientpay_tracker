import React, { useState } from 'react';
import { Client } from '../types';
import { Search, Plus, Trash2, Edit2, User, Mail, FileText, Sparkles, Globe, Loader2, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', notes: '' });
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.email) {
      onAddClient(newClient);
      setNewClient({ name: '', email: '', notes: '' });
      setIsModalOpen(false);
    }
  };

  const generateLogo = async (client: Client) => {
    if (generatingForId) return;

    // Check for API key for high quality image gen
    if (!window.aistudio?.hasSelectedApiKey) {
      try {
        const hasKey = await window.aistudio?.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio?.openSelectKey();
          // Assuming key selection was successful, proceed.
          // In a real app we might want to verify again, but prompts say to assume success.
        }
      } catch (e) {
        console.error(e);
      }
    }

    setGeneratingForId(client.id);
    try {
      // Re-init with potentially new key from billing selection
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: `A professional, minimalist, vector-style logo for a company named "${client.name}". White background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          },
        },
      });

      for (const part /* of response.candidates[0].content.parts */ of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          onUpdateClient(client.id, { logoUrl: imageUrl });
          break;
        }
      }
    } catch (error) {
      console.error("Image Gen Error", error);
      alert("Error generating logo. Do you have a billable account?");
    } finally {
      setGeneratingForId(null);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          New Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Name</th>

                <th className="px-6 py-4 font-semibold text-slate-600 text-sm hidden md:table-cell">Notes</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                        {client.logoUrl ? (
                          <img src={client.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          client.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{client.name}</span>
                        <span className="text-sm text-slate-500">{client.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell max-w-xs truncate">
                    {client.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {clients.length === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-lg font-medium text-slate-600">Add your first client to start tracking payments.</p>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Add Client
                        </button>
                      </div>
                    ) : (
                      "No clients found with this filter"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">New Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: Acme Corp"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="contact@acme.com"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
                    placeholder="Additional info..."
                    value={newClient.notes}
                    onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  />
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
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};