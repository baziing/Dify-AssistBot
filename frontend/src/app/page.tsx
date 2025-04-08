'use client';

import { useState, useRef, useEffect } from 'react';
import { TicketContent } from '@/components/TicketContent';
import { ChatInterface } from '@/components/ChatInterface';
import { TranslationTool } from '@/components/TranslationTool';
import { Button } from '@/components/ui/button';
import { PlusCircle, Languages } from 'lucide-react';
import { DifyService } from '@/services/dify';

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
  const difyService = useRef(new DifyService());

  useEffect(() => {
    // 创建新的对话
    const initConversation = async () => {
      try {
        const response = await difyService.current.createConversation();
        setConversationId(response.conversation_id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };
    initConversation();
  }, []);

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
      if (!conversationId) {
        throw new Error('No conversation ID');
      }
      const response = await difyService.current.sendMessage(conversationId, content);
      const stream = response.body;
      if (!stream) {
        throw new Error('No response stream');
      }

      let assistantMessage = '';
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      // 添加助手消息占位
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.includes('data: ')) {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.event === 'message') {
                assistantMessage += data.message;
                // 更新最后一条消息
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantMessage }
                ]);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后重试。'
      }]);
    }
  };

  const handleTranslate = async (content: string) => {
    // 更新第一条消息的翻译，保持原始格式
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, translated: content } : msg
    ));
    // TODO: 在实际应用中，这里需要调用翻译API
  };

  const handleNewChat = async () => {
    setMessages([]);
    setDetectedLanguage(undefined);
    if (translationToolRef.current) {
      translationToolRef.current.resetTool();
    }
    try {
      const response = await difyService.current.createConversation();
      setConversationId(response.conversation_id);
    } catch (error) {
      console.error('Failed to create new conversation:', error);
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
                <span>翻译工具</span>
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
