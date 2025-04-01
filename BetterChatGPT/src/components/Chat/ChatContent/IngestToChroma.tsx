import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import PopupModal from '@components/PopupModal';
import FileTextIcon from '@icon/FileTextIcon';

const IngestToChroma = React.memo(() => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestResult, setIngestResult] = useState<string | null>(null);
  
  const handleIngest = async () => {
    try {
      setIsIngesting(true);
      setIngestResult(null);
      
      const currentChatIndex = useStore.getState().currentChatIndex;
      const chats = useStore.getState().chats;
      
      if (!chats || currentChatIndex < 0 || currentChatIndex >= chats.length) {
        throw new Error('No chat selected');
      }
      
      const currentChat = chats[currentChatIndex];
      const { id, title, messages } = currentChat;
      
      // Format the chat messages for ChromaDB ingestion
      const formattedMessages = messages.map((message, index) => ({
        id: `${id}_${index}`,
        text: message.content,
        metadata: {
          role: message.role,
          chatId: id,
          title,
          timestamp: new Date().toISOString(),
          messageIndex: index
        }
      }));
      
      // Make POST request to the ChromaDB server
      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: formattedMessages
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to ingest chat: ${error}`);
      }
      
      const result = await response.json();
      setIngestResult('Chat successfully ingested to ChromaDB');
    } catch (error) {
      console.error('Error ingesting chat to ChromaDB:', error);
      setIngestResult(`Error: ${error.message}`);
    } finally {
      setIsIngesting(false);
    }
  };
  
  return (
    <>
      <button
        className='btn btn-neutral'
        aria-label='Ingest to ChromaDB'
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Ingest to ChromaDB
      </button>
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title='Ingest Chat to ChromaDB'
          cancelButton={true}
        >
          <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
            <p className='mb-4'>
              This will ingest the current chat into ChromaDB for future retrieval.
            </p>
            <button
              className='btn btn-primary gap-2'
              onClick={handleIngest}
              disabled={isIngesting}
            >
              <FileTextIcon />
              {isIngesting ? 'Ingesting...' : 'Confirm Ingest'}
            </button>
            
            {ingestResult && (
              <div className={`mt-4 p-2 rounded ${ingestResult.startsWith('Error') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                {ingestResult}
              </div>
            )}
          </div>
        </PopupModal>
      )}
    </>
  );
});

export default IngestToChroma;