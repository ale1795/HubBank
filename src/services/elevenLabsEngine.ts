// Real-time voice engine: wraps the ElevenLabs Conversational AI browser SDK.
// The agent runs with client-side tools (see BankingContext), so the browser
// executes the actual banking API calls itself — no public webhook URL needed.
import { Conversation } from '@elevenlabs/client';
import type { Conversation as ConversationInstance } from '@elevenlabs/client';

export const ATENA_AGENT_ID = 'agent_5301m1t4hc84emfve30k0cdrz7qm';

export type AtenaLiveStatus = 'disconnected' | 'connecting' | 'connected';
export type AtenaLiveMode = 'listening' | 'speaking';

export interface AtenaSessionHandlers {
  clientTools: Record<string, (parameters: any) => Promise<string> | string>;
  dynamicVariables?: Record<string, string | number | boolean>;
  onModeChange: (mode: AtenaLiveMode) => void;
  onStatusChange: (status: AtenaLiveStatus | 'disconnecting') => void;
  onUserMessage: (text: string) => void;
  onAgentMessage: (text: string) => void;
  onError: (message: string) => void;
}

let activeConversation: ConversationInstance | null = null;

export function isAtenaSessionActive(): boolean {
  return !!activeConversation;
}

export async function startAtenaSession(handlers: AtenaSessionHandlers): Promise<ConversationInstance> {
  if (activeConversation) {
    return activeConversation;
  }

  const conversation = await Conversation.startSession({
    agentId: ATENA_AGENT_ID,
    connectionType: 'webrtc',
    clientTools: handlers.clientTools,
    dynamicVariables: handlers.dynamicVariables,
    onModeChange: (props) => handlers.onModeChange(props.mode),
    onStatusChange: (props) => handlers.onStatusChange(props.status),
    onMessage: (props) => {
      if (props.role === 'user') {
        handlers.onUserMessage(props.message);
      } else {
        handlers.onAgentMessage(props.message);
      }
    },
    onError: (message) => handlers.onError(message),
    onDisconnect: () => {
      activeConversation = null;
    },
  });

  activeConversation = conversation;
  return conversation;
}

export function sendAtenaText(text: string): void {
  activeConversation?.sendUserMessage(text);
}

export async function endAtenaSession(): Promise<void> {
  if (activeConversation) {
    const conversation = activeConversation;
    activeConversation = null;
    await conversation.endSession();
  }
}
