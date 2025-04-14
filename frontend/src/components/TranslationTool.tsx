import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Languages, ArrowRight, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { sendMessageToDify } from '@/services/dify';
import { getLanguageDisplay } from '@/config/languages';

interface TranslationToolProps {
  detectedLanguage?: string;
  onReset: () => void;
  conversationId?: string;
}

export const TranslationTool = forwardRef<{ resetTool: () => void }, TranslationToolProps>(
  ({ detectedLanguage, onReset, conversationId }, ref) => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState(detectedLanguage || 'auto');
    const [targetLanguage, setTargetLanguage] = useState('zh');
    const [isTranslating, setIsTranslating] = useState(false);

    // 当检测到的语言变化时更新源语言
    useEffect(() => {
      if (detectedLanguage) {
        setSourceLanguage(detectedLanguage);
        // 如果检测到的是中文，则目标语言设为英文，否则设为中文
        setTargetLanguage(detectedLanguage === 'zh' ? 'en' : 'zh');
      }
    }, [detectedLanguage]);

    // 处理翻译
    const handleTranslate = async () => {
      if (!sourceText.trim()) return;
      
      setIsTranslating(true);
      setTranslatedText('正在翻译...');
      
      try {
        // 根据源语言和目标语言构建翻译请求
        let translationPrefix;
        if (targetLanguage === 'zh') {
          // 如果目标语言是中文，则使用"翻译成中文"
          translationPrefix = '【翻译成中文】';
        } else {
          // 如果目标语言不是中文，则使用"翻译成源语言"
          translationPrefix = '【翻译成源语言】';
        }
        const response = await sendMessageToDify(`${translationPrefix}${sourceText}`, conversationId);
        setTranslatedText(response.answer);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText('翻译失败，请稍后重试');
      } finally {
        setIsTranslating(false);
      }
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
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-gray-50">
              <Languages className="w-5 h-5 text-gray-500" />
            </div>
            <h2 className="text-sm font-medium text-gray-700 ml-2">翻译工具</h2>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-500">
                源语言: {sourceLanguage === 'auto' ? '自动检测' : getLanguageDisplay(sourceLanguage)}
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
              disabled={!sourceText.trim() || isTranslating}
              title="翻译"
            >
              {isTranslating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">
              目标语言: {getLanguageDisplay(targetLanguage)}
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