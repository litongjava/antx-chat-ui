// useAgentService.ts
import {useRef, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import {useUser} from '../../context/UserContext';
import {BubbleDataType} from './types';
import {ChatMessage, sendSSERequest, SSEEvent, ChatAskRequestParam,} from '../../client/sseClient';

export default function useAgentService(curSessionId: string) {
  // 为每个 session 管理独立的 AbortController
  const abortMap = useRef<Record<string, AbortController>>({});

  // 存储每个 session 的消息队列（MessageInfo 包装）
  const [sessionMsgMap, setSessionMsgMap] = useState<
    Record<string, BubbleDataType[]>
  >({});

  // 存储每个 session 的 loading 状态
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const {user} = useUser();
  const token = user?.token || '';

  /**
   * 更新某个 session 的整个消息数组
   */
  const updateSessionMsgs = (
    sessionId: string,
    msgs: BubbleDataType[]
  ) => {
    setSessionMsgMap((prev) => ({
      ...prev,
      [sessionId]: msgs,
    }));
  };

  const appendSessionMsgs = (sessionId: string, msgs: BubbleDataType[]) => {
    setSessionMsgMap(prev => {
      const prevMsgs = prev[sessionId] || [];
      return {
        ...prev,
        [sessionId]: [...prevMsgs, ...msgs],
      };
    });
  };


  /**
   * 设置某个 session 的 loading
   */
  const setLoadingFor = (sessionId: string, value: boolean) => {
    setLoadingMap((prev) => ({
      ...prev,
      [sessionId]: value,
    }));
  };


  /**
   * 发送消息，支持并存多条 SSE 流
   */
  const sendMessage = async (
    param: ChatAskRequestParam,
    message: ChatMessage
  ): Promise<boolean> => {
    const sid = param.session_id;
    if (!sid || loadingMap[sid]) return false;
    if (!token) {
      console.error('User token missing');
      return false;
    }

    // 创建新的 AbortController 并保存
    const controller = new AbortController();
    abortMap.current[sid] = controller;
    setLoadingFor(sid, true);

    // 初始化 assistant 消息
    const userMessage: BubbleDataType = {
      id: uuidv4(),
      session_id: message.session_id,
      content: message.content,
      role: message.role,
    }
    const assistantMessage: BubbleDataType = {
      id: uuidv4(),
      session_id: sid,
      content: '',
      reasoning_content: '',
      role: 'assistant',
      model: '',
      citations: [],
      question_id: '',
      answer_id: '',
    };
    appendSessionMsgs(sid, [userMessage, assistantMessage]);

    // 累积内容
    let acc = {...assistantMessage};

    const onEvent = (event: SSEEvent) => {
      switch (event.type) {
        case 'delta': {
          const d = JSON.parse(event.data);
          acc = {
            ...acc,
            model: d.model,
            content: acc.content + (d.content || ''),
          };

          setSessionMsgMap((prev) => {
            const prevMsgs = prev[sid] || [];
            return {
              ...prev,
              [sid]: [...prevMsgs.slice(0, -1), acc],
            };
          });
          break;
        }
        case 'reasoning': {
          const d = JSON.parse(event.data);
          acc = {
            ...acc,
            model: d.model,
            reasoning_content: acc.reasoning_content + (d.content || ''),
          };
          setSessionMsgMap((prev) => {
            const prevMsgs = prev[sid] || [];
            return {
              ...prev,
              [sid]: [...prevMsgs.slice(0, -1), acc],
            };
          });
          break;
        }
        case 'message_id': {
          const d = JSON.parse(event.data);
          acc = {
            ...acc,
            question_id: d.question_id || '',
            answer_id: d.answer_id || '',
          };
          setSessionMsgMap((prev) => {
            const prevMsgs = prev[sid] || [];
            return {
              ...prev,
              [sid]: [...prevMsgs.slice(0, -1), acc],
            };
          });
          break;
        }
        case 'done': {
          setSessionMsgMap((prev) => {
            const prevMsgs = prev[sid] || [];
            return {
              ...prev,
              [sid]: [...prevMsgs.slice(0, -1), acc],
            };
          });
          setLoadingFor(sid, false);
          delete abortMap.current[sid];
          break;
        }
        case 'error': {
          acc.content = (event.data || 'SSE request failed')
          setSessionMsgMap((prev) => {
            const prevMsgs = prev[sid] || [];
            return {
              ...prev,
              [sid]: [...prevMsgs.slice(0, -1), acc],
            };
          });
          setLoadingFor(sid, false);
          delete abortMap.current[sid];
          console.error('SSE request error:', event.data);
          break;
        }
        default:
          break;
      }
    };

    try {
      await sendSSERequest(
        param,
        onEvent,
        controller.signal,
        token,
        [{session_id: sid, role: message.role, content: message.content}]
      );
    } catch (err) {
      setLoadingFor(sid, false);
      delete abortMap.current[sid];
      console.error('sendSSERequest failed:', err);
    }

    return true;
  };

  /**
   * 中断当前 session 的请求流
   */
  const abortRequest = () => {
    const sid = curSessionId;
    const ctrl = abortMap.current[sid];
    if (ctrl) {
      ctrl.abort();
      delete abortMap.current[sid];
      setLoadingFor(sid, false);
    }
  };

  return {
    // 当前会话的 MessageInfo 数组
    messages: sessionMsgMap[curSessionId] || [],
    // 当前会话的 loading 状态
    loading: !!loadingMap[curSessionId],
    sendMessage,
    abortRequest,
    // 允许外部指定 session 更新消息
    setMessages: updateSessionMsgs,
  };
}
