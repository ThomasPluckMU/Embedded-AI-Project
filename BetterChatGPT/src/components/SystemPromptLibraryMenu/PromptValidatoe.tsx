// src/components/Prompt/PromptValidator.tsx

import React, { useState, useEffect } from 'react';
import useStore from '@store/store';
import { ValidationError } from '@type/prompt';

// Props for the component
interface PromptValidatorProps {
  compact?: boolean;  // Show compact view
  iconOnly?: boolean; // Show only icon with count
}

const PromptValidator: React.FC<PromptValidatorProps> = ({ 
  compact = false,
  iconOnly = false
}) => {
  const prompts = useStore(state => state.prompts);
  const validationErrors = useStore(state => state.promptValidationErrors);
  const validateAllPrompts = useStore(state => state.validateAllPrompts);
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Run validation when prompts change
  useEffect(() => {
    validateAllPrompts();
  }, [prompts, validateAllPrompts]);
  
  // Count errors
  const errorCount = Object.keys(validationErrors).length;
  
  // If no errors, don't show anything
  if (errorCount === 0) {
    return null;
  }
  
  // Icon-only indicator
  if (iconOnly) {
    return (
      <div 
        className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 text-white text-xs cursor-help"
        title={`${errorCount} prompts have validation issues`}
      >
        {errorCount}
      </div>
    );
  }
  
  // Compact indicator
  if (compact) {
    return (
      <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
        <span role="img" aria-label="Warning">⚠️</span>{' '}
        {errorCount} {errorCount === 1 ? 'prompt has' : 'prompts have'} validation issues
      </div>
    );
  }
  
  // Full validator component with details
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div 
        className="flex justify-between items-center px-4 py-3 bg-yellow-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center text-yellow-800">
          <span role="img" aria-label="Warning" className="mr-2">⚠️</span>
          <span className="font-medium">
            {errorCount} {errorCount === 1 ? 'prompt has' : 'prompts have'} validation issues
          </span>
        </div>
        <div className="text-yellow-700">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-white p-4">
          {Object.entries(validationErrors).map(([promptId, errors]) => {
            // Find the prompt with this ID
            const prompt = prompts.find(p => p.id === promptId);
            if (!prompt) return null;
            
            return (
              <div key={promptId} className="mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0">
                <div className="font-medium mb-2">{prompt.name}</div>
                
                <ul className="text-sm space-y-1">
                  {errors.map((error: ValidationError, index: number) => (
                    <li key={index} className="text-red-600">
                      {error.field}: {error.message}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-2 text-xs text-gray-500">
                  These issues have been automatically fixed, but you should review the prompt.
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptValidator;