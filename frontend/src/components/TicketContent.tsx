import { useState } from 'react';
import { Button } from './ui/button';
import { Languages, ChevronDown, ChevronUp } from 'lucide-react';

interface TicketContentProps {
  originalContent?: string;
  translatedContent?: string;
}

export function TicketContent({ originalContent, translatedContent }: TicketContentProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContent = Boolean(originalContent || translatedContent);
  const currentContent = showOriginal ? originalContent : translatedContent;
  const hasMoreContent = currentContent && (currentContent.split('\n').length > 3 || currentContent.length > 200);

  return (
    <div className="bg-white flex-none">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-gray-50">
              <Languages className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-sm font-medium text-gray-700">工单内容</h2>
          </div>
          {hasContent && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              {showOriginal ? '显示中文' : '显示原文'}
            </Button>
          )}
        </div>
        <div className="pl-10">
          {hasContent ? (
            <>
              <div 
                className={`text-sm text-gray-600 whitespace-pre-wrap break-words overflow-y-auto ${
                  !isExpanded ? 'line-clamp-3' : 'max-h-[calc(100vh-300px)]'
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {currentContent}
              </div>
              {hasMoreContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      收起 <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      展开全部 <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-400">
              请输入工单信息...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 