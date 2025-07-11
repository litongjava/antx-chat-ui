// ChatSider.tsx
import React from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Conversations } from '@ant-design/x';
import { Button} from 'antd';
import UserAvatar from '../user/UserAvatar.tsx';
import {MessageInfo} from "@ant-design/x/es/use-x-chat";
import {BubbleDataType} from "./types.ts";

interface ConversationItem {
  key: string;
  label: string;
  group: string;
}

interface ChatSiderProps {
  siderCollapsed: boolean;
  toggleSider: () => void;
  mobileSiderVisible: boolean;
  setMobileSiderVisible: (visible: boolean) => void;
  conversations: ConversationItem[];
  curConversation: string;
  setCurConversation: (key: string) => void;
  setConversations: (items: ConversationItem[]) => void;
  setMessages: (messages:  MessageInfo<BubbleDataType>[]) => void;
  messageHistory: Record<string, MessageInfo<BubbleDataType>[]>;
  handleNewConversation: () => void;
}

const ChatSider: React.FC<ChatSiderProps> = ({
                                               siderCollapsed,
                                               toggleSider,
                                               mobileSiderVisible,
                                               setMobileSiderVisible,
                                               conversations,
                                               curConversation,
                                               setCurConversation,
                                               setConversations,
                                               setMessages,
                                               messageHistory,
                                               handleNewConversation
                                             }) => {
  return (
    <div
      className={`sider ${siderCollapsed ? 'collapsed' : ''} ${mobileSiderVisible ? 'mobileVisible' : ''}`}
    >
      {siderCollapsed ? (
        <div className="collapsedIconContainer">
          <div className="collapsedLogo">
            <img
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
              draggable={false}
              alt="logo"
              width={32}
              height={32}
            />
          </div>

          <Button
            type="text"
            className="collapsedMenuButton"
            icon={<MenuUnfoldOutlined style={{ fontSize: 20 }} />}
            onClick={toggleSider}
          />

          <div
            className="collapsedIcon"
            onClick={handleNewConversation}
          >
            <div className="newChatIcon">
              <PlusOutlined />
            </div>
          </div>

          <div className="collapsedAvatar">
            <UserAvatar />
          </div>
        </div>
      ) : (
        <>
          <div className="logo">
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
              icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSider}
            />
          </div>

          <Button
            onClick={handleNewConversation}
            type="link"
            className="addBtn"
            icon={<PlusOutlined style={{ fontSize: 16 }} />}
          >
            New Conversation
          </Button>

          <Conversations
            items={conversations}
            className="conversations"
            activeKey={curConversation}
            onActiveChange={async (val) => {
              // 模拟abort处理
              setTimeout(() => {
                setCurConversation(val);
                setMessages(messageHistory?.[val] || []);
              }, 100);
              setMobileSiderVisible(false);
            }}
            groupable
            styles={{ item: { padding: '0 8px' } }}
            menu={(conversation) => ({
              items: [
                {
                  label: 'Rename',
                  key: 'rename',
                  icon: <EditOutlined />,
                },
                {
                  label: 'Delete',
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    const newList = conversations.filter((item) => item.key !== conversation.key);
                    const newKey = newList?.[0]?.key;
                    setConversations(newList);
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

          <div className="siderFooter">
            <UserAvatar />
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="questionBtn"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSider;