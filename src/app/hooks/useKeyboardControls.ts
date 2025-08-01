import { useEffect } from 'react';
import { Position } from '../types';

interface UseKeyboardControlsProps {
  helmetPosition: Position;
  setHelmetPosition: (position: Position) => void;
  adjustScale: (delta: number) => void;
  isActive: boolean;
}

export function useKeyboardControls({
  helmetPosition,
  setHelmetPosition,
  adjustScale,
  isActive,
}: UseKeyboardControlsProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.05 : 0.01;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setHelmetPosition({
            ...helmetPosition,
            x: Math.max(0, helmetPosition.x - step),
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setHelmetPosition({
            ...helmetPosition,
            x: Math.min(1, helmetPosition.x + step),
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHelmetPosition({
            ...helmetPosition,
            y: Math.max(0, helmetPosition.y - step),
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHelmetPosition({
            ...helmetPosition,
            y: Math.min(1, helmetPosition.y + step),
          });
          break;
        case '+':
        case '=':
          e.preventDefault();
          adjustScale(0.05);
          break;
        case '-':
        case '_':
          e.preventDefault();
          adjustScale(-0.05);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [helmetPosition, setHelmetPosition, adjustScale, isActive]);
}
