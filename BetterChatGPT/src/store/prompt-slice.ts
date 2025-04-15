import { StoreSlice } from './store';
import { Prompt } from '@type/prompt';
import { DEFAULT_PROMPTS, DEFAULT_PROMPT } from '@constants/prompt';

// Define defaultPrompts with explicit typing
const defaultPrompts = Object.entries(DEFAULT_PROMPTS).map(([id, promptData]: [string, {
  name: string;
  prompt: string;
  temperature: number;
}]) => ({
  id,
  name: promptData.name,
  prompt: promptData.prompt,
  temperature: promptData.temperature
}));

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (commandPrompt: Prompt[]) => void;
}

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  prompts: defaultPrompts,
  setPrompts: (prompts: Prompt[]) => {
    set((prev: PromptSlice) => ({
      ...prev,
      prompts: prompts,
    }));
  },
});