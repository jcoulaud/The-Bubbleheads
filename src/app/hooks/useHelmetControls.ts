import { useCallback, useEffect, useState } from 'react';
import { Position } from '../types';

interface UseHelmetControlsReturn {
  helmetPosition: Position;
  helmetScale: number;
  isDraggingHelmet: boolean;
  dragOffset: Position;
  setHelmetPosition: (position: Position) => void;
  setHelmetScale: (scale: number) => void;
  handleHelmetMouseDown: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
  adjustScale: (delta: number) => void;
  resetHelmetPosition: () => void;
}

export function useHelmetControls(
  previewContainerRef: React.RefObject<HTMLDivElement | null>,
): UseHelmetControlsReturn {
  const [helmetPosition, setHelmetPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [helmetScale, setHelmetScale] = useState(1.74);
  const [isDraggingHelmet, setIsDraggingHelmet] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const handleHelmetMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      e.preventDefault();
      if (!previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      setDragOffset({
        x: x - helmetPosition.x,
        y: y - helmetPosition.y,
      });

      setIsDraggingHelmet(true);
    },
    [helmetPosition, previewContainerRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (!isDraggingHelmet || !previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      setHelmetPosition({
        x: Math.max(0, Math.min(1, x - dragOffset.x)),
        y: Math.max(0, Math.min(1, y - dragOffset.y)),
      });
    },
    [isDraggingHelmet, dragOffset, previewContainerRef],
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingHelmet(false);
  }, []);

  const adjustScale = useCallback((delta: number) => {
    setHelmetScale((prev) => Math.max(0.7, Math.min(2, prev + delta)));
  }, []);

  const resetHelmetPosition = useCallback(() => {
    setHelmetPosition({ x: 0.5, y: 0.5 });
    setHelmetScale(1.74);
  }, []);

  useEffect(() => {
    if (isDraggingHelmet) {
      const handleDocumentMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!previewContainerRef.current) return;

        const rect = previewContainerRef.current.getBoundingClientRect();
        let clientX: number, clientY: number;

        if (e instanceof TouchEvent) {
          const touch = e.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        setHelmetPosition({
          x: Math.max(0, Math.min(1, x - dragOffset.x)),
          y: Math.max(0, Math.min(1, y - dragOffset.y)),
        });
      };

      const handleDocumentMouseUp = () => {
        setIsDraggingHelmet(false);
      };

      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
      document.addEventListener('touchmove', handleDocumentMouseMove, { passive: false });
      document.addEventListener('touchend', handleDocumentMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        document.removeEventListener('touchmove', handleDocumentMouseMove);
        document.removeEventListener('touchend', handleDocumentMouseUp);
      };
    }
  }, [isDraggingHelmet, dragOffset, previewContainerRef]);

  return {
    helmetPosition,
    helmetScale,
    isDraggingHelmet,
    dragOffset,
    setHelmetPosition,
    setHelmetScale,
    handleHelmetMouseDown,
    handleMouseMove,
    handleMouseUp,
    adjustScale,
    resetHelmetPosition,
  };
}
