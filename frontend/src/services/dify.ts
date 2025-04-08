interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class DifyService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_DIFY_API_URL || '';
  }

  async sendMessage(conversationId: string, query: string): Promise<any> {
    try {
      console.log('Sending message to:', `${this.baseUrl}/chat-messages`);
      const response = await fetch(`${this.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          inputs: {},
          query: query,
          response_mode: 'streaming',
          user: 'default',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async createConversation(): Promise<any> {
    try {
      console.log('Creating conversation at:', `${this.baseUrl}/chat-messages`);
      const response = await fetch(`${this.baseUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          inputs: {},
          query: "你好",
          user: 'default',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return { conversation_id: data.conversation_id };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
} 