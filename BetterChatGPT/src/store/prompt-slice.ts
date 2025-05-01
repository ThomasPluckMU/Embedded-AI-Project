import { StoreSlice } from './store';
import { Prompt, SystemPrompt } from '@type/prompt';
import { DEFAULT_PROMPTS } from '@constants/prompt';
import { DEFAULT_SYSTEM_PROMPTS } from '@constants/chat';

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
}

// Convert the object structure to an array with IDs
const defaultPromptsArray: Prompt[] = Object.entries(defaultPrompts).map(([key, value]) => ({
  id: key, // Use the key as the ID
  ...value, // Spread the rest of the properties
}));

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  prompts: defaultPrompts,
  setPrompts: (prompts: Prompt[]) => {
    set((prev: PromptSlice) => ({
      ...prev,
      prompts: prompts,
    }));
  },
});