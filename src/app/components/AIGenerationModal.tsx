import React, { useRef, useState } from 'react';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, customImage?: string | null) => void;
  isGenerating?: boolean;
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCustomImage(null);
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim() || customImage) {
      onGenerate(customPrompt.trim(), customImage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
      <div className='relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            AI Image Generation
          </h2>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
            <svg
              className='w-5 h-5 text-gray-500 dark:text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Options Header */}
          <div className='text-center'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
              Choose your generation method
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Use text, image, or both to create your AI avatar
            </p>
          </div>

          {/* Option 1: Text Prompt */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                Option 1:
              </span>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Describe what you want
              </label>
            </div>
            <input
              type='text'
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={
                customImage
                  ? 'e.g., "in a cyberpunk style" or leave empty'
                  : 'e.g., cat, dog, robot, astronaut'
              }
              disabled={isGenerating}
              className='w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              autoFocus
            />
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              AI will generate a new character wearing the helmet
            </p>
          </div>

          {/* OR Separator */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-200 dark:border-gray-700'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium'>
                AND / OR
              </span>
            </div>
          </div>

          {/* Option 2: Custom Image Upload */}
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                Option 2:
              </span>
              <label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Upload your photo
              </label>
            </div>
            <div className='space-y-2'>
              {!customImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className='w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-400 transition-colors'>
                  <svg
                    className='mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                    />
                  </svg>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Click to upload a photo
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                    AI will add the helmet to your photo
                  </p>
                </div>
              ) : (
                <div className='flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={customImage}
                      alt='Uploaded'
                      className='w-12 h-12 rounded object-cover'
                    />
                    <div>
                      <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        {uploadedFileName}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Custom image uploaded
                      </p>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='text-red-500 hover:text-red-600 p-1'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='hidden'
              />
            </div>
          </div>

          {/* How it works */}
          <div className='bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 space-y-3'>
            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>How it works:</h3>
            <div className='space-y-2 text-xs text-gray-600 dark:text-gray-400'>
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 dark:text-purple-400 mt-0.5'>•</span>
                <p>
                  <strong>Text only:</strong> AI creates a new character based on your description
                </p>
              </div>
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 dark:text-purple-400 mt-0.5'>•</span>
                <p>
                  <strong>Image only:</strong> AI adds the helmet to your uploaded photo
                </p>
              </div>
              <div className='flex items-start gap-2'>
                <span className='text-purple-600 dark:text-purple-400 mt-0.5'>•</span>
                <p>
                  <strong>Both:</strong> AI uses your photo as reference to create the described
                  character
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              disabled={isGenerating}
              className='flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={(!customPrompt.trim() && !customImage) || isGenerating}
              className='flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
              {isGenerating ? (
                <>
                  <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  <span>Generate Image</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AIGenerationModal);
