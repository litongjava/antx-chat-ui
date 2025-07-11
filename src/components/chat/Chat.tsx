// Chat.tsx
import {MenuUnfoldOutlined, PlusOutlined,} from '@ant-design/icons';
import {useXAgent, useXChat} from '@ant-design/x';
import {Button, message} from 'antd';
import dayjs from 'dayjs';
import React, {useEffect, useRef, useState} from 'react';
import './Chat.css';
import {AttachmentFile, BubbleDataType, ConversationItem} from './types.ts';
import {DEFAULT_CONVERSATIONS_ITEMS} from './consts.tsx';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import ChatSider from './ChatSider.tsx';
import ChatMessageList from './ChatMessageList.tsx'; // 新增
import ChatSender from './ChatSender.tsx'; // 新增

const Chat: React.FC = () => {
  const abortController = useRef<AbortController>(null);

  // ==================== State ====================
  const [messageHistory, setMessageHistory] = useState<Record<string, MessageInfo<BubbleDataType>[]>>({});

  const [conversations, setConversations] = useState<ConversationItem[]>(DEFAULT_CONVERSATIONS_ITEMS);
  const [curConversation, setCurConversation] = useState<string>(DEFAULT_CONVERSATIONS_ITEMS[0].key);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);

  const [inputValue, setInputValue] = useState('');

  const [model, setModel] = useState<string>('DeepSeek-R1-Distill-Qwen-7B');
  const [tools, setTools] = useState<string[]>([]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);

  /**
   * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
   */
    // ==================== Runtime ====================
  const [agent] = useXAgent<BubbleDataType>({
      baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
      model: 'DeepSeek-R1-Distill-Qwen-7B',
      dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
    });
  const loading = agent.isRequesting();

  const {onRequest, messages, setMessages} = useXChat({
    agent,
    requestFallback: (_, {error}) => {
      if (error.name === 'AbortError') {
        return {
          content: 'Request is aborted',
          role: 'assistant',
        };
      }
      return {
        content: 'Request failed, please try again!',
        role: 'assistant',
      };
    },
    transformMessage: (info) => {
      const {originMessage, chunk} = info || {};
      let currentContent = '';
      let currentThink = '';
      try {
        if (chunk?.data && !chunk?.data.includes('DONE')) {
          const message = JSON.parse(chunk?.data);
          currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
          currentContent = message?.choices?.[0]?.delta?.content || '';
        }
      } catch (error) {
        console.error(error);
      }

      const content = `${originMessage?.content || ''}${currentContent}`;
      const reasoning_content = `${originMessage?.reasoning_content || ''}${currentThink}`;

      return {
        content: content,
        reasoning_content: reasoning_content,
        role: 'assistant',
      };
    },
    resolveAbortController: (controller) => {
      abortController.current = controller;
    },
  });

  // ==================== Event ====================
  const onSubmit = (val: string) => {
    if (!val) return;

    if (loading) {
      message.error('Request is in progress, please wait for the request to complete.');
      return;
    }

    onRequest({
      stream: true,
      message: {role: 'user', content: val},
      model: model,
      tools: tools
    });
  };

  const toggleSider = () => {
    setSiderCollapsed(!siderCollapsed);
  };

  const toggleMobileSider = () => {
    setMobileSiderVisible(!mobileSiderVisible);
  };

  const handleNewConversation = () => {
    if (agent.isRequesting()) {
      message.error(
        'Message is Requesting, you can create a new conversation after request done or abort it right now...',
      );
      return;
    }

    const now = dayjs().valueOf().toString();
    setConversations([
      {
        key: now,
        label: `New Conversation ${conversations.length + 1}`,
        group: 'Today',
      },
      ...conversations,
    ]);
    setCurConversation(now);
    setMessages([]);
    setMobileSiderVisible(false);
  };

  useEffect(() => {
    // history mock
    if (messages?.length) {
      setMessageHistory((prev) => ({
        ...prev,
        [curConversation]: messages,
      }));
    }
  }, [messages]);

  // ==================== Render =================
  return (
    <div className="layout">
      {/* 移动端头部 */}
      <div className="mobileHeader">
        <Button
          icon={<MenuUnfoldOutlined/>}
          onClick={toggleMobileSider}
        />
        <Button
          className="newChatButton"
          icon={<PlusOutlined/>}
          onClick={handleNewConversation}
        />
      </div>

      {/* 移动端侧边栏遮罩 */}
      {mobileSiderVisible && (
        <div className="overlay" onClick={() => setMobileSiderVisible(false)}/>
      )}

      {/* 侧边栏 */}
      <ChatSider
        siderCollapsed={siderCollapsed}
        toggleSider={toggleSider}
        mobileSiderVisible={mobileSiderVisible}
        setMobileSiderVisible={setMobileSiderVisible}
        conversations={conversations}
        curConversation={curConversation}
        setCurConversation={setCurConversation}
        setConversations={setConversations}
        setMessages={setMessages}
        messageHistory={messageHistory}
        handleNewConversation={handleNewConversation}
      />

      <div className="chat">
        {/* 使用 ChatMessageList 组件 */}
        <ChatMessageList
          messages={messages}
          onSubmit={onSubmit}
        />

        {/* 使用 ChatSender 组件 */}
        <ChatSender
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={onSubmit}
          model={model}
          setModel={setModel}
          tools={tools}
          setTools={setTools}
          loading={loading}
          attachmentsOpen={attachmentsOpen}
          setAttachmentsOpen={setAttachmentsOpen}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
      </div>
    </div>
  );
};

export default Chat;