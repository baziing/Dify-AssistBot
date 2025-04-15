import axios from 'axios';

// 获取当前主机地址
const getBaseUrl = () => {
  // 如果有环境变量配置，优先使用
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 在服务器端渲染时返回默认值
  if (typeof window === 'undefined') {
    return 'http://localhost:5003';
  }
  
  // 在客户端使用当前主机地址
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5003`;
};

// API基础URL
const API_BASE_URL = getBaseUrl();

// 配置axios默认值
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false; // 禁用credentials

// 仅在客户端打印日志
if (typeof window !== 'undefined') {
  console.log('API 配置初始化完成:', {
    baseURL: API_BASE_URL,
    protocol: window.location.protocol,
    hostname: window.location.hostname
  });
}

// 工单接口
export interface Ticket {
  workflow_id: string;
  conversation_id: string;
  ticket_content_original: string;
  ticket_content_translated: string;
  language: string;
  user_id: string;
}

// 工单工作流接口
export interface TicketWorkflow {
  workflow_id: string;
  step_number: string;
  ai_message: string;
  ai_message_translated?: string;
  customer_message: string;
  conversation_id: string;
  user_id: string;
}

// 根据工作流ID获取工单信息
export const getTicketByWorkflowId = async (workflowId: string): Promise<Ticket> => {
  try {
    const response = await axios.get('/api/get_ticket_by_workflow_id', {
      params: { workflow_id: workflowId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket by workflow ID:', error);
    throw error;
  }
};

// 根据会话ID获取工单信息
export const getTicketByConversationId = async (conversationId: string): Promise<Ticket> => {
  try {
    const response = await axios.get('/api/get_ticket_by_conversation_id', {
      params: { conversation_id: conversationId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket by conversation ID:', error);
    throw error;
  }
};

// 根据会话ID和消息内容获取工作流翻译
export const getWorkflowTranslation = async (conversationId: string, message: string): Promise<string> => {
  try {
    console.log('准备发送翻译请求:', {
      conversation_id: conversationId,
      message: message,
      api_url: `${API_BASE_URL}/api/get_workflow_translation`
    });

    const params = {
      conversation_id: conversationId,
      message: message
    };
    console.log('请求参数:', params);

    const response = await axios.get('/api/get_workflow_translation', { params });
    console.log('收到翻译响应:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // 如果响应是对象
    if (response.data && typeof response.data === 'object') {
      console.log('响应是对象，检查可用字段:', Object.keys(response.data));
      
      if (response.data.ai_message_translated) {
        console.log('使用 ai_message_translated 字段');
        return response.data.ai_message_translated;
      }
      
      if (response.data.translation) {
        console.log('使用 translation 字段');
        return response.data.translation;
      }
    }
    
    // 如果响应是字符串
    if (typeof response.data === 'string') {
      console.log('响应是字符串，直接返回');
      return response.data;
    }

    console.log('未找到有效的翻译内容');
    return '';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('翻译请求失败:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      });
    } else {
      console.error('翻译请求发生未知错误:', error);
    }
    return '';
  }
};

// 插入工单
export const insertTicket = async (ticket: Omit<Ticket, 'created_at' | 'updated_at'>) => {
  try {
    const response = await axios.post('/api/insert_ticket', null, {
      params: {
        workflow_id: ticket.workflow_id,
        conversation_id: ticket.conversation_id,
        ticket_content_original: ticket.ticket_content_original,
        ticket_content_translated: ticket.ticket_content_translated,
        language: ticket.language,
        user_id: ticket.user_id
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error inserting ticket:', error);
    throw error;
  }
};

// 插入工单工作流
export const insertTicketWorkflow = async (workflow: Omit<TicketWorkflow, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const response = await axios.post('/api/insert_ticket_workflow', null, {
      params: {
        workflow_id: workflow.workflow_id,
        step_number: workflow.step_number,
        ai_message: workflow.ai_message || '',
        ai_message_translated: workflow.ai_message_translated || '',
        customer_message: workflow.customer_message || '',
        conversation_id: workflow.conversation_id,
        user_id: workflow.user_id
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error inserting ticket workflow:', error);
    throw error;
  }
};
