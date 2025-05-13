import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSlice, createChatSlice } from './chat-slice';
import { InputSlice, createInputSlice } from './input-slice';
import { AuthSlice, createAuthSlice } from './auth-slice';
import { ConfigSlice, createConfigSlice } from './config-slice';
import { PromptSlice, createPromptSlice } from './prompt-slice';
import { SystemPromptSlice, createSystemPromptSlice } from './prompt-slice';
import { ToastSlice, createToastSlice } from './toast-slice';
import {
  LocalStorageInterfaceV0ToV1,
  LocalStorageInterfaceV1ToV2,
  LocalStorageInterfaceV2ToV3,
  LocalStorageInterfaceV3ToV4,
  LocalStorageInterfaceV4ToV5,
  LocalStorageInterfaceV5ToV6,
  LocalStorageInterfaceV6ToV7,
  LocalStorageInterfaceV7oV8,
} from '@type/chat';
import {
  migrateV0,
  migrateV1,
  migrateV2,
  migrateV3,
  migrateV4,
  migrateV5,
  migrateV6,
  migrateV7,
} from './migrate';

export type StoreState = ChatSlice &
  InputSlice &
  AuthSlice &
  ConfigSlice &
  PromptSlice &
  SystemPromptSlice &
  ToastSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

export const createPartializedState = (state: StoreState) => ({
  chats: state.chats,
  currentChatIndex: state.currentChatIndex,
  apiKey: state.apiKey,
  apiEndpoint: state.apiEndpoint,
  assemblyAiApiKey: state.assemblyAiApiKey,
  theme: state.theme,
  autoTitle: state.autoTitle,
  advancedMode: state.advancedMode,
  prompts: state.prompts,
  systemPrompts: state.systemPrompts,
  activeSystemPromptId: state.activeSystemPromptId,
  defaultChatConfig: state.defaultChatConfig,
  defaultSystemMessage: state.defaultSystemMessage,
  hideMenuOptions: state.hideMenuOptions,
  firstVisit: state.firstVisit,
  hideSideMenu: state.hideSideMenu,
  folders: state.folders,
  enterToSubmit: state.enterToSubmit,
  inlineLatex: state.inlineLatex,
  markdownMode: state.markdownMode,
  totalTokenUsed: state.totalTokenUsed,
  countTotalTokens: state.countTotalTokens,
  useRAG: state.useRAG,
});

// Define the expected type for the migrated state
type PersistedState = ReturnType<typeof createPartializedState>;

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createChatSlice(set, get),
      ...createInputSlice(set, get),
      ...createAuthSlice(set, get),
      ...createConfigSlice(set, get),
      ...createPromptSlice(set, get),
      ...createSystemPromptSlice(set, get),
      ...createToastSlice(set, get),
    }),
    {
      name: 'free-chat-gpt',
      partialize: (state) => createPartializedState(state),
      version: 8,
      migrate: (persistedState: unknown, version: number): PersistedState => {
        const state = persistedState as any;
        
        switch (version) {
          case 0:
            migrateV0(state as LocalStorageInterfaceV0ToV1);
          case 1:
            migrateV1(state as LocalStorageInterfaceV1ToV2);
          case 2:
            migrateV2(state as LocalStorageInterfaceV2ToV3);
          case 3:
            migrateV3(state as LocalStorageInterfaceV3ToV4);
          case 4:
            migrateV4(state as LocalStorageInterfaceV4ToV5);
          case 5:
            migrateV5(state as LocalStorageInterfaceV5ToV6);
          case 6:
            migrateV6(state as LocalStorageInterfaceV6ToV7);
          case 7:
            migrateV7(state as LocalStorageInterfaceV7oV8);
            break;
        }
        
        // Ensure all required properties exist
        if (!state.chats) state.chats = [];
        if (state.currentChatIndex === undefined) state.currentChatIndex = 0;
        if (state.apiEndpoint === undefined) state.apiEndpoint = "";
        if (state.theme === undefined) state.theme = "dark";
        if (state.autoTitle === undefined) state.autoTitle = false;
        if (state.advancedMode === undefined) state.advancedMode = false;
        if (state.prompts === undefined) state.prompts = [];
        if (state.systemPrompts === undefined) state.systemPrompts = [];
        if (state.activeSystemPromptId === undefined) state.activeSystemPromptId = null;
        if (state.hideMenuOptions === undefined) state.hideMenuOptions = false;
        if (state.firstVisit === undefined) state.firstVisit = true;
        if (state.hideSideMenu === undefined) state.hideSideMenu = false;
        if (state.folders === undefined) state.folders = {};
        if (state.enterToSubmit === undefined) state.enterToSubmit = true;
        if (state.inlineLatex === undefined) state.inlineLatex = false;
        if (state.markdownMode === undefined) state.markdownMode = true;
        if (state.totalTokenUsed === undefined) state.totalTokenUsed = 0;
        if (state.countTotalTokens === undefined) state.countTotalTokens = false;
        if (state.useRAG === undefined) state.useRAG = false;
        
        return state as PersistedState;
      },
    }
  )
);

export default useStore;