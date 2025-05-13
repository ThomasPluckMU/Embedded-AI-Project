// src/utils/prompt.ts

import { Prompt, validatePrompt, fixPrompt } from '@type/prompt';
import useStore from '@store/store';

// Function to add a new prompt
export function addPrompt(prompt: Partial<Prompt>): { 
  success: boolean; 
  prompt?: Prompt; 
  errors?: Array<{ field: string; message: string; }> 
} {
  try {
    // Create a complete prompt from partial data
    const newPrompt: Prompt = {
      id: prompt.id || `prompt-${Date.now()}`,
      name: prompt.name || 'New Prompt',
      prompt: prompt.prompt || '',
      temperature: typeof prompt.temperature === 'number' ? prompt.temperature : 0.5
    };
    
    // Validate the prompt
    const errors = validatePrompt(newPrompt);
    if (errors.length > 0) {
      console.warn('Validation errors when adding prompt:', errors);
      // Fix the prompt
      const fixedPrompt = fixPrompt(newPrompt);
      // Add to store
      const store = useStore.getState();
      store.setPrompts([...store.prompts, fixedPrompt]);
      return { success: true, prompt: fixedPrompt, errors };
    }
    
    // Add valid prompt to store
    const store = useStore.getState();
    store.setPrompts([...store.prompts, newPrompt]);
    return { success: true, prompt: newPrompt };
  } catch (error) {
    console.error('Error adding prompt:', error);
    return { 
      success: false, 
      errors: [{ field: 'general', message: 'Failed to add prompt' }] 
    };
  }
}

// Function to delete a prompt
export function deletePrompt(id: string): boolean {
  try {
    const store = useStore.getState();
    const filteredPrompts = store.prompts.filter(p => p.id !== id);
    
    // Check if any prompt was removed
    if (filteredPrompts.length === store.prompts.length) {
      console.warn(`No prompt found with id: ${id}`);
      return false;
    }
    
    store.setPrompts(filteredPrompts);
    return true;
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return false;
  }
}

// Function to update an existing prompt
export function updatePrompt(id: string, updates: Partial<Prompt>): {
  success: boolean;
  prompt?: Prompt;
  errors?: Array<{ field: string; message: string; }>
} {
  try {
    const store = useStore.getState();
    const promptIndex = store.prompts.findIndex(p => p.id === id);
    
    if (promptIndex === -1) {
      console.warn(`No prompt found with id: ${id}`);
      return { 
        success: false, 
        errors: [{ field: 'id', message: 'Prompt not found' }] 
      };
    }
    
    // Create updated prompt
    const updatedPrompt: Prompt = {
      ...store.prompts[promptIndex],
      ...updates
    };
    
    // Validate the updated prompt
    const errors = validatePrompt(updatedPrompt);
    if (errors.length > 0) {
      console.warn('Validation errors when updating prompt:', errors);
      // Fix the prompt
      const fixedPrompt = fixPrompt(updatedPrompt);
      
      // Update in the store
      const updatedPrompts = [...store.prompts];
      updatedPrompts[promptIndex] = fixedPrompt;
      store.setPrompts(updatedPrompts);
      
      return { success: true, prompt: fixedPrompt, errors };
    }
    
    // Update valid prompt in store
    const updatedPrompts = [...store.prompts];
    updatedPrompts[promptIndex] = updatedPrompt;
    store.setPrompts(updatedPrompts);
    
    return { success: true, prompt: updatedPrompt };
  } catch (error) {
    console.error('Error updating prompt:', error);
    return { 
      success: false, 
      errors: [{ field: 'general', message: 'Failed to update prompt' }] 
    };
  }
}

// Import CSV function
export function importPromptCSV(csvContent: string): { 
  prompts: Prompt[]; 
  validationIssues: string[] 
} {
  const prompts: Prompt[] = [];
  const validationIssues: string[] = [];
  
  try {
    const lines = csvContent.split('\n');
    
    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, but respect quotes
      const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      if (columns.length >= 3) {
        const name = columns[0].replace(/^"|"$/g, '').trim();
        const promptText = columns[1].replace(/^"|"$/g, '').trim();
        const temperatureStr = columns[2].trim();
        
        // Parse temperature
        let temperature = 0.5;
        try {
          temperature = parseFloat(temperatureStr);
          if (isNaN(temperature)) {
            validationIssues.push(`Row ${i+1}: Invalid temperature value "${temperatureStr}", using default 0.5`);
            temperature = 0.5;
          }
          if (temperature < 0) {
            validationIssues.push(`Row ${i+1}: Temperature ${temperature} is below 0, clamped to 0`);
            temperature = 0;
          }
          if (temperature > 1) {
            validationIssues.push(`Row ${i+1}: Temperature ${temperature} is above 1, clamped to 1`);
            temperature = 1;
          }
        } catch (e) {
          validationIssues.push(`Row ${i+1}: Could not parse temperature "${temperatureStr}", using default 0.5`);
          temperature = 0.5;
        }
        
        const promptData = {
          id: `imported-${Date.now()}-${i}`,
          name,
          prompt: promptText,
          temperature
        };
        
        // Validate the prompt
        const errors = validatePrompt(promptData);
        if (errors.length > 0) {
          validationIssues.push(`Row ${i+1}: ${errors.map(e => `${e.field} - ${e.message}`).join(', ')}`);
          // Fix the prompt and add it
          prompts.push(fixPrompt(promptData));
        } else {
          prompts.push(promptData);
        }
      } else {
        validationIssues.push(`Row ${i+1}: Not enough columns (expected at least 3)`);
      }
    }
    
    return { prompts, validationIssues };
  } catch (error) {
    validationIssues.push(`Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
    return { prompts, validationIssues };
  }
}

// Export prompts function
export function exportPrompts(prompts: Prompt[], format: 'csv' | 'json' = 'csv'): string {
  try {
    if (format === 'json') {
      // Export as formatted JSON
      return JSON.stringify(prompts, null, 2);
    } else {
      // Export as CSV
      const header = 'name,prompt,temperature\n';
      const rows = prompts.map(prompt => {
        // Escape quotes in strings
        const escapedName = `"${prompt.name.replace(/"/g, '""')}"`;
        const escapedPrompt = `"${prompt.prompt.replace(/"/g, '""')}"`;
        return `${escapedName},${escapedPrompt},${prompt.temperature}`;
      });
      
      return header + rows.join('\n');
    }
  } catch (error) {
    console.error('Error exporting prompts:', error);
    return '';
  }
}