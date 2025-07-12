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
import {Conversation, Conversations} from '@ant-design/x';
import {Button} from 'antd';
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
  curConversation: string; // 这里保持为string
  setCurConversation: (key: string) => void;
  setConversations: (items: ConversationItem[]) => void;
  setMessages: (messages: MessageInfo<BubbleDataType>[]) => void;
  messageHistory: Record<string, MessageInfo<BubbleDataType>[]>;
  handleNewConversation: () => void;
  onRename: (sessionId: string, newName: string) => void;
  onDelete: (sessionId: string) => void;
}

const ChatSider: React.FC<ChatSiderProps> = ({
                                               siderCollapsed,
                                               toggleSider,
                                               mobileSiderVisible,
                                               setMobileSiderVisible,
                                               conversations,
                                               curConversation,
                                               setCurConversation,
                                               setMessages,
                                               messageHistory,
                                               handleNewConversation,
                                               onRename,
                                               onDelete
                                             }) => {
  const handleRename = (conversation: Conversation) => {
    const defaultName =
      typeof conversation.label === 'string'
        ? conversation.label
        : String(conversation.label) || '';

    const newName = prompt('输入新会话名称', defaultName);
    if (newName && newName.trim()) {
      onRename(conversation.key, newName.trim());
    }
  };

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
            icon={<MenuUnfoldOutlined style={{fontSize: 20}}/>}
            onClick={toggleSider}
          />

          <div
            className="collapsedIcon"
            onClick={handleNewConversation}
          >
            <div className="newChatIcon">
              <PlusOutlined/>
            </div>
          </div>

          <div className="collapsedAvatar">
            <UserAvatar/>
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
              icon={siderCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
              onClick={toggleSider}
            />
          </div>

          <Button
            onClick={handleNewConversation}
            type="link"
            className="addBtn"
            icon={<PlusOutlined style={{fontSize: 16}}/>}
          >
            New Conversation
          </Button>

          <Conversations
            items={conversations}
            className="conversations"
            activeKey={curConversation} // 这里直接使用，空字符串是安全的
            onActiveChange={async (val) => {
              // 确保val是字符串
              if (val) {
                setTimeout(() => {
                  setCurConversation(val);
                  setMessages(messageHistory?.[val] || []);
                }, 100);
                setMobileSiderVisible(false);
              }
            }}
            groupable
            styles={{item: {padding: '0 8px'}}}
            menu={(conversation) => ({
              items: [
                {
                  label: '重命名',
                  key: 'rename',
                  icon: <EditOutlined/>,
                  onClick: () => handleRename(conversation)
                },
                {
                  label: '删除',
                  key: 'delete',
                  icon: <DeleteOutlined/>,
                  danger: true,
                  onClick: () => {
                    if (window.confirm('确定要删除此会话吗？')) {
                      onDelete(conversation.key);
                    }
                  }
                },
              ],
            })}
          />
          <div className="siderFooter">
            <UserAvatar/>
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
};

export default ChatSider;