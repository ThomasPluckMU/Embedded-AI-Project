import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';

import useSubmit from '@hooks/useSubmit';

import { AssemblyAI } from 'assemblyai'

import { ChatInterface } from '@type/chat';

import PopupModal from '@components/PopupModal';
import TokenCount from '@components/TokenCount';
import CommandPrompt from '../CommandPrompt';

const EditView = ({
  content,
  setIsEdit,
  messageIndex,
  sticky,
}: {
  content: string;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  messageIndex: number;
  sticky?: boolean;
}) => {
  const inputRole = useStore((state) => state.inputRole);
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const useRAG = useStore((state) => state.useRAG);
  const setUseRAG = useStore((state) => state.setUseRAG);

  const [_content, _setContent] = useState<string>(content);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const textareaRef = React.createRef<HTMLTextAreaElement>();

  const { t } = useTranslation();

  const resetTextAreaHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|playbook|silk/i.test(
        navigator.userAgent
      );

    if (e.key === 'Enter' && !isMobile && !e.nativeEvent.isComposing) {
      const enterToSubmit = useStore.getState().enterToSubmit;

      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        handleGenerate();
        resetTextAreaHeight();
      } else if (
        (enterToSubmit && !e.shiftKey) ||
        (!enterToSubmit && (e.ctrlKey || e.shiftKey))
      ) {
        if (sticky) {
          e.preventDefault();
          handleGenerate();
          resetTextAreaHeight();
        } else {
          handleSave();
        }
      }
    }
  };

  const handleSave = () => {
    if (sticky && (_content === '' || useStore.getState().generating)) return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;
    if (sticky) {
      updatedMessages.push({ role: inputRole, content: _content });
      _setContent('');
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      setIsEdit(false);
    }
    setChats(updatedChats);
  };

  const { handleSubmit } = useSubmit();
  const handleGenerate = () => {
    if (useStore.getState().generating) return;
    const updatedChats: ChatInterface[] = JSON.parse(
      JSON.stringify(useStore.getState().chats)
    );
    const updatedMessages = updatedChats[currentChatIndex].messages;
    if (sticky) {
      if (_content !== '') {
        updatedMessages.push({ role: inputRole, content: _content });
      }
      _setContent('');
      resetTextAreaHeight();
    } else {
      updatedMessages[messageIndex].content = _content;
      updatedChats[currentChatIndex].messages = updatedMessages.slice(
        0,
        messageIndex + 1
      );
      setIsEdit(false);
    }
    setChats(updatedChats);
    handleSubmit();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      
      // Focus the textarea and place cursor at end when transcription is added
      if (_content) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(_content.length, _content.length);
      }
    }
  }, [_content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <>
      <div
        className={`w-full ${
          sticky
            ? 'py-2 md:py-3 px-2 md:px-4 border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]'
            : ''
        }`}
      >
        {sticky && (
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                useRAG 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              onClick={() => setUseRAG(!useRAG)}
              title={useRAG ? 'RAG is enabled - Using ChromaDB for context retrieval' : 'RAG is disabled - Toggle to enable ChromaDB context retrieval'}
            >
              <svg viewBox="0 0 1024 1024" fill="currentColor" style={{ width: '14px', height: '14px' }}>
                <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494zM504 618H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM312 490v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8z" />
              </svg>
              <span>RAG {useRAG ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className='m-0 resize-none rounded-lg bg-transparent overflow-y-hidden focus:ring-0 focus-visible:ring-0 leading-7 w-full placeholder:text-gray-500/40'
          onChange={(e) => {
            _setContent(e.target.value);
          }}
          value={_content}
          placeholder={t('submitPlaceholder') as string}
          onKeyDown={handleKeyDown}
          rows={1}
        ></textarea>
      </div>
      <EditViewButtons
        sticky={sticky}
        handleGenerate={handleGenerate}
        handleSave={handleSave}
        setIsModalOpen={setIsModalOpen}
        setIsEdit={setIsEdit}
        _setContent={_setContent}
      />
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('warning') as string}
          message={t('clearMessageWarning') as string}
          handleConfirm={handleGenerate}
        />
      )}
    </>
  );
};

const EditViewButtons = memo(
  ({
    sticky = false,
    handleGenerate,
    handleSave,
    setIsModalOpen,
    setIsEdit,
    _setContent,
  }: {
    sticky?: boolean;
    handleGenerate: () => void;
    handleSave: () => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    _setContent: React.Dispatch<React.SetStateAction<string>>;
  }) => {
    const { t } = useTranslation();
    const generating = useStore.getState().generating;
    const advancedMode = useStore((state) => state.advancedMode);

    const assemblyAiApiKey = useStore((state) => state.assemblyAiApiKey);

  	const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  	const client = new AssemblyAI({
      apiKey: assemblyAiApiKey ? assemblyAiApiKey : '',
    });

  	const transcribeAudioFile = async () => {
  		if (!audioFile) return;
  		
  		if (!assemblyAiApiKey) {
  		  // Show a toast message using the store's error mechanism
  		  useStore.getState().setError("AssemblyAI API key is required for audio transcription. Please add it in API settings.");
  		  return;
  		}
  		
  		try {
  		  setIsTranscribing(true);
  		  
    		const data = {
    			audio: audioFile,
    			speaker_labels: true,
    		};
    
    		const transcription = await client.transcripts.transcribe(data);
    		
    		let formattedText = '';
    		if (transcription.utterances && transcription.utterances.length > 0) {
    		  formattedText = transcription.utterances.map(utterance => 
    		    `Speaker ${utterance.speaker}: ${utterance.text}`
    		  ).join('\n\n');
    		} else {
    		  // Fallback to plain text if no utterances
    		  formattedText = transcription.text || '';
    		}
    		
    		_setContent(prevContent => {
    		  // If there's already content, add a newline before the transcription
    		  return prevContent.trim() ? `${prevContent}\n\n${formattedText}` : formattedText;
    		});
    		
    		console.log(transcription);
  		} catch (error: any) {
  		  console.error("Transcription error:", error);
  		  useStore.getState().setError(`Transcription failed: ${error.message || "Unknown error"}`);
  		} finally {
  		  setAudioFile(null);
  		  setIsTranscribing(false);
  		}
  	}

  	const handleAudioFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  		if (e.target.files) {
  			setAudioFile(e.target.files[0]);
  		}
  	}

    return (
      <div className='flex'>
        <div className='flex-1 text-center mt-2 flex justify-center items-center'>

          <div className='flex mr-auto items-center gap-2'>
            <div className="flex items-center">
              <div 
                className={`relative flex items-center gap-2 py-1 px-2 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${!assemblyAiApiKey ? 'opacity-70' : 'btn-neutral'}`}
                title={!assemblyAiApiKey ? "AssemblyAI API key required in API settings" : "Upload audio file for transcription"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.5V21" />
                  <rect x="8" y="21" width="8" height="2" rx="1" />
                </svg>
                <span className="text-xs">Transcribe Audio</span>
                {!assemblyAiApiKey && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-yellow-500">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <input
                  type="file"
                  accept="audio/*"
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  onChange={handleAudioFileInputChange}
                />
              </div>
            </div>

            {audioFile && !isTranscribing && (
              <div className="flex items-center gap-2">
                <span className="text-xs truncate max-w-[100px]" title={audioFile.name}>
                  {audioFile.name}
                </span>
                <button
                  className="btn-primary py-1 px-3 rounded text-xs flex items-center gap-1 hover:opacity-90 transition-opacity"
                  onClick={transcribeAudioFile}
                  disabled={!assemblyAiApiKey}
                  title={!assemblyAiApiKey ? "AssemblyAI API key required" : "Transcribe audio"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Transcribe
                </button>
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setAudioFile(null)}
                  title="Cancel"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {isTranscribing && (
              <div className="flex items-center gap-2">
                <div className="animate-pulse flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animation-delay-200"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animation-delay-400"></div>
                </div>
                <span className="text-xs">Transcribing...</span>
              </div>
            )}
          </div>
          
          {sticky && (
            <button
              className={`btn relative mr-2 btn-primary ${
                generating ? 'cursor-not-allowed opacity-40' : ''
              }`}
              onClick={handleGenerate}
              aria-label={t('generate') as string}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('generate')}
              </div>
            </button>
          )}

          {sticky || (
            <button
              className='btn relative mr-2 btn-primary'
              onClick={() => {
                !generating && setIsModalOpen(true);
              }}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('generate')}
              </div>
            </button>
          )}

          <button
            className={`btn relative mr-2 ${
              sticky
                ? `btn-neutral ${
                    generating ? 'cursor-not-allowed opacity-40' : ''
                  }`
                : 'btn-neutral'
            }`}
            onClick={handleSave}
            aria-label={t('save') as string}
          >
            <div className='flex items-center justify-center gap-2'>
              {t('save')}
            </div>
          </button>

          {sticky || (
            <button
              className='btn relative btn-neutral'
              onClick={() => setIsEdit(false)}
              aria-label={t('cancel') as string}
            >
              <div className='flex items-center justify-center gap-2'>
                {t('cancel')}
              </div>
            </button>
          )}
        </div>
        {sticky && advancedMode && <TokenCount />}
        <CommandPrompt _setContent={_setContent} />
      </div>
    );
  }
);

export default EditView;
