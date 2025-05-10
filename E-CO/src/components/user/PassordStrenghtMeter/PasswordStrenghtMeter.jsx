import React from 'react';

export function PasswordStrengthMeter({ strength }) {
  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength === 1) return 'Très faible';
    if (strength === 2) return 'Faible';
    if (strength === 3) return 'Moyen';
    if (strength === 4) return 'Fort';
    return 'Très fort';
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200';
    if (strength === 1) return 'bg-red-500';
    if (strength === 2) return 'bg-orange-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength === 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-full w-1/5 ${
              index < strength ? getStrengthColor() : 'bg-gray-200'
            } ${index > 0 ? 'ml-0.5' : ''}`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs ${
          strength <= 2 ? 'text-red-500' : 
          strength === 3 ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {getStrengthText()}
        </p>
      )}
    </div>
  );
}