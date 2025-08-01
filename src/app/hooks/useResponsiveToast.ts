import { useEffect, useState } from 'react';

export const useResponsiveToast = () => {
  const [position, setPosition] = useState<'top-right' | 'bottom-center'>('top-right');

  useEffect(() => {
    const checkScreenSize = () => {
      setPosition(window.innerWidth < 1024 ? 'bottom-center' : 'top-right');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return position;
};