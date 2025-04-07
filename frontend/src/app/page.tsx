'use client';

import { useState } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // 示例数据，实际应该从API获取
  const ticketData = {
    originalContent: "Hello, I need help with my account.",
    translatedContent: "你好，我需要帮助处理我的账户问题。"
  };

  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);

    // TODO: 调用Dify API获取AI响应
    // 这里暂时使用模拟数据
    const aiResponse: Message = {
      role: 'assistant',
      content: '感谢您的咨询。请问您具体遇到了什么问题？'
    };
    setMessages(prev => [...prev, aiResponse]);
  };

  const handleTranslate = (content: string) => {
    // TODO: 实现翻译功能
    console.log('翻译内容:', content);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <main className="h-screen flex flex-col bg-gray-50">
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
      
      <div className="flex-none border-b border-gray-100">
        <TicketContent
          originalContent={ticketData.originalContent}
          translatedContent={ticketData.translatedContent}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onTranslate={handleTranslate}
        />
      </div>
    </main>
  );
}
