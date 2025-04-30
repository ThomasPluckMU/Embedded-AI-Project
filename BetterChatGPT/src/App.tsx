// src/App.tsx

import React from 'react';
import PromptManager from './components/PromptManager';
import './styles/PromptManager.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>BetterChatGPT</h1>
      </header>
      <main className="app-content">
        <PromptManager />
      </main>
    </div>
  );
};

export default App;