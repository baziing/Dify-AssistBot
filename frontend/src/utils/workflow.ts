// 生成工作流ID的辅助函数
export const generateWorkflowId = () => {
  return 'wf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}; 