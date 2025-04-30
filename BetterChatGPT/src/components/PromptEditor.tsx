// src/components/PromptManager.tsx
import React, { useState } from 'react';
import '../styles/PromptManager.css';

// Define the Prompt interface
interface Prompt {
  name: string;
  prompt: string;
  temperature: number;
}

// Your default prompts
const DEFAULT_PROMPTS = {
  professionalAssistant: {
    name: "Professional Assistant",
    prompt: "You are a professional assistant focused on providing clear, concise, and accurate information.",
    temperature: 0.3
  },
  creativeWriter: {
    name: "Creative Writer",
    prompt: "You are a creative writing assistant with expertise in storytelling.",
    temperature: 0.7
  },
  codingHelper: {
    name: "Coding Helper",
    prompt: "You are a programming assistant specialized in helping developers.",
    temperature: 0.2
  }
};

const PromptManager: React.FC = () => {
  // State for prompts
  const [prompts, setPrompts] = useState<Record<string, Prompt>>(DEFAULT_PROMPTS);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<{
    key: string;
    prompt: Prompt;
  } | null>(null);
  
  // State for form fields
  const [formName, setFormName] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formTemperature, setFormTemperature] = useState(0.7);
  
  // State for messages
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Helper to show messages
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle edit button click
  const handleEdit = (key: string) => {
    const prompt = prompts[key];
    setCurrentPrompt({ key, prompt });
    setFormName(prompt.name);
    setFormPrompt(prompt.prompt);
    setFormTemperature(prompt.temperature);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Handle delete button click
  const handleDelete = (key: string) => {
    // Check if it's a default prompt (optional: you can allow deleting defaults too)
    const isDefaultPrompt = key in DEFAULT_PROMPTS;
    if (isDefaultPrompt) {
      showMessage("Cannot delete default prompts", "error");
      return;
    }

    // Ask for confirmation
    if (window.confirm(`Are you sure you want to delete "${prompts[key].name}"?`)) {
      const newPrompts = { ...prompts };
      delete newPrompts[key];
      setPrompts(newPrompts);
      showMessage("Prompt deleted successfully", "success");
    }
  };

  // Handle add new prompt button
  const handleAddNew = () => {
    setCurrentPrompt(null);
    setFormName('');
    setFormPrompt('');
    setFormTemperature(0.7);
    setIsAdding(true);
    setIsEditing(false);
  };

  // Handle form submission (save/update)
  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formName.trim()) {
      showMessage("Name is required", "error");
      return;
    }
    
    if (!formPrompt.trim()) {
      showMessage("Prompt text is required", "error");
      return;
    }
    
    if (formTemperature < 0 || formTemperature > 2) {
      showMessage("Temperature must be between 0 and 2", "error");
      return;
    }
    
    const promptData: Prompt = {
      name: formName,
      prompt: formPrompt,
      temperature: formTemperature
    };
    
    if (isAdding) {
      // Create a key from the name
      const key = formName.toLowerCase().replace(/\s+/g, '_');
      
      // Check if key already exists
      if (prompts[key]) {
        showMessage(`A prompt with the name "${formName}" already exists`, "error");
        return;
      }
      
      // Add new prompt
      setPrompts({
        ...prompts,
        [key]: promptData
      });
      
      showMessage("Prompt added successfully", "success");
    } else if (isEditing && currentPrompt) {
      // Update existing prompt
      setPrompts({
        ...prompts,
        [currentPrompt.key]: promptData
      });
      
      showMessage("Prompt updated successfully", "success");
    }
    
    // Reset form state
    setIsAdding(false);
    setIsEditing(false);
    setCurrentPrompt(null);
  };

  // Handle cancel button
  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(false);
    setCurrentPrompt(null);
  };

  return (
    <div className="prompt-manager">
      <h2>Manage Prompts</h2>
      
      {/* Messages */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Add/Edit Form */}
      {(isAdding || isEditing) && (
        <div className="prompt-form">
          <h3>{isAdding ? "Add New Prompt" : "Edit Prompt"}</h3>
          <form onSubmit={handleSavePrompt}>
            <div className="form-group">
              <label htmlFor="prompt-name">Name:</label>
              <input
                id="prompt-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter prompt name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prompt-text">Prompt Text:</label>
              <textarea
                id="prompt-text"
                value={formPrompt}
                onChange={(e) => setFormPrompt(e.target.value)}
                placeholder="Enter prompt instructions..."
                rows={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prompt-temperature">
                Temperature: {formTemperature.toFixed(1)}
              </label>
              <input
                id="prompt-temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formTemperature}
                onChange={(e) => setFormTemperature(parseFloat(e.target.value))}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isAdding ? "Add Prompt" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Prompts List */}
      {!isAdding && !isEditing && (
        <>
          <div className="prompts-list">
            {Object.entries(prompts).map(([key, prompt]) => (
              <div key={key} className="prompt-item">
                <div className="prompt-details">
                  <h3>{prompt.name}</h3>
                  <div className="prompt-temp">Temperature: {prompt.temperature}</div>
                  <div className="prompt-preview">
                    {prompt.prompt.length > 100 
                      ? prompt.prompt.substring(0, 100) + '...' 
                      : prompt.prompt}
                  </div>
                </div>
                <div className="prompt-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEdit(key)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(key)}
                    disabled={key in DEFAULT_PROMPTS}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="button-container">
            <button onClick={handleAddNew} className="btn-primary">
              Add New Prompt
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PromptManager;