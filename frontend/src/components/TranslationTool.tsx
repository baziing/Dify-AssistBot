import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Languages, ArrowRight, RefreshCw, ArrowLeftRight } from 'lucide-react';

interface TranslationToolProps {
  detectedLanguage?: string;
  onReset: () => void;
}

export const TranslationTool = forwardRef<{ resetTool: () => void }, TranslationToolProps>(
  ({ detectedLanguage, onReset }, ref) => {
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
      setSourceLanguage('auto');
      setTargetLanguage('zh');
      onReset();
    };

    // 暴露重置方法给父组件
    useImperativeHandle(ref, () => ({
      resetTool: () => {
        setSourceText('');
        setTranslatedText('');
        setSourceLanguage('auto');
        setTargetLanguage('zh');
      }
    }));

    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-none px-4 py-3 border-b border-gray-100">
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
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              onClick={handleReset}
            >
              <RefreshCw className="w-4 h-4" />
              <span>重置</span>
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
                className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                onClick={toggleLanguages}
                title="切换语言"
              >
                <ArrowLeftRight className="w-4 h-4" />
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
              size="icon"
              className="h-8 w-8 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
              onClick={handleTranslate}
              disabled={!sourceText.trim()}
              title="翻译"
            >
              <ArrowRight className="h-4 w-4" />
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
); 