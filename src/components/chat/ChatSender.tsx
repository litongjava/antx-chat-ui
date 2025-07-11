// ChatSender.tsx
import React from 'react';
import {Attachments, Prompts, Sender} from '@ant-design/x';
import {Button, Flex, Select, Tag, Tooltip} from 'antd';
import {CloudUploadOutlined, OpenAIOutlined, PaperClipOutlined, ProductOutlined,} from '@ant-design/icons';
import {MODEL_OPTIONS, SENDER_PROMPTS, TOOL_OPTIONS} from './consts.tsx';
import {AttachmentFile} from './types.ts';

interface ChatSenderProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (val: string) => void;
  model: string;
  setModel: (model: string) => void;
  tools: string[];
  setTools: (tools: string[]) => void;
  loading: boolean;
  attachmentsOpen: boolean;
  setAttachmentsOpen: (open: boolean) => void;
  attachedFiles: AttachmentFile[];
  setAttachedFiles: (files: AttachmentFile[]) => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({
                                                 inputValue,
                                                 setInputValue,
                                                 onSubmit,
                                                 model,
                                                 setModel,
                                                 tools,
                                                 setTools,
                                                 loading,
                                                 attachmentsOpen,
                                                 setAttachmentsOpen,
                                                 attachedFiles,
                                                 setAttachedFiles,
                                               }) => {
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
        <Tooltip title="Select AI Model" placement="top">
          <div className="selectWrapper">
            <Select
              value={model}
              onChange={setModel}
              options={MODEL_OPTIONS}
              suffixIcon={<OpenAIOutlined/>}
              styles={{popup: {root: {minWidth: 180}}}}
            />
          </div>
        </Tooltip>

        <Tooltip title="Select Tools" placement="top">
          <div className="selectWrapper">
            <Select
              value={tools}
              onChange={(vals) => setTools(vals as string[])}
              options={TOOL_OPTIONS}
              mode="multiple"
              suffixIcon={<ProductOutlined/>}
              styles={{popup: {root: {minWidth: 180}}}}
            />
          </div>
        </Tooltip>

        {tools.length > 0 && (
          <Tag className="tag" icon={<PaperClipOutlined/>}>
            {tools.length} tools enabled
          </Tag>
        )}
      </div>
      {/* 🌟 输入框 */}
      <Sender
        value={inputValue}
        header={senderHeader}
        onSubmit={() => {
          onSubmit(inputValue);
          setInputValue('');
        }}
        onChange={setInputValue}
        onCancel={() => {
          // 取消逻辑需要在父组件实现
        }}
        prefix={
          <Button
            type="text"
            icon={<PaperClipOutlined style={{fontSize: 18}}/>}
            onClick={() => setAttachmentsOpen(!attachmentsOpen)}
          />
        }
        loading={loading}
        className="sender"
        allowSpeech
        actions={(_, info) => {
          const {SendButton, LoadingButton, SpeechButton} = info.components;
          return (
            <Flex gap={4}>
              <SpeechButton className="speechButton"/>
              {loading ? <LoadingButton type="default"/> : <SendButton type="primary"/>}
            </Flex>
          );
        }}
        placeholder="Ask or input / use skills"
      />
    </>
  );
};

export default ChatSender;