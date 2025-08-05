// Chat.tsx
import {CloseOutlined, MenuUnfoldOutlined, PlusOutlined,} from '@ant-design/icons';
import {Button, message, Spin} from 'antd';
import {FC, useEffect, useRef, useState} from 'react';
import './Chat.css';
import {ConversationItem} from './types.ts';
import ChatSlider from './ChatSlider.tsx';
import {useUser} from "../../context/UserContext.tsx";
import {ChatService} from "./ChatService.ts";
import {showError} from "../../utils/ErrorUtils.ts";
import ChatWindow from "./ChatWindow.tsx";

const Chat: FC = () => {

  // 修复1: 初始化conversations为空数组
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [curConversation, setCurConversation] = useState<string>('');

  const [siderCollapsed, setSiderCollapsed] = useState(false);

  const newSessionRef = useRef(false);

  const [mobileSiderVisible, setMobileSiderVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const {user} = useUser();
  const token = user?.token;

  const toggleSider = () => {
    setSiderCollapsed(!siderCollapsed);
  };

  const toggleMobileSider = () => {
    setMobileSiderVisible(!mobileSiderVisible);
  };


  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) {
        message.error('未登录');
        return;
      }

      try {
        setLoading(true)
        const sessions = await ChatService.listSessions(token);
        setLoading(false)
        setConversations(sessions);
        if (sessions.length === 0) {
          await handleNewConversation();
        } else {
          newSessionRef.current = false;
          setCurConversation(sessions[0].key);
        }
      } catch (error) {
        setLoading(false)
        showError(error, '加载会话失败');
      }
    };

    loadConversations();
  }, [token]);


  // 创建新会话
  const handleNewConversation = async () => {
    if (!token) {
      message.error('未登录');
      return;
    }

    const newName = `New Conversation ${conversations.length + 1}`;
    const newSession = await ChatService.createSession(token, newName);

    if (newSession) {
      setConversations(prev => [newSession, ...prev]);
      setCurConversation(newSession.key);
      newSessionRef.current = true;
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
        newSessionRef.current = false;
        setCurConversation(newKey);
      }
    } else {
      message.error('删除会话失败');
    }
  };


  return (
    <div className="layout">
      {/* 全局加载动画 */}
      {loading && (
        <div className="loading-overlay">
          <Spin
            size="large"
            className="loading-spinner"
          />
        </div>
      )}

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


      <ChatSlider
        siderCollapsed={siderCollapsed}
        toggleSider={toggleSider}
        mobileSiderVisible={mobileSiderVisible}
        setMobileSiderVisible={setMobileSiderVisible}
        conversations={conversations}
        curConversation={curConversation || ''}
        setCurConversation={setCurConversation}
        setConversations={setConversations}
        handleNewConversation={handleNewConversation}
        onRename={handleRenameSession}
        onDelete={handleDeleteSession}
        newSessionRef={newSessionRef}
      />


      <ChatWindow
        curConversation={curConversation}
        newSessionRef={newSessionRef}
        previewHtml={previewHtml}
        setPreviewHtml={setPreviewHtml}
        previewVisible={previewVisible}
        setPreviewVisible={setPreviewVisible}
      />


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