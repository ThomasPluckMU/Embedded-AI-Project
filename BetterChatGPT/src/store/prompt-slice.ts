import { StoreSlice } from './store';
import { Prompt, SystemPrompt } from '@type/prompt';
import { DEFAULT_PROMPTS } from '@constants/prompt';
import { DEFAULT_SYSTEM_PROMPTS } from '@constants/chat';

export interface PromptSlice {
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
}

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => {
  // Convert DEFAULT_PROMPTS object to array with ids
  const promptsArray: Prompt[] = Object.entries(DEFAULT_PROMPTS).map(([key, value]) => ({
    id: key,
    name: value.name,
    prompt: value.prompt,
  }));

  return {
    prompts: promptsArray,
    setPrompts: (prompts: Prompt[]) => {
      set((prev: PromptSlice) => ({
        ...prev,
        prompts: prompts,
      }));
    },
  };
};

export interface SystemPromptSlice {
  systemPrompts: SystemPrompt[];
  setSystemPrompts: (systemPrompts: SystemPrompt[]) => void;
  activeSystemPromptId: string;
  setActiveSystemPromptId: (id: string) => void;
}

export const createSystemPromptSlice: StoreSlice<SystemPromptSlice> = (set, get) => ({
  systemPrompts: DEFAULT_SYSTEM_PROMPTS,
  setSystemPrompts: (systemPrompts: SystemPrompt[]) => {
    set((prev: SystemPromptSlice) => ({
      ...prev,
      systemPrompts: systemPrompts,
    }));
  },
  activeSystemPromptId: "default",
  setActiveSystemPromptId: (id: string) => {
    set((prev: SystemPromptSlice) => ({
      ...prev,
      activeSystemPromptId: id,
    }));
  },
});