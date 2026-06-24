import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    // If the modal is not commanded to be open, render absolutely nothing
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-6xl',
    };

    const maxW = sizeClasses[size] || 'max-w-md';

    return (
        // The dark, blurred background overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            
            {/* The actual white modal box */}
            <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxW} max-h-[90vh] flex flex-col overflow-hidden transform transition-all`}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <h3 className="text-xl font-extrabold text-aidwise-text tracking-tight">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Modal Content (Passed in from the parent page) */}
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;