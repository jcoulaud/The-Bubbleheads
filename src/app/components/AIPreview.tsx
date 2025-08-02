import React from 'react';
import toast from 'react-hot-toast';

interface AIPreviewProps {
  imageUrl: string;
  format?: 'picture' | 'banner';
  onBack: () => void;
  onRegenerate: () => void;
  progress?: number;
  isGenerating?: boolean;
}

const AIPreview: React.FC<AIPreviewProps> = ({
  imageUrl,
  format = 'picture',
  onBack,
  onRegenerate,
  progress = 100,
  isGenerating = false,
}) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = format === 'banner' ? 'ai-generated-banner.png' : 'ai-generated-helmet.png';
    link.click();
    toast.success('Image downloaded!');
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast.success('Image copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy image');
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col'>
      <div className='flex-1 py-8 px-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-6'>
            <button
              onClick={onBack}
              className='flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              <span>Back to Upload</span>
            </button>
          </div>

          {/* Title */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
              AI Generated {format === 'banner' ? 'Banner' : 'Image'}
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Your AI-generated {format === 'banner' ? 'banner' : 'image'} is ready!
            </p>
          </div>

          {/* Image Preview */}
          <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6'>
            <div
              className={`relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ${
                format === 'banner' ? 'aspect-[3/1]' : 'aspect-square max-w-2xl mx-auto'
              }`}>
              <img src={imageUrl} alt='AI Generated' className='w-full h-full object-contain' />

              {/* Progress Indicator */}
              {isGenerating && progress < 100 && (
                <div className='absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4'>
                  <div className='mb-2'>
                    <div className='flex justify-between text-xs text-white mb-1'>
                      <span>Generating...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className='text-xs text-gray-300'>
                    Creating your AI image with partial rendering...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <button
              onClick={onRegenerate}
              className='flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                />
              </svg>
              <span>Regenerate</span>
            </button>

            <button
              onClick={copyToClipboard}
              className='flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
              <span>Copy Image</span>
            </button>

            <button
              onClick={downloadImage}
              className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AIPreview);
