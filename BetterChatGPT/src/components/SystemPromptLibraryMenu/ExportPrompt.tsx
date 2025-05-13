// src/components/SystemPromptLibraryMenu/ExportPrompt.tsx

import React, { useState } from 'react';
import useStore from '@store/store';
import { exportPrompts } from '@utils/prompt';

const ExportPrompt: React.FC = () => {
  const prompts = useStore(state => state.prompts);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as 'csv' | 'json');
  };
  
  const handleExport = () => {
    try {
      if (prompts.length === 0) {
        setExportStatus('No prompts to export');
        return;
      }
      
      // Generate export content
      const exportContent = exportPrompts(prompts, format);
      if (!exportContent) {
        setExportStatus('Failed to generate export content');
        return;
      }
      
      // Create download link
      const blob = new Blob(
        [exportContent], 
        { type: format === 'csv' ? 'text/csv' : 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportStatus(`Successfully exported ${prompts.length} prompts as ${format.toUpperCase()}`);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setExportStatus(null);
      }, 3000);
    } catch (error) {
      setExportStatus(`Error exporting prompts: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Export Prompts</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Export Format</label>
        <select 
          value={format} 
          onChange={handleFormatChange}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
      
      <button
        onClick={handleExport}
        disabled={prompts.length === 0}
        className={`px-4 py-2 rounded-md ${
          prompts.length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        Export {prompts.length} Prompts
      </button>
      
      {exportStatus && (
        <div className={`mt-4 p-3 rounded-md ${
          exportStatus.includes('Successfully') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {exportStatus}
        </div>
      )}
    </div>
  );
};

export default ExportPrompt;