// src/components/SystemPromptLibraryMenu/PromptManager.tsx

import React, { useState } from 'react';
import useStore from '@store/store';
import { Prompt } from '@type/prompt';

const PromptManager: React.FC = () => {
  const prompts = useStore(state => state.prompts);
  const setPrompts = useStore(state => state.setPrompts);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: 'New Prompt',
    prompt: '',
    temperature: 0.5
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'temperature') {
      const temp = parseFloat(value);
      if (!isNaN(temp)) {
        setFormData({
          ...formData,
          temperature: Math.max(0, Math.min(1, temp))
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setMessage({
        type: 'error',
        text: 'Prompt name is required'
      });
      return;
    }
    
    if (!formData.prompt.trim()) {
      setMessage({
        type: 'error',
        text: 'Prompt content is required'
      });
      return;
    }
    
    try {
      // Create a new prompt with a unique ID
      const newPrompt: Prompt = {
        id: `prompt-${Date.now()}`,
        name: formData.name.trim(),
        prompt: formData.prompt.trim(),
        temperature: formData.temperature
      };
      
      // Add it to the prompts array
      const updatedPrompts = [...prompts, newPrompt];
      
      // Update the store
      setPrompts(updatedPrompts);
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Prompt added successfully'
      });
      
      // Reset form
      setFormData({
        name: 'New Prompt',
        prompt: '',
        temperature: 0.5
      });
      
      // Hide form
      setShowForm(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding prompt:', error);
      setMessage({
        type: 'error',
        text: 'Failed to add prompt: ' + (error instanceof Error ? error.message : String(error))
      });
    }
  };
  
  // Handle prompt deletion
  const handleDelete = (id: string) => {
    try {
      // Filter out the prompt with the given ID
      const updatedPrompts = prompts.filter(p => p.id !== id);
      
      // Check if any prompt was actually removed
      if (updatedPrompts.length === prompts.length) {
        console.warn('No prompt found with ID:', id);
        setMessage({
          type: 'error',
          text: 'Could not find prompt to delete'
        });
        return;
      }
      
      // Update the store
      setPrompts(updatedPrompts);
      
      // Show success message
      setMessage({
        type: 'success',
        text: 'Prompt deleted successfully'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setMessage({
        type: 'error',
        text: 'Failed to delete prompt: ' + (error instanceof Error ? error.message : String(error))
      });
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Prompt Manager</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Prompt
        </button>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      {showForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Add New Prompt</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt Content</label>
              <textarea
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border rounded"
                placeholder="Enter your prompt here..."
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Temperature: {formData.temperature.toFixed(1)}
              </label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Prompt
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-3">
        {prompts.map(prompt => (
          <div key={prompt.id} className="p-4 border rounded">
            <div className="flex justify-between">
              <h3 className="font-medium">{prompt.name}</h3>
              <div className="space-x-2">
                <button
                  onClick={() => handleDelete(prompt.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {prompt.prompt}
            </p>
            <div className="mt-2 text-sm">
              Temperature: {prompt.temperature}
            </div>
          </div>
        ))}
        
        {prompts.length === 0 && (
          <div className="p-6 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No prompts available. Click "Add New Prompt" to create one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptManager;