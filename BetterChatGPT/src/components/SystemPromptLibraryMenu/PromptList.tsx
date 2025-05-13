// src/components/Prompt/PromptList.tsx

import React from 'react';
import useStore from '@store/store';

const PromptList: React.FC = () => {
  const prompts = useStore(state => state.prompts);
  const validationErrors = useStore(state => state.promptValidationErrors);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Available Prompts</h2>
      
      {prompts.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded-lg text-gray-600 text-center">
          No prompts available
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {prompts.map(prompt => {
            const hasErrors = !!validationErrors[prompt.id];
            
            return (
              <div 
                key={prompt.id} 
                className={`border rounded-lg p-4 ${
                  hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{prompt.name}</h3>
                  
                  {hasErrors && (
                    <div 
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                      title="This prompt has validation issues that were automatically fixed"
                    >
                      Fixed
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {prompt.prompt}
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="mr-4">
                    <span className="font-medium text-gray-700">Temperature:</span>{' '}
                    <span className={prompt.temperature < 0 || prompt.temperature > 1 ? 'text-red-600' : ''}>
                      {prompt.temperature.toFixed(2)}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>{' '}
                    <span className="text-gray-500">{prompt.id.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptList;