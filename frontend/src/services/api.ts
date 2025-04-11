import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.111.225:5003';

// 配置axios默认值
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false; // 禁用credentials

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