// // useChatService.ts
// import {useXAgent, useXChat} from '@ant-design/x';
// import {BubbleDataType} from './types';
// import {useRef} from 'react';
//
// export default function useChatService() {
//   const abortController = useRef<AbortController>(null);
//
//   // 创建 AI agent
//   const [agent] = useXAgent<BubbleDataType>({
//     baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
//     model: 'DeepSeek-R1-Distill-Qwen-7B',
//     dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
//   });
//
//   // 使用聊天功能
//   const chat = useXChat({
//     agent,
//     requestFallback: (_, { error }) => {
//       if (error.name === 'AbortError') {
//         return {
//           content: 'Request is aborted',
//           role: 'assistant',
//         };
//       }
//       return {
//         content: 'Request failed, please try again!',
//         role: 'assistant',
//       };
//     },
//     transformMessage: (info) => {
//       const { originMessage, chunk } = info || {};
//       let currentContent = '';
//       let currentThink = '';
//
//       try {
//         if (chunk?.data && !chunk?.data.includes('DONE')) {
//           const message = JSON.parse(chunk?.data);
//           currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
//           currentContent = message?.choices?.[0]?.delta?.content || '';
//         }
//       } catch (error) {
//         console.error(error);
//       }
//
//       return {
//         content: `${originMessage?.content || ''}${currentContent}`,
//         reasoning_content: `${originMessage?.reasoning_content || ''}${currentThink}`,
//         role: 'assistant',
//       };
//     },
//     resolveAbortController: (controller) => {
//       abortController.current = controller;
//     },
//   });
//
//   const { onRequest, messages, setMessages } = chat;
//   const loading = agent.isRequesting();
//
//   // 发送消息的函数
//   const sendMessage = (content: string, model: string, tools: string[]) => {
//     if (!content) return false;
//     if (loading) return false;
//
//     onRequest({
//       stream: true,
//       message: { role: 'user', content },
//       model,
//       tools
//     });
//
//     return true;
//   };
//
//   // 中断当前请求
//   const abortRequest = () => {
//     if (abortController.current) {
//       abortController.current.abort();
//       abortController.current = null;
//     }
//   };
//
//   return {
//     messages,
//     setMessages,
//     loading,
//     sendMessage,
//     abortRequest,
//     agent
//   };
// }