import { useCallback, useEffect, useState } from 'react';
import { Position } from '../types';

interface UseUserImageControlsReturn {
  userImagePosition: Position;
  userImageScale: number;
  userImageRotation: number;
  userImageFlipped: boolean;
  userImagePerspectiveX: number;
  userImagePerspectiveY: number;
  isDraggingUserImage: boolean;
  dragOffset: Position;
  setUserImagePosition: (position: Position) => void;
  setUserImageScale: (scale: number) => void;
  setUserImageRotation: (rotation: number) => void;
  setUserImageFlipped: (flipped: boolean) => void;
  setUserImagePerspectiveX: (perspective: number) => void;
  setUserImagePerspectiveY: (perspective: number) => void;
  handleUserImageMouseDown: (
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
  ) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  handleMouseUp: () => void;
  adjustScale: (delta: number) => void;
  adjustRotation: (delta: number) => void;
  adjustPerspectiveX: (delta: number) => void;
  adjustPerspectiveY: (delta: number) => void;
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
  const [userImagePerspectiveX, setUserImagePerspectiveX] = useState(0);
  const [userImagePerspectiveY, setUserImagePerspectiveY] = useState(0);
  const [isDraggingUserImage, setIsDraggingUserImage] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  const handleUserImageMouseDown = useCallback(
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
        x: x - userImagePosition.x,
        y: y - userImagePosition.y,
      });

      setIsDraggingUserImage(true);
    },
    [userImagePosition, previewContainerRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (!isDraggingUserImage || !previewContainerRef.current) return;

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

  const adjustPerspectiveX = useCallback((delta: number) => {
    setUserImagePerspectiveX((prev) => Math.max(-50, Math.min(50, prev + delta)));
  }, []);

  const adjustPerspectiveY = useCallback((delta: number) => {
    setUserImagePerspectiveY((prev) => Math.max(-50, Math.min(50, prev + delta)));
  }, []);

  const toggleFlip = useCallback(() => {
    setUserImageFlipped((prev) => !prev);
  }, []);

  const resetUserImageTransform = useCallback(() => {
    setUserImagePosition({ x: 0.5, y: 0.5 });
    setUserImageScale(1);
    setUserImageRotation(0);
    setUserImageFlipped(false);
    setUserImagePerspectiveX(0);
    setUserImagePerspectiveY(0);
  }, []);

  useEffect(() => {
    if (isDraggingUserImage) {
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
      document.addEventListener('touchmove', handleDocumentMouseMove, { passive: false });
      document.addEventListener('touchend', handleDocumentMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleDocumentMouseMove);
        document.removeEventListener('mouseup', handleDocumentMouseUp);
        document.removeEventListener('touchmove', handleDocumentMouseMove);
        document.removeEventListener('touchend', handleDocumentMouseUp);
      };
    }
  }, [isDraggingUserImage, dragOffset, previewContainerRef]);

  return {
    userImagePosition,
    userImageScale,
    userImageRotation,
    userImageFlipped,
    userImagePerspectiveX,
    userImagePerspectiveY,
    isDraggingUserImage,
    dragOffset,
    setUserImagePosition,
    setUserImageScale,
    setUserImageRotation,
    setUserImageFlipped,
    setUserImagePerspectiveX,
    setUserImagePerspectiveY,
    handleUserImageMouseDown,
    handleMouseMove,
    handleMouseUp,
    adjustScale,
    adjustRotation,
    adjustPerspectiveX,
    adjustPerspectiveY,
    toggleFlip,
    resetUserImageTransform,
  };
}
