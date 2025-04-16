import React, { useEffect, useRef, useState } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { matchSorter } from 'match-sorter';
import { Prompt } from '@type/prompt';
import useHideOnOutsideClick from '@hooks/useHideOnOutsideClick';

const CommandPrompt = ({
  _setContent,
}: {
  _setContent: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  
  // Get prompts from the store and ensure it's always an array
  const storePrompts = useStore((state) => state.prompts) || [];
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [dropDown, setDropDown, dropDownRef] = useHideOnOutsideClick();
  const [_prompts, _setPrompts] = useState<Prompt[]>(Array.isArray(storePrompts) ? storePrompts : []);

  useEffect(() => {
    if (dropDown && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dropDown]);

  useEffect(() => {
    const currentPrompts = useStore.getState().prompts || [];
    if (Array.isArray(currentPrompts)) {
      const filteredPrompts = matchSorter(currentPrompts, input, {
        keys: ['name'],
      });
      _setPrompts(filteredPrompts);
    } else {
      _setPrompts([]);
    }
  }, [input]);

  useEffect(() => {
    _setPrompts(Array.isArray(storePrompts) ? storePrompts : []);
    setInput('');
  }, [storePrompts]);

  return (
    <div className='relative max-wd-sm' ref={dropDownRef}>
      <button
        className='btn btn-neutral btn-small'
        aria-label='prompt library'
        onClick={() => setDropDown(!dropDown)}
      >
        /
      </button>
      <div
        className={`${
          dropDown ? '' : 'hidden'
        } absolute top-100 bottom-100 right-0 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800 opacity-90`}
      >
        <div className='text-sm px-4 py-2 w-max'>{t('promptLibrary')}</div>
        <input
          ref={inputRef}
          type='text'
          className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 m-0 w-full mr-0 h-8 focus:outline-none'
          value={input}
          placeholder={t('search') as string}
          onChange={(e) => setInput(e.target.value)}
        />
        <ul className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0 w-max max-w-sm max-md:max-w-[90vw] max-h-32 overflow-auto'>
          {Array.isArray(_prompts) && _prompts.length > 0 ? (
            _prompts.map((prompt) => (
              <li
                key={prompt.id}
                className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer text-start w-full'
                onClick={() => {
                  _setContent((prev) => prev + prompt.prompt);
                  setDropDown(false);
                }}
              >
                {prompt.name}
              </li>
            ))
          ) : (
            <li className='px-4 py-2 text-gray-500 dark:text-gray-400'>
              {t('noPrompts')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPrompt;