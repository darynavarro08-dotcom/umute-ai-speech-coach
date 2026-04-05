'use client';

import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-500`}></div>
    </div>
  );
};

export const LoadingCard: React.FC<{ message?: string }> = ({ 
  message = 'Processing...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};
