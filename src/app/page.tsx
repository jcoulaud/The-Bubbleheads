'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import EditorInterface from './components/EditorInterface';
import UploadSection from './components/UploadSection';
import { useHelmetControls } from './hooks/useHelmetControls';
import { useUserImageControls } from './hooks/useUserImageControls';
import type { Position } from './types';
import { renderHelmetImage } from './utils/canvasRenderer';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [helmetImageError, setHelmetImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [useBackground, setUseBackground] = useState(true);
  const [editMode, setEditMode] = useState<'helmet' | 'user'>('helmet');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    helmetPosition,
    helmetScale,
    isDraggingHelmet,
    handleHelmetMouseDown,
    handleMouseMove: handleHelmetMouseMove,
    handleMouseUp: handleHelmetMouseUp,
    adjustScale,
    resetHelmetPosition,
    setHelmetPosition,
  } = useHelmetControls(previewContainerRef);

  const {
    userImagePosition,
    userImageScale,
    userImageRotation,
    userImageFlipped,
    userImagePerspectiveX,
    userImagePerspectiveY,
    isDraggingUserImage,
    handleUserImageMouseDown,
    handleMouseMove: handleUserImageMouseMove,
    handleMouseUp: handleUserImageMouseUp,
    adjustScale: adjustUserImageScale,
    adjustRotation: adjustUserImageRotation,
    adjustPerspectiveX: adjustUserImagePerspectiveX,
    adjustPerspectiveY: adjustUserImagePerspectiveY,
    toggleFlip: toggleUserImageFlip,
    resetUserImageTransform,
    setUserImagePosition,
  } = useUserImageControls(previewContainerRef);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsImageLoaded(false);
      // Store the original filename without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setOriginalFilename(nameWithoutExt);

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setShowPreview(true);
        setIsImageLoaded(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const updatePreview = useCallback(async () => {
    if (!uploadedImage || !previewCanvasRef.current || !previewContainerRef.current) return;

    const canvas = previewCanvasRef.current;
    const container = previewContainerRef.current;
    const containerSize = container.clientWidth;

    if (canvas.width !== containerSize || canvas.height !== containerSize) {
      canvas.width = containerSize;
      canvas.height = containerSize;
    }

    try {
      await renderHelmetImage({
        canvas,
        userImage: uploadedImage,
        helmetPosition,
        helmetScale,
        useBackground,
        userImagePosition,
        userImageScale,
        userImageRotation,
        userImageFlipped,
        userImagePerspectiveX,
        userImagePerspectiveY,
        isPreview: true,
      });
    } catch (error) {
      console.error('Error rendering preview:', error);
      setHelmetImageError(true);
    }
  }, [
    uploadedImage,
    helmetPosition,
    helmetScale,
    useBackground,
    userImagePosition,
    userImageScale,
    userImageRotation,
    userImageFlipped,
    userImagePerspectiveX,
    userImagePerspectiveY,
  ]);

  useEffect(() => {
    if (!showPreview) return;

    let animationFrameId: number;

    const scheduleUpdate = () => {
      animationFrameId = requestAnimationFrame(() => {
        updatePreview();
      });
    };

    scheduleUpdate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [updatePreview, showPreview]);

  useEffect(() => {
    const handleHelmetPositionUpdate = (e: CustomEvent<Position>) => {
      setHelmetPosition(e.detail);
    };

    window.addEventListener('helmet-position-update', handleHelmetPositionUpdate as EventListener);
    return () => {
      window.removeEventListener(
        'helmet-position-update',
        handleHelmetPositionUpdate as EventListener,
      );
    };
  }, [setHelmetPosition]);

  const downloadFinalImage = useCallback(async () => {
    if (!uploadedImage || !canvasRef.current) return;

    setIsProcessing(true);

    const canvas = canvasRef.current;

    try {
      await renderHelmetImage({
        canvas,
        userImage: uploadedImage,
        helmetPosition,
        helmetScale,
        useBackground,
        userImagePosition,
        userImageScale,
        userImageRotation,
        userImageFlipped,
        userImagePerspectiveX,
        userImagePerspectiveY,
        isPreview: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${originalFilename}-helmet.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
        setIsProcessing(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading image:', error);
      setHelmetImageError(true);
      setIsProcessing(false);
    }
  }, [
    uploadedImage,
    originalFilename,
    helmetPosition,
    helmetScale,
    useBackground,
    userImagePosition,
    userImageScale,
    userImageRotation,
    userImageFlipped,
    userImagePerspectiveX,
    userImagePerspectiveY,
  ]);

  const resetImages = useCallback(() => {
    setUploadedImage(null);
    setOriginalFilename('');
    setShowPreview(false);
    resetHelmetPosition();
    resetUserImageTransform();
    setIsImageLoaded(false);
    setUseBackground(true);
    setEditMode('helmet');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [resetHelmetPosition, resetUserImageTransform]);

  // Combined mouse/touch handlers that delegate based on edit mode
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (editMode === 'helmet') {
        handleHelmetMouseDown(e);
      } else {
        handleUserImageMouseDown(e);
      }
    },
    [editMode, handleHelmetMouseDown, handleUserImageMouseDown],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
      if (editMode === 'helmet') {
        handleHelmetMouseMove(e);
      } else {
        handleUserImageMouseMove(e);
      }
    },
    [editMode, handleHelmetMouseMove, handleUserImageMouseMove],
  );

  const handleMouseUp = useCallback(() => {
    if (editMode === 'helmet') {
      handleHelmetMouseUp();
    } else {
      handleUserImageMouseUp();
    }
  }, [editMode, handleHelmetMouseUp, handleUserImageMouseUp]);

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      {!uploadedImage && !showPreview && (
        <section className='py-12'>
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <div className='relative mb-8'>
              <div className='relative mb-4'>
                <img
                  src='/helmet.png'
                  alt='Helmet'
                  className='w-24 h-24 md:w-32 md:h-32 mx-auto animate-float opacity-90 drop-shadow-2xl'
                />
              </div>
              <h1 className='relative text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 animate-fade-in'>
                Helmet Generator
              </h1>
              <div className='text-lg md:text-xl text-gray-600 font-medium mb-4'>for the</div>
              <div className='flex items-center justify-center gap-4 mb-6'>
                <div className='h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-[100px]'></div>
                <h2 className='text-3xl md:text-4xl font-black text-blue-600 tracking-wider'>
                  The Bubbleheads Community
                </h2>
                <div className='h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-[100px]'></div>
              </div>
            </div>

            <div className='hidden md:flex items-center justify-center gap-6 text-sm text-gray-500'>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 text-xs font-bold'>1</span>
                </div>
                <span>Upload Photo</span>
              </div>
              <div className='w-px h-4 bg-gray-300'></div>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 text-xs font-bold'>2</span>
                </div>
                <span>Customize Helmet</span>
              </div>
              <div className='w-px h-4 bg-gray-300'></div>
              <div className='flex items-center gap-2'>
                <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 text-xs font-bold'>3</span>
                </div>
                <span>Download & Share</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Message */}
      {helmetImageError && (
        <section className='py-8 px-6'>
          <div className='max-w-2xl mx-auto'>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
              <div className='flex items-start'>
                <div className='w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
                    />
                  </svg>
                </div>
                <div className='ml-4'>
                  <h3 className='text-lg font-semibold text-red-800 mb-2'>Setup Required</h3>
                  <p className='text-red-700 mb-4'>
                    Please add your helmet image to complete the setup:
                  </p>
                  <div className='space-y-2 text-sm text-red-700'>
                    <div className='flex items-center gap-2'>
                      <span className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        1
                      </span>
                      <span>Save the helmet image as &quot;helmet.png&quot;</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        2
                      </span>
                      <span>Place it in the &quot;public/&quot; directory</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                        3
                      </span>
                      <span>Refresh the page and try again</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upload Section */}
      {!uploadedImage && (
        <UploadSection
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleImageUpload}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Editor Interface */}
      {showPreview && (
        <EditorInterface
          previewCanvasRef={previewCanvasRef}
          previewContainerRef={previewContainerRef}
          helmetPosition={helmetPosition}
          helmetScale={helmetScale}
          userImagePosition={userImagePosition}
          userImageScale={userImageScale}
          userImageRotation={userImageRotation}
          userImageFlipped={userImageFlipped}
          userImagePerspectiveX={userImagePerspectiveX}
          userImagePerspectiveY={userImagePerspectiveY}
          isImageLoaded={isImageLoaded}
          isDraggingHelmet={isDraggingHelmet}
          isDraggingUserImage={isDraggingUserImage}
          useBackground={useBackground}
          editMode={editMode}
          onEditModeChange={setEditMode}
          onBackgroundToggle={setUseBackground}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={handleMouseDown}
          onScaleAdjust={adjustScale}
          onUserImageScaleAdjust={adjustUserImageScale}
          onUserImageRotationAdjust={adjustUserImageRotation}
          onUserImagePerspectiveXAdjust={adjustUserImagePerspectiveX}
          onUserImagePerspectiveYAdjust={adjustUserImagePerspectiveY}
          onUserImageFlipToggle={toggleUserImageFlip}
          onResetPosition={resetHelmetPosition}
          onResetUserImageTransform={resetUserImageTransform}
          onProcessImage={downloadFinalImage}
          onCancel={resetImages}
          isProcessing={isProcessing}
        />
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Footer */}
      <footer className='mt-16 py-8 px-6 border-t border-gray-200'>
        <div className='max-w-4xl mx-auto text-center'>
          <p className='text-sm text-gray-600'>
            made by a{' '}
            <a
              href='https://x.com/JulienCoulaud/status/1951264332165140624'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-700 font-medium'>
              degen
            </a>{' '}
            for the{' '}
            <a
              href='https://x.com/TheBubble_Heads'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:text-blue-700 font-medium'>
              bubbleheads community
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
