import React from 'react';

const Textarea = ({ label, name, value, onChange, placeholder, required = false, rows = 4 }) => {
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-aidwise-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aidwise-blue focus:bg-white transition-all duration-200 resize-y"
            />
        </div>
    );
};

export default Textarea;