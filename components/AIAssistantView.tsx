import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { AppState } from '../types';

interface AIAssistantViewProps {
  appState: AppState;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ appState }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Bonjour ! Je suis votre assistant financier. Je peux vous aider à analyser vos données, rédiger des emails de relance ou vous donner des conseils." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat session ref to keep history
  const chatSession = useRef<Chat | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (!chatSession.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Prepare context from app state
        const context = `
          Tu es un assistant pour une application de gestion freelance nommée "ClientPay".
          Données actuelles:
          - ${appState.clients.length} clients enregistrés.
          - ${appState.payments.length} factures au total.
          - Clients: ${appState.clients.map(c => c.name).join(', ')}.
        `;

        chatSession.current = ai.chats.create({
          model: 'gemini-3-pro-preview',
          config: {
            systemInstruction: context + " Réponds de manière concise, professionnelle et utile.",
          },
        });
      }

      const response = await chatSession.current.sendMessageStream({ message: userMsg });
      
      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); // Placeholder

      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            fullText += c.text;
            setMessages(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', text: fullText };
                return newHistory;
            });
        }
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Désolé, j'ai rencontré une erreur." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Sparkles className="text-indigo-600" size={20} />
        <h3 className="font-bold text-slate-800">Assistant Gemini</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
            )}
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'}
            `}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Bot size={18} />
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-none text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Posez une question sur vos finances..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};