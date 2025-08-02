'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import AIGenerationModal from './components/AIGenerationModal';
import AIPreview from './components/AIPreview';
import EditorInterface from './components/EditorInterface';
import SocialLinks from './components/SocialLinks';
import UploadSection from './components/UploadSection';
import { useDarkMode } from './hooks/useDarkMode';
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAIGeneratedImage] = useState<string | null>(null);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [streamProgress, setStreamProgress] = useState<number>(0);

  const { isDarkMode } = useDarkMode();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smooth progress animation
  useEffect(() => {
    if (isGeneratingAI && streamProgress < 100) {
      const timer = setInterval(() => {
        setStreamProgress((prev) => {
          const slowIncrement = 0.15; // ~0.15% per 100ms = 16.7 seconds per 25%

          let nextMilestone;
          if (prev < 25) nextMilestone = 25;
          else if (prev < 50) nextMilestone = 50;
          else if (prev < 75) nextMilestone = 75;
          else nextMilestone = 100;

          // Don't exceed the next milestone
          const maxProgress = nextMilestone - 0.5;

          // Apply increment
          const newProgress = Math.min(prev + slowIncrement, maxProgress);
          return newProgress;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [isGeneratingAI, streamProgress]);
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

  const handleAIGenerate = useCallback(async (prompt: string, customImage?: string | null) => {
    setIsGeneratingAI(true);
    setStreamProgress(0);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, useStreaming: true, customImage }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate image');
      }

      // Check if response is streaming
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let partialCount = 0;
        const totalPartials = 4; // 3 partials + 1 final
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('event:')) {
              currentEvent = trimmedLine.substring(6).trim();
            } else if (trimmedLine.startsWith('data:')) {
              const dataStr = trimmedLine.substring(5).trim();

              try {
                const data = JSON.parse(dataStr);

                if (currentEvent === 'image_edit.partial_image' && data.b64_json) {
                  partialCount++;
                  const progress = (partialCount / totalPartials) * 100;

                  // Jump directly to the milestone
                  setStreamProgress(progress);
                  setAIGeneratedImage(`data:image/png;base64,${data.b64_json}`);

                  // Show preview on first partial
                  if (partialCount === 1) {
                    setShowAIModal(false);
                    setShowAIPreview(true);
                  }
                } else if (currentEvent === 'image_edit.completed' && data.b64_json) {
                  setStreamProgress(100);
                  setAIGeneratedImage(`data:image/png;base64,${data.b64_json}`);
                  toast.success('AI image generated successfully!');
                } else if (currentEvent === 'error') {
                  throw new Error(data.error || 'Stream error');
                }
              } catch {
                // Silently ignore parse errors
              }
            } else if (trimmedLine === '') {
              // Empty line indicates end of an SSE message
              currentEvent = '';
            }
          }
        }
      } else {
        // Non-streaming response
        const data = await response.json();

        if (data.imageUrl) {
          setAIGeneratedImage(data.imageUrl);
          setShowAIModal(false);
          setShowAIPreview(true);
          toast.success('AI image generated successfully!');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
      setShowAIModal(true);
      setShowAIPreview(false);
      setStreamProgress(0);
    } finally {
      setIsGeneratingAI(false);
    }
  }, []);

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
        isDarkMode,
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
    isDarkMode,
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
        isDarkMode,
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
    isDarkMode,
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
    setAIGeneratedImage(null);
    setShowAIPreview(false);
    setStreamProgress(0);
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

  // Show AI Preview if we have an AI generated image
  if (showAIPreview && aiGeneratedImage) {
    return (
      <>
        <SocialLinks />
        <AIPreview
          imageUrl={aiGeneratedImage}
          onBack={resetImages}
          onRegenerate={() => {
            setShowAIPreview(false);
            setShowAIModal(true);
            setStreamProgress(0);
          }}
          progress={streamProgress}
          isGenerating={isGeneratingAI}
        />
      </>
    );
  }

  return (
    <main className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col'>
      <SocialLinks />
      {/* Main Content */}
      <div className='flex-1'>
        {/* Hero Section */}
        {!uploadedImage && !showPreview && (
          <section className='py-8 md:py-12'>
            <div className='max-w-4xl mx-auto px-6 text-center'>
              <div className='relative mb-8'>
                <div className='relative mb-4'>
                  <img
                    src='/helmet.png'
                    alt='Helmet'
                    className='w-24 h-24 md:w-32 md:h-32 mx-auto animate-float opacity-90 drop-shadow-2xl'
                  />
                </div>
                <h1 className='relative text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3 animate-fade-in'>
                  Helmet Generator
                </h1>
                <div className='text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium mb-3'>
                  for the
                </div>
                <div className='flex items-center justify-center gap-4 mb-6'>
                  <div className='h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-[100px]'></div>
                  <h2 className='text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 tracking-wider'>
                    The Bubbleheads Community
                  </h2>
                  <div className='h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-[100px]'></div>
                </div>
              </div>

              <div className='hidden md:flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 dark:text-blue-400 text-xs font-bold'>1</span>
                  </div>
                  <span>Upload Photo</span>
                </div>
                <div className='w-px h-4 bg-gray-300 dark:bg-gray-600'></div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 dark:text-blue-400 text-xs font-bold'>2</span>
                  </div>
                  <span>Customize Helmet</span>
                </div>
                <div className='w-px h-4 bg-gray-300 dark:bg-gray-600'></div>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 dark:text-blue-400 text-xs font-bold'>3</span>
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
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6'>
                <div className='flex items-start'>
                  <div className='w-8 h-8 bg-red-500 dark:bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0'>
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
                    <h3 className='text-lg font-semibold text-red-800 dark:text-red-200 mb-2'>
                      Setup Required
                    </h3>
                    <p className='text-red-700 dark:text-red-300 mb-4'>
                      Please add your helmet image to complete the setup:
                    </p>
                    <div className='space-y-2 text-sm text-red-700 dark:text-red-300'>
                      <div className='flex items-center gap-2'>
                        <span className='w-5 h-5 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                          1
                        </span>
                        <span>Save the helmet image as &quot;helmet.png&quot;</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='w-5 h-5 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                          2
                        </span>
                        <span>Place it in the &quot;public/&quot; directory</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='w-5 h-5 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
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
            onAIGenerate={() => setShowAIModal(true)}
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

        {/* AI Generation Modal */}
        <AIGenerationModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onGenerate={handleAIGenerate}
          isGenerating={isGeneratingAI}
        />
      </div>
    </main>
  );
}
