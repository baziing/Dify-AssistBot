import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Languages, ArrowRight, RefreshCw } from 'lucide-react';

interface TranslationToolProps {
  detectedLanguage?: string;
  onReset: () => void;
}

export function TranslationTool({ detectedLanguage, onReset }: TranslationToolProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(detectedLanguage || 'auto');
  const [targetLanguage, setTargetLanguage] = useState(detectedLanguage === 'zh' ? 'en' : 'zh');

  // 当检测到的语言变化时更新源语言
  useEffect(() => {
    if (detectedLanguage) {
      setSourceLanguage(detectedLanguage);
      setTargetLanguage(detectedLanguage === 'zh' ? 'en' : 'zh');
    }
  }, [detectedLanguage]);

  // 处理翻译
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    // TODO: 在实际应用中，这里需要调用翻译API
    // 这里使用模拟数据
    const mockTranslation = sourceText;
    setTranslatedText(mockTranslation);
  };

  // 切换语言
  const toggleLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // 重置工具
  const handleReset = () => {
    setSourceText('');
    setTranslatedText('');
    onReset();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-none p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-gray-50">
              <Languages className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-sm font-medium text-gray-700">翻译工具</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900"
            onClick={handleReset}
          >
            重置
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-gray-500">
              源语言: {sourceLanguage === 'auto' ? '自动检测' : sourceLanguage === 'zh' ? '中文' : '英文'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
              onClick={toggleLanguages}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              切换
            </Button>
          </div>
          <Textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="请输入要翻译的文本..."
            className="h-[calc(25vh-40px)] resize-none"
          />
        </div>
        
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleTranslate}
            disabled={!sourceText.trim()}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">
            目标语言: {targetLanguage === 'zh' ? '中文' : '英文'}
          </div>
          <Textarea
            value={translatedText}
            readOnly
            placeholder="翻译结果将显示在这里..."
            className="h-[calc(25vh-40px)] resize-none bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
} 