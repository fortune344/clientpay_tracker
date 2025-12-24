import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animation in
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation out
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="text-white" size={24} />,
        error: <XCircle className="text-white" size={24} />,
        info: <Info className="text-white" size={24} />
    };

    const bgColors = {
        success: 'bg-emerald-500/90',
        error: 'bg-red-500/90',
        info: 'bg-indigo-500/90'
    };

    return (
        <div
            className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100]
        flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-md
        transition-all duration-300 ease-out
        ${bgColors[type]} text-white
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
      `}
        >
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                {icons[type]}
            </div>
            <p className="font-medium text-sm pr-4 shadow-sm">{message}</p>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
            </button>
        </div>
    );
};
