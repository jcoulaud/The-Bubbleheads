import { useCallback, useEffect, useState } from 'react';
import { Position } from '../types';

interface UseHelmetControlsReturn {
  helmetPosition: Position;
  helmetScale: number;
  isDraggingHelmet: boolean;
  dragOffset: Position;
  setHelmetPosition: (position: Position) => void;
  setHelmetScale: (scale: number) => void;
  handleHelmetMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
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
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (!previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setDragOffset({
        x: x - helmetPosition.x,
        y: y - helmetPosition.y,
      });

      setIsDraggingHelmet(true);
    },
    [helmetPosition, previewContainerRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDraggingHelmet || !previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

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
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!previewContainerRef.current) return;

        const rect = previewContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

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

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
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
