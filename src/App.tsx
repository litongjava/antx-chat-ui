import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  CopyOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileSearchOutlined,
  HeartOutlined,
  LikeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Attachments, Bubble, Conversations, Prompts, Sender, useXAgent, useXChat, Welcome,} from '@ant-design/x';
import {Avatar, Button, Collapse, Flex, type GetProp, message, Select, Space, Spin, Tag, Tooltip} from 'antd';
import {createStyles} from 'antd-style';
import dayjs from 'dayjs';
import React, {useEffect, useRef, useState} from 'react';
import markdownit from 'markdown-it';

const md = markdownit({html: true, breaks: true});

const renderMarkdown = (content: string, reasoning?: string | null) => (
  <div>
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

type BubbleDataType = {
  role: string;
  content: string;
  reasoning_content?: string | null;
};

const DEFAULT_CONVERSATIONS_ITEMS = [
  {
    key: 'default-0',
    label: 'What is Ant Design X?',
    group: 'Today',
  },
  {
    key: 'default-1',
    label: 'How to quickly install and import components?',
    group: 'Today',
  },
  {
    key: 'default-2',
    label: 'New AGI Hybrid Interface',
    group: 'Yesterday',
  },
];

const HOT_TOPICS = {
  key: '1',
  label: 'Hot Topics',
  children: [
    {
      key: '1-1',
      description: 'What has Ant Design X upgraded?',
      icon: <span style={{color: '#f93a4a', fontWeight: 700}}>1</span>,
    },
    {
      key: '1-2',
      description: 'New AGI Hybrid Interface',
      icon: <span style={{color: '#ff6565', fontWeight: 700}}>2</span>,
    },
    {
      key: '1-3',
      description: 'What components are in Ant Design X?',
      icon: <span style={{color: '#ff8f1f', fontWeight: 700}}>3</span>,
    },
    {
      key: '1-4',
      description: 'Come and discover the new design paradigm of the AI era.',
      icon: <span style={{color: '#00000040', fontWeight: 700}}>4</span>,
    },
    {
      key: '1-5',
      description: 'How to quickly install and import components?',
      icon: <span style={{color: '#00000040', fontWeight: 700}}>5</span>,
    },
  ],
};

const DESIGN_GUIDE = {
  key: '2',
  label: 'Design Guide',
  children: [
    {
      key: '2-1',
      icon: <HeartOutlined/>,
      label: 'Intention',
      description: 'AI understands user needs and provides solutions.',
    },
    {
      key: '2-2',
      icon: <SmileOutlined/>,
      label: 'Role',
      description: "AI's public persona and image",
    },
    {
      key: '2-3',
      icon: <CommentOutlined/>,
      label: 'Chat',
      description: 'How AI Can Express Itself in a Way Users Understand',
    },
    {
      key: '2-4',
      icon: <PaperClipOutlined/>,
      label: 'Interface',
      description: 'AI balances "chat" & "do" behaviors.',
    },
  ],
};

const SENDER_PROMPTS: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Upgrades',
    icon: <ScheduleOutlined/>,
  },
  {
    key: '2',
    description: 'Components',
    icon: <ProductOutlined/>,
  },
  {
    key: '3',
    description: 'RICH Guide',
    icon: <FileSearchOutlined/>,
  },
  {
    key: '4',
    description: 'Installation Introduction',
    icon: <AppstoreAddOutlined/>,
  },
];

