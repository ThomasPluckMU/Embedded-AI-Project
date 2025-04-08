import { StoreSlice } from './store';
import { Prompt } from '@type/prompt';
import { DEFAULT_PROMPTS } from '@constants/prompt';

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (commandPrompt: Prompt[]) => void;
}

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  // @ts-ignore
  prompts: DEFAULT_PROMPTS,
  setPrompts: (prompts: Prompt[]) => {
    set((prev: PromptSlice) => ({
      ...prev,
      prompts: prompts,
    }));
  },
});
