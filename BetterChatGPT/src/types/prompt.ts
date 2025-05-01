export interface Prompt {
  id: string;
  name: string;
  prompt: string;
  temperature: number; // Add this line
}

export interface SystemPrompt {
  id: string;
  name: string;
  prompt: string;
}
