// Chat.tsx
import {
  CloudUploadOutlined,
  CopyOutlined,
  DislikeOutlined,
  EllipsisOutlined,
  LikeOutlined,
  MenuUnfoldOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {Attachments, Bubble, Prompts, Sender, useXAgent, useXChat, Welcome} from '@ant-design/x';
import {Button, Collapse, Flex, message, Select, Space, Spin, Tag, Tooltip} from 'antd';
import dayjs from 'dayjs';
import React, {useEffect, useRef, useState} from 'react';
import markdownit from 'markdown-it';
import './Chat.css';
import {AttachmentFile, BubbleDataType, ConversationItem} from './types';
import {
  DEFAULT_CONVERSATIONS_ITEMS,
  DESIGN_GUIDE,
  HOT_TOPICS,
  MODEL_OPTIONS,
  SENDER_PROMPTS,
  TOOL_OPTIONS
} from './consts';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import ChatSider from './ChatSider';

const md = markdownit({html: true, breaks: true});

const renderMarkdown = (content: string, reasoning?: string | null) => (
  <div className="markdown-content">
    {reasoning && (
      <Collapse
        defaultActiveKey={['1']}
        style={{marginTop: 12}}
        items={[
          {
            key: '1',
            label: 'Thought',
            children: (
              <div
                dangerouslySetInnerHTML={{__html: md.render(reasoning)}}
              />
            ),
          },
        ]}
      />
    )}
    <div dangerouslySetInnerHTML={{__html: md.render(content)}}/>
  </div>
);

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



  const chatList = (
    <div className="chatList">
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          items={messages?.map((i) => {
            const {message, status} = i;
            if (message?.role === 'user') {
              return {
                ...i.message,
                className: status === 'loading' ? 'loadingMessage' : '',
                messageRender: renderMarkdown,
              }
            } else {
              return {
                ...i.message,
                className: status === 'loading' ? 'loadingMessage' : '',
                messageRender: (content: string) => renderMarkdown(content, i.message.reasoning_content ?? null),
                typing: status === 'loading' ? {step: 5, interval: 20, suffix: <Spin size="small"/>} : false,
              }
            }

          })}
          style={{height: '100%', paddingInline: 'calc(calc(100% - 900px) /2)'}}
          roles={{
            assistant: {
              placement: 'start',
              variant: 'borderless',
              footer: (
                <div style={{display: 'flex'}}>
                  <Button type="text" size="small" icon={<ReloadOutlined/>}/>
                  <Button type="text" size="small" icon={<CopyOutlined/>}/>
                  <Button type="text" size="small" icon={<LikeOutlined/>}/>
                  <Button type="text" size="small" icon={<DislikeOutlined/>}/>
                </div>
              ),
            },
            user: {placement: 'end', variant: 'borderless',},
          }}
        />
      ) : (
        <Space
          direction="vertical"
          size={16}
          style={{paddingInline: 'calc(calc(100% - 900px) /2)'}}
          className="placeholder"
        >
          <Welcome
            variant="borderless"
            icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
            title="Hello, I'm Ant Design X"
            description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
            extra={
              <Space>
                <Button icon={<ShareAltOutlined/>}/>
                <Button icon={<EllipsisOutlined/>}/>
              </Space>
            }
          />
          <Flex gap={16} wrap="wrap">
            <Prompts
              items={[HOT_TOPICS]}
              styles={{
                list: {height: '100%'},
                item: {
                  flex: 1,
                  minWidth: 300,
                  backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                  borderRadius: 12,
                  border: 'none',
                },
                subItem: {padding: 0, background: 'transparent'},
              }}
              onItemClick={(info) => {
                onSubmit(info.data.description as string);
              }}
              className="chatPrompt"
            />

            <Prompts
              items={[DESIGN_GUIDE]}
              styles={{
                item: {
                  flex: 1,
                  minWidth: 300,
                  backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                  borderRadius: 12,
                  border: 'none',
                },
                subItem: {background: '#ffffffa6'},
              }}
              onItemClick={(info) => {
                onSubmit(info.data.description as string);
              }}
              className="chatPrompt"
            />
          </Flex>
        </Space>
      )}
    </div>
  );
  const senderHeader = (
    <Sender.Header
      title="Upload File"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{content: {padding: 0}}}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={(info) => setAttachedFiles(info.fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? {title: 'Drop file here'}
            : {
              icon: <CloudUploadOutlined/>,
              title: 'Upload files',
              description: 'Click or drag files to this area to upload',
            }
        }
      />
    </Sender.Header>
  );
  const chatSender = (
    <>
      {/* 🌟 提示词 */}
      <Prompts
        items={SENDER_PROMPTS}
        onItemClick={(info) => {
          onSubmit(info.data.description as string);
        }}
        styles={{
          item: {padding: '6px 12px'},
        }}
        className="senderPrompt"
      />
      <div className="toolbar">
        <Tooltip title="Select AI Model" placement="top">
          <div className="selectWrapper">
            <Select
              value={model}
              onChange={setModel}
              options={MODEL_OPTIONS}
              suffixIcon={<OpenAIOutlined/>}
              styles={{ popup: { root: { minWidth: 180 } } }}
            />
          </div>
        </Tooltip>

        <Tooltip title="Select Tools" placement="top">
          <div className="selectWrapper">
            <Select
              value={tools}
              onChange={(vals) => setTools(vals as string[])}
              options={TOOL_OPTIONS}
              mode="multiple"
              suffixIcon={<ProductOutlined/>}
              styles={{ popup: { root: { minWidth: 180 } } }}
            />
          </div>
        </Tooltip>

        {tools.length > 0 && (
          <Tag className="tag" icon={<PaperClipOutlined/>}>
            {tools.length} tools enabled
          </Tag>
        )}
      </div>
      {/* 🌟 输入框 */}
      <Sender
        value={inputValue}
        header={senderHeader}
        onSubmit={() => {
          onSubmit(inputValue);
          setInputValue('');
        }}
        onChange={setInputValue}
        onCancel={() => {
          abortController.current?.abort();
        }}
        prefix={
          <Button
            type="text"
            icon={<PaperClipOutlined style={{fontSize: 18}}/>}
            onClick={() => setAttachmentsOpen(!attachmentsOpen)}
          />
        }
        loading={loading}
        className="sender"
        allowSpeech
        actions={(_, info) => {
          const {SendButton, LoadingButton, SpeechButton} = info.components;
          return (
            <Flex gap={4}>
              <SpeechButton className="speechButton"/>
              {loading ? <LoadingButton type="default"/> : <SendButton type="primary"/>}
            </Flex>
          );
        }}
        placeholder="Ask or input / use skills"
      />
    </>
  );

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
        {chatList}
        {chatSender}
      </div>
    </div>
  );
};

export default Chat;