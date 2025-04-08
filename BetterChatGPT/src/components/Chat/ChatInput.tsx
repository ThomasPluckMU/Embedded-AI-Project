import React from 'react';
import { useState } from 'react';
import RefreshIcon from '@icon/RefreshIcon';
import SendIcon from '@icon/SendIcon';
import { DEFAULT_PROMPTS, DEFAULT_PROMPT } from '../../constants/prompt';

// Define TypeScript interfaces
interface Prompt {
  name: string;
  prompt: string;
  temperature: number;
}

interface TextFieldProps {
  message: string;
  setMessage: (message: string) => void;
  currentPrompt: Prompt;
  setCurrentPrompt: (prompt: Prompt) => void;
}

const ChatInput = () => {
  const [message, setMessage] = useState<string>('');
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(DEFAULT_PROMPT);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sending the message with the selected prompt
    console.log('Sending message with prompt:', currentPrompt);
    setMessage('');
  };

  return (
    <div className='w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient'>
      <form 
        className='stretch mx-2 flex flex-row gap-3 pt-2 last:mb-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6'
        onSubmit={handleSubmit}
      >
        <div className='relative flex h-full flex-1 md:flex-col'>
          <TextField 
            message={message} 
            setMessage={setMessage} 
            currentPrompt={currentPrompt}
            setCurrentPrompt={setCurrentPrompt}
          />
        </div>
      </form>
    </div>
  );
};

const TextField = ({ message, setMessage, currentPrompt, setCurrentPrompt }: TextFieldProps) => {
  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPrompt = DEFAULT_PROMPTS[e.target.value as keyof typeof DEFAULT_PROMPTS];
    setCurrentPrompt(selectedPrompt);
  };

  return (
    <div className='flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]'>
      <div className="flex items-center mb-2">
        <select 
          className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
          onChange={handlePromptChange}
          value={Object.keys(DEFAULT_PROMPTS).find(key => 
            DEFAULT_PROMPTS[key as keyof typeof DEFAULT_PROMPTS] === currentPrompt
          )}
        >
          {Object.keys(DEFAULT_PROMPTS).map((promptKey) => (
            <option key={promptKey} value={promptKey}>
              {DEFAULT_PROMPTS[promptKey as keyof typeof DEFAULT_PROMPTS].name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        tabIndex={0}
        data-id='2557e994-6f98-4656-a955-7808084f8b8c'
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className='m-0 w-full resize-none border-0 bg-transparent p-0 pl-2 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pl-0'
        style={{ maxHeight: '200px', height: '24px', overflowY: 'hidden' }}
      ></textarea>
      <button
        className='absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:bg-gray-100 dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent'
        aria-label='submit'
        type="submit"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default ChatInput;