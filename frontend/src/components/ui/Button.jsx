import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', // default to our AidWise blue
    className = '' 
}) => {
    // These styles apply to ALL buttons (Apple vibe: rounded-xl, soft shadow, scale-down click effect)
    const baseStyle = "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aidwise-blue shadow-apple active:scale-95 flex items-center justify-center";

    // These styles change based on the 'variant' we choose
    const variants = {
        primary: "bg-aidwise-blue text-white hover:bg-blue-700 hover:shadow-apple-lg",
        secondary: "bg-white text-aidwise-text border border-aidwise-border hover:bg-gray-50 hover:shadow-apple-lg",
        danger: "bg-red-500 text-white hover:bg-red-600 hover:shadow-apple-lg focus:ring-red-500"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;