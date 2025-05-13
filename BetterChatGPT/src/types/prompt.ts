export interface Prompt {
  id: string;
  name: string;
  prompt: string;
  temperature: number;
}

// Add ValidationError interface
export interface ValidationError {
  field: string;
  message: string;
}

// Add validatePrompt function
export function validatePrompt(prompt: any): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check ID
  if (!prompt || typeof prompt.id !== 'string' || prompt.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'Prompt ID is required and must be a non-empty string'
    });
  }
  
  // Check name
  if (!prompt || typeof prompt.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Prompt name is required and must be a string'
    });
  } else if (prompt.name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Prompt name cannot be empty'
    });
  } else if (prompt.name.length > 50) {
    errors.push({
      field: 'name',
      message: 'Prompt name must be less than 50 characters'
    });
  }
  
  // Check prompt content
  if (!prompt || typeof prompt.prompt !== 'string') {
    errors.push({
      field: 'prompt',
      message: 'Prompt content is required and must be a string'
    });
  } else if (prompt.prompt.trim() === '') {
    errors.push({
      field: 'prompt',
      message: 'Prompt content cannot be empty'
    });
  }
  
  // Check temperature
  if (!prompt || typeof prompt.temperature !== 'number') {
    errors.push({
      field: 'temperature',
      message: 'Temperature is required and must be a number'
    });
  } else if (isNaN(prompt.temperature)) {
    errors.push({
      field: 'temperature',
      message: 'Temperature must be a valid number'
    });
  } else if (prompt.temperature < 0) {
    errors.push({
      field: 'temperature',
      message: 'Temperature must be at least 0'
    });
  } else if (prompt.temperature > 1) {
    errors.push({
      field: 'temperature',
      message: 'Temperature must be at most 1'
    });
  }
  
  return errors;
}

// Add fixPrompt function
export function fixPrompt(prompt: any): Prompt {
  const defaultPrompt: Prompt = {
    id: typeof prompt?.id === 'string' && prompt.id.trim() !== '' 
      ? prompt.id 
      : String(Date.now()),
    name: typeof prompt?.name === 'string' && prompt.name.trim() !== '' 
      ? prompt.name 
      : 'Untitled Prompt',
    prompt: typeof prompt?.prompt === 'string' && prompt.prompt.trim() !== '' 
      ? prompt.prompt 
      : 'Enter your prompt here...',
    temperature: typeof prompt?.temperature === 'number' && !isNaN(prompt.temperature)
      ? Math.max(0, Math.min(1, prompt.temperature)) // Clamp between 0 and 1
      : 0.5
  };
  
  return defaultPrompt;
}

// Add type guard function
export function isValidPrompt(obj: any): obj is Prompt {
  return validatePrompt(obj).length === 0;
}