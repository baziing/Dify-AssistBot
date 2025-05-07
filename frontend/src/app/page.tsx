'use client';

import { useState, useRef, useEffect } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { TranslationTool } from '@/components/TranslationTool';
import { TranslationMessage } from '@/components/TranslationMessage';
import { Button } from '@/components/ui/button';
import { PlusCircle, Languages, Search } from 'lucide-react';
import { sendMessageToDify } from '@/services/dify';
import { 
  getTicketByWorkflowId, 
  insertTicket, 
  insertTicketWorkflow, 
  getTicketByConversationId,
  getWorkflowTranslation 
} from '@/services/api';
import { generateWorkflowId as generateUUID } from '@/utils/workflow';
import { SearchTool } from '@/components/SearchTool';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  translated?: string;
  isLoading?: boolean;
  stepNumber?: string;
  variables?: Record<string, any>;
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
  const [showSearch, setShowSearch] = useState(false);

  const handleSendMessage = async (content: string) => {
    console.log('开始处理消息时 messages.length:', messages.length);
    
    // 在开始时就判断是否是第一条消息
    const isFirstMessage = messages.length === 0;
    
    // 计算当前步骤号，从 0 开始
    const currentStepNumber = isFirstMessage ? '0' : 
      Math.floor(messages.length / 2).toString();
    
    // 添加用户消息
    const userMessage: Message = {
      role: 'user',
      content: content,
      translated: isFirstMessage ? content : undefined,
      stepNumber: currentStepNumber
    };
    setMessages(prev => [...prev, userMessage]);
    console.log('添加用户消息后 messages.length:', messages.length + 1);

    // 如果是第一条消息，设置工单内容为加载状态
    if (isFirstMessage) {
      console.log('检测到第一条消息');
      setTicketContent({
        original: content,
        translated: '正在思考中...'
      });
    }

    // 添加AI助手的加载消息
    const loadingMessage: Message = {
      role: 'assistant',
      content: '正在思考中...',
      isLoading: true,
      stepNumber: currentStepNumber
    };
    setMessages(prev => [...prev, loadingMessage]);
    console.log('添加AI加载消息后 messages.length:', messages.length + 2);

    try {
      const response = await sendMessageToDify(`【工单】${content}`, conversationId);
      
      // 更新会话ID
      if (!conversationId && response.conversation_id) {
        console.log('设置新的会话ID:', response.conversation_id);
        setConversationId(response.conversation_id);
      }

      // 如果是第一条消息，从数据库获取工单信息
      if (isFirstMessage) {
        console.log('准备获取工单信息时');
        try {
          const ticket = await getTicketByConversationId(response.conversation_id);
          if (ticket) {
            // 从response.variables中获取检测到的语言
            const detectedLang = response.variables?.original_customer_language || ticket.language || 'unknown';
            setDetectedLanguage(detectedLang);
            setTicketContent({
              original: ticket.ticket_content_original,
              translated: ticket.ticket_content_translated
            });
          } else {
            // 如果没有工单信息，仍然使用API返回的语言检测结果
            const detectedLang = response.variables?.original_customer_language || 'unknown';
            setDetectedLanguage(detectedLang);
            setTicketContent({
              original: content,
              translated: response.answer
            });
          }
        } catch (error) {
          console.error('Error getting ticket:', error);
          // 发生错误时仍然使用API返回的语言检测结果
          const detectedLang = response.variables?.original_customer_language || 'unknown';
          setDetectedLanguage(detectedLang);
          setTicketContent({
            original: content,
            translated: response.answer
          });
        }
      }

      // 更新AI助手消息
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 ? {
          role: 'assistant',
          content: response.answer,
          isLoading: false,
          stepNumber: currentStepNumber,
          variables: {
            ...response.variables,
            conversation_id: response.conversation_id
          }
        } : msg
      ));

      // 如果是第一条消息，保存工单信息
      if (isFirstMessage) {
        console.log('准备保存工单信息时');
        // 保存工单信息
        const newWorkflowId = generateUUID();
        setWorkflowId(newWorkflowId);

        try {
          // 创建新工单，使用最新的语言检测结果
          await insertTicket({
            workflow_id: newWorkflowId,
            conversation_id: response.conversation_id,
            ticket_content_original: content,
            ticket_content_translated: response.answer,
            language: response.variables?.original_customer_language || 'unknown',
            user_id: 'user'
          });
        } catch (error) {
          console.error('Error creating ticket:', error);
        }
      }

    } catch (error) {
      console.error('Error sending message to Dify:', error);
      // 移除加载消息
      setMessages(prev => prev.slice(0, -1));
    }
  };

  // 从AI回复中提取工作流ID
  const extractWorkflowIdFromResponse = (response: string): string | null => {
    // 这里需要根据实际情况调整提取逻辑
    // 例如，如果AI回复中包含"工作流ID: 123456"这样的格式
    const match = response.match(/工作流ID:\s*(\w+)/i);
    return match ? match[1] : null;
  };

  const handleTranslate = async (content: string, messageIndex: number) => {
    // 获取要翻译的消息
    const targetMessage = messages[messageIndex];
    if (!targetMessage) {
      console.error('No message found');
      return;
    }

    // 添加AI助手的加载消息
    const loadingMessage: Message = {
      role: 'assistant',
      content: '正在获取翻译...',
      isLoading: true,
      stepNumber: targetMessage.stepNumber
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      if (!conversationId) {
        throw new Error('No conversation ID available');
      }

      // 从数据库获取翻译，使用消息内容而不是stepNumber
      const translation = await getWorkflowTranslation(conversationId, content);
      
      // 移除加载消息
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // 移除加载消息
        if (translation) {
          // 如果找到了翻译，添加为新的消息，使用 TranslationMessage 组件
          return [...newMessages, {
            role: 'assistant',
            content: JSON.stringify({
              type: 'translation',
              original: content,
              translation: translation
            }),
            stepNumber: targetMessage.stepNumber
          }];
        } else {
          // 如果没有找到翻译，显示错误消息
          return [...newMessages, {
            role: 'assistant',
            content: '未找到对应的翻译内容。',
            stepNumber: targetMessage.stepNumber
          }];
        }
      });
    } catch (error) {
      console.error('Error getting translation:', error);
      // 显示错误消息
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // 移除加载消息
        return [...newMessages, {
          role: 'assistant',
          content: '获取翻译失败，请稍后重试。',
          stepNumber: targetMessage.stepNumber
        }];
      });
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
      {/* 左侧工单内容栏，宽度与工具栏一致 w-80，固定 */}
      <div className="fixed top-0 left-0 w-80 h-full bg-white border-r border-gray-100 z-20 flex flex-col overflow-y-auto">
        <TicketContent 
          originalContent={ticketContent.original}
          translatedContent={ticketContent.translated}
          language={detectedLanguage}
        />
      </div>
      {/* 主体内容，左侧留出 w-80 空间 */}
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ml-80 ${
        showTranslation || showSearch ? 'mr-80' : 'mr-0'
      }`}>
        <div className="flex-none px-4 py-3 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">AI客服助手</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  if (showSearch) {
                    setShowSearch(false);
                  } else {
                    setShowSearch(true);
                    setShowTranslation(false);
                  }
                }}
              >
                <Search className={`w-4 h-4 ${showSearch ? 'text-gray-600' : 'text-gray-400'}`} />
                <span>{showSearch ? '隐藏检索' : '显示检索'}</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  if (showTranslation) {
                    setShowTranslation(false);
                  } else {
                    setShowTranslation(true);
                    setShowSearch(false);
                  }
                }}
              >
                <Languages className={`w-4 h-4 ${showTranslation ? 'text-gray-600' : 'text-gray-400'}`} />
                <span>{showTranslation ? '隐藏翻译' : '显示翻译'}</span>
              </Button>
              <Button 
                variant="ghost"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                onClick={handleNewChat}
              >
                <PlusCircle className="w-4 h-4" />
                <span>新建聊天</span>
              </Button>
            </div>
          </div>
        </div>
        {/* 移除原有 TicketContent 位置 */}
        <div className="flex-1 min-h-0 bg-white">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onTranslate={handleTranslate}
            conversationId={conversationId}
            setMessages={setMessages}
          />
        </div>
      </div>
      {/* 右侧工具栏不变 */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-100 transform transition-transform duration-300 ${
          showTranslation || showSearch ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {showTranslation && (
          <TranslationTool
            detectedLanguage={detectedLanguage}
            onReset={handleNewChat}
            conversationId={conversationId}
            ref={translationToolRef}
          />
        )}
        {showSearch && (
          <SearchTool
            onReset={handleNewChat}
          />
        )}
      </div>
    </main>
  );
}
