// src/components/PromptManager.tsx

import React, { useState, useEffect } from 'react';

// Define the Prompt interface
interface Prompt {
  id: string;
  name: string;
  prompt: string;
  temperature: number;
}

// Default prompts from your original application
const DEFAULT_PROMPTS: Record<string, Prompt> = {
  professionalAssistant: {
    id: 'professionalAssistant',
    name: "Professional Assistant",
    prompt: "You are a professional assistant focused on providing clear, concise, and accurate information.",
    temperature: 0.3
  },
  creativeWriter: {
    id: 'creativeWriter',
    name: "Creative Writer",
    prompt: "You are a creative writing assistant with expertise in storytelling.",
    temperature: 0.7
  },
  codingHelper: {
    id: 'codingHelper',
    name: "Coding Helper",
    prompt: "You are a programming assistant specialized in helping developers.",
    temperature: 0.2
  }
};

const PromptManager: React.FC = () => {
  // State for all prompts
  const [prompts, setPrompts] = useState<Record<string, Prompt>>(DEFAULT_PROMPTS);
  
  // Form state
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  
  // UI state
  const [nameError, setNameError] = useState('');
  const [textError, setTextError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Load prompts from localStorage on mount
  useEffect(() => {
    try {
      const savedPrompts = localStorage.getItem('better-chatgpt-prompts');
      if (savedPrompts) {
        const parsed = JSON.parse(savedPrompts);
        setPrompts({...DEFAULT_PROMPTS, ...parsed});
      }
    } catch (e) {
      console.error('Failed to load prompts from localStorage:', e);
    }
  }, []);
  
  // Save prompts to localStorage when they change
  useEffect(() => {
    try {
      // Only save custom prompts (not default ones)
      const customPrompts: Record<string, Prompt> = {};
      Object.entries(prompts).forEach(([key, prompt]) => {
        if (!DEFAULT_PROMPTS[key]) {
          customPrompts[key] = prompt;
        }
      });
      localStorage.setItem('better-chatgpt-prompts', JSON.stringify(customPrompts));
    } catch (e) {
      console.error('Failed to save prompts to localStorage:', e);
    }
  }, [prompts]);
  
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Prompt name is required.');
      return false;
    } else if (value.length < 3) {
      setNameError('Prompt name must be at least 3 characters.');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };
  
  const validateText = (value: string) => {
    if (!value.trim()) {
      setTextError('Prompt content is required.');
      return false;
    } else {
      setTextError('');
      return true;
    }
  };
  
  const handleEditPrompt = (promptId: string) => {
    const prompt = prompts[promptId];
    setName(prompt.name);
    setText(prompt.prompt);
    setTemperature(prompt.temperature);
    setIsEditing(true);
    setEditingPromptId(promptId);
    setIsAddingNew(false);
  };
  
  const handleDeletePrompt = (promptId: string) => {
    // Don't allow deletion of default prompts
    if (DEFAULT_PROMPTS[promptId]) {
      alert("Default prompts cannot be deleted");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${prompts[promptId].name}"?`)) {
      const newPrompts = {...prompts};
      delete newPrompts[promptId];
      setPrompts(newPrompts);
    }
  };
  
  const handleAddNew = () => {
    setName('');
    setText('');
    setTemperature(0.7);
    setNameError('');
    setTextError('');
    setIsAddingNew(true);
    setIsEditing(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValid = validateName(name);
    const textValid = validateText(text);
    
    if (nameValid && textValid) {
      if (isEditing) {
        // Update existing prompt
        setPrompts({
          ...prompts,
          [editingPromptId]: {
            ...prompts[editingPromptId],
            name,
            prompt: text,
            temperature
          }
        });
        setSuccessMessage('Prompt updated successfully!');
      } else {
        // Add new prompt
        const promptId = name.toLowerCase().replace(/\s+/g, '_');
        
        // Check if ID already exists
        if (prompts[promptId] && !isEditing) {
          alert(`A prompt with name "${name}" already exists`);
          return;
        }
        
        setPrompts({
          ...prompts,
          [promptId]: {
            id: promptId,
            name,
            prompt: text,
            temperature
          }
        });
        setSuccessMessage('Prompt saved successfully!');
      }
      
      // Reset form
      setName('');
      setText('');
      setTemperature(0.7);
      setNameError('');
      setTextError('');
      setIsEditing(false);
      setIsAddingNew(false);
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    }
  };
  
  const handleCancel = () => {
    setName('');
    setText('');
    setTemperature(0.7);
    setNameError('');
    setTextError('');
    setIsEditing(false);
    setIsAddingNew(false);
  };
  
  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.3) return 'More deterministic, focused responses';
    if (temp <= 0.7) return 'Balanced creativity and coherence';
    return 'More creative, varied responses';
  };
  
  // Render the prompt form
  const renderPromptForm = () => (
    <div style={{ 
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#333',
        fontSize: '24px'
      }}>
        {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Prompt Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              validateName(e.target.value);
            }}
            placeholder="Enter a descriptive name"
            style={{
              width: '100%',
              padding: '10px',
              border: nameError ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: nameError ? 'rgba(220, 53, 69, 0.05)' : 'white',
              fontSize: '15px'
            }}
          />
          {nameError && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '13px', 
              marginTop: '5px' 
            }}>
              {nameError}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Prompt Text
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              validateText(e.target.value);
            }}
            placeholder="Enter your prompt instructions here..."
            rows={5}
            style={{
              width: '100%',
              padding: '10px',
              border: textError ? '1px solid #dc3545' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: textError ? 'rgba(220, 53, 69, 0.05)' : 'white',
              fontSize: '15px',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ 
            textAlign: 'right', 
            fontSize: '12px', 
            color: '#6c757d',
            marginTop: '5px'
          }}>
            {text.length} characters
          </div>
          {textError && (
            <div style={{ 
              color: '#dc3545', 
              fontSize: '13px', 
              marginTop: '5px' 
            }}>
              {textError}
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Temperature: {temperature.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            fontSize: '13px', 
            color: '#666',
            fontStyle: 'italic',
            marginTop: '5px'
          }}>
            {getTemperatureDescription(temperature)}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginTop: '20px'
        }}>
          <button 
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              flex: '1'
            }}
          >
            {isEditing ? 'Update Prompt' : 'Save Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
  
  // Render the prompt list
  const renderPromptList = () => (
    <div>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        color: '#333',
        fontSize: '24px'
      }}>
        Manage Prompts
      </h2>
      
      {successMessage && (
        <div style={{
          backgroundColor: '#dff0d8',
          color: '#3c763d',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {successMessage}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        {Object.entries(prompts).map(([id, prompt]) => (
          <div key={id} style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{prompt.name}</h3>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Temperature: {prompt.temperature.toFixed(1)}
            </div>
            <p style={{ 
              margin: '0 0 15px 0', 
              color: '#555',
              fontSize: '14px'
            }}>
              {prompt.prompt.length > 150 
                ? prompt.prompt.substring(0, 150) + '...' 
                : prompt.prompt}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handleEditPrompt(id)}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeletePrompt(id)}
                disabled={Boolean(DEFAULT_PROMPTS[id])}
                style={{
                  backgroundColor: DEFAULT_PROMPTS[id] ? '#e0e0e0' : '#f44336',
                  color: DEFAULT_PROMPTS[id] ? '#9e9e9e' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: DEFAULT_PROMPTS[id] ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleAddNew}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add New Prompt
        </button>
      </div>
    </div>
  );
  
  return (
    <div style={{ 
      maxWidth: '700px', 
      margin: '30px auto',
      padding: '25px',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      {isEditing || isAddingNew ? renderPromptForm() : renderPromptList()}
    </div>
  );
};

export default PromptManager;