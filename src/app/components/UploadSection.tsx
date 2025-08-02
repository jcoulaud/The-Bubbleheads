import React from 'react';

interface UploadSectionProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAIGenerate: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
  onAIGenerate,
}) => {
  return (
    <section className='py-8 px-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h2 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            Choose Your Creation Method
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Add helmet to your existing avatar or create a brand new one with AI
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Custom Photo Option */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}>
            {/* Badge */}
            <div className='absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full'>
              Manual Editor
            </div>
            {/* Editor Icon */}
            <div className='mx-auto w-12 h-12 mb-4'>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  isDragging
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
            </div>

            {/* Upload Text */}
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Photo Editor
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {isDragging ? 'Drop to upload' : 'Upload your Twitter avatar'}
              </p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                Perfect for existing profile pics • Manual positioning
              </p>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={onFileSelect}
              className='hidden'
            />
          </div>

          {/* AI Generated Option */}
          <div
            className='relative border-2 border-solid rounded-xl p-8 text-center transition-all cursor-pointer border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/10'
            onClick={onAIGenerate}>
            {/* Badge */}
            <div className='absolute top-4 right-4 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full'>
              AI Powered
            </div>
            {/* AI Icon */}
            <div className='mx-auto w-12 h-12 mb-4'>
              <div className='w-12 h-12 rounded-lg flex items-center justify-center transition-all bg-gradient-to-br from-purple-500 to-blue-500 text-white'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
            </div>

            {/* AI Text */}
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                AI Generation
              </h3>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Create a brand new avatar</p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                Generate from scratch • Powered by OpenAI
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className='mt-8 grid md:grid-cols-2 gap-4 text-center'>
          <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
            <h4 className='text-sm font-medium text-blue-900 dark:text-blue-200 mb-1'>
              Photo Editor Mode
            </h4>
            <p className='text-xs text-blue-700 dark:text-blue-300'>
              Best for: Adding helmet to your existing Twitter/X profile picture
            </p>
          </div>
          <div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
            <h4 className='text-sm font-medium text-purple-900 dark:text-purple-200 mb-1'>
              AI Generation Mode
            </h4>
            <p className='text-xs text-purple-700 dark:text-purple-300'>
              Best for: Creating a completely new avatar from scratch
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(UploadSection);
