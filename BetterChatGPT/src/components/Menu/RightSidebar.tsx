import React, { useState, useEffect } from 'react';
import useStore from '@store/store';

const RightSidebar = () => {
  const rightSidebarWidth = 250;
  const [query, setQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [autoTitle, setAutoTitle] = useState(true);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [userMode, setUserMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [ragFiles, setRagFiles] = useState<File[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  const handleSearch = () => {
    if (query.trim()) {
      setHistory((prev) => [query, ...prev.slice(0, 9)]);
      console.log('Search or send prompt:', query);
      setQuery('');
    }
  };

  const recentPrompts = [
    'How to use Zustand?',
    'Tailwind tips',
    'Summarize this paragraph',
  ];

  const favoritePrompts = [
    'Act like a mentor and review this code',
    'Give me ideas for a tech blog intro',
  ];

  return (
    <div
      className="fixed right-0 top-0 h-screen bg-gray-900 text-white shadow-lg z-[999] transition-transform duration-300 translate-x-0 flex flex-col"
      style={{ width: rightSidebarWidth }}
    >
      <div className="p-4 font-bold border-b border-gray-700 text-green-400">
        🔍 Search
      </div>

      <div className="flex-1 overflow-y-auto p-4 text-sm space-y-6">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded outline-none"
            placeholder="Type prompt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
          <button
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
            onClick={handleSearch}
          >
            Send
          </button>
        </div>

        {/* Upload Buttons Section */}
        <div className="space-y-6">
          {/* AUDIO TRANSCRIPT */}
          <div>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAudioFile(file);
              }}
            />
            <label
              htmlFor="audio-upload"
              className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white py-2 rounded cursor-pointer"
            >
              🎤 Audio Transcript
            </label>

            {audioFile && (
              <>
                <p className="mt-1 text-xs text-gray-300">
                  Selected: <span className="font-medium">{audioFile.name}</span>
                </p>
                <button
                  className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 rounded"
                  onClick={() => {
                    console.log('Uploading audio file:', audioFile);
                    alert(`Pretend uploading ${audioFile.name}`);
                  }}
                >
                  Upload Audio
                </button>
              </>
            )}
          </div>

          {/* RAG INGESTION */}
          <div>
            <input
              id="rag-upload"
              type="file"
              accept=".pdf,.txt"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setRagFiles(Array.from(files));
                }
              }}
            />
            <label
              htmlFor="rag-upload"
              className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white py-2 rounded cursor-pointer"
            >
              📥 RAG Ingestion
            </label>

            {ragFiles.length > 0 && (
              <>
                <ul className="mt-1 text-xs text-gray-300 list-disc list-inside">
                  {ragFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
                <button
                  className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 rounded"
                  onClick={() => {
                    console.log('Uploading RAG files:', ragFiles);
                    alert(`Pretend uploading ${ragFiles.length} RAG file(s)`);
                  }}
                >
                  Upload RAG Files
                </button>
              </>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <span>⚙️ Enable RAG</span>
            <input
              type="checkbox"
              checked={ragEnabled}
              onChange={() => setRagEnabled(!ragEnabled)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>👤 User Mode</span>
            <input
              type="checkbox"
              checked={userMode}
              onChange={() => setUserMode(!userMode)}
            />
          </div>
        </div>

        {/* Search History */}
        <div>
          <h3 className="text-gray-400 font-semibold mb-2">📜 Search History</h3>
          <ul className="space-y-1">
            {history.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-white text-gray-400"
                onClick={() => setQuery(item)}
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Prompts */}
        <div>
          <h3 className="text-gray-400 font-semibold mb-2">🧠 Recent Prompts</h3>
          <ul className="space-y-1">
            {recentPrompts.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-white text-gray-400"
                onClick={() => setQuery(item)}
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Favorite Prompts */}
        <div>
          <h3 className="text-gray-400 font-semibold mb-2">⭐ Favorite Prompts</h3>
          <ul className="space-y-1">
            {favoritePrompts.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-white text-gray-400"
                onClick={() => setQuery(item)}
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-gray-400 font-semibold mb-2">⚙️ Settings</h3>
          <div className="flex items-center justify-between mb-1">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Auto Title</span>
            <input
              type="checkbox"
              checked={autoTitle}
              onChange={() => setAutoTitle(!autoTitle)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
