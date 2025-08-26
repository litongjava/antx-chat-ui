// ChatSide.tsx
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import {Conversation, Conversations} from '@ant-design/x';
import {Button, Input, Modal, message} from 'antd';
import UserAvatar from '../user/UserAvatar.tsx';
import React, {useState} from 'react';

interface ConversationItem {
  key: string;
  label: string;
  group: string;
}

interface ChatSliderProps {
  siderCollapsed: boolean,
  toggleSider: () => void,
  mobileSiderVisible: boolean,
  setMobileSiderVisible: (visible: boolean) => void,
  conversations: ConversationItem[],
  curConversation: string,
  setCurConversation: (key: string) => void,
  setConversations: (items: ConversationItem[]) => void,
  handleNewConversation: () => void,
  onRename: (sessionId: string, newName: string) => void,
  onDelete: (sessionId: string) => void,
  newSessionRef: React.RefObject<boolean>
}

const ChatSlider: React.FC<ChatSliderProps> = ({
                                                 siderCollapsed,
                                                 toggleSider,
                                                 mobileSiderVisible,
                                                 setMobileSiderVisible,
                                                 conversations,
                                                 curConversation,
                                                 setCurConversation,
                                                 handleNewConversation,
                                                 onRename,
                                                 onDelete,
                                                 newSessionRef
                                               }) => {

  // ChatSide.tsx 片段


  const [renameOpen, setRenameOpen] = useState(false);
  const [renameVal, setRenameVal] = useState('');
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);

  const openRename = (conversation: Conversation) => {
    const defaultName =
      typeof conversation.label === 'string'
        ? conversation.label
        : String(conversation.label) || '';
    setRenameVal(defaultName);
    setRenameTarget(conversation);
    setRenameOpen(true);
  };

  const doRename = () => {
    const v = renameVal.trim();
    if (!v) {
      message.warning('名称不能为空');
      return;
    }
    if (renameTarget) {
      onRename(renameTarget.key, v);
    }
    setRenameOpen(false);
  };

  // 原 menu 中把 onClick: () => handleRename(conversation) 改成：
  // onClick: () => openRename(conversation)


  return (
    <>

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
                setCurConversation(val);
                newSessionRef.current = false;
                setMobileSiderVisible(false);
              }}
              groupable
              styles={{item: {padding: '0 8px'}}}
              menu={(conversation) => ({
                items: [
                  {
                    label: '重命名',
                    key: 'rename',
                    icon: <EditOutlined/>,
                    onClick: () => openRename(conversation)
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
      <Modal
        title="重命名会话"
        open={renameOpen}
        onOk={doRename}
        onCancel={() => setRenameOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={renameVal}
          onChange={(e) => setRenameVal(e.target.value)}
          placeholder="输入新会话名称"
          maxLength={100}
          showCount
          autoFocus
        />
      </Modal>
    </>
  );
};

export default ChatSlider;
