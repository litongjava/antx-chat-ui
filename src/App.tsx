import {Attachments, Bubble, Conversations, Prompts, Sender, useXAgent, useXChat, Welcome,} from '@ant-design/x';

import {createStyles} from 'antd-style';
import React, {useEffect} from 'react';

import {
  CloudUploadOutlined,
  CommentOutlined, CopyOutlined, DislikeOutlined,
  EllipsisOutlined,
  FireOutlined,
  HeartOutlined, LikeOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReadOutlined,
  ShareAltOutlined,
  SmileOutlined, SoundOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Badge, Button, type GetProp, Space, message as antdMessage} from 'antd';

import OpenAI from 'openai';
import markdownit from 'markdown-it';

const md = markdownit({html: true, breaks: true});

// 跟单条 Bubble 的做法一样
const renderMarkdown = (content: string) => (
  <div dangerouslySetInnerHTML={{__html: md.render(content)}}/>
);

// 复制文本
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      antdMessage.success('Copied to clipboard');
    })
    .catch(() => {
      antdMessage.error('Copy failed');
    });
};

// 播放(read aloud)
const readAloud = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
  antdMessage.info('Reading aloud...');
};

// 点赞/点踩
const handleLike = () => {
  antdMessage.success('Thanks for your feedback!');
};

const handleDislike = () => {
  antdMessage.warning('Feedback received.');
};


const renderAiMarkdown = (content: string) => (
  <div>
    <div dangerouslySetInnerHTML={{__html: md.render(content)}}/>
    <Space style={{marginTop: 8}}>
      <Button
        type="text"
        icon={<SoundOutlined/>}
        onClick={() => readAloud(content)}
      />
      <Button
        type="text"
        icon={<CopyOutlined/>}
        onClick={() => copyToClipboard(content)}
      />
      <Button
        type="text"
        icon={<LikeOutlined/>}
        onClick={handleLike}
      />
      <Button
        type="text"
        icon={<DislikeOutlined/>}
        onClick={handleDislike}
      />
    </Space>
  </div>
);

function getOpenClient() {
// 初始化 OpenAI 客户端
  const client = new OpenAI({
    baseURL: "http://localhost/openai/v1",
    apiKey: "", //save in backend
    dangerouslyAllowBrowser: true, // 注意：这会使您的 API 密钥暴露在客户端
  });
  return client;
}

const client = getOpenClient();

// 渲染标题的辅助函数
const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

// 默认会话列表项
const defaultConversationsItems = [
  {
    key: '0',
    label: 'What is Ant Design X?',
  },
];