const useStyle = createStyles(({token, css}) => {
  return {
    layout: css`
        width: 100%;
        min-width: 1000px;
        height: 100vh;
        display: flex;
        background: ${token.colorBgContainer};
        font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
        position: relative;

        @media (max-width: 768px) {
            flex-direction: column;
            min-width: unset;
        }
    `,
    sider: css`
        background: ${token.colorBgLayout};
        width: 280px;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 0 12px;
        box-sizing: border-box;
        transition: width 0.3s, transform 0.3s;
        z-index: 100;

        @media (max-width: 768px) {
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            transform: translateX(-100%);
            width: 280px;
            padding: 0 12px;
            z-index: 100;

            &.mobileVisible {
                transform: translateX(0);
            }
        }

        &.collapsed {
            width: 80px;
            padding: 0 8px;

            .ant-conversations,
            .addBtn > span,
            .logo span,
            .siderFooter .questionBtn {
                display: none;
            }

            .addBtn {
                width: 40px;
                min-width: 40px;
                padding: 0;
                display: flex;
                justify-content: center;
                margin: 0 auto;
            }

            .siderFooter {
                justify-content: center;
                padding: 0;
            }

            .collapsedLogo {
                justify-content: center;
                padding: 0;
                margin: 24px 0 16px;
            }
            
            .collapsedAvatar {
                margin-top: auto;
            }
        }
    `,
    logo: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        box-sizing: border-box;
        gap: 8px;
        margin: 24px 0;

        .logoContent {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        span {
            font-weight: bold;
            color: ${token.colorText};
            font-size: 16px;
            transition: opacity 0.3s;
        }
    `,
    addBtn: css`
        background: #1677ff0f;
        border: 1px solid #1677ff34;
        height: 40px;
    `,
    conversations: css`
        flex: 1;
        overflow-y: auto;
        margin-top: 12px;
        padding: 0;

        .ant-conversations-list {
            padding-inline-start: 0;
        }
    `,
    siderFooter: css`
        border-top: 1px solid ${token.colorBorderSecondary};
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 8px;
    `,
    // chat list 样式
    chat: css`
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding-block: ${token.paddingLG}px;
        gap: 16px;
        flex: 1;
        overflow: hidden;

        @media (max-width: 768px) {
            padding: 16px;
            height: calc(100vh - 200px);
        }
    `,
    chatPrompt: css`
        .ant-prompts-label {
            color: #000000e0 !important;
        }

        .ant-prompts-desc {
            color: #000000a6 !important;
            width: 100%;
        }

        .ant-prompts-icon {
            color: #000000a6 !important;
        }
    `,
    chatList: css`
        flex: 1;
        overflow: auto;

        @media (max-width: 768px) {
            padding-inline: 16px !important;
        }
    `,
    loadingMessage: css`
        background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
        background-size: 100% 2px;
        background-repeat: no-repeat;
        background-position: bottom;
    `,
    placeholder: css`
        padding-top: 32px;

        @media (max-width: 768px) {
            padding-inline: 16px;
        }
    `,
    // sender 样式
    sender: css`
        width: 100%;
        max-width: 900px;
        margin: 0 auto;

        @media (max-width: 768px) {
            padding: 0 16px;
        }
    `,
    speechButton: css`
        font-size: 18px;
        color: ${token.colorText} !important;
    `,
    senderPrompt: css`
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        color: ${token.colorText};

        @media (max-width: 768px) {
            padding: 0 16px;
        }
    `,
    toolbar: css`
        width: 100%;
        max-width: 900px;
        margin: 0 auto 8px;
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 0 4px;

        @media (max-width: 768px) {
            flex-wrap: wrap;
            padding: 0 12px;
        }
    `,
    selectLabel: css`
        font-size: 13px;
        color: ${token.colorTextSecondary};
        white-space: nowrap;
    `,
    selectWrapper: css`
        flex: 1;
        display: flex;
        gap: 8px;

        @media (max-width: 768px) {
            width: 100%;
            min-width: 100%;
        }

        .ant-select {
            flex: 1;
            min-width: 120px;

            &:hover {
                .ant-select-selector {
                    border-color: ${token.colorPrimaryHover} !important;
                }
            }
        }
    `,
    tag: css`
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border: none;
        border-radius: 4px;
        padding: 0 8px;
        height: 24px;
        line-height: 24px;
        white-space: nowrap;

        @media (max-width: 768px) {
            margin-left: auto;
        }
    `,
    expandButton: css`
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 10;
        display: none;

        @media (max-width: 768px) {
            display: block;
        }
    `,
    newChatButton: css`
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 10;
        display: none;

        @media (max-width: 768px) {
            display: block;
        }
    `,
    overlay: css`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
        display: none;

        @media (max-width: 768px) {
            display: block;
        }
    `,
    mobileHeader: css`
        display: none;
        padding: 16px;
        background: ${token.colorBgContainer};
        border-bottom: 1px solid ${token.colorBorder};
        position: sticky;
        top: 0;
        z-index: 10;
        justify-content: space-between;
        align-items: center;

        @media (max-width: 768px) {
            display: flex;
        }
    `,
    // 新增折叠状态下的图标样式
    collapsedIconContainer: css`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        height: 100%;
        padding-top: 24px;
    `,
    collapsedIcon: css`
        font-size: 20px;
        color: ${token.colorText};
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
            background: ${token.colorBgTextHover};
        }
    `,
    newChatIcon: css`
        background: ${token.colorPrimaryBg};
        color: ${token.colorPrimary};
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    `,
  };
});

const MODEL_OPTIONS = [
  {label: 'DeepSeek (R1)', value: 'deepseek-r1'},
  {label: 'DeepSeek-R1-Distill-Qwen-7B', value: 'DeepSeek-R1-Distill-Qwen-7B'},
];

const TOOL_OPTIONS = [
  {label: 'Search', value: 'search'},
  {label: 'Linux', value: 'linux'},
  {label: 'Translate', value: 'translate'},
];
const Independent: React.FC = () => {
  const {styles} = useStyle();
  const abortController = useRef<AbortController>(null);

  // ==================== State ====================
  const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});

  const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS_ITEMS);
  const [curConversation, setCurConversation] = useState(DEFAULT_CONVERSATIONS_ITEMS[0].key);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

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

  // ==================== Nodes ====================
  const chatSider = (
    <div
      className={`${styles.sider} ${siderCollapsed ? 'collapsed' : ''} ${mobileSiderVisible ? 'mobileVisible' : ''}`}
    >
      {siderCollapsed ? (
        <div className={styles.collapsedIconContainer}>
          {/* 折叠状态下的顶部Logo */}
          <div className="collapsedLogo">
            <img
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
              draggable={false}
              alt="logo"
              width={32}
              height={32}
            />
          </div>

          {/* 折叠状态下的菜单按钮 */}
          <Button
            type="text"
            className="collapsedMenuButton"
            icon={<MenuUnfoldOutlined style={{fontSize: 20}}/>}
            onClick={toggleSider}
          />

          {/* 新建会话按钮（折叠状态） */}
          <div
            className={styles.collapsedIcon}
            onClick={handleNewConversation}
          >
            <div className={styles.newChatIcon}>
              <PlusOutlined/>
            </div>
          </div>

          {/* 底部头像 */}
          <div className="collapsedAvatar">
            <Avatar size={32}/>
          </div>
        </div>
      ) : (
        <>
          {/* 🌟 Logo */}
          <div className={styles.logo}>
            <div className="logoContent">
              <img
                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                draggable={false}
                alt="logo"
                width={24}
                height={24}
              />
              <span>Ant Design X</span>
            </div>
            <Button
              type="text"
              icon={siderCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
              onClick={toggleSider}
            />
          </div>

          {/* 🌟 添加会话 */}
          <Button
            onClick={handleNewConversation}
            type="link"
            className={styles.addBtn}
            icon={<PlusOutlined style={{fontSize: 16}}/>}
          >
            New Conversation
          </Button>

          {/* 🌟 会话管理 */}
          <Conversations
            items={conversations}
            className={styles.conversations}
            activeKey={curConversation}
            onActiveChange={async (val) => {
              abortController.current?.abort();
              // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
              // In future versions, the sessionId capability will be added to resolve this problem.
              setTimeout(() => {
                setCurConversation(val);
                setMessages(messageHistory?.[val] || []);
              }, 100);
              setMobileSiderVisible(false);
            }}
            groupable
            styles={{item: {padding: '0 8px'}}}
            menu={(conversation) => ({
              items: [
                {
                  label: 'Rename',
                  key: 'rename',
                  icon: <EditOutlined/>,
                },
                {
                  label: 'Delete',
                  key: 'delete',
                  icon: <DeleteOutlined/>,
                  danger: true,
                  onClick: () => {
                    const newList = conversations.filter((item) => item.key !== conversation.key);
                    const newKey = newList?.[0]?.key;
                    setConversations(newList);
                    // The delete operation modifies curConversation and triggers onActiveChange, so it needs to be executed with a delay to ensure it overrides correctly at the end.
                    // This feature will be fixed in a future version.
                    setTimeout(() => {
                      if (conversation.key === curConversation) {
                        setCurConversation(newKey);
                        setMessages(messageHistory?.[newKey] || []);
                      }
                    }, 200);
                  },
                },
              ],
            })}
          />

          <div className={styles.siderFooter}>
            <Avatar size={24}/>
            <Button
              type="text"
              icon={<QuestionCircleOutlined/>}
              className="questionBtn"
            />
          </div>
        </>
      )}
    </div>
  );

  const chatList = (
    <div className={styles.chatList}>
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          items={messages?.map((i) => {
            const {message, status} = i;
            console.log("message", message);
            if (message?.role === 'user') {
              return {
                ...i.message,
                classNames: {
                  content: status === 'loading' ? styles.loadingMessage : '',
                },
                avatar: {icon: <UserOutlined/>},
                messageRender: renderMarkdown,
              }
            } else {
              return {
                ...i.message,
                classNames: {
                  content: status === 'loading' ? styles.loadingMessage : '',
                },
                avatar: {icon: <OpenAIOutlined/>},
                messageRender: content => renderMarkdown(content, i.message.reasoning_content ?? null),
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
          className={styles.placeholder}
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
              className={styles.chatPrompt}
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
              className={styles.chatPrompt}
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
        className={styles.senderPrompt}
      />
      <div className={styles.toolbar}>
        <Tooltip title="Select AI Model" placement="top">
          <div className={styles.selectWrapper}>
            <Select
              value={model}
              onChange={setModel}
              options={MODEL_OPTIONS}
              suffixIcon={<OpenAIOutlined/>}
              dropdownStyle={{minWidth: 240}}
            />
          </div>
        </Tooltip>

        <Tooltip title="Select Tools" placement="top">
          <div className={styles.selectWrapper}>
            <Select
              value={tools}
              onChange={(vals) => setTools(vals as string[])}
              options={TOOL_OPTIONS}
              mode="multiple"
              maxTagCount="responsive"
              suffixIcon={<ProductOutlined/>}
              dropdownStyle={{minWidth: 180}}
            />
          </div>
        </Tooltip>

        {tools.length > 0 && (
          <Tag className={styles.tag} icon={<PaperClipOutlined/>}>
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
        className={styles.sender}
        allowSpeech
        actions={(_, info) => {
          const {SendButton, LoadingButton, SpeechButton} = info.components;
          return (
            <Flex gap={4}>
              <SpeechButton className={styles.speechButton}/>
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
    <div className={styles.layout}>
      {/* 移动端头部 */}
      <div className={styles.mobileHeader}>
        <Button
          icon={<MenuUnfoldOutlined />}
          onClick={toggleMobileSider}
        />
        <Button
          className={styles.newChatButton}
          icon={<PlusOutlined />}
          onClick={handleNewConversation}
        />
      </div>

      {/* 移动端侧边栏遮罩 */}
      {mobileSiderVisible && (
        <div className={styles.overlay} onClick={() => setMobileSiderVisible(false)}/>
      )}

      {/* 侧边栏 */}
      {chatSider}

      <div className={styles.chat}>
        {chatList}
        {chatSender}
      </div>
    </div>
  );
};

export default Independent;