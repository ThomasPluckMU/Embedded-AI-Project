// src/store/prompt-slice.ts

import { StoreSlice } from './store';
import { Prompt, validatePrompt, fixPrompt, ValidationError } from '@type/prompt';
import { DEFAULT_PROMPTS, DEFAULT_PROMPT } from '@constants/prompt';

// Process default prompts with validation
const defaultPrompts = Object.entries(DEFAULT_PROMPTS).map(([id, promptData]: [string, {
  name: string;
  prompt: string;
  temperature: number;
}]) => {
  const promptWithId = {
    id,
    ...promptData
  };
  
  const errors = validatePrompt(promptWithId);
  if (errors.length > 0) {
    console.warn(`Default prompt "${promptData.name}" has validation issues:`, errors);
    return fixPrompt(promptWithId);
  }
  
  return promptWithId as Prompt;
});

// Enhanced PromptSlice with validation
export interface PromptSlice {
  prompts: Prompt[];
  promptValidationErrors: Record<string, ValidationError[]>;
  setPrompts: (promptsToSet: any[]) => void;
  updatePrompt: (id: string, updatedData: Partial<Prompt>) => boolean;
  validateAllPrompts: () => Record<string, ValidationError[]>;
  clearValidationErrors: () => void;
}

export const createPromptSlice: StoreSlice<PromptSlice> = (set, get) => ({
  prompts: defaultPrompts,
  promptValidationErrors: {},
  
  setPrompts: (promptsToSet: any[]) => {
    // Validate and fix all prompts
    const validationErrors: Record<string, ValidationError[]> = {};
    const processedPrompts = promptsToSet.map(item => {
      const errors = validatePrompt(item);
      
      // If there are errors, fix the prompt
      if (errors.length > 0) {
        const fixedPrompt = fixPrompt(item);
        validationErrors[fixedPrompt.id] = errors;
        return fixedPrompt;
      }
      
      return item as Prompt;
    });
    
    set(state => ({
      ...state,
      prompts: processedPrompts,
      promptValidationErrors: validationErrors
    }));
  },
  
  updatePrompt: (id: string, updatedData: Partial<Prompt>) => {
    const prompts = get().prompts;
    const promptIndex = prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) return false;
    
    // Create updated prompt
    const currentPrompt = prompts[promptIndex];
    const updatedPrompt = {
      ...currentPrompt,
      ...updatedData
    };
    
    // Validate the updated prompt
    const errors = validatePrompt(updatedPrompt);
    const newValidationErrors = { ...get().promptValidationErrors };
    
    if (errors.length > 0) {
      // Store validation errors
      newValidationErrors[id] = errors;
      
      // Fix the prompt before saving
      const fixedPrompt = fixPrompt(updatedPrompt);
      const updatedPrompts = [...prompts];
      updatedPrompts[promptIndex] = fixedPrompt;
      
      set(state => ({
        ...state,
        prompts: updatedPrompts,
        promptValidationErrors: newValidationErrors
      }));
    } else {
      // Clear validation errors for this prompt
      if (newValidationErrors[id]) {
        delete newValidationErrors[id];
      }
      
      // Update without fixing
      const updatedPrompts = [...prompts];
      updatedPrompts[promptIndex] = updatedPrompt as Prompt;
      
      set(state => ({
        ...state,
        prompts: updatedPrompts,
        promptValidationErrors: newValidationErrors
      }));
    }
    
    return true;
  },
  
  validateAllPrompts: () => {
    const prompts = get().prompts;
    const validationErrors: Record<string, ValidationError[]> = {};
    let hasErrors = false;
    
    // Validate each prompt
    prompts.forEach(prompt => {
      const errors = validatePrompt(prompt);
      if (errors.length > 0) {
        validationErrors[prompt.id] = errors;
        hasErrors = true;
      }
    });
    
    // If there are errors, update the store
    if (hasErrors) {
      set(state => ({
        ...state,
        promptValidationErrors: validationErrors
      }));
    }
    
    return validationErrors;
  },
  
  clearValidationErrors: () => {
    set(state => ({
      ...state,
      promptValidationErrors: {}
    }));
  }
});

// Keep SystemPromptSlice with added validation
export interface SystemPromptSlice {
  systemPrompts: Prompt[];
  activeSystemPromptId: string | null;
  setSystemPrompts: (systemPrompts: any[]) => void;
  setActiveSystemPromptId: (id: string | null) => void;
}

export const createSystemPromptSlice: StoreSlice<SystemPromptSlice> = (set, get) => ({
  systemPrompts: [],
  activeSystemPromptId: null,
  setSystemPrompts: (systemPrompts: any[]) => {
    // Apply the same validation process as regular prompts
    const processedPrompts = systemPrompts.map(item => {
      const errors = validatePrompt(item);
      if (errors.length > 0) {
        console.warn(`System prompt has validation issues:`, errors);
        return fixPrompt(item);
      }
      return item as Prompt;
    });
    
    set(state => ({
      ...state,
      systemPrompts: processedPrompts,
    }));
  },
  setActiveSystemPromptId: (id: string | null) => {
    set(state => ({
      ...state,
      activeSystemPromptId: id,
    }));
  },
});