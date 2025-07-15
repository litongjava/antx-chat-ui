// useAgentService.ts
import {useRef, useState} from 'react';
import {useXAgent, useXChat} from '@ant-design/x';
import {BubbleDataType} from './types';
import {useUser} from '../../context/UserContext';
import {showError} from '../../utils/ErrorUtils';
import {ChatMessage, sendSSERequest, SSEEvent, SSERequestParam} from "../../client/sseClient.ts";
import {v4 as uuidv4} from 'uuid';

export default function useAgentService() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const {user} = useUser();

  const [agent] = useXAgent<
    BubbleDataType,
    ChatMessage | undefined,
    Partial<BubbleDataType> // SSE 更新字段类型
  >({
    request: async (reqVo, {onSuccess, onUpdate, onError}) => {
      if (!user?.token) {
        showError(null, 'User not authenticated');
        return;
      }
      if (!reqVo) {
        showError(null, 'reqVo is null');
      }
      // @ts-ignore
      if (!reqVo!.message) {
        showError(null, 'Please Input Message');
        return;
      }

      // @ts-ignore
      const sendVo: ChatMessage = reqVo?.message;
      if (!sendVo.requestParam) {
        showError(null, 'requestParam is null');
        return;
      }

      const requestParam = sendVo.requestParam;
      const sendMessages = [{role: sendVo.role, content: sendVo.content}];
      setLoading(true);
      // 创建初始消息对象
      const initialMessage: BubbleDataType = {
        id: uuidv4(),
        content: '',
        reasoning_content: '',
        role: 'assistant',
        model: '',
        citations: [],
        question_id: '',
        answer_id: '',
      };

      // 累积的消息对象
      let messageUpdate: BubbleDataType = {...initialMessage};

      const onEvent = (event: SSEEvent) => {
        switch (event.type) {
          case 'start':
            // 初始化消息
            onUpdate(initialMessage);
            break;

          case 'delta': {
            const deltaData = JSON.parse(event.data);
            // 更新消息字段
            messageUpdate = {
              ...messageUpdate,
              model: deltaData.model,
              content: messageUpdate.content + (deltaData.content || ''),
            };
            onUpdate(messageUpdate);
            break;
          }

          case 'reasoning': {
            const deltaData = JSON.parse(event.data);
            // 更新消息字段
            messageUpdate = {
              ...messageUpdate,
              model: deltaData.model,
              reasoning_content: messageUpdate.reasoning_content + (deltaData.content || ''),
            };
            onUpdate(messageUpdate);
            break;
          }

          case 'message_id': {
            const deltaData = JSON.parse(event.data);
            // 添加完成时的额外数据
            messageUpdate = {
              ...messageUpdate,
              question_id: deltaData.question_id || '',
              answer_id: deltaData.answer_id || '',
            };
            onUpdate(messageUpdate);
            break;
          }
          case 'done': {
            onSuccess([messageUpdate]);
            setLoading(false);
            break;
          }
          case 'error':
            onError(new Error(event.data || 'SSE request failed'));
            setLoading(false);
            break;

          default:
          //console.log(`Unhandled event type: ${event.type}`);
        }
      }

      try {
        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        if (requestParam) {
          await sendSSERequest(requestParam, onEvent, signal, user.token, sendMessages);
        }

      } catch (error) {
        console.error('SSE request failed:', error);
        onError(error instanceof Error ? error : new Error('Request failed'));
        setLoading(false);
      }
    }
  });

  // 使用聊天功能
  const chat = useXChat({
    agent,
    requestFallback: (
      _: BubbleDataType,
      {error}: { error: Error; messages: BubbleDataType[] }
    ): BubbleDataType => {
      setLoading(false);
      return {
        content: error.message || '请求失败，请重试！',
        reasoning_content: '',
        role: 'assistant',
      };
    },
  });


  const {onRequest, messages, setMessages} = chat;

  // 发送消息的函数 - 添加所有需要的参数
  const sendMessage = (inputRequestParam: SSERequestParam, message: ChatMessage): boolean => {
    if (!message || !inputRequestParam.session_id) return false;
    if (loading) return false;
    message.requestParam = inputRequestParam
    onRequest(message);
    return true;
  };


  // 中止当前请求
  const abortRequest = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // 故意吞掉任何异常，不做任何事
      }
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  return {
    messages,
    setMessages,
    loading,
    sendMessage,
    abortRequest,
    agent
  };
}