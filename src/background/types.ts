// Types for the extension
export interface ExtensionMessage {
  target: string;
  action: string;
  data?: unknown;
}

export type OffscreenDocumentReason = 'AUDIO_PLAYBACK' | 'CLIPBOARD' | 'DOM_SCRAPING';

// Message targets
export const MESSAGE_TARGETS = {
  BACKGROUND: 'background',
  OFFSCREEN: 'offscreen',
  POPUP: 'popup',
  CONTENT: 'content'
} as const;

// Message actions
export const MESSAGE_ACTIONS = {
  OFFSCREEN_READY: 'offscreenReady',
  PLAY_AUDIO: 'playAudio',
  COPY_TO_CLIPBOARD: 'copyToClipboard'
} as const;
