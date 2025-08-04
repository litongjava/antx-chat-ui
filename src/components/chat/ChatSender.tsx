// ChatSender.tsx
import React, {useEffect} from 'react';
import {Attachments, Prompts, Sender} from '@ant-design/x';
import {Button, Checkbox, Flex, Select, Tag, Tooltip} from 'antd';
import {CloudUploadOutlined, PaperClipOutlined,} from '@ant-design/icons';
import {
  VOLC_ENGINE_MODEL_OPTIONS,
  PROVIDER_OPTIONS,
  SENDER_PROMPTS,
  TOOL_OPTIONS,
  TYPE_OPTIONS,
  GOOGLE_ENGINE_MODEL_OPTIONS
} from './consts.tsx';
import {AttachmentFile} from './types.ts';

interface ChatSenderProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (val: string) => void;
  onCancel?: VoidFunction | undefined
  provider: string;
  setProvider: (model: string) => void;
  model: string;
  setModel: (model: string) => void;
  type: string;
  setType: (type: string) => void;
  tools: string[];
  setTools: (tools: string[]) => void;
  loading: boolean;
  attachmentsOpen: boolean;
  setAttachmentsOpen: (open: boolean) => void;
  attachedFiles: AttachmentFile[];
  setAttachedFiles: (files: AttachmentFile[]) => void;
  historyEnabled: boolean; // new
  setHistoryEnabled: (enabled: boolean) => void; // new
}

const ChatSender: React.FC<ChatSenderProps> = ({
                                                 inputValue,
                                                 setInputValue,
                                                 onSubmit,
                                                 onCancel,
                                                 provider,
                                                 setProvider,
                                                 model,
                                                 setModel,
                                                 type,
                                                 setType,
                                                 tools,
                                                 setTools,
                                                 loading,
                                                 attachmentsOpen,
                                                 setAttachmentsOpen,
                                                 attachedFiles,
                                                 setAttachedFiles,
                                                 historyEnabled,
                                                 setHistoryEnabled
                                               }) => {
  // 组件内
  type Option = { label: string; value: string };
  let modelOptions: Option[] = [];

  if (provider === 'google') {
    modelOptions = GOOGLE_ENGINE_MODEL_OPTIONS;
  } else if (provider === 'volcengine') {
    modelOptions = VOLC_ENGINE_MODEL_OPTIONS;
  } else {
    modelOptions = [];
  }

  useEffect(() => {
    if (modelOptions.length === 0) return;
    if (!modelOptions.some(o => o.value === model)) {
      setModel(modelOptions[0].value);
    }
  }, [provider]);


  const senderHeader = (
    <Sender.Header
      title="Upload File"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{content: {padding: 0}}}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={(info) => setAttachedFiles(info.fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? {title: 'Drop file here'}
            : {
              icon: <CloudUploadOutlined/>,
              title: 'Upload files',
              description: 'Click or drag files to this area to upload',
            }
        }
      />
    </Sender.Header>
  );

  return (
    <>
      {/* 🌟 提示词 */}
      <Prompts
        items={SENDER_PROMPTS}
        onItemClick={(info) => {
          onSubmit(info.data.description as string);
        }}
        styles={{
          item: {padding: '6px 12px'},
        }}
        className="senderPrompt"
      />
      <div className="toolbar">
        <Tooltip title="Select Provider" placement="top">
          <Select
            value={provider}
            onChange={setProvider}
            options={PROVIDER_OPTIONS}
            styles={{popup: {root: {minWidth: 180}}}}
          />
        </Tooltip>

        <Tooltip title="Select AI Model" placement="top">
          <Select
            value={model}
            onChange={setModel}
            options={modelOptions}
            styles={{popup: {root: {minWidth: 180}}}}
            disabled={!provider}
          />
        </Tooltip>

        <Tooltip title="Select type" placement="top">
          <Select
            value={type}
            onChange={setType}
            options={TYPE_OPTIONS}
            styles={{popup: {root: {minWidth: 180}}}}
          />
        </Tooltip>


        <Tooltip title="Select Tools" placement="top">
          <Select
            value={tools}
            onChange={(vals) => setTools(vals as string[])}
            options={TOOL_OPTIONS}
            mode="multiple"
            styles={{root: {minWidth: 180}}}
          />
        </Tooltip>

        {/* New history checkbox */}
        <Tooltip title="Include history with submit" placement="top">
          <Checkbox
            checked={historyEnabled}
            onChange={(e) => setHistoryEnabled(e.target.checked)}
            style={{marginLeft: 8}}
          >
            history
          </Checkbox>
        </Tooltip>

        {tools.length > 0 && (
          <Tag className="tag" icon={<PaperClipOutlined/>}>
            {tools.length} tools enabled
          </Tag>
        )}
      </div>
      {/* 🌟 输入框 */}
      <div className="sender">
        {/* 输入 + 附件 区做成可滚动 */}
        <div className="input-area">
          <Sender
            value={inputValue}
            header={senderHeader}
            onSubmit={() => {
              onSubmit(inputValue);
              setInputValue('');
            }}
            onChange={setInputValue}
            onCancel={onCancel}
            prefix={
              <Button
                type="text"
                icon={<PaperClipOutlined style={{fontSize: 18}}/>}
                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              />
            }
            loading={loading}
            className="sender-inner" // 可选，用于更精细 style 定位
            allowSpeech
            placeholder="Ask or input / use skills"
            // 不再直接让默认 actions 占据底部，把按钮渲染到下面的 send-actions
            actions={(_, info) => {
              const {SendButton, LoadingButton, SpeechButton} = info.components;
              return (
                <div className="send-actions">
                  <Flex gap={4} style={{justifyContent: 'flex-end'}}>
                    <SpeechButton className="speechButton"/>
                    {loading ? (
                      <LoadingButton type="default"/>
                    ) : (
                      <SendButton type="primary"/>
                    )}
                  </Flex>
                </div>
              );
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ChatSender;