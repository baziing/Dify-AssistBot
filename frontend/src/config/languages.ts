// ISO 639-1 语言代码映射
export const languageMap: { [key: string]: string } = {
  // 东亚语言
  'zh': '中文',
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文',
  'ja': '日文',
  'ko': '韩文',

  // 欧洲语言
  'en': '英文',
  'en-US': '美式英文',
  'en-GB': '英式英文',
  'es': '西班牙文',
  'fr': '法文',
  'de': '德文',
  'it': '意大利文',
  'pt': '葡萄牙文',
  'ru': '俄文',
  'nl': '荷兰文',
  'pl': '波兰文',
  'tr': '土耳其文',

  // 东南亚语言
  'vi': '越南文',
  'th': '泰文',
  'id': '印尼文',
  'ms': '马来文',
  'fil': '菲律宾文',

  // 南亚语言
  'hi': '印地文',
  'bn': '孟加拉文',
  'ta': '泰米尔文',

  // 中东语言
  'ar': '阿拉伯文',
  'fa': '波斯文',
  'he': '希伯来文',

  // 其他常用语言
  'sw': '斯瓦希里文',
  'am': '阿姆哈拉文',
  'ha': '豪萨文'
};

// 获取语言显示文本
export const getLanguageDisplay = (lang?: string): string => {
  if (!lang) return '未知';
  
  // 尝试直接匹配完整代码
  if (languageMap[lang]) {
    return languageMap[lang];
  }
  
  // 如果没有找到完整匹配，尝试匹配主要语言代码
  const mainLang = lang.split('-')[0];
  if (languageMap[mainLang]) {
    return languageMap[mainLang];
  }
  
  // 如果都没有找到，返回未知
  return '未知';
}; 