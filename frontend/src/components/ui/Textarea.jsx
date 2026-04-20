import React from 'react';

// NEW: Added 'error' to the props
const Textarea = ({ label, name, value, onChange, placeholder, required = false, rows = 4, error }) => {
    return (
        <div className="flex flex-col mb-4">
            {label && (
                <label className="mb-1.5 text-sm font-medium text-aidwise-text">
                    {label}
                </label>
            )}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                // HCI: Conditional red border
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-aidwise-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 resize-y ${
                    error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-aidwise-blue'
                }`}
            />
            {/* HCI: Inline error message */}
            {error && <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
};

export default Textarea;