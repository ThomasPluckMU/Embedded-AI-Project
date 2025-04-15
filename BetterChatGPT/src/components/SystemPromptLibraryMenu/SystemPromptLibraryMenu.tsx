import React, { useState } from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import PopupModal from '@components/PopupModal';
import { SystemPrompt } from '@type/prompt';

const SystemPromptLibraryMenu = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <div>
      <button
        className='btn btn-neutral'
        onClick={() => setIsModalOpen(true)}
        aria-label='System Prompts'
      >
        System Prompts
      </button>
      {isModalOpen && <SystemPromptPopup setIsModalOpen={setIsModalOpen} />}
    </div>
  );
};

const SystemPromptPopup = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const systemPrompts = useStore((state) => state.systemPrompts);
  const setSystemPrompts = useStore((state) => state.setSystemPrompts);
  const activeSystemPromptId = useStore((state) => state.activeSystemPromptId);
  const setActiveSystemPromptId = useStore((state) => state.setActiveSystemPromptId);

  const [newPromptName, setNewPromptName] = useState<string>('');
  const [newPromptContent, setNewPromptContent] = useState<string>('');
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  const handleSave = () => {
    if (editingPromptId) {
      // Update existing prompt
      const updatedPrompts = systemPrompts.map((prompt) =>
        prompt.id === editingPromptId
          ? { ...prompt, name: newPromptName, prompt: newPromptContent }
          : prompt
      );
      setSystemPrompts(updatedPrompts);
      setEditingPromptId(null);
    } else if (newPromptName && newPromptContent) {
      // Add new prompt
      const newPrompt: SystemPrompt = {
        id: uuidv4(),
        name: newPromptName,
        prompt: newPromptContent,
      };
      setSystemPrompts([...systemPrompts, newPrompt]);
    }
    
    // Reset form
    setNewPromptName('');
    setNewPromptContent('');
  };

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingPromptId(prompt.id);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.prompt);
  };

  const handleDelete = (id: string) => {
    const updatedPrompts = systemPrompts.filter((prompt) => prompt.id !== id);
    setSystemPrompts(updatedPrompts);
    
    // If we're deleting the active prompt, select another one
    if (id === activeSystemPromptId && updatedPrompts.length > 0) {
      setActiveSystemPromptId(updatedPrompts[0].id);
    }
  };

  const handleActivate = (id: string) => {
    setActiveSystemPromptId(id);
  };

  const handleCancel = () => {
    setNewPromptName('');
    setNewPromptContent('');
    setEditingPromptId(null);
  };

  return (
    <PopupModal
      title="System Prompts Library"
      setIsModalOpen={setIsModalOpen}
      cancelButton={false}
    >
      <div className='p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600 w-full max-h-[80vh] overflow-y-auto text-sm text-gray-900 dark:text-gray-300'>
        <div className='flex flex-col gap-4 max-w-4xl mx-auto'>
          <div className='border rounded-md p-3 sm:p-4 dark:border-gray-600'>
            <h3 className='text-lg font-bold mb-2'>
              {editingPromptId ? 'Edit System Prompt' : 'Add New System Prompt'}
            </h3>
            <div className='flex flex-col gap-2'>
              <div>
                <label className='block text-sm font-medium'>Name</label>
                <input
                  type='text'
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  className='w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700'
                  placeholder='Enter prompt name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium'>Prompt Content</label>
                <textarea
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                  className='w-full p-2 border rounded-md min-h-[120px] sm:min-h-[150px] dark:border-gray-600 dark:bg-gray-700'
                  placeholder='Enter system prompt content'
                />
              </div>
              <div className='flex justify-end gap-2 mt-2'>
                <button
                  className='btn btn-neutral'
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className='btn btn-primary'
                  onClick={handleSave}
                  disabled={!newPromptName || !newPromptContent}
                >
                  {editingPromptId ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-bold mb-2'>Your System Prompts</h3>
            {systemPrompts.length === 0 ? (
              <p className='text-gray-500 dark:text-gray-400'>No system prompts found</p>
            ) : (
              <div className='grid gap-2'>
                {systemPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`border rounded-md p-3 dark:border-gray-600 ${
                      prompt.id === activeSystemPromptId
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : ''
                    }`}
                  >
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                      <h4 className='font-medium'>{prompt.name}</h4>
                      <div className='flex flex-wrap gap-2'>
                        <button
                          className={`px-2 py-1 rounded-md text-xs ${
                            prompt.id === activeSystemPromptId
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                          onClick={() => handleActivate(prompt.id)}
                        >
                          {prompt.id === activeSystemPromptId ? 'Active' : 'Activate'}
                        </button>
                        <button
                          className='px-2 py-1 bg-blue-500 text-white rounded-md text-xs'
                          onClick={() => handleEdit(prompt)}
                        >
                          Edit
                        </button>
                        <button
                          className='px-2 py-1 bg-red-500 text-white rounded-md text-xs'
                          onClick={() => handleDelete(prompt.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className='mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2'>
                      {prompt.prompt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PopupModal>
  );
};

export default SystemPromptLibraryMenu;