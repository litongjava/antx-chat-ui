// ChatList.tsx
import React from 'react';
import {Prompts, Welcome} from '@ant-design/x';
import {Button, Collapse, Flex, Space, Spin} from 'antd';
import {Bubble} from '@ant-design/x/es';
import {MessageInfo} from '@ant-design/x/es/use-x-chat';
import {BubbleDataType} from './types';
import {DESIGN_GUIDE, HOT_TOPICS} from './consts';
import ReloadOutlined from '@ant-design/icons/lib/icons/ReloadOutlined';
import {CopyOutlined, DislikeOutlined, EllipsisOutlined, LikeOutlined, ShareAltOutlined} from "@ant-design/icons";
import markdownit from "markdown-it";

interface ChatListProps {
  messages: MessageInfo<BubbleDataType>[];
  onSubmit: (val: string) => void;
}

const md = markdownit({html: true, breaks: true});

export const renderMarkdown = (content: string, reasoning?: string | null) => (
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
const ChatList: React.FC<ChatListProps> = ({messages, onSubmit}) => {
  return (
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
              };
            } else {
              return {
                ...i.message,
                className: status === 'loading' ? 'loadingMessage' : '',
                messageRender: (content: string) =>
                  renderMarkdown(content, i.message.reasoning_content ?? null),
                typing: status === 'loading' ? {step: 5, interval: 20, suffix: <Spin size="small"/>} : false,
              };
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
            user: {placement: 'end', variant: 'borderless'},
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
};

export default ChatList;