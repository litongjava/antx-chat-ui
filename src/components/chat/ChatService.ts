// ChatService.ts
import {config} from "../../config/config.ts";
import {showError} from "../../utils/ErrorUtils.ts";
import {BubbleDataType} from "./types.ts";


// 会话项类型
export interface ConversationItem {
  id: number;
  key: string;
  label: string;
  group: string;
  create_time: string;
}

export class ChatService {
  // 计算分组（今天、昨天、更早）
  static calculateGroup(createTime: string): string {
    const now = new Date();
    const createDate = new Date(createTime);

    const diffDays = Math.floor(
      (now.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return 'Earlier';
  }

  // 创建会话
  static async createSession(token: string, name: string): Promise<ConversationItem | null> {
    try {
      const response = await fetch(`${config.base_url}/api/v1/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          school_id: 1,
          chat_type: 0,
          type: 'conversation',
          app_id: 1
        })
      });

      const result = await response.json();
      if (result.code === 1) {
        return {
          id: result.data.id,
          key: result.data.id.toString(),
          label: result.data.name,
          group: 'Today',
          create_time: new Date().toISOString()
        };
      } else {
        throw new Error(result.msg || '创建会话失败');
      }
    } catch (error) {
      showError(error, '创建会话失败')
      return null;
    }
  }

  // 获取会话列表
  static async listSessions(token: string): Promise<ConversationItem[]> {
    try {
      const response = await fetch(`${config.base_url}/api/v1/chat/list?offset=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.code === 1 && Array.isArray(result.data)) {
        return result.data.map((session: any) => ({
          id: session.id,
          key: session.id.toString(),
          label: session.name,
          group: this.calculateGroup(session.create_time),
          create_time: session.create_time
        }));
      } else {
        throw new Error(result.msg || '获取会话列表失败');
      }
    } catch (error) {
      showError(error, '获取会话列表失败');
      return [];
    }
  }

  // 重命名会话
  static async renameSession(token: string, sessionId: string, name: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.base_url}/api/v1/chat/set/name?session_id=${sessionId}&name=${name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      return result.code === 1;
    } catch (error) {
      showError(error, '重命名会话失败')
      return false;
    }
  }

  // 删除会话
  static async deleteSession(token: string, sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.base_url}/api/v1/chat/delete?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      const result = await response.json();
      return result.code === 1;
    } catch (error) {
      showError(error, '删除会话失败')
      return false;
    }
  }

  static async getHistory(
    token: string,
    session_id: string,
    offset: number = 1,
    limit: number = 1000
  ): Promise<BubbleDataType[]> {
    try {
      const url = new URL(`${config.base_url}/api/v1/chat/history`);
      url.searchParams.append('session_id', session_id);
      url.searchParams.append('offset', offset.toString());
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.ok && Array.isArray(result.data)) {
        return result.data.map((msg: any) => ({
          session_id: session_id,
          id: msg.id,
          role: msg.role,
          content: msg.content,
          model: msg.model || undefined,
          citations: msg.citations || undefined,
          reasoning_content: msg.reasoning_content || undefined,
        }));
      } else {
        throw new Error(result.msg || '获取历史记录失败');
      }
    } catch (error) {
      showError(error, '获取历史记录失败');
      return [];
    }
  }
}