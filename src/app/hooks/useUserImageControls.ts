import { useCallback, useEffect, useState } from 'react';
import { Position } from '../types';

interface UseUserImageControlsReturn {
  userImagePosition: Position;
  userImageScale: number;
  userImageRotation: number;
  userImageFlipped: boolean;
  isDraggingUserImage: boolean;
  dragOffset: Position;
  setUserImagePosition: (position: Position) => void;
  setUserImageScale: (scale: number) => void;
  setUserImageRotation: (rotation: number) => void;
  setUserImageFlipped: (flipped: boolean) => void;
  handleUserImageMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
  adjustScale: (delta: number) => void;
  adjustRotation: (delta: number) => void;
  toggleFlip: () => void;
  resetUserImageTransform: () => void;
}

export function useUserImageControls(
  previewContainerRef: React.RefObject<HTMLDivElement | null>,
): UseUserImageControlsReturn {
  const [userImagePosition, setUserImagePosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [userImageScale, setUserImageScale] = useState(1);
  const [userImageRotation, setUserImageRotation] = useState(0);
  const [userImageFlipped, setUserImageFlipped] = useState(false);
  const [isDraggingUserImage, setIsDraggingUserImage] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const handleUserImageMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (!previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setDragOffset({
        x: x - userImagePosition.x,
        y: y - userImagePosition.y,
      });

      setIsDraggingUserImage(true);
    },
    [userImagePosition, previewContainerRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isDraggingUserImage || !previewContainerRef.current) return;

      const rect = previewContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setUserImagePosition({
        x: x - dragOffset.x,
        y: y - dragOffset.y,
      });
    },
    [isDraggingUserImage, dragOffset, previewContainerRef],
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingUserImage(false);
  }, []);

  const adjustScale = useCallback((delta: number) => {
    setUserImageScale((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  }, []);

  const adjustRotation = useCallback((delta: number) => {
    setUserImageRotation((prev) => (prev + delta) % 360);
  }, []);

  const toggleFlip = useCallback(() => {
    setUserImageFlipped((prev) => !prev);
  }, []);

  const resetUserImageTransform = useCallback(() => {
    setUserImagePosition({ x: 0.5, y: 0.5 });
    setUserImageScale(1);
    setUserImageRotation(0);
    setUserImageFlipped(false);
  }, []);

  useEffect(() => {
    if (isDraggingUserImage) {
      const handleDocumentMouseMove = (e: MouseEvent) => {
        if (!previewContainerRef.current) return;

        const rect = previewContainerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setUserImagePosition({
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        });
      };

      const handleDocumentMouseUp = () => {
        setIsDraggingUserImage(false);
      };

      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
      };
    }
  }, [isDraggingUserImage, dragOffset, previewContainerRef]);

  return {
    userImagePosition,
    userImageScale,
    userImageRotation,
    userImageFlipped,
    isDraggingUserImage,
    dragOffset,
    setUserImagePosition,
    setUserImageScale,
    setUserImageRotation,
    setUserImageFlipped,
    handleUserImageMouseDown,
    handleMouseMove,
    handleMouseUp,
    adjustScale,
    adjustRotation,
    toggleFlip,
    resetUserImageTransform,
  };
}