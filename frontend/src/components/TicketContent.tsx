import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquare, Globe2 } from 'lucide-react';
import { getLanguageDisplay } from '@/config/languages';

interface TicketContentProps {
  originalContent?: string;
  translatedContent?: string;
  language?: string;
}

export function TicketContent({ originalContent, translatedContent, language }: TicketContentProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  // const [isExpanded, setIsExpanded] = useState(false); // Removed as unused
  // 新增：图片预览弹窗状态
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // 处理原始内容，移除"【工单】"前缀
  const processOriginalContent = (content?: string) => {
    if (!content) return '';
    return content.replace(/^【工单】/, '');
  };

  const hasContent = Boolean(originalContent || translatedContent);
  const currentContent = showOriginal ? processOriginalContent(originalContent) : translatedContent;
  // const hasMoreContent = currentContent && (currentContent.split('\n').length > 3 || currentContent.length > 200); // Removed as unused

  // 新增：尝试将内容解析为JSON数组（兼容 text 字段为对象字符串的情况，做简单粗暴的替换）
  let messageList: { text?: string; picture?: string; role?: string }[] = [];
  if (Array.isArray(currentContent)) {
    messageList = currentContent;
  } else if (
    typeof currentContent === 'string' &&
    currentContent.trim().startsWith('[') &&
    currentContent.trim().endsWith(']')
  ) {
    try {
      // 先直接尝试 parse
      messageList = JSON.parse(currentContent);
    } catch { // _e is declared but its value is never read.
      // 如果失败，再做粗暴替换兜底
      try {
        const fixed = currentContent
          .replace(/"text":"\{/g, '"text":{')
          .replace(/}\",\"picture\"/g, '},"picture"');
        messageList = JSON.parse(fixed);
      } catch (e2) {
        messageList = [];
        console.error('TicketContent JSON parse error:', e2);
      }

    }
  }

  // 处理 text 字段为对象字符串的情况（支持多key多气泡）
  function parseTextToBubbles(text?: string | object) {
    if (!text) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = undefined;
    // 如果本身就是对象
    if (typeof text === 'object' && text !== null) {
      obj = text;
    } else if (typeof text === 'string' && text.trim().startsWith('{') && text.trim().endsWith('}')) {
      try {
        const fixed = text.replace(/([{,])"([^",]+)":/g, '$1"$2":');
        obj = JSON.parse(fixed);
      } catch {} // _e is declared but its value is never read.
    }
    if (obj && typeof obj === 'object') {
      // 多key时每个key-value单独气泡
      return Object.entries(obj).map(([k, v]) => ({ key: k, value: v }));
    }
    // 不是对象时，原样返回
    return [{ value: text }];
  }

  const bubbleBase = "max-w-[90%] px-4 py-2 text-sm shadow-sm whitespace-pre-wrap break-words rounded-xl";
  const customerBubble = "self-start bg-white border border-gray-200 text-gray-700 rounded-bl-2xl";
  const supportBubble = "self-end bg-gray-100 text-gray-700 border border-gray-200 rounded-br-2xl";

  return (
    <div className="bg-gray-50 flex flex-col h-full">
      {/* 顶部标题栏 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-white">
          <MessageSquare className="w-5 h-5 text-gray-500" />
        </div>
        <h2 className="text-sm font-medium text-gray-700">工单内容</h2>
        {language && (
          <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
            <Globe2 className="w-4 h-4" />
            <span>{getLanguageDisplay(language)}</span>
          </div>
        )}
        {hasContent && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 ml-auto"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? '显示中文' : '显示原文'}
          </Button>
        )}
      </div>
      {/* 内容区，仿聊天气泡样式，支持滚动 */}
      <div className="px-4 pb-6 overflow-y-auto max-h-[calc(100vh-56px)]">
        {hasContent ? (
          <div className="flex flex-col gap-4">
            {messageList.length > 0 ? (
              messageList.map((msg, idx) => {
                const bubbles = parseTextToBubbles(msg.text);
                const isEmptyText = !bubbles[0] || !bubbles[0].value || String(bubbles[0].value).trim() === '';
                const isEmptyPic = !msg.picture || msg.picture.trim() === '';
                // 判断role，去除不可见字符
                const roleStr = (msg.role || '').replace(/[\u200b\u200c\u200d\ufeff]/g, '');
                const isCustomer = !roleStr || roleStr === 'customer';
                const bubbleAlign = isCustomer ? 'self-start' : 'self-end';
                if ((bubbles.length === 0 || isEmptyText) && !isEmptyPic) {
                  return (
                    <div key={idx} className={`${bubbleAlign} max-w-[90%] bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 shadow-sm whitespace-pre-wrap break-words`}>
                      {msg.picture && msg.picture.split(';').map((url, i) => {
                        const trimmed = url.trim();
                        const fullUrl = trimmed.startsWith('https://static.neocraftstudio.com')
                          ? trimmed
                          : `https://static.neocraftstudio.com${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
                        return trimmed && (
                          <img
                            key={i}
                            src={fullUrl}
                            alt="图片"
                            className="mt-2 h-24 w-24 object-cover rounded cursor-pointer inline-block mr-2"
                            onClick={() => setPreviewImg(fullUrl)}
                          />
                        );
                      })}
                    </div>
                  );
                }
                if (isEmptyText && isEmptyPic) {
                  return null;
                }
                // 新：所有key-value放在同一个气泡，key灰色加粗，key-value对换行，图片在下方
                return (
                  <div
                    key={idx}
                    className={`${bubbleBase} ${isCustomer ? customerBubble : supportBubble}`}
                  >
                    {bubbles.map((bubble, bidx) => (
                      <div key={bidx} className="mb-2">
                        {'key' in bubble && bubble.key && (
                          <div className="font-semibold text-gray-500 mb-0.5">{bubble.key}</div>
                        )}
                        <div className="break-words whitespace-pre-wrap">{String(bubble.value)}</div>
                      </div>
                    ))}
                    {msg.picture && msg.picture.split(';').map((url, i) => {
                      const trimmed = url.trim();
                      const fullUrl = trimmed.startsWith('https://static.neocraftstudio.com')
                        ? trimmed
                        : `https://static.neocraftstudio.com${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
                      return trimmed && (
                        <img
                          key={i}
                          src={fullUrl}
                          alt="图片"
                          className="mt-2 h-24 w-24 object-cover rounded cursor-pointer inline-block mr-2"
                          onClick={() => setPreviewImg(fullUrl)}
                        />
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <div className="self-start max-w-[90%] bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 shadow-sm whitespace-pre-wrap break-words">
                {currentContent}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400"> </div>
        )}
      </div>
      {/* 图片预览弹窗 */}
      {previewImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="预览" className="max-h-[90vh] max-w-[90vw] rounded shadow-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
