import React, { useState } from 'react';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { Position } from '../types';

interface EditorInterfaceProps {
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  helmetPosition: Position;
  helmetScale: number;
  isImageLoaded: boolean;
  isDraggingHelmet: boolean;
  useBackground: boolean;
  onBackgroundToggle: (value: boolean) => void;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseUp: () => void;
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  onScaleAdjust: (delta: number) => void;
  onResetPosition: () => void;
  onProcessImage: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

const EditorInterface: React.FC<EditorInterfaceProps> = ({
  previewCanvasRef,
  previewContainerRef,
  helmetPosition,
  helmetScale,
  isImageLoaded,
  isDraggingHelmet,
  useBackground,
  onBackgroundToggle,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onScaleAdjust,
  onResetPosition,
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
    adjustScale: onScaleAdjust,
    isActive: isFocused,
  });
  return (
    <section className='py-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-12 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Perfect Your Creation
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Drag to position the helmet and adjust the size to create your perfect space portrait.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-8'>
          {/* Controls */}
          <div className='order-1 lg:order-1 space-y-6'>
            {/* Style Selection */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-6'>
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>Helmet Style</h3>
                  <p className='text-sm text-gray-600'>Choose your background effect</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <button
                    onClick={() => onBackgroundToggle(true)}
                    aria-label='Select space effect style'
                    aria-pressed={useBackground}
                    className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                      useBackground
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                    }`}>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg'>
                        🚀
                      </div>
                      {useBackground && (
                        <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className='font-semibold text-gray-900 mb-1'>Space Effect</div>
                    <div className='text-sm text-gray-600'>Helmet with cosmic background</div>
                  </button>

                  <button
                    onClick={() => onBackgroundToggle(false)}
                    aria-label='Select clean look style'
                    aria-pressed={!useBackground}
                    className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                      !useBackground
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50'
                    }`}>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center text-white text-lg'>
                        ✨
                      </div>
                      {!useBackground && (
                        <div className='w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center'>
                          <svg
                            className='w-3 h-3 text-white'
                            fill='currentColor'
                            viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className='font-semibold text-gray-900 mb-1'>Clean Look</div>
                    <div className='text-sm text-gray-600'>Simple helmet on original photo</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Size Control */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-6'>
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-1'>
                    <h3 className='text-lg font-semibold text-gray-900'>Size Control</h3>
                    <div className='text-blue-600 font-semibold'>
                      {Math.round(((helmetScale - 0.7) / 1.3) * 100)}%
                    </div>
                  </div>
                  <p className='text-sm text-gray-600'>Adjust the helmet size</p>
                </div>

                <div className='flex items-center gap-4'>
                  <button
                    onClick={() => onScaleAdjust(-0.13)}
                    aria-label='Decrease helmet size'
                    className='w-10 h-10 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-300 rounded-lg flex items-center justify-center transition-all cursor-pointer'>
                    <svg
                      className='w-4 h-4 text-gray-600 hover:text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M20 12H4'
                      />
                    </svg>
                  </button>

                  <div className='flex-1'>
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
                      aria-label='Helmet size slider'
                      className='w-full slider'
                    />
                  </div>

                  <button
                    onClick={() => onScaleAdjust(0.13)}
                    aria-label='Increase helmet size'
                    className='w-10 h-10 bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-300 rounded-lg flex items-center justify-center transition-all cursor-pointer'>
                    <svg
                      className='w-4 h-4 text-gray-600 hover:text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Position Display */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
              <div className='p-6'>
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-1'>Position</h3>
                  <p className='text-sm text-gray-600'>Current helmet coordinates</p>
                </div>

                <div className='grid grid-cols-2 gap-3 mb-4'>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 text-center'>
                    <div className='text-2xl font-bold text-blue-600 mb-1'>
                      {Math.round(helmetPosition.x * 100)}%
                    </div>
                    <div className='text-xs text-gray-600 font-medium'>Horizontal</div>
                  </div>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 text-center'>
                    <div className='text-2xl font-bold text-blue-600 mb-1'>
                      {Math.round(helmetPosition.y * 100)}%
                    </div>
                    <div className='text-xs text-gray-600 font-medium'>Vertical</div>
                  </div>
                </div>

                <button
                  onClick={onResetPosition}
                  aria-label='Reset helmet position to center'
                  className='w-full bg-gray-100 hover:bg-blue-100 border border-gray-300 hover:border-blue-300 text-gray-700 hover:text-blue-700 px-4 py-3 rounded-lg transition-all font-medium cursor-pointer'>
                  🎯 Reset to Center
                </button>
              </div>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className='order-2 lg:order-2'>
            <div className='sticky top-8'>
              <div className='bg-white border border-gray-200 rounded-lg shadow-lg p-6'>
                <div className='mb-6'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-lg font-semibold text-gray-900'>Live Preview</h3>
                  </div>
                  <p className='text-sm text-gray-600'>Drag the helmet to position it perfectly</p>
                </div>

                <div
                  ref={previewContainerRef}
                  role='application'
                  aria-label='Helmet position preview. Click and drag to reposition the helmet. Use arrow keys to move, +/- to resize'
                  tabIndex={0}
                  className='relative bg-gray-50 rounded-lg overflow-hidden cursor-move aspect-square border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseDown={onMouseDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={{ cursor: isDraggingHelmet ? 'grabbing' : 'grab' }}>
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

                  {/* Drag Hint */}
                  {isImageLoaded && (
                    <div className='absolute top-3 left-3 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none'>
                      {isDraggingHelmet ? 'Positioning...' : 'Drag to move'}
                    </div>
                  )}
                </div>

                {/* Action Buttons - Below the preview */}
                <div className='mt-4 grid grid-cols-2 gap-3'>
                  <button
                    onClick={onCancel}
                    aria-label='Start over with a new image'
                    className='bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-medium transition-all cursor-pointer'>
                    🔄 Start Over
                  </button>

                  <button
                    onClick={onProcessImage}
                    disabled={isProcessing}
                    aria-label={isProcessing ? 'Processing image' : 'Download image with helmet'}
                    className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed cursor-pointer'>
                    <div className='flex items-center justify-center'>
                      {isProcessing ? (
                        <>
                          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                              fillRule='evenodd'
                              d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                              clipRule='evenodd'
                            />
                          </svg>
                          Download Image
                        </>
                      )}
                    </div>
                  </button>
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
