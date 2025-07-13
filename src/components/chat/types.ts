// types.ts
import type {GetProp} from 'antd';
import {Attachments} from "@ant-design/x";

export interface BubbleDataType {
  content: string;             // 消息内容
  reasoning_content?: string;  // 推理内容
  role: 'user' | 'assistant';  // 角色
  model?: string;              // 模型名称
  citations?: string[];        // 引用来源
  question_id?: string;        // 问题ID
  answer_id?: string;          // 回答ID
}

export interface ChatSiderProps {
  conversations: ConversationItem[];
  curConversation: string;
  onNewConversation: () => void;
  onConversationChange: (key: string) => void;
  onDeleteConversation: (key: string) => void;
  onRenameConversation: (key: string) => void;
  siderCollapsed: boolean;
  mobileSiderVisible: boolean;
  toggleSider: () => void;
  toggleMobileSider: () => void;
}

export type ConversationItem = {
  key: string;
  label: string;
  group: string;
};

export type TopicItem = {
  key: string;
  description: string;
  icon: React.ReactNode;
};

export type GuideItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  description: string;
};

export type AttachmentFile = GetProp<typeof Attachments, 'items'>[number];

export interface HotTopics {
  key: string;
  label: string;
  children: TopicItem[];
}

export interface DesignGuide {
  key: string;
  label: string;
  children: GuideItem[];
}