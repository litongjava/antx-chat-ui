// Chat.tsx
import {message} from 'antd';
import React, {useEffect, useState} from 'react';
import './Chat.css';
import {AttachmentFile} from './types.ts';
import ChatMessageList from './ChatMessageList.tsx';
import ChatSender from './ChatSender.tsx';
import useAgentService from "./useAgentService.ts";
import {ChatAskRequestParam} from "../../client/sseClient.ts";
import {TYPE_OPTIONS} from "./consts.tsx";
import {ChatService} from "./ChatService.ts";
import {showError} from "../../utils/ErrorUtils.ts";
import {useUser} from "../../context/UserContext.tsx";

interface ChatWindowProps {
  curConversation: string,
  previewHtml: string | null,
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>,
  previewVisible: boolean,
  setPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>,
  newSessionRef: React.RefObject<boolean>
}

const ChatWindow: React.FC<ChatWindowProps> = ({
                                                 curConversation,
                                                 previewHtml,
                                                 setPreviewHtml,
                                                 previewVisible,
                                                 setPreviewVisible,
                                                 newSessionRef,
                                               }) => {
  const {
    messages,
    loading,
    sendMessage,
    setMessages,
    abortRequest,
  } = useAgentService(curConversation);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);

  const [inputValue, setInputValue] = useState('');

  const [provider, setProvider] = useState<string>('volcengine');
  const [model, setModel] = useState<string>('deepseek-v3');
  const [type, setType] = useState<string>(TYPE_OPTIONS[0].value);
  const [tools, setTools] = useState<string[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(true);

  const {user} = useUser();
  const token = user?.token;

  // ==================== Event ====================
  const onSubmit = (val: string) => {
    if (!val) return;

    if (loading) {
      message.error('Request is in progress, please wait for the request to complete.');
      return;
    }
    const requestParam: ChatAskRequestParam = {
      session_id: curConversation,
      provider: provider,
      type: type,
      model: model,
      tools: tools,
      history_enabled: historyEnabled
    }
    const success = sendMessage(requestParam, {session_id: curConversation, role: "user", content: val});
    if (!success) {
      message.error('Failed to send message');
    }
  };

  const loadHistory = async (sessionId: string) => {
    if (!token) return;

    try {
      const history = await ChatService.getHistory(token, sessionId);
      // 设置当前会话的消息
      setMessages(curConversation, history);
    } catch (error) {
      showError(error, '加载历史记录失败');
    }
  };

  // 当切换会话时加载历史记录
  useEffect(() => {
    if (curConversation && token) {
      if (!loading) {
        loadHistory(curConversation);
      }
    }
  }, [curConversation]);


  return (
    <div className="chat">
      <ChatMessageList
        messages={messages}
        onSubmit={onSubmit}
        currentSessionId={curConversation}
        newSessionRef={newSessionRef}
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
        historyEnabled={historyEnabled}
        setHistoryEnabled={setHistoryEnabled}
      />
    </div>
  );
};

export default ChatWindow;