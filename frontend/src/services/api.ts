import axios from 'axios';

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.111.225:5003';

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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_ticket_by_workflow_id?workflow_id=${workflowId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ticket');
  }
  return response.json();
};

// 插入工单
export const insertTicket = async (ticket: Omit<Ticket, 'created_at' | 'updated_at'>) => {
  const params = new URLSearchParams({
    workflow_id: ticket.workflow_id,
    conversation_id: ticket.conversation_id,
    ticket_content_original: ticket.ticket_content_original,
    ticket_content_translated: ticket.ticket_content_translated,
    language: ticket.language,
    user_id: ticket.user_id
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insert_ticket?${params}`);
  if (!response.ok) {
    throw new Error('Failed to insert ticket');
  }
  return response.json();
};

// 插入工单工作流
export const insertTicketWorkflow = async (workflow: Omit<TicketWorkflow, 'id' | 'created_at' | 'updated_at'>) => {
  const params = new URLSearchParams({
    workflow_id: workflow.workflow_id,
    step_number: workflow.step_number,
    ai_message: workflow.ai_message || '',
    ai_message_translated: workflow.ai_message_translated || '',
    customer_message: workflow.customer_message || '',
    conversation_id: workflow.conversation_id,
    user_id: workflow.user_id
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insert_ticket_workflow?${params}`);
  if (!response.ok) {
    throw new Error('Failed to insert ticket workflow');
  }
  return response.json();
}; 