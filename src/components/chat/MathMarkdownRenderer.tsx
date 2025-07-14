import React, {useMemo} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import 'katex/dist/katex.min.css';
import CodeBlokTools from "../CodeBlokTools.tsx";
import './CodeBlock.css';

interface MathMarkdownRendererProps {
  /** The markdown content to render, possibly containing LaTeX expressions */
  content: string;
  /** Optional additional className for the wrapper div */
  className?: string;
}

const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({content, className}) => {
  const processedContent = useMemo(() => {
    if (!content) return content;

    let processed = content;
    // 将 \( \) 转换为 $ $
    processed = processed.replace(/\\\((.*?)\\\)/g, '$$$1$$');
    // 将 \[ \] 转换为 $$ $$
    processed = processed.replace(/\\\[(.*?)\\\]/gs, '$$$$\n$1\n$$$$');
    // 处理常见的 LaTeX 数学环境
    const mathEnvironments = ['equation', 'align', 'gather', 'multline', 'split', 'cases'];
    mathEnvironments.forEach(env => {
      const regex = new RegExp(`\\\\begin\\{${env}\\}(.*?)\\\\end\\{${env}\\}`, 'gs');
      processed = processed.replace(regex, `$$\n\\\\begin{${env}}$1\\\\end{${env}}\n$$`);
    });

    return processed;
  }, [content]);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({node, inline, className: langClass, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(langClass || '');
            if (inline || !match) {
              return <code className={langClass} {...props}>{children}</code>;
            }
            const id = Math.random().toString(36).substr(2, 9);
            // 剔除 ref，避免类型不匹配
            const {ref, ...restProps} = props as { ref?: unknown; [key: string]: any };

            return (
              <div className="code-block">
                <div className="code-header">
                  <div className="lang-info">
                    <span>{match[1]}</span>
                  </div>
                  <CodeBlokTools id={id} language={match[1]}/>
                </div>
                <SyntaxHighlighter
                  id={id}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{margin: 0, padding: '1em'}}
                  {...restProps}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          table: ({children}: { children?: React.ReactNode }) => (
            <div className="table-container">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          th: ({children}: { children?: React.ReactNode }) => (
            <th className="table-header">{children}</th>
          ),
          td: ({children}: { children?: React.ReactNode }) => (
            <td className="table-cell">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MathMarkdownRenderer;
