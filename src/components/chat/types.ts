// types.ts
import type { GetProp } from 'antd';
import {Attachments} from "@ant-design/x";

export type BubbleDataType = {
  role: string;
  content: string;
  reasoning_content?: string | null;
};

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