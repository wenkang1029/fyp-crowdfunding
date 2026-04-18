import React from 'react';
import Card from './Card';

const StatCard = ({ title, value, icon: Icon, trend }) => {
    return (
        <Card className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
                {/* Dynamically render the Lucide icon passed as a prop */}
                {Icon && <div className="p-2 bg-aidwise-blue/10 text-aidwise-blue rounded-xl"><Icon size={20} /></div>}
            </div>
            
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-aidwise-text tracking-tight">{value}</span>
                
                {/* Optional: Show an upward/downward trend if provided */}
                {trend && (
                    <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </Card>
    );
};

export default StatCard;