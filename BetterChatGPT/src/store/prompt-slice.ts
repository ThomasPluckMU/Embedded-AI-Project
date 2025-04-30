import { StoreSlice } from './store';
import { Prompt } from '@type/prompt';
import defaultPrompts from '@constants/prompt';

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (commandPrompt: Prompt[]) => void;
}

// Convert the object structure to an array with IDs
const defaultPromptsArray: Prompt[] = Object.entries(defaultPrompts).map(([key, value]) => ({
  id: key, // Use the key as the ID
  ...value, // Spread the rest of the properties
}));

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  prompts: defaultPromptsArray,
  setPrompts: (prompts: Prompt[]) => {
    set((prev: PromptSlice) => ({
      ...prev,
      prompts: prompts,
    }));
  },
});