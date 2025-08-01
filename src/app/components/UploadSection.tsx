import React from 'react';

interface UploadSectionProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
}) => {
  return (
    <section className='py-8 px-6'>
      <div className='max-w-2xl mx-auto'>
        <div className='text-center mb-6'>
          <h2 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
            Upload Your Photo
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Choose a photo to transform</p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}>
          {/* Upload Icon */}
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
                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                />
              </svg>
            </div>
          </div>

          {/* Upload Text */}
          <div className='space-y-2'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {isDragging ? 'Drop your photo here' : 'Drop your photo or click to browse'}
            </h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {isDragging ? 'Release to upload' : 'JPG, PNG, or GIF up to 10MB'}
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
      </div>
    </section>
  );
};

export default React.memo(UploadSection);
