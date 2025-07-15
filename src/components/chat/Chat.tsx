// Chat.tsx
import {CloseOutlined, MenuUnfoldOutlined, PlusOutlined,} from '@ant-design/icons';
import {Button, message} from 'antd';
import React, {useEffect, useState} from 'react';
import './Chat.css';
import {AttachmentFile, BubbleDataType, ConversationItem} from './types.ts';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import ChatSider from './ChatSider.tsx';
import ChatMessageList from './ChatMessageList.tsx';
import ChatSender from './ChatSender.tsx';
import {useUser} from "../../context/UserContext.tsx";
import {ChatService} from "./ChatService.ts";
import {showError} from "../../utils/ErrorUtils.ts";
import useAgentService from "./useAgentService.ts";
import {SSERequestParam} from "../../client/sseClient.ts";
import {TYPE_OPTIONS} from "./consts.tsx";

const Chat: React.FC = () => {
  const {
    messages,
    setMessages,
    loading,
    sendMessage,
    agent,
    abortRequest,
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
  const [type, setType] = useState<string>(TYPE_OPTIONS[0].value);
  const [tools, setTools] = useState<string[]>([]);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

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
      type: type,
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

  // 当切换会话时加载历史记录
  useEffect(() => {
    if (curConversation && token) {
      // 如果缓存中有记录，直接使用
      if (messageHistory[curConversation]) {
        setMessages(messageHistory[curConversation]);
      } else {
        // 否则从服务器加载
        loadHistory(curConversation);
      }
    }
  }, [curConversation, token]);

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
      // 新会话初始化空历史记录
      setMessageHistory(prev => ({
        ...prev,
        [newSession.key]: []
      }));

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

  const loadHistory = async (sessionId: string) => {
    if (!token) return;

    try {
      const history = await ChatService.getHistory(token, sessionId);

      // 更新历史记录缓存
      setMessageHistory(prev => ({
        ...prev,
        [sessionId]: history
      }));

      // 设置当前会话的消息
      setMessages(history);
    } catch (error) {
      showError(error, '加载历史记录失败');
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
        loadHistory={loadHistory}
      />


      <div className="chat">
        <ChatMessageList
          messages={messages}
          onSubmit={onSubmit}
          previewHtml={previewHtml}
          setPreviewHtml={setPreviewHtml}
          previewVisible={previewVisible}
          setPreviewVisible={setPreviewVisible}
          loading={loading}
        />

        <ChatSender
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={onSubmit}
          onCancel={abortRequest}
          provider={provider}
          setProvider={setProvider}
          model={model}
          setModel={setModel}
          type={type}
          setType={setType}
          tools={tools}
          setTools={setTools}
          loading={loading}
          attachmentsOpen={attachmentsOpen}
          setAttachmentsOpen={setAttachmentsOpen}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
      </div>
      {previewVisible && (
        <div className="right-panel">
          <div className="preview-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 16px',
            borderBottom: '1px solid #eee',
            background: '#fafafa'
          }}>
            <span style={{fontSize: 16, fontWeight: 500}}>Preview</span>
            <Button type="text" icon={<CloseOutlined/>} onClick={() => setPreviewVisible(false)}/>
          </div>
          <iframe
            srcDoc={previewHtml || ''}
            style={{width: '100%', height: 'calc(100vh - 50px)', border: 0}}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
};

export default Chat;