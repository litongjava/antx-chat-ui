// types.ts
import type {GetProp} from 'antd';
import {Attachments} from "@ant-design/x";

export interface BubbleDataType {
  id?: string;
  content: string;             // 消息内容
  reasoning_content?: string;  // 推理内容
  role: 'user' | 'assistant';  // 角色
  model?: string;              // 模型名称
  citations?: string[];        // 引用来源
  question_id?: string;        // 问题ID（用户消息）
  answer_id?: string;          // 回答ID（助手消息）
}

export type ConversationItem = {
  key: string;
  label: string;
  group: string;
};
export type AttachmentFile = GetProp<typeof Attachments, 'items'>[number];