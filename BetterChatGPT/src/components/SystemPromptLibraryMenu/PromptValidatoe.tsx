// src/components/Prompt/PromptValidator.tsx

import React from 'react';
import useStore from '@store/store';
import { isValidPrompt } from '@type/prompt';

const PromptValidator: React.FC = () => {
  const prompts = useStore(state => state.prompts);
  
  // Check for invalid prompts or temperatures
  const invalidPrompts = prompts.filter(prompt => !isValidPrompt(prompt));
  const promptsWithInvalidTemp = prompts.filter(
    prompt => isValidPrompt(prompt) && (prompt.temperature < 0 || prompt.temperature > 1)
  );
  
  // If all prompts are valid, don't show anything
  if (invalidPrompts.length === 0 && promptsWithInvalidTemp.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <div className="font-bold">Warning: Prompt Validation Issues</div>
      {invalidPrompts.length > 0 && (
        <p>{invalidPrompts.length} prompts have invalid structure and will be fixed automatically.</p>
      )}
      {promptsWithInvalidTemp.length > 0 && (
        <p>{promptsWithInvalidTemp.length} prompts have temperature values outside the valid range (0-1) and will be adjusted.</p>
      )}
    </div>
  );
};

export default PromptValidator;