import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToast({ message, type, id });
    }, []);

    const closeToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
