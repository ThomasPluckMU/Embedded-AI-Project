// src/components/SystemPromptLibraryMenu/ImportPrompt.tsx

import React, { useState } from 'react';
import useStore from '@store/store';
import { importPromptCSV } from '@utils/prompt';
import { Prompt } from '@type/prompt';

const ImportPrompt: React.FC = () => {
  const setPrompts = useStore(state => state.setPrompts);
  const prompts = useStore(state => state.prompts);
  
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
    issues: string[];
  } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const content = await file.text();
      const result = importPromptCSV(content);
      
      if (result.prompts.length > 0) {
        // Add to existing prompts
        const updatedPrompts = [...prompts, ...result.prompts];
        setPrompts(updatedPrompts);
        
        setImportResult({
          success: true,
          count: result.prompts.length,
          issues: result.validationIssues
        });
      } else {
        setImportResult({
          success: false,
          count: 0,
          issues: result.validationIssues.length > 0 
            ? result.validationIssues 
            : ['No valid prompts found in the file']
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        count: 0,
        issues: [`Error importing file: ${error instanceof Error ? error.message : String(error)}`]
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Import Prompts</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          CSV should have columns: name, prompt, temperature
        </p>
      </div>
      
      <button
        onClick={handleImport}
        disabled={!file || isImporting}
        className={`px-4 py-2 rounded-md ${
          !file || isImporting
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isImporting ? 'Importing...' : 'Import Prompts'}
      </button>
      
      {importResult && (
        <div className={`mt-4 p-3 rounded-md ${
          importResult.success ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <p className={importResult.success ? 'text-green-700' : 'text-red-700'}>
            {importResult.success 
              ? `Successfully imported ${importResult.count} prompts` 
              : 'Import failed'}
          </p>
          
          {importResult.issues.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-gray-700">Issues:</p>
              <ul className="list-disc list-inside text-sm mt-1 max-h-40 overflow-y-auto">
                {importResult.issues.map((issue, index) => (
                  <li key={index} className="text-gray-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportPrompt;