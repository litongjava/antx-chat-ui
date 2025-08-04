const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
if (!BASE_URL) {
  throw new Error("Missing backend URL in environment variables");
}

// 定义消息数据结构，根据业务需要扩展字段
export interface ChatMessage {
  session_id: string;
  role: string;
  content: string;
  requestParam?: ChatAskRequestParam,
}

// 定义 SSE 事件数据结构
export interface SSEEvent {
  type: string;
  data: string; // data 始终以字符串形式返回，由调用者自行解析 JSON 或其它格式
}

// 定义请求参数类型
export interface ChatAskRequestParam {
  session_id: string;
  school_id?: string;
  type?: string;
  app_id?: string;
  chat_type?: number;
  provider?: string;
  model?: string;
  tools?: string[];
  file_ids?: string[];
  history_enabled:boolean
}

export async function sendSSERequest(
  params: ChatAskRequestParam,
  //
  onEvent?: (event: SSEEvent) => void, signal?: AbortSignal,
  //
  access_token?: string, messages?: ChatMessage[]) {
  const {
    session_id,
    school_id,
    type,
    app_id,
    chat_type,
    provider,
    model,
    tools,
    history_enabled
  } = params;


  const url = `${BASE_URL}/api/v1/chat/ask`;

  // 构造符合后端接口要求的请求体，并确保 chat_type 字段被发送
  const body = {
    provider,
    model,
    type,
    session_id,
    school_id,
    app_id,
    chat_type,
    messages,
    tools,
    history_enabled,
    stream: true,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok || !response.body) {
    throw new Error("Network response error or empty body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const {done, value} = await reader.read();
    if (done) {
      if (onEvent) {
        onEvent({type: 'done', data: ""});
      }

      break;
    }
    buffer += decoder.decode(value, {stream: true});
    const parts = buffer.split("\r\n\r\n");
    // 最后一部分可能是不完整的数据，保留到下次拼接
    buffer = parts.pop() || "";
    for (const part of parts) {
      const event = parseSSEEvent(part);
      if (event) {
        if (onEvent) {
          onEvent(event);
        }

      }
    }
  }
}

// 解析 SSE 事件，不主动解析 data 为 JSON，由调用者决定
function parseSSEEvent(raw: string): SSEEvent | null {
  const lines = raw.split("\n").map(line => line.trim()).filter(Boolean);
  let eventType = "message";
  let dataStr = "";
  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.substring("event:".length).trim();
    } else if (line.startsWith("data:")) {
      dataStr += line.substring("data:".length).trim();
    }
  }
  if (dataStr) {
    return {type: eventType, data: dataStr};
  }
  return null;
}