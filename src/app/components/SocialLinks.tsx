'use client';

export default function SocialLinks() {
  return (
    <div className='fixed top-4 left-4 z-50 flex items-center gap-2'>
      <a
        href='https://dyorhub.xyz/tokens/3G1yVFfKzZxsvTnAnJMQzZBtyTpfWUTY6G7685nRjups'
        target='_blank'
        rel='noopener noreferrer'
        className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group'
        aria-label='View on DYOR Hub'>
        <img
          src='/dyor-hub-clean.svg'
          alt='DYOR Hub'
          className='w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity duration-200 dark:invert'
        />
      </a>
      <a
        href='https://axiom.trade/t/3G1yVFfKzZxsvTnAnJMQzZBtyTpfWUTY6G7685nRjups/@jmisc'
        target='_blank'
        rel='noopener noreferrer'
        className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group'
        aria-label='View on Axiom'>
        <img
          src='/axiom.svg'
          alt='Axiom'
          className='w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-200 dark:invert'
        />
      </a>
      <a
        href='https://gmgn.ai/sol/token/eKMpq0u9_3G1yVFfKzZxsvTnAnJMQzZBtyTpfWUTY6G7685nRjups'
        target='_blank'
        rel='noopener noreferrer'
        className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group'
        aria-label='View on GMGN'>
        <img
          src='/gmgn.svg'
          alt='GMGN'
          className='w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity duration-200'
        />
      </a>
      <a
        href='https://dexscreener.com/solana/dufuudxe8eh663dfwx16n8lufcanyeseqwgvodoshzxc'
        target='_blank'
        rel='noopener noreferrer'
        className='p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 group'
        aria-label='View on DexScreener'>
        <img
          src='/dexscreener.svg'
          alt='DexScreener'
          className='w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-200 dark:invert'
        />
      </a>
    </div>
  );
}
