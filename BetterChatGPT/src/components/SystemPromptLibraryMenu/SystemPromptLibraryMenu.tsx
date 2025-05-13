// src/components/Prompt/PromptSettings.tsx

import React, { useState } from 'react';
import useStore from '@store/store';
import { Prompt } from '@type/prompt';
import { v4 as uuidv4 } from 'uuid';

const PromptSettings: React.FC = () => {
  const prompts = useStore((state) => state.prompts);
  const setPrompts = useStore((state) => state.setPrompts);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTemperature, setEditTemperature] = useState(0.5);
  const [temperatureError, setTemperatureError] = useState('');
  
  // Function to validate temperature
  const validateTemperature = (value: number): string => {
    if (isNaN(value)) {
      return 'Temperature must be a number';
    }
    if (value < 0 || value > 1) {
      return 'Temperature must be between 0 and 1';
    }
    return '';
  };
  
  // Start editing a prompt
  const handleEdit = (index: number) => {
    const prompt = prompts[index];
    setEditingIndex(index);
    setEditName(prompt.name);
    setEditContent(prompt.prompt);
    setEditTemperature(prompt.temperature);
    setTemperatureError('');
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditingIndex(null);
  };
  
  // Save edited prompt
  const handleSave = () => {
    if (editingIndex === null) return;
    
    const error = validateTemperature(editTemperature);
    if (error) {
      setTemperatureError(error);
      return;
    }
    
    const updatedPrompts = [...prompts];
    updatedPrompts[editingIndex] = {
      ...updatedPrompts[editingIndex],
      name: editName,
      prompt: editContent,
      temperature: editTemperature
    };
    
    setPrompts(updatedPrompts);
    setEditingIndex(null);
  };
  
  // Delete a prompt
  const handleDelete = (index: number) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      const updatedPrompts = [...prompts];
      updatedPrompts.splice(index, 1);
      setPrompts(updatedPrompts);
    }
  };
  
  // Add a new prompt
  const handleAddPrompt = () => {
    const newPrompt: Prompt = {
      id: uuidv4(),
      name: 'New Prompt',
      prompt: 'Enter your prompt here...',
      temperature: 0.5
    };
    
    setPrompts([...prompts, newPrompt]);
  };
  
  // Handle temperature change
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEditTemperature(value);
    setTemperatureError(validateTemperature(value));
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prompt Settings</h2>
      
      <button 
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAddPrompt}
      >
        Add New Prompt
      </button>
      
      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            {editingIndex === index ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Prompt Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Temperature: {editTemperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editTemperature}
                    onChange={handleTemperatureChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                  {temperatureError && (
                    <p className="text-red-500 text-xs mt-1">{temperatureError}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{prompt.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{prompt.prompt}</p>
                
                <div className="mt-2">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Temperature:</span>
                    <span 
                      className={`text-sm font-medium ${
                        prompt.temperature < 0 || prompt.temperature > 1 
                          ? 'text-red-500' 
                          : 'text-green-500'
                      }`}
                    >
                      {prompt.temperature}
                      {(prompt.temperature < 0 || prompt.temperature > 1) && 
                        ' (Invalid - should be between 0 and 1)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {prompts.length === 0 && (
          <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            No prompts available. Click "Add New Prompt" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptSettings;