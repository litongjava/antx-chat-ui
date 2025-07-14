// ChatMessageList.tsx
import React, {useCallback, useState} from 'react';
import {Prompts, Welcome} from '@ant-design/x';
import {Button, Collapse, Flex, Space, Spin} from 'antd';
import {Bubble} from '@ant-design/x/es';
import {MessageInfo} from '@ant-design/x/es/use-x-chat';
import {BubbleDataType} from './types.ts';
import {DESIGN_GUIDE, HOT_TOPICS} from './consts.tsx';
import ReloadOutlined from '@ant-design/icons/lib/icons/ReloadOutlined';
import {CopyOutlined, DislikeOutlined, EllipsisOutlined, LikeOutlined, ShareAltOutlined} from "@ant-design/icons";
import 'katex/dist/katex.min.css';
import MathMarkdownRenderer from "./MathMarkdownRenderer.tsx";


interface ChatListProps {
  messages: MessageInfo<BubbleDataType>[];
  onSubmit: (val: string) => void;
  // 新增 preview 相关 props
  previewHtml: string | null;
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>;
  previewVisible: boolean;
  setPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;

}


const ChatMessageList: React.FC<ChatListProps> = ({
                                                    messages,
                                                    onSubmit,
                                                    setPreviewHtml,
                                                    setPreviewVisible
                                                  }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');


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
              <MathMarkdownRenderer content={reasoning} onRunCode={(code, lang) => {
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
      <MathMarkdownRenderer content={raw} onRunCode={(code, lang) => {
        if (lang === 'html') {
          setPreviewHtml(code);
          setPreviewVisible(true);
        } else {
          // 如果不是 HTML，可以弹个提示 or 忽略
        }
      }}/>
    </div>
  );

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

  return (
    <div className="chatList">
      {messages?.length ? (
        /* 🌟 消息列表 */
        <Bubble.List
          items={messages?.map((i, index) => {
            const {message, status} = i;
            if (message?.role === 'user') {
              return {
                ...i.message,
                className: `${status === 'loading' ? 'loadingMessage ' : ''}user-message`,
                messageRender: renderMarkdown,
                // 添加索引属性
                _index: index
              };
            } else {
              return {
                ...i.message,
                className: `${status === 'loading' ? 'loadingMessage ' : ''}assistant-message`,
                messageRender: (content: string) =>
                  renderMarkdown(content, i.message.reasoning_content ?? null),
                typing: status === 'loading' ? {step: 5, interval: 20, suffix: <Spin size="small"/>} : false,
                // 添加索引属性
                _index: index
              };
            }
          })}
          style={{height: '100%', paddingInline: 'calc(calc(100% - 900px) /2)'}}
          roles={{
            assistant: {
              placement: 'start',
              variant: 'borderless',
              footer: (item: any) => (
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
              footer: (item: any) => (
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