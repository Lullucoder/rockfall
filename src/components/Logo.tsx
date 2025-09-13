import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6', 
    large: 'w-8 h-8'
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl ${sizeClasses[size]} ${className}`}>
        <Shield className={`${iconSizeClasses[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-white rounded-xl overflow-hidden ${sizeClasses[size]} ${className}`}>
      <img 
        src="https://lh3.googleusercontent.com/pw/AP1GczPglrA4_0VH4D4-HVTxLCzhgo03yutjZ0y2oaOPKt1F1USiPTctVYfNsPHlFHbQ9O4Jt9IC4EpxK-yjeZ0R3BZn-Iy0_pmGK1P5iu3akaBYVQdblZp0nuquViOFRjLvB00WYu7xk5FaQIy-poG7ZSMeAQ=w397-h311-s-no-gm" 
        alt="RockSafe 360 Logo" 
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
};