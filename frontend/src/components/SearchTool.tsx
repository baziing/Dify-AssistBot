import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sendMessageToDify } from '@/services/dify';

interface QAResult {
  question: string;
  answer: string;
}

interface SearchToolProps {
  onReset: () => void;
  conversationId?: string;
}

export function SearchTool({ onReset, conversationId }: SearchToolProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<QAResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [jumpPage, setJumpPage] = useState('');

  // 生成分页按钮数组
  const getPageButtons = () => {
    const totalPages = searchResults.length;
    const maxButtons = 5; // 最多显示的按钮数
    const buttons: (number | string)[] = [];

    if (totalPages <= maxButtons) {
      // 如果总页数小于等于最大显示数，显示所有页码
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 始终显示第一页
    buttons.push(1);

    // 计算中间页码的起始和结束
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // 如果当前页靠近开始
    if (currentPage <= 3) {
      end = 4;
    }
    // 如果当前页靠近结束
    if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    // 添加省略号和中间页码
    if (start > 2) {
      buttons.push('...');
    }
    for (let i = start; i <= end; i++) {
      buttons.push(i);
    }
    if (end < totalPages - 1) {
      buttons.push('...');
    }

    // 始终显示最后一页
    buttons.push(totalPages);

    return buttons;
  };

  // 处理检索
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    setCurrentPage(1);
    setHasSearched(true);
    
    try {
      const response = await sendMessageToDify(`【搜索】${searchText}`, conversationId);
      if (response?.answer) {
        // 使用正则表达式匹配 Question 和 answer 对，支持多行内容
        const qaRegex = /Question":"(.*?)"\s*answer:"([\s\S]*?)(?=\s*Question|$)/g;
        const results: QAResult[] = [];
        let match;
        
        while ((match = qaRegex.exec(response.answer)) !== null) {
          const question = match[1].trim();
          const answer = match[2].trim().replace(/"\s*$/, ''); // 移除末尾的引号和空白
          
          if (question && answer) {
            results.push({
              question,
              answer
            });
          }
        }
        
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('检索失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleButtonClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getCurrentPageResult = () => {
    if (searchResults.length === 0) return null;
    const result = searchResults[currentPage - 1];
    return (
      <div className="whitespace-pre-wrap">
        <div className="font-medium mb-2">{result.question}</div>
        <div className="my-2 border-t border-black"></div>
        <div>{result.answer}</div>
      </div>
    );
  };

  const handlePageJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpPage);
      if (!isNaN(page) && page >= 1 && page <= searchResults.length) {
        setCurrentPage(page);
        setJumpPage('');
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < searchResults.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-none p-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Input
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              placeholder="输入关键词搜索..."
              className="pr-12 rounded-full border border-gray-200 bg-white focus:border-gray-300 focus:ring-0 transition-all duration-200"
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              variant="ghost"
              size="sm"
              className="absolute right-1.5 w-10 h-10 text-gray-400 hover:text-gray-600"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {hasSearched && (
          isSearching ? (
            <div className="p-4 text-center text-gray-500">
              正在检索...
            </div>
          ) : (
            searchResults.length > 0 ? (
              getCurrentPageResult()
            ) : (
              <div className="p-4 text-center text-gray-500">
                没有查询到相关内容
              </div>
            )
          )
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="flex-none py-3 px-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-sm">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-7 px-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {getPageButtons().map((item, index) => (
                typeof item === 'number' ? (
                  <Button
                    key={index}
                    variant={currentPage === item ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 min-w-[1.75rem] px-2",
                      currentPage === item
                        ? "bg-gray-900 text-white hover:bg-gray-800" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => handleButtonClick(item)}
                  >
                    {item}
                  </Button>
                ) : (
                  <span key={index} className="px-1 text-gray-400">...</span>
                )
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === searchResults.length}
                className="h-7 px-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {searchResults.length > 10 && (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
                <Input
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value.replace(/[^\d]/g, ''))}
                  onKeyDown={handlePageJump}
                  className="w-14 h-8 text-center rounded-md bg-white border-gray-200"
                  placeholder={`${currentPage}/${searchResults.length}`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 