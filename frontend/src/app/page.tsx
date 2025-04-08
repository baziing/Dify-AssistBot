'use client';

import { useState } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { TranslationTool } from '@/components/TranslationTool';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  translated?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>();

  const handleSendMessage = async (content: string) => {
    // 检测语言（这里使用模拟数据，实际应用中需要调用语言检测API）
    const detectedLang = content.match(/[\u4e00-\u9fa5]/) ? 'zh' : 'en';
    setDetectedLanguage(detectedLang);

    // 添加用户消息，保持原始格式
    const userMessage: Message = {
      role: 'user',
      content: content,
      // 如果是第一条消息，自动添加翻译，保持原始格式
      translated: messages.length === 0 ? content : undefined
    };
    setMessages(prev => [...prev, userMessage]);

    // 模拟AI助手回复
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: '您好！我是AI客服助手。我已经收到您的工单内容，请问还有什么可以帮助您的吗？'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    // TODO: 在实际应用中，这里需要调用Dify API获取真实的AI回复
  };

  const handleTranslate = async (content: string) => {
    // 更新第一条消息的翻译，保持原始格式
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, translated: content } : msg
    ));
    // TODO: 在实际应用中，这里需要调用翻译API
  };

  const handleNewChat = () => {
    setMessages([]);
    setDetectedLanguage(undefined);
  };

  const firstMessage = messages.length > 0 ? messages[0] : null;

  return (
    <main className="h-screen flex bg-gray-50">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-none px-4 py-3 bg-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">AI客服助手</h1>
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
      
      <div className="w-80 flex-none border-l border-gray-100 bg-white">
        <TranslationTool 
          detectedLanguage={detectedLanguage}
          onReset={handleNewChat}
        />
      </div>
    </main>
  );
}
