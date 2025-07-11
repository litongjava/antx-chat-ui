// Chat.tsx
import {MenuUnfoldOutlined, PlusOutlined,} from '@ant-design/icons';
import {Button, message} from 'antd';
import React, {useEffect, useState} from 'react';
import './Chat.css';
import {AttachmentFile, BubbleDataType, ConversationItem} from './types.ts';
import {DEFAULT_CONVERSATIONS_ITEMS} from './consts.tsx';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import ChatSider from './ChatSider.tsx';
import ChatMessageList from './ChatMessageList.tsx'; // 新增
import ChatSender from './ChatSender.tsx';
import useChatService from "./useChatService.ts";
import {useUser} from "../../context/UserContext.tsx";
import {ChatService} from "../../services/ChatService.ts";
import {showError} from "../../utils/ErrorUtils.ts"; // 新增


const Chat: React.FC = () => {
  const {
    messages,
    setMessages,
    loading,
    sendMessage,
    agent,
  } = useChatService();

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

  const {user} = useUser(); // 获取用户信息
  const token = user?.token; // 获取用户token

  // ==================== Event ====================
  const onSubmit = (val: string) => {
    if (!val) return;

    if (loading) {
      message.error('Request is in progress, please wait for the request to complete.');
      return;
    }

    const success = sendMessage(val, model, tools);
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
    // history mock
    if (messages?.length) {
      setMessageHistory((prev) => ({
        ...prev,
        [curConversation]: messages,
      }));
    }
  }, [messages]);

  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) {
        message.error('未登录');
        return;
      }

      try {
        const sessions = await ChatService.listSessions(token);
        if (sessions.length > 0) {
          setConversations(sessions);
          setCurConversation(sessions[0].key);
        } else {
          // 如果没有会话，使用默认会话
          setConversations(DEFAULT_CONVERSATIONS_ITEMS);
          setCurConversation(DEFAULT_CONVERSATIONS_ITEMS[0].key);
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
        onRename={handleRenameSession}
        onDelete={handleDeleteSession}
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