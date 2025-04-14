import axios from 'axios';
import { getWorkflowTranslation } from './api';

const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY;
const DIFY_API_ENDPOINT = process.env.NEXT_PUBLIC_DIFY_API_ENDPOINT;

interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  detected_language?: string;
  variables?: {
    original_customer_query?: string;
    original_customer_query_cn?: string;
    original_customer_language?: string;
    database_translation?: string;
  };
}

export async function sendMessageToDify(
  message: string,
  conversationId?: string
): Promise<DifyResponse> {
  try {
    console.log('Sending message to Dify:', { message, conversationId });

    // 1. 获取 AI 回答
    const response = await axios.post(
      `${DIFY_API_ENDPOINT}/chat-messages`,
      {
        inputs: {
          message: message
        },
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

    // 2. 等待一段时间，确保工单创建完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. 获取工作流翻译
    const translation = await getWorkflowTranslation(
      response.data.conversation_id,
      response.data.answer
    );

    console.log('Translation result:', translation);

    return {
      answer: response.data.answer,
      conversation_id: response.data.conversation_id,
      detected_language: response.data.variables?.original_customer_language,
      variables: {
        ...response.data.variables,
        database_translation: translation || null
      }
    };
  } catch (error) {
    console.error('Error sending message to Dify:', error);
    throw error;
  }
} 