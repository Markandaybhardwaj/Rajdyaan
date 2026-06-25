'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#3B1F0A',
          color: '#FAF6EE',
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#B5922A', secondary: '#FAF6EE' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#FAF6EE' },
        },
      }}
    />
  );
}
