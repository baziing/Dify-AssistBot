import axios from 'axios';

const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY;
const DIFY_API_ENDPOINT = process.env.NEXT_PUBLIC_DIFY_API_ENDPOINT;

interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  variables?: {
    original_customer_query?: string;
    original_customer_query_cn?: string;
  };
}

export async function sendMessageToDify(
  message: string,
  conversationId?: string
): Promise<DifyResponse> {
  try {
    console.log('Sending message to Dify:', { message, conversationId });

    const response = await axios.post(
      `${DIFY_API_ENDPOINT}/chat-messages`,
      {
        inputs: {},
        query: message,
        conversation_id: conversationId,
        user: 'user'
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Dify response:', response.data);

    return {
      answer: response.data.answer,
      conversation_id: response.data.conversation_id,
      variables: response.data.variables
    };
  } catch (error) {
    console.error('Error sending message to Dify:', error);
    throw error;
  }
} 