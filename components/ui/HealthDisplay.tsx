import React from 'react';
import { Heart } from 'lucide-react';

interface HealthDisplayProps {
    current: number;
    max: number;
    heartSize?: number;
    className?: string;
    showText?: boolean;
}

export const HealthDisplay: React.FC<HealthDisplayProps> = ({
    current,
    max,
    heartSize = 24,
    className = '',
    showText = true
}) => {
    // Logic: Each heart is worth 10 HP
    // Max hearts = max / 10
    const totalHearts = Math.ceil(max / 10);

    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            <div className="flex gap-1 flex-wrap justify-center">
                {Array.from({ length: totalHearts }).map((_, index) => {
                    const heartValue = (index + 1) * 10;
                    const prevHeartValue = index * 10;

                    // Calculate fill percentage for this specific heart
                    // If current HP is greater than this heart's max value, it's 100%
                    // If current HP is less than this heart's start value, it's 0%
                    // Otherwise it's fractional
                    let fillPercentage = 0;

                    if (current >= heartValue) {
                        fillPercentage = 100;
                    } else if (current > prevHeartValue) {
                        fillPercentage = ((current - prevHeartValue) / 10) * 100;
                    }

                    return (
                        <div key={index} className="relative" style={{ width: heartSize, height: heartSize }}>
                            {/* Background Heart (Empty/Grey) */}
                            <Heart
                                size={heartSize}
                                className="text-slate-200 dark:text-slate-800 absolute inset-0"
                                strokeWidth={2.5}
                            />

                            {/* Foreground Heart (Red Check) - Masked width */}
                            <div
                                className="absolute inset-0 overflow-hidden transition-all duration-500 ease-in-out"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Heart
                                    size={heartSize}
                                    className="text-red-500 fill-red-500"
                                    strokeWidth={2.5}
                                    style={{ minWidth: heartSize, width: heartSize }} // Prevent squishing
                                />
                            </div>

                            {/* Border Overlay (for clean edges on partial fill) */}
                            <Heart
                                size={heartSize}
                                className="text-black/5 dark:text-white/5 absolute inset-0 pointer-events-none"
                                strokeWidth={2.5}
                            />
                        </div>
                    );
                })}
            </div>

            {showText && (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                    {current}/{max} HP
                </span>
            )}
        </div>
    );
};
