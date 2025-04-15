import { useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

interface SearchToolProps {
  onReset: () => void;
  conversationId?: string;
}

export function SearchTool({ onReset, conversationId }: SearchToolProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // 处理检索
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    
    try {
      // TODO: 实现检索逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      setSearchResults(['示例结果1', '示例结果2', '示例结果3', '示例结果4']);
    } catch (error) {
      console.error('检索失败:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 处理按钮点击
  const handleButtonClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // TODO: 根据页码加载对应的结果
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
        {searchResults.map((result, index) => (
          <div 
            key={index} 
            className="p-4 mb-2 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          >
            {result}
          </div>
        ))}
      </div>

      {searchResults.length > 0 && (
        <div className="flex-none py-4 px-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4].map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "min-w-[2rem] h-8",
                  currentPage === number 
                    ? "bg-gray-900 text-white hover:bg-gray-800" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => handleButtonClick(number)}
              >
                {number}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 