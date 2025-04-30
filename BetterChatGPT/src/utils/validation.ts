// src/utils/validation.ts

export const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Prompt name is required.';
  if (name.length < 3) return 'Prompt name must be at least 3 characters.';
  return null;
};

export const validatePromptText = (text: string): string | null => {
  if (!text.trim()) return 'Prompt content is required.';
  return null;
};

export const validateTemperature = (temperature: number): string | null => {
  if (isNaN(temperature) || temperature < 0 || temperature > 1)
    return 'Temperature must be a number between 0 and 1.';
  return null;
};
