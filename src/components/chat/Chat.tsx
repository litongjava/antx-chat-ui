// Chat.tsx
import {MenuUnfoldOutlined, PlusOutlined,} from '@ant-design/icons';
import {Button, message} from 'antd';
import React, {useEffect, useState} from 'react';
import './Chat.css';
import {AttachmentFile, BubbleDataType, ConversationItem} from './types.ts';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import ChatSider from './ChatSider.tsx';
import ChatMessageList from './ChatMessageList.tsx';
import ChatSender from './ChatSender.tsx';
import {useUser} from "../../context/UserContext.tsx";
import {ChatService} from "../../services/ChatService.ts";
import {showError} from "../../utils/ErrorUtils.ts";
import useAgentService from "./useAgentService.ts";
import {SSERequestParam} from "../../client/sseClient.ts";

const Chat: React.FC = () => {
  const {
    messages,
    setMessages,
    loading,
    sendMessage,
    agent
  } = useAgentService();

  // ==================== State ====================
  const [messageHistory, setMessageHistory] = useState<Record<string, MessageInfo<BubbleDataType>[]>>({});

  // 修复1: 初始化conversations为空数组
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [curConversation, setCurConversation] = useState<string | null>(null);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);

  const [inputValue, setInputValue] = useState('');

  const [provider, setProvider] = useState<string>('volcengine');
  const [model, setModel] = useState<string>('deepseek-v3');
  const [tools, setTools] = useState<string[]>([]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);

  const {user} = useUser();
  const token = user?.token;

  // ==================== Event ====================
  const onSubmit = (val: string) => {
    if (!val) return;

    if (loading) {
      message.error('Request is in progress, please wait for the request to complete.');
      return;
    }

    const requestParam: SSERequestParam = {
      session_id: curConversation,
      provider: provider,
      model: model,
      tools: tools,
    }
    const success = sendMessage(requestParam, {role: "user", content: val});
    if (!success) {
      message.error('Failed to send message');
    }
  };

  const toggleSider = () => {
    setSiderCollapsed(!siderCollapsed);
  };

  const toggleMobileSider = () => {
    setMobileSiderVisible(!mobileSiderVisible);
  };

  useEffect(() => {
    if (messages?.length && curConversation) {
      setMessageHistory((prev) => ({
        ...prev,
        [curConversation]: messages,
      }));
    }
  }, [messages, curConversation]);

  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) {
        message.error('未登录');
        return;
      }

      try {
        const sessions = await ChatService.listSessions(token);
        setConversations(sessions);

        if (sessions.length === 0) {
          await handleNewConversation();
        } else {
          setCurConversation(sessions[0].key);
        }
      } catch (error) {
        showError(error, '加载会话失败');
      }
    };

    loadConversations();
  }, [token]);

  // 创建新会话
  const handleNewConversation = async () => {
    if (agent.isRequesting()) {
      message.error('消息请求中，请等待请求完成或中止');
      return;
    }

    if (!token) {
      message.error('未登录');
      return;
    }

    const newName = `New Conversation ${conversations.length + 1}`;
    const newSession = await ChatService.createSession(token, newName);

    if (newSession) {
      setConversations(prev => [newSession, ...prev]);
      setCurConversation(newSession.key);
      setMessages([]);
      setMobileSiderVisible(false);
      return newSession; // 返回新创建的会话
    }
  };

  // 重命名会话
  const handleRenameSession = async (sessionId: string, newName: string) => {
    if (!token) {
      message.error('未登录');
      return;
    }
    const success = await ChatService.renameSession(token, sessionId, newName);
    if (success) {
      setConversations(prev =>
        prev.map(item =>
          item.key === sessionId ? {...item, label: newName} : item
        )
      );
    } else {
      message.error('重命名会话失败');
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    if (!token) {
      message.error('未登录');
      return;
    }

    const success = await ChatService.deleteSession(token, sessionId);
    if (success) {
      const newList = conversations.filter(item => item.key !== sessionId);
      setConversations(newList);

      if (sessionId === curConversation) {
        const newKey = newList[0]?.key || '';
        setCurConversation(newKey);
        setMessages(messageHistory[newKey] || []);
      }
    } else {
      message.error('删除会话失败');
    }
  };

  return (
    <div className="layout">
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

      {mobileSiderVisible && (
        <div className="overlay" onClick={() => setMobileSiderVisible(false)}/>
      )}

      <ChatSider
        siderCollapsed={siderCollapsed}
        toggleSider={toggleSider}
        mobileSiderVisible={mobileSiderVisible}
        setMobileSiderVisible={setMobileSiderVisible}
        conversations={conversations}
        curConversation={curConversation || ''}
        setCurConversation={setCurConversation}
        setConversations={setConversations}
        setMessages={setMessages}
        messageHistory={messageHistory}
        handleNewConversation={handleNewConversation}
        onRename={handleRenameSession}
        onDelete={handleDeleteSession}
      />

      <div className="chat">
        <ChatMessageList
          messages={messages}
          onSubmit={onSubmit}
        />

        <ChatSender
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={onSubmit}
          provider={provider}
          setProvider={setProvider}
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