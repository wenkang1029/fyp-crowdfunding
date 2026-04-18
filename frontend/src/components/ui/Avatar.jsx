import React from 'react';

const Avatar = ({ name, className = '' }) => {
    // Helper function to extract up to 2 initials from the user's name
    const getInitials = (fullName) => {
        if (!fullName) return 'U'; // Fallback to 'U' for User
        const words = fullName.trim().split(' ');
        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    return (
        <div className={`flex items-center justify-center bg-aidwise-blue text-white font-semibold rounded-full h-10 w-10 shrink-0 shadow-sm ${className}`}>
            {getInitials(name)}
        </div>
    );
};

export default Avatar;