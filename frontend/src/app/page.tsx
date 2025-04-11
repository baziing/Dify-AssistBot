'use client';

import { useState, useRef, useEffect } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { TranslationTool } from '@/components/TranslationTool';
import { Button } from '@/components/ui/button';
import { PlusCircle, Languages, Search } from 'lucide-react';
import { sendMessageToDify } from '@/services/dify';
import { getTicketByWorkflowId, insertTicket, insertTicketWorkflow, getTicketByConversationId } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  translated?: string;
  isLoading?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>();
  const [showTranslation, setShowTranslation] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [ticketContent, setTicketContent] = useState<{
    original?: string;
    translated?: string;
  }>({});
  const [workflowId, setWorkflowId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    // 检测语言（这里使用模拟数据，实际应用中需要调用语言检测API）
    const detectedLang = content.match(/[\u4e00-\u9fa5]/) ? 'zh' : 'en';
    setDetectedLanguage(detectedLang);

    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: content,
      translated: messages.length === 0 ? content : undefined
    };
    setMessages(prev => [...prev, userMessage]);

    // 如果是第一条消息，设置工单内容为加载状态
    if (messages.length === 0) {
      setTicketContent({
        original: content,
        translated: '正在思考中...'
      });
    }

    // 添加AI助手的加载消息
    const loadingMessage: Message = {
      role: 'assistant',
      content: '正在思考中...',
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // 调用Dify API获取回复
      const response = await sendMessageToDify(`【工单】${content}`, conversationId);
      
      // 保存会话ID
      setConversationId(response.conversation_id);

      // 更新AI助手消息
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? {
          role: 'assistant',
          content: response.answer,
          isLoading: false
        } : msg
      ));

      // 如果是第一条消息，尝试从数据库中获取工单信息
      if (messages.length === 0) {
        try {
          // 通过conversation_id获取工单信息
          console.log('正在通过会话ID获取工单信息:', response.conversation_id);
          const ticket = await getTicketByConversationId(response.conversation_id);
          console.log('获取到的工单信息:', ticket);

          if (ticket) {
            // 更新工单内容为翻译后的中文
            setTicketContent({
              original: ticket.ticket_content_original,
              translated: ticket.ticket_content_translated
            });
            
            // 设置工作流ID和语言
            setWorkflowId(ticket.workflow_id);
            setDetectedLanguage(ticket.language);
          } else {
            // 如果没有找到工单，创建新的工单
            console.log('未找到工单，创建新工单');
            const newWorkflowId = generateWorkflowId();
            setWorkflowId(newWorkflowId);

            // 创建新工单
            await insertTicket({
              workflow_id: newWorkflowId,
              conversation_id: response.conversation_id,
              ticket_content_original: content,
              ticket_content_translated: content,
              language: detectedLang,
              user_id: 'test_user_456'
            });

            setTicketContent({
              original: content,
              translated: content
            });
          }
        } catch (error) {
          console.error('Error handling ticket:', error);
          setTicketContent({
            original: content,
            translated: content
          });
        }
      }

      // 保存工单工作流记录
      if (workflowId) {
        try {
          await insertTicketWorkflow({
            workflow_id: workflowId,
            step_number: (messages.length / 2 + 1).toString(),
            ai_message: response.answer,
            ai_message_translated: response.answer, // 这里可以添加AI回复的翻译
            customer_message: content,
            conversation_id: response.conversation_id,
            user_id: 'test_user_456'
          });
        } catch (error) {
          console.error('Error saving ticket workflow:', error);
        }
      }
    } catch (error) {
      console.error('Error getting response from Dify:', error);
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? {
          role: 'assistant',
          content: '抱歉，我遇到了一些问题。请稍后再试。',
          isLoading: false
        } : msg
      ));

      if (messages.length === 0) {
        setTicketContent({
          original: content,
          translated: content
        });
      }
    }
  };

  // 生成工作流ID的辅助函数
  const generateWorkflowId = () => {
    return 'wf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // 从AI回复中提取工作流ID
  const extractWorkflowIdFromResponse = (response: string): string | null => {
    // 这里需要根据实际情况调整提取逻辑
    // 例如，如果AI回复中包含"工作流ID: 123456"这样的格式
    const match = response.match(/工作流ID:\s*(\w+)/i);
    return match ? match[1] : null;
  };

  const handleTranslate = async (content: string) => {
    // 更新第一条消息的翻译
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, translated: content } : msg
    ));

    // 添加AI助手的加载消息
    const loadingMessage: Message = {
      role: 'assistant',
      content: '正在翻译中...',
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // 调用Dify API获取翻译
      const response = await sendMessageToDify(`【翻译】${content}`, conversationId);
      
      // 更新翻译结果和移除加载消息
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // 移除加载消息
        return newMessages.map((msg, index) => 
          index === 0 ? { ...msg, translated: response.answer } : msg
        );
      });
    } catch (error) {
      console.error('Error getting translation from Dify:', error);
      // 移除加载消息
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setDetectedLanguage(undefined);
    setConversationId(undefined);
    setTicketContent({});
    setWorkflowId('');
    setError(null);
    // 重置翻译工具的状态
    if (translationToolRef.current) {
      translationToolRef.current.resetTool();
    }
  };

  // 创建一个ref来引用翻译工具组件
  const translationToolRef = useRef<{ resetTool: () => void }>(null);

  return (
    <main className="h-screen flex bg-gray-50 relative overflow-hidden">
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
        showTranslation ? 'mr-80' : 'mr-0'
      }`}>
        <div className="flex-none px-4 py-3 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">AI客服助手</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                <Languages className={`w-4 h-4 ${showTranslation ? 'text-gray-600' : 'text-gray-400'}`} />
                <span>{showTranslation ? '隐藏翻译' : '显示翻译'}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                onClick={handleNewChat}
              >
                <PlusCircle className="w-4 h-4" />
                <span>新建聊天</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-none bg-white border-b border-gray-100">
          <TicketContent 
            originalContent={ticketContent.original}
            translatedContent={ticketContent.translated}
          />
        </div>

        <div className="flex-1 min-h-0 bg-white">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onTranslate={handleTranslate}
          />
        </div>
      </div>
      
      <div className={`w-80 flex-none border-l border-gray-100 bg-white transition-all duration-300 absolute right-0 top-0 bottom-0 ${
        showTranslation ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <TranslationTool 
          ref={translationToolRef}
          detectedLanguage={detectedLanguage}
          onReset={handleNewChat}
        />
      </div>
    </main>
  );
}
