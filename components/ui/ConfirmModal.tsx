import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    onConfirm,
    onCancel,
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            ></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`
            mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4
            ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}
          `}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
