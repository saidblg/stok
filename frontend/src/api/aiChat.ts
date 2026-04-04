import apiClient from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const aiChatApi = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await apiClient.post<ApiResponse<ChatResponse>>('/ai-chat', { message });
    return response.data.data;
  },
};
