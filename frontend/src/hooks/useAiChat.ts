import { useState, useCallback } from 'react';
import { aiChatApi, ChatMessage } from '../api/aiChat';

export const useAiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Merhaba! Ben Karabacak Gıda AI asistanıyım. Size satışlar, stok durumu, müşteriler ve stratejik öneriler hakkında yardımcı olabilirim. Ne sormak istersiniz?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatApi.sendMessage(content);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      console.error('AI Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Merhaba! Ben Karabacak Gıda AI asistanıyım. Size satışlar, stok durumu, müşteriler ve stratejik öneriler hakkında yardımcı olabilirim. Ne sormak istersiniz?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
