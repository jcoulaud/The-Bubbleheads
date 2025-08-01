'use client';

import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useDarkMode } from '../hooks/useDarkMode';
import { useResponsiveToast } from '../hooks/useResponsiveToast';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const toastPosition = useResponsiveToast();

  return (
    <>
      {/* Toast Provider */}
      <Toaster
        position={toastPosition}
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#111827',
            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
            marginTop: toastPosition === 'top-right' ? '60px' : '0',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: isDarkMode ? '#1f2937' : '#ffffff',
            },
          },
        }}
      />

      {/* Dark Mode Toggle */}
      <div className='fixed top-4 right-4 z-50'>
        <button
          onClick={toggleDarkMode}
          className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700'
          aria-label='Toggle dark mode'
          type='button'>
          {isDarkMode ? (
            <Sun className='w-5 h-5 text-yellow-500' />
          ) : (
            <Moon className='w-5 h-5 text-gray-700 dark:text-gray-300' />
          )}
        </button>
      </div>

      {children}

      {/* Footer */}
      <footer className='py-8 px-6 border-t border-gray-200 dark:border-gray-700 mt-auto'>
        <div className='max-w-4xl mx-auto text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            made by a{' '}
            <a
              href='https://x.com/JulienCoulaud'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium'>
              degen
            </a>{' '}
            for the{' '}
            <a
              href='https://x.com/TheBubble_Heads'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium'>
              bubbleheads community
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}