'use client';

import { useState, useRef } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { TranslationTool } from '@/components/TranslationTool';
import { Button } from '@/components/ui/button';
import { PlusCircle, Languages } from 'lucide-react';
import { sendMessageToDify } from '@/services/dify';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  translated?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>();
  const [showTranslation, setShowTranslation] = useState(false);
  const [conversationId, setConversationId] = useState<string>();

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

    try {
      // 调用Dify API获取回复
      const response = await sendMessageToDify(`【工单】${content}`, conversationId);
      
      // 保存会话ID
      setConversationId(response.conversation_id);

      // 添加AI助手回复
      const aiResponse: Message = {
        role: 'assistant',
        content: response.answer
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting response from Dify:', error);
      // 添加错误消息
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleTranslate = async (content: string) => {
    // 更新第一条消息的翻译
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, translated: content } : msg
    ));

    try {
      // 调用Dify API获取翻译
      const response = await sendMessageToDify(`【翻译】${content}`, conversationId);
      
      // 更新翻译结果
      setMessages(prev => prev.map((msg, index) => 
        index === 0 ? { ...msg, translated: response.answer } : msg
      ));
    } catch (error) {
      console.error('Error getting translation from Dify:', error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setDetectedLanguage(undefined);
    setConversationId(undefined);
    // 重置翻译工具的状态
    if (translationToolRef.current) {
      translationToolRef.current.resetTool();
    }
  };

  // 创建一个ref来引用翻译工具组件
  const translationToolRef = useRef<{ resetTool: () => void }>(null);

  const firstMessage = messages.length > 0 ? messages[0] : null;

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
            originalContent={firstMessage?.content}
            translatedContent={firstMessage?.translated}
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
