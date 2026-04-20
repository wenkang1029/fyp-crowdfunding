import React, { useState } from 'react';

// NEW: Added 'error' to the props
const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false, error }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const currentInputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="flex flex-col mb-4">
            {label && (
                <label className="mb-1.5 text-sm font-medium text-aidwise-text">
                    {label}
                </label>
            )}
            
            <div className="relative w-full">
                <input
                    type={currentInputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    // HCI: If there is an error, make the border red!
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-aidwise-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 pr-12 ${
                        error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-aidwise-blue'
                    }`}
                />
                
                {isPasswordType && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-aidwise-blue transition-colors focus:outline-none"
                    >
                        {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                )}
            </div>
            {/* HCI: Display the specific error message right below the input */}
            {error && <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
};

export default Input;