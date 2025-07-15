// ChatMessageList.tsx
import React, {useCallback, useMemo, useState} from 'react';
import {Prompts, Welcome} from '@ant-design/x';
import {Button, Collapse, Flex, Space, Spin} from 'antd';
import {Bubble} from '@ant-design/x/es';
import {BubbleDataType} from './types.ts';
import {DESIGN_GUIDE, HOT_TOPICS} from './consts.tsx';
import ReloadOutlined from '@ant-design/icons/lib/icons/ReloadOutlined';
import {CopyOutlined, DislikeOutlined, EllipsisOutlined, LikeOutlined, ShareAltOutlined} from "@ant-design/icons";
import MarkdownRenderer from "./MarkdownRenderer.tsx";


interface ChatListProps {
  messages: BubbleDataType[],
  currentSessionId: string,
  newSessionRef: React.RefObject<boolean>
  onSubmit: (val: string) => void,
  previewHtml: string | null,
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>,
  previewVisible: boolean,
  setPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>,
  loading: boolean,
}

const ChatMessageList: React.FC<ChatListProps> = ({
                                                    messages,
                                                    currentSessionId,
                                                    onSubmit,
                                                    setPreviewHtml,
                                                    setPreviewVisible,
                                                    loading,
                                                  }) => {
  const renderMarkdown = (raw: string, reasoning?: string | null) => (
    <div className="markdown-content">
      {reasoning && (
        <Collapse
          defaultActiveKey={['1']}
          style={{marginBottom: 12}}
          items={[{
            key: '1',
            label: 'Thought',
            children: (
              <MarkdownRenderer content={reasoning} loading={loading} onRunCode={(code, lang) => {
                if (lang === 'html') {
                  setPreviewHtml(code);
                  setPreviewVisible(true);
                } else {
                  // 如果不是 HTML，可以弹个提示 or 忽略
                }
              }}/>
            )
          }]}
        />
      )}
      <MarkdownRenderer content={raw} loading={loading} onRunCode={(code, lang) => {
        if (lang === 'html') {
          setPreviewHtml(code);
          setPreviewVisible(true);
        } else {
          // 如果不是 HTML，可以弹个提示 or 忽略
        }
      }}/>
    </div>
  );

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch(() => {
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
  }, []);

  const renderUserMessage = useCallback(
    (raw: string) => renderMarkdown(raw),
    [renderMarkdown]
  );

  const renderAssistantMessage = useCallback(
    (raw: string, reasoning: string | null) =>
      renderMarkdown(raw, reasoning),
    [renderMarkdown]
  );

  const filteredMessages = useMemo(() => {
    return messages.filter(msg =>
      msg.session_id === currentSessionId
    );
  }, [messages, currentSessionId]);

  const bubbleItems = useMemo(() => {
    return filteredMessages.map((i) => {
      // 确保每条消息都有一个唯一且稳定的 id
      const msgId = i.id

      const common = {
        ...i,
        key: msgId,
      };

      if (i.role === 'user') {
        return {
          ...common,
          className: 'user-message',
          messageRender: renderUserMessage,
          typing: false,
        };
      } else {
        return {
          ...common,
          className: 'assistant-message',
          messageRender: (content: string) => {
            if (!content && !i.reasoning_content) {
              return <Spin/>;
            } else {
              return renderAssistantMessage(content, i.reasoning_content ?? null);
            }
          },
          typing: false,
        };
      }
    });
  }, [messages, renderUserMessage, renderAssistantMessage]);

  const welcome = <><Space
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
  </Space></>;

  const mesasgeList = <><Bubble.List
    items={bubbleItems}
    style={{height: '100%', paddingInline: 'calc(calc(100% - 900px) /2)'}}
    roles={{
      assistant: {
        placement: 'start',
        variant: 'borderless',
        footer: (item: string) => (
          <div style={{display: 'flex'}}>
            <Button type="text" size="small" icon={<ReloadOutlined/>}/>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined/>}
              onClick={(e) => {
                e.stopPropagation();
                if (item) handleCopy(item);
              }}
            />
            <Button type="text" size="small" icon={<LikeOutlined/>}/>
            <Button type="text" size="small" icon={<DislikeOutlined/>}/>
          </div>
        ),
      },
      user: {
        placement: 'end',
        variant: 'filled',
        footer: (item: string) => (
          <div
            style={{
              display: 'flex',
              position: 'relative',
              top: '-8px',
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined/>}
              onClick={(e) => {
                e.stopPropagation();
                if (item) handleCopy(item);
              }}
            />
          </div>
        ),
      },
    }}
  /></>;
  return (
    <div className="chatList">

      {bubbleItems?.length ? mesasgeList : welcome}

      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          background: toastType === 'success' ? '#52c41a' : '#f5222d',
          color: 'white',
          borderRadius: '4px',
          zIndex: 9999,
          animation: 'fadeIn 0.3s'
        }}>
          {toastType === 'success' ? '✅ 已复制到剪贴板' : '❌ 复制失败'}
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;