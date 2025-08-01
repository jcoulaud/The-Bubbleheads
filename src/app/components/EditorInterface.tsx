import {
  Camera,
  Download,
  FlipHorizontal,
  Minus,
  Move,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Target,
} from 'lucide-react';
import React, { useState } from 'react';
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
  isImageLoaded: boolean;
  isDraggingHelmet: boolean;
  isDraggingUserImage: boolean;
  useBackground: boolean;
  editMode: 'helmet' | 'user';
  onEditModeChange: (mode: 'helmet' | 'user') => void;
  onBackgroundToggle: (value: boolean) => void;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseUp: () => void;
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  onScaleAdjust: (delta: number) => void;
  onUserImageScaleAdjust: (delta: number) => void;
  onUserImageRotationAdjust: (delta: number) => void;
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
  onUserImageFlipToggle,
  onResetPosition,
  onResetUserImageTransform,
  onProcessImage,
  onCancel,
  isProcessing,
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
        <div className='mb-8 text-center'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>
            Perfect Your Creation
          </h2>
          <p className='text-gray-600'>
            Drag to position and use the controls to create your perfect space portrait.
          </p>
        </div>

        <div className='grid lg:grid-cols-5 gap-6'>
          {/* Compact Sidebar Controls */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Mode & Style Selection */}
            <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
              {/* Edit Mode */}
              <div>
                <h4 className='text-sm font-semibold text-gray-900 mb-3'>Edit Mode</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => onEditModeChange('helmet')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      editMode === 'helmet'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    <Move className='w-4 h-4' />
                    Helmet
                  </button>
                  <button
                    onClick={() => onEditModeChange('user')}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      editMode === 'user'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                    }`}>
                    <Camera className='w-4 h-4' />
                    Picture
                  </button>
                </div>
              </div>

              {/* Background Style */}
              <div>
                <h4 className='text-sm font-semibold text-gray-900 mb-3'>Background Style</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => onBackgroundToggle(true)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      useBackground
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                    }`}>
                    <span className='text-base'>🚀</span>
                    Space
                  </button>
                  <button
                    onClick={() => onBackgroundToggle(false)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      !useBackground
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <span className='text-base'>✨</span>
                    Clean
                  </button>
                </div>
              </div>
            </div>

            {/* Context-Sensitive Controls */}
            {editMode === 'helmet' ? (
              <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Move className='w-4 h-4 text-blue-600' />
                  <span className='font-medium text-gray-900'>Helmet Controls</span>
                </div>

                {/* Size Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Size</span>
                    <span className='text-sm font-medium text-blue-600'>
                      {Math.round(((helmetScale - 0.7) / 1.3) * 100)}%
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onScaleAdjust(-0.13)}
                      className='p-1 hover:bg-gray-100 rounded'>
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
                      className='flex-1 h-2'
                    />
                    <button
                      onClick={() => onScaleAdjust(0.13)}
                      className='p-1 hover:bg-gray-100 rounded'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                <button
                  onClick={onResetPosition}
                  className='w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium'>
                  <Target className='w-4 h-4' />
                  Reset Position
                </button>
              </div>
            ) : (
              <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Camera className='w-4 h-4 text-green-600' />
                  <span className='font-medium text-gray-900'>Picture Controls</span>
                </div>

                {/* Size Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Size</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(((userImageScale - 0.1) / 2.9) * 100)}%
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImageScaleAdjust(-0.1)}
                      className='p-1 hover:bg-gray-100 rounded'>
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
                      className='flex-1 h-2'
                    />
                    <button
                      onClick={() => onUserImageScaleAdjust(0.1)}
                      className='p-1 hover:bg-gray-100 rounded'>
                      <Plus className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Rotation</span>
                    <span className='text-sm font-medium text-green-600'>
                      {Math.round(userImageRotation)}°
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => onUserImageRotationAdjust(-15)}
                      className='p-1 hover:bg-gray-100 rounded'>
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
                      className='flex-1 h-2'
                    />
                    <button
                      onClick={() => onUserImageRotationAdjust(15)}
                      className='p-1 hover:bg-gray-100 rounded'>
                      <RotateCw className='w-3 h-3' />
                    </button>
                  </div>
                </div>

                {/* Flip Control */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Flip Horizontal</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        userImageFlipped
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                      {userImageFlipped ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <button
                    onClick={onUserImageFlipToggle}
                    className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-medium ${
                      userImageFlipped
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                    }`}>
                    <FlipHorizontal className='w-4 h-4' />
                    {userImageFlipped ? 'Remove Flip' : 'Flip Picture'}
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={onResetUserImageTransform}
                  className='w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg transition-all flex items-center justify-center gap-2 font-medium'>
                  <Target className='w-4 h-4' />
                  Reset All Changes
                </button>
              </div>
            )}

            {/* Quick Info */}
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
              <div className='text-xs text-gray-500 mb-1'>Position</div>
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
          <div className='lg:col-span-3'>
            <div className='bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden'>
              {/* Floating Toolbar */}
              <div className='bg-gray-50 border-b border-gray-200 px-4 py-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-semibold text-gray-900'>Live Preview</h3>
                    <span className='text-sm text-gray-500'>
                      {editMode === 'helmet'
                        ? 'Drag helmet to position'
                        : 'Drag, resize & rotate picture'}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={onCancel}
                      className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all'
                      title='Start over'>
                      <RefreshCw className='w-4 h-4' />
                    </button>
                    <button
                      onClick={onProcessImage}
                      disabled={isProcessing}
                      className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed'>
                      {isProcessing ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className='w-4 h-4' />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Canvas Container */}
              <div className='p-6'>
                <div
                  ref={previewContainerRef}
                  role='application'
                  aria-label={
                    editMode === 'helmet'
                      ? 'Helmet position preview. Click and drag to reposition the helmet. Use arrow keys to move, +/- to resize'
                      : 'Picture position preview. Click and drag to reposition your picture'
                  }
                  tabIndex={0}
                  className='relative bg-gray-50 rounded-lg overflow-hidden cursor-move aspect-square border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseDown={onMouseDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{ cursor: isDraggingHelmet || isDraggingUserImage ? 'grabbing' : 'grab' }}>
                  {!isImageLoaded && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-50 z-10'>
                      <div className='text-center'>
                        <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3'></div>
                        <p className='text-sm text-gray-700 font-medium'>Loading preview...</p>
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
      </div>
    </section>
  );
};

export default React.memo(EditorInterface);
