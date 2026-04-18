import React, { useState } from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, required = false }) => {
    // State to track if the password should be visible
    const [showPassword, setShowPassword] = useState(false);
    
    // Determine if this specific input is a password field
    const isPasswordType = type === 'password';
    
    // Dynamically change the input type based on the toggle state
    const currentInputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="flex flex-col mb-4">
            {label && (
                <label className="mb-1.5 text-sm font-medium text-aidwise-text">
                    {label}
                </label>
            )}
            
            {/* relative container allows us to position the toggle button absolutely inside it */}
            <div className="relative w-full">
                <input
                    type={currentInputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-aidwise-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-aidwise-blue focus:bg-white transition-all duration-200 pr-12"
                />
                
                {/* The HCI Password Toggle Button */}
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
        </div>
    );
};

export default Input;