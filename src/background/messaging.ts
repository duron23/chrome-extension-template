import { ExtensionMessage } from './types';
import { createOffscreenDocument } from './offscreen-utils';

/**
 * Sends a message to the offscreen document
 */
export async function sendMessageToOffscreen(message: ExtensionMessage): Promise<void> {
  // Ensure offscreen document exists before sending messages
  await createOffscreenDocument('AUDIO_PLAYBACK');
  await chrome.runtime.sendMessage(message);
}

/**
 * Example helper function to play audio via offscreen document
 */
export async function playAudio(audioSrc: string): Promise<void> {
  await sendMessageToOffscreen({
    target: 'offscreen',
    action: 'playAudio',
    data: { src: audioSrc },
  });
}

/**
 * Example helper function to copy text to clipboard via offscreen document
 */
export async function copyToClipboard(text: string): Promise<void> {
  await sendMessageToOffscreen({
    target: 'offscreen',
    action: 'copyToClipboard',
    data: { text },
  });
}