// 样式定义
const useStyle = createStyles(({token, css}) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100%;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
    `,
    conversations: css`
      padding: 0 12px;
      flex: 1;
      overflow-y: auto;
    `,
    chat: css`
      height: 100%;
      width: 100%;
      max-width: 70%;
      margin: 0 auto;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: ${token.paddingLG}px;
      gap: 16px;
    `,
    messages: css`
      flex: 1;
    `,
    placeholder: css`
      padding-top: 32px;
    `,
    sender: css`
      box-shadow: ${token.boxShadow};
    `,
    logo: css`
      display: flex;
      height: 72px;
      align-items: center;
      justify-content: start;
      padding: 0 24px;
      box-sizing: border-box;

      img {
        width: 24px;
        height: 24px;
        display: inline-block;
      }

      span {
        display: inline-block;
        margin: 0 8px;
        font-weight: bold;
        color: ${token.colorText};
        font-size: 16px;
      }
    `,
    addBtn: css`
      background: #1677ff0f;
      border: 1px solid #1677ff34;
      width: calc(100% - 24px);
      margin: 0 12px 24px 12px;
    `,
  };
});

// 占位符提示项
const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: renderTitle(<FireOutlined style={{color: '#FF4D4F'}}/>, 'Hot Topics'),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(<ReadOutlined style={{color: '#1890FF'}}/>, 'Design Guide'),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined/>,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined/>,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined/>,
        description: `Express the feeling`,
      },
    ],
  },
];

// 发送者提示项
const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: <FireOutlined style={{color: '#FF4D4F'}}/>,
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: <ReadOutlined style={{color: '#1890FF'}}/>,
  },
];

// 定义消息角色
const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: {step: 5, interval: 20},
    styles: {
      content: {
        borderRadius: 16,
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
  },
};


const Independent: React.FC = () => {
  // ==================== 样式 ====================
  const {styles} = useStyle();

  // ==================== 状态 ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);
  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);
  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
    [],
  );

  // ==================== 运行时逻辑 ====================
  const [agent] = useXAgent({
    request: async ({message}, {onSuccess, onUpdate, onError}) => {
      if (message) {
        let content: string = '';
        try {

          const chatResponse = await client.chat.completions.create({
            model: 'gemini-2.0-flash-exp',
            messages: [{role: 'user', content: message}],
            stream: true,
          });
          for await (const chunk of chatResponse) {
            content += chunk.choices[0]?.delta?.content || '';
            onUpdate(content);
          }
          onSuccess(content);
        } catch (error) {
          console.error('OpenAI API 错误:', error);
          onError(error as Error);
          const err = error instanceof Error ? error : new Error(String(error));
          onSuccess(err.message);
        }
      }
    }

  });

  const {onRequest, messages, setMessages} = useXChat({agent});

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
    }
  }, [activeKey]);

  // ==================== 事件处理 ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onRequest(info.data.description as string);
  };

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (key) => {
    setActiveKey(key);
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  // ==================== 节点 ====================
  const placeholderNode = (
    <Space direction="vertical" size={16} className={styles.placeholder}>
      <Welcome
        variant="borderless"
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Hello, I'm Ant Design X"
        description="基于 Ant Design，AGI 产品界面解决方案，创造更智能的视觉体验~"
        extra={
          <Space>
            <Button icon={<ShareAltOutlined/>}/>
            <Button icon={<EllipsisOutlined/>}/>
          </Space>
        }
      />
      <Prompts
        title="Do you want?"
        items={placeholderPromptsItems}
        styles={{
          list: {
            width: '100%',
          },
          item: {
            flex: 1,
          },
        }}
        onItemClick={onPromptsItemClick}
      />
    </Space>
  );

  const items = messages.map((e) => {
    const {message, id, status} = e;
    // console.log("e:", e);
    const role = status === 'local' ? 'local' : 'ai';
    if (role === 'local') {
      return ({
        key: id,
        //loading: status === 'loading',
        role: role,
        messageRender: renderMarkdown,
        content: message,
        avatar: {icon: <UserOutlined/>}
      })
    } else {
      return ({
        key: id,
        //loading: status === 'loading',
        role: role,
        messageRender: renderAiMarkdown,
        content: message,
        avatar: {icon: <OpenAIOutlined/>}
      })
    }

  });

  const attachmentsNode = (
    <Badge dot={attachedFiles.length > 0 && !headerOpen}>
      <Button type="text" icon={<PaperClipOutlined/>} onClick={() => setHeaderOpen(!headerOpen)}/>
    </Badge>
  );

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? {title: 'Drop file here'}
            : {
              icon: <CloudUploadOutlined/>,
              title: 'Upload files',
              description: '点击或拖拽文件到此区域进行上传',
            }
        }
      />
    </Sender.Header>
  );

  const logoNode = (
    <div className={styles.logo}>
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span>Ant Design X</span>
    </div>
  );

  // ==================== 渲染 ====================
  return (
    <div className={styles.layout}>
      <div className={styles.menu}>
        {/* 🌟 Logo */}
        {logoNode}
        {/* 🌟 添加会话 */}
        <Button
          onClick={onAddConversation}
          type="link"
          className={styles.addBtn}
          icon={<PlusOutlined/>}
        >
          New Conversation
        </Button>
        {/* 🌟 会话管理 */}
        <Conversations
          items={conversationsItems}
          className={styles.conversations}
          activeKey={activeKey}
          onActiveChange={onConversationClick}
        />
      </div>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        <Bubble.List
          items={items.length > 0 ? items : [{content: placeholderNode, variant: 'borderless'}]}
          roles={roles}
          className={styles.messages}
        />
        {/* 🌟 提示词 */}
        <Prompts items={senderPromptsItems} onItemClick={onPromptsItemClick}/>
        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          prefix={attachmentsNode}
          loading={agent.isRequesting()}
          className={styles.sender}
        />
      </div>
    </div>
  );
};


export default Independent;
