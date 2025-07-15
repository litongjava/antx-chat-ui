//CodeBlock.tsx
import React from 'react';
import MermaidRenderer from './MermaidRenderer';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import CodeBlokTools from './CodeBlokTools.tsx';
import './CodeBlock.css';

interface CodeBlockProps {
  code: string;
  language: string;
  loading: boolean;
  onRunCode?: (code: string, language: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({code, language, loading, onRunCode}) => {
  if (language === 'mermaid' && !loading) {
    return <MermaidRenderer chart={code.trim()}/>;
  }

  const id = Math.random().toString(36).slice(2, 9);
  return (
    <div className="code-block">
      <div className="code-header">
        <div className="lang-info"><span>{language}</span></div>
        <CodeBlokTools id={id} language={language} onRun={(c, l) => onRunCode?.(c, l)}/>
      </div>
      <SyntaxHighlighter id={id} language={language} PreTag="div" customStyle={{margin: 0, padding: '1em'}}>
        {code.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;