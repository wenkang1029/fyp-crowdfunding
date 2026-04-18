import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-apple p-6 md:p-8 ${className}`}>
            {children}
        </div>
    );
};

export default Card;