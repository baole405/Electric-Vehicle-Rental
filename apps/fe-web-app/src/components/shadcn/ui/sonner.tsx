import React from 'react';

interface ToasterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const Toaster: React.FC<ToasterProps> = ({ position = 'top-right' }) => {
  // Placeholder toaster component
  return (
    <div className={`toaster toaster-${position}`}>
      {/* Toast notifications will appear here */}
    </div>
  );
};
