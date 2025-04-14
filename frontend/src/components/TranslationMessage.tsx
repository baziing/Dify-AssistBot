import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TranslationMessageProps {
  original: string;
  translation: string;
}

export function TranslationMessage({ original, translation }: TranslationMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div 
        className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>显示原文</span>
      </div>
      
      {isExpanded && (
        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600 font-mono">
          <pre className="font-mono text-inherit whitespace-pre-wrap">{original}</pre>
        </div>
      )}
      
      <div className="text-gray-900">
        <pre className="font-sans text-inherit whitespace-pre-wrap">{translation}</pre>
      </div>
    </div>
  );
} 