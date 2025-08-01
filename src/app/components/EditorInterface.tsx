import {
  ArrowLeft,
  Camera,
  Copy,
  Download,
  FlipHorizontal,
  Minus,
  Move,
  Plus,
  RotateCcw,
  RotateCw,
  Target,
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { Position } from '../types';

interface EditorInterfaceProps {
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  helmetPosition: Position;
  helmetScale: number;
  userImagePosition: Position;
  userImageScale: number;
  userImageRotation: number;
  userImageFlipped: boolean;
  userImagePerspectiveX: number;
  userImagePerspectiveY: number;
  isImageLoaded: boolean;
  isDraggingHelmet: boolean;
  isDraggingUserImage: boolean;
  useBackground: boolean;
  editMode: 'helmet' | 'user';
  onEditModeChange: (mode: 'helmet' | 'user') => void;
  onBackgroundToggle: (value: boolean) => void;
  onMouseMove: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onMouseUp: () => void;
  onMouseDown: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onScaleAdjust: (delta: number) => void;
  onUserImageScaleAdjust: (delta: number) => void;
  onUserImageRotationAdjust: (delta: number) => void;
  onUserImagePerspectiveXAdjust: (delta: number) => void;
  onUserImagePerspectiveYAdjust: (delta: number) => void;
  onUserImageFlipToggle: () => void;
  onResetPosition: () => void;
  onResetUserImageTransform: () => void;
  onProcessImage: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const EditorInterface: React.FC<EditorInterfaceProps> = ({
  previewCanvasRef,
  previewContainerRef,
  helmetPosition,
  helmetScale,
  userImagePosition,
  userImageScale,
  userImageRotation,
  userImageFlipped,
  userImagePerspectiveX,
  userImagePerspectiveY,
  isImageLoaded,
  isDraggingHelmet,
  isDraggingUserImage,
  useBackground,
  editMode,
  onEditModeChange,
  onBackgroundToggle,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onScaleAdjust,
  onUserImageScaleAdjust,
  onUserImageRotationAdjust,
  onUserImagePerspectiveXAdjust,
  onUserImagePerspectiveYAdjust,
  onUserImageFlipToggle,
  onResetPosition,
  onResetUserImageTransform,
  onProcessImage,
  onCancel,
  isProcessing,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyImage = async () => {
    if (!previewCanvasRef.current || isCopying) return;

    setIsCopying(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        previewCanvasRef.current?.toBlob(resolve, 'image/png');
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);

        toast.success('Image copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to copy image:', error);
    } finally {
      setIsCopying(false);
    }
  };

  useKeyboardControls({
    helmetPosition,
    setHelmetPosition: (pos) => {
      const event = new CustomEvent('helmet-position-update', { detail: pos });
      window.dispatchEvent(event);
    },
    adjustScale: editMode === 'helmet' ? onScaleAdjust : onUserImageScaleAdjust,
    isActive: isFocused && editMode === 'helmet',
  });
  return (
    <section className='py-8 px-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6 lg:mb-8 mt-12 lg:mt-0 text-center'>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            Perfect Your Creation
          </h2>
          <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4 sm:px-0'>
            Drag to position and use the controls to create your perfect space portrait.
          </p>
        </div>

        <div className='flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-6'>
          {/* Compact Sidebar Controls */}
          <div className='lg:col-span-2 space-y-4 order-2 lg:order-1 relative lg:pt-0'>
            {/* Back Button for Desktop */}
            <button
              onClick={onCancel}
              className='hidden lg:block absolute -top-12 left-0 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all'
              title='Go back'>
              <ArrowLeft className='w-5 h-5' />
            </button>
            {/* Mode & Style Selection */}
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-4'>
              {/* Edit Mode */}
              <div>
                <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  Edit Mode
                </h4>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => onEditModeChange('helmet')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      editMode === 'helmet'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}>
                    <Move className='w-4 h-4' />
                    Helmet
                  </button>
                  <button
                    onClick={() => onEditModeChange('user')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      editMode === 'user'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}>
                    <Camera className='w-4 h-4' />
                    Picture
                  </button>
                </div>
              </div>

              {/* Background Style */}
              <div>
                <h4 className='text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3'>
                  Background Style
                </h4>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => onBackgroundToggle(true)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      useBackground
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}>
                    <span className='text-base'>🚀</span>
                    Space
                  </button>
                  <button
                    onClick={() => onBackgroundToggle(false)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      !useBackground
                        ? 'border-gray-500 dark:border-gray-400 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-200 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}>
                    <span className='text-base'>✨</span>
                    Clean
                  </button>
                </div>
              </div>
            </div>

            {/* Context-Sensitive Controls */}
            {editMode === 'helmet' ? (
              <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Move className='w-4 h-4 text-blue-600' />
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    Helmet Controls
                  </span>
                </div>

                {/* Size Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Size</span>
                    <span className='text-sm font-medium text-blue-600'>
                      {Math.round(((helmetScale - 0.7) / 1.3) * 100)}%
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onScaleAdjust(-0.13)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Minus className='w-3 h-3' />
                    </button>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      value={((helmetScale - 0.7) / 1.3) * 100}
                      onChange={(e) => {
                        const displayValue = parseInt(e.target.value);
                        const actualScale = 0.7 + (displayValue / 100) * 1.3;
                        onScaleAdjust(actualScale - helmetScale);
                      }}
                      className='flex-1 h-2 slider'
                    />
                    <button
                      onClick={() => onScaleAdjust(0.13)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                <button
                  onClick={onResetPosition}
                  className='w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-2 font-medium'>
                  <Target className='w-4 h-4' />
                  Reset Position
                </button>
              </div>
            ) : (
              <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Camera className='w-4 h-4 text-green-600' />
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    Picture Controls
                  </span>
                </div>

                {/* Size Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Size</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(((userImageScale - 0.1) / 2.9) * 100)}%
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImageScaleAdjust(-0.1)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Minus className='w-3 h-3' />
                    </button>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      value={((userImageScale - 0.1) / 2.9) * 100}
                      onChange={(e) => {
                        const displayValue = parseInt(e.target.value);
                        const actualScale = 0.1 + (displayValue / 100) * 2.9;
                        onUserImageScaleAdjust(actualScale - userImageScale);
                      }}
                      className='flex-1 h-2 slider'
                    />
                    <button
                      onClick={() => onUserImageScaleAdjust(0.1)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Rotation</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(userImageRotation)}°
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImageRotationAdjust(-15)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <RotateCcw className='w-3 h-3' />
                    </button>
                    <input
                      type='range'
                      min='0'
                      max='360'
                      value={userImageRotation}
                      onChange={(e) => {
                        const newRotation = parseInt(e.target.value);
                        onUserImageRotationAdjust(newRotation - userImageRotation);
                      }}
                      className='flex-1 h-2 slider'
                    />
                    <button
                      onClick={() => onUserImageRotationAdjust(15)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <RotateCw className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                {/* Perspective Controls */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Perspective X</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(userImagePerspectiveX)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImagePerspectiveXAdjust(-5)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Minus className='w-3 h-3' />
                    </button>
                    <input
                      type='range'
                      min='-50'
                      max='50'
                      value={userImagePerspectiveX}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        onUserImagePerspectiveXAdjust(newValue - userImagePerspectiveX);
                      }}
                      className='flex-1 h-2 slider'
                    />
                    <button
                      onClick={() => onUserImagePerspectiveXAdjust(5)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Perspective Y</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(userImagePerspectiveY)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImagePerspectiveYAdjust(-5)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Minus className='w-3 h-3' />
                    </button>
                    <input
                      type='range'
                      min='-50'
                      max='50'
                      value={userImagePerspectiveY}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        onUserImagePerspectiveYAdjust(newValue - userImagePerspectiveY);
                      }}
                      className='flex-1 h-2 slider'
                    />
                    <button
                      onClick={() => onUserImagePerspectiveYAdjust(5)}
                      className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 rounded transition-all touch-manipulation'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                {/* Flip Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Flip Horizontal
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        userImageFlipped
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                      {userImageFlipped ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <button
                    onClick={onUserImageFlipToggle}
                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                      userImageFlipped
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}>
                    <FlipHorizontal className='w-4 h-4' />
                    {userImageFlipped ? 'Remove Flip' : 'Flip Picture'}
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={onResetUserImageTransform}
                  className='w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-2 font-medium'>
                  <Target className='w-4 h-4' />
                  Reset All Changes
                </button>
              </div>
            )}

            {/* Quick Info */}
            <div className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-3'>
              <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Position</div>
              <div className='flex justify-between text-sm'>
                <span className='text-blue-600 font-medium'>
                  X:{' '}
                  {Math.round(
                    (editMode === 'helmet' ? helmetPosition.x : userImagePosition.x) * 100,
                  )}
                  %
                </span>
                <span className='text-blue-600 font-medium'>
                  Y:{' '}
                  {Math.round(
                    (editMode === 'helmet' ? helmetPosition.y : userImagePosition.y) * 100,
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className='lg:col-span-3 order-1 lg:order-2'>
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden'>
              {/* Floating Toolbar */}
              <div className='bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3'>
                    <h3 className='font-semibold text-gray-900 dark:text-gray-100'>Live Preview</h3>
                    <span className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
                      {editMode === 'helmet'
                        ? 'Drag helmet to position'
                        : 'Drag, resize & rotate picture'}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className='flex items-center gap-1 sm:gap-2'>
                    <button
                      onClick={handleCopyImage}
                      disabled={isCopying}
                      className='flex items-center gap-1 px-2 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-500 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed'>
                      {isCopying ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                          <span className='hidden sm:inline'>Copying...</span>
                        </>
                      ) : (
                        <>
                          <Copy className='w-4 h-4' />
                          <span className='hidden sm:inline'>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={onProcessImage}
                      disabled={isProcessing}
                      className='flex items-center gap-1 px-2 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed'>
                      {isProcessing ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                          <span className='hidden sm:inline'>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Download className='w-4 h-4' />
                          <span className='hidden sm:inline'>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Container */}
              <div className='p-3 sm:p-6'>
                <div
                  ref={previewContainerRef}
                  role='application'
                  aria-label={
                    editMode === 'helmet'
                      ? 'Helmet position preview. Click and drag to reposition the helmet. Use arrow keys to move, +/- to resize'
                      : 'Picture position preview. Click and drag to reposition your picture'
                  }
                  tabIndex={0}
                  className='relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-move aspect-square border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-pan-x touch-pan-y'
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseDown={onMouseDown}
                  onTouchStart={onMouseDown}
                  onTouchMove={onMouseMove}
                  onTouchEnd={onMouseUp}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{ cursor: isDraggingHelmet || isDraggingUserImage ? 'grabbing' : 'grab' }}>
                  {!isImageLoaded && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-50 z-10'>
                      <div className='text-center'>
                        <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3'></div>
                        <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                          Loading preview...
                        </p>
                      </div>
                    </div>
                  )}

                  <canvas
                    ref={previewCanvasRef}
                    className='absolute inset-0 w-full h-full transition-opacity duration-300'
                    style={{
                      opacity: isImageLoaded ? 1 : 0,
                    }}
                  />

                  {/* Enhanced Drag Hints */}
                  {isImageLoaded && (
                    <>
                      <div className='absolute top-3 left-3 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none'>
                        {isDraggingHelmet || isDraggingUserImage
                          ? 'Positioning...'
                          : 'Drag to move'}
                      </div>

                      {/* Mode indicator */}
                      <div className='absolute top-3 right-3 flex items-center gap-1 bg-black/75 text-white text-xs px-2 py-1 rounded'>
                        {editMode === 'helmet' ? (
                          <>
                            <Move className='w-3 h-3' />
                            Helmet
                          </>
                        ) : (
                          <>
                            <Camera className='w-3 h-3' />
                            Picture
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Restart Button */}
        <div className='lg:hidden mt-8 px-4'>
          <button
            onClick={onCancel}
            className='w-full p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all flex items-center justify-center gap-2 font-medium border border-gray-200 dark:border-gray-700'
            title='Start over'>
            <RotateCcw className='w-5 h-5' />
            Start Over
          </button>
        </div>
      </div>
    </section>
  );
};

export default React.memo(EditorInterface);
