import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Bot, User, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { getWorkflowTranslation } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  stepNumber?: string;
  variables?: {
    original_answer?: string;
    database_translation?: string;
    translated_answer?: string;
    conversation_id?: string;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  // onTranslate: (content: string, messageIndex: number) => void; // Removed as it's unused
  conversationId?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  // onTranslate, // Removed as it's unused
  conversationId,
  setMessages 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const [translatingMessages, setTranslatingMessages] = useState<number[]>([]);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
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

  const toggleMessageExpand = (index: number) => {
    setExpandedMessages(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  useEffect(() => {
    console.log("messages:", messages);
  }, [messages]);

  const handleCopy = (text: string, key: string) => {
    if (!text) {
      console.error('No text to copy');
      return;
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 获取翻译内容
  const fetchTranslation = async (message: Message, index: number) => {
    const messageConversationId = message.variables?.conversation_id || conversationId;
    
    if (!messageConversationId || translatingMessages.includes(index)) {
      console.log('跳过翻译获取:', {
        reason: !messageConversationId ? 'conversationId不存在' : '正在翻译中',
        messageConversationId,
        conversationId,
        isTranslating: translatingMessages.includes(index)
      });
      return;
    }

    setTranslatingMessages(prev => [...prev, index]);
    try {
      console.log('调用翻译API:', {
        conversationId: messageConversationId,
        messageContent: message.content
      });
      const translation = await getWorkflowTranslation(messageConversationId, message.content);
      console.log('获取到翻译结果:', translation);

      if (translation) {
        setMessages(prevMessages => {
          console.log('更新消息的翻译:', {
            messageIndex: index,
            translation: translation,
            totalMessages: prevMessages.length
          });
          return prevMessages.map((msg, i) => 
            i === index ? {
              ...msg,
              variables: {
                ...msg.variables,
                database_translation: translation
              }
            } : msg
          );
        });
      }
    } catch (error) {
      console.error('获取翻译失败:', error);
    } finally {
      setTranslatingMessages(prev => prev.filter(i => i !== index));
    }
  };

  // 点击显示翻译按钮的处理函数
  const handleTranslateClick = async (message: Message, index: number) => {
    console.log('点击显示翻译按钮:', {
      messageIndex: index,
      messageContent: message.content,
      hasTranslation: !!message.variables?.database_translation,
      conversationId,
      isExpanded: expandedMessages.includes(index)
    });

    toggleMessageExpand(index);
    
    // 如果是展开操作且没有翻译内容，获取翻译
    if (!expandedMessages.includes(index) && !message.variables?.database_translation) {
      console.log('开始获取翻译...');
      fetchTranslation(message, index);
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
                </div>
                {message.role === 'assistant' && (
                  <div className="space-y-2">
                    <div className="text-gray-900 relative group">
                      <pre className="font-sans text-inherit whitespace-pre-wrap break-words">
                        {message.content}
                      </pre>
                      <button
                        onClick={() => handleCopy(message.content, `message-${index}`)}
                        className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedStates[`message-${index}`] ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    
                    {!message.isLoading && (
                      <div 
                        className={`flex items-center gap-2 text-sm ${
                          message.isLoading 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-500 cursor-pointer hover:text-gray-700'
                        }`}
                        onClick={() => !message.isLoading && handleTranslateClick(message, index)}
                      >
                        {expandedMessages.includes(index) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>
                          {translatingMessages.includes(index) ? '正在获取翻译...' : '显示翻译'}
                        </span>
                      </div>
                    )}
                    
                    {expandedMessages.includes(index) && (
                      <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 relative group">
                        <pre className="font-mono text-inherit whitespace-pre-wrap">
                          {message.variables?.database_translation || '正在获取翻译...'}
                        </pre>
                        {message.variables?.database_translation && (
                          <button
                            onClick={() => handleCopy(message.variables?.database_translation || '', `translation-${index}`)}
                            className="absolute bottom-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedStates[`translation-${index}`] ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {message.role === 'user' && (
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <pre className="font-sans text-inherit whitespace-pre-wrap break-words">{message.content}</pre>
                  </div>
                )}
                {message.isLoading && (
                  <div className="mt-2 text-sm text-gray-500">
                    <div className="animate-pulse">●●●</div>
                  </div>
                )}
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
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  // 如果是正在使用输入法，不处理 Enter 键
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  if ((e.nativeEvent as any).isComposing || e.keyCode === 229) {
                    return;
                  }
                  
                  // 只在按下 Enter 且没有按下 Shift 键时发送消息
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) {
                      onSendMessage(input);
                      setInput('');
                    }
                  }
                }}
                // 添加 onCompositionEnd 事件处理
                onCompositionEnd={(e: React.CompositionEvent<HTMLTextAreaElement>) => {
                  // 输入法输入完成后，如果用户按下了 Enter，不自动发送
                  if (e.data && input.trim()) {
                    return;
                  }
                }}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
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
