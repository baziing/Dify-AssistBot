import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Send, Bot, User } from 'lucide-react';
import { TranslationMessage } from './TranslationMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  stepNumber?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onTranslate: (content: string, messageIndex: number) => void;
}

export function ChatInterface({ messages, onSendMessage, onTranslate }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 px-4 py-3 ${
                message.role === 'assistant' ? 'bg-white' : ''
              }`}
            >
              <div className="flex-none w-8 h-8 rounded-sm flex items-center justify-center bg-gray-50">
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-gray-500" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {message.role === 'assistant' ? 'AI助手' : '用户'}
                  </span>
                  {message.role === 'assistant' && (() => {
                    try {
                      // 尝试解析消息内容，如果是翻译消息则不显示翻译按钮
                      JSON.parse(message.content);
                      return null;
                    } catch {
                      // 如果解析失败，说明是普通消息，显示翻译按钮
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
                          onClick={() => onTranslate(message.content, index)}
                        >
                          翻译
                        </Button>
                      );
                    }
                  })()}
                </div>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {(() => {
                    try {
                      // 尝试解析消息内容
                      const parsedContent = JSON.parse(message.content);
                      if (parsedContent.type === 'translation') {
                        return (
                          <TranslationMessage
                            original={parsedContent.original}
                            translation={parsedContent.translation}
                          />
                        );
                      }
                    } catch {
                      // 如果解析失败，说明是普通消息
                      return <pre className="font-sans text-inherit whitespace-pre-wrap">{message.content}</pre>;
                    }
                  })()}
                  {message.isLoading && (
                    <div className="mt-2 text-sm text-gray-500">
                      <div className="animate-pulse">●●●</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex-none border-t border-gray-100 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-xl border bg-white shadow-sm">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入您的问题..."
                className="min-h-[60px] max-h-[90px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      onSendMessage(input);
                      setInput('');
                    }
                  }
                }}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  );
} 